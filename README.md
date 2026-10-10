# 武汉理工大学空闲教室查询

一个面向移动端的空闲教室查询页面。用户可以按日期、上课时段和校区筛选教室，查看各教学楼、楼层在所选时间段内持续可用的教室。

## 功能特性

- 支持南湖、东院、西院、鉴湖、余家头和军山 6 个查询区域
- 支持按日期与 7 个常用上课时段查询
- 按教学楼和楼层展示空闲教室，并统计可用教室数量
- 默认匹配当前或下一个上课时段
- 通过 NativeRPC 记忆上次选择的校区
- 移动端优先的界面，最大内容宽度为 768px

## 技术栈

- [Vue 3](https://vuejs.org/) + TypeScript
- [Vite](https://vite.dev/)
- [Pinia](https://pinia.vuejs.org/)
- [Vue Router](https://router.vuejs.org/)
- [TDesign Mobile Vue](https://tdesign.tencent.com/mobile-vue/)
- [Tailwind CSS](https://tailwindcss.com/)

## 快速开始

### 环境要求

- Node.js `^20.19.0` 或 `>=22.12.0`
- pnpm（推荐使用与当前锁文件兼容的 pnpm 10）

### 安装与运行

```bash
pnpm install
pnpm dev
```

开发服务器启动后，按照终端提示在浏览器中访问页面。

项目默认在 `.env` 中使用以下开发配置；如果需要自定义数据源，可以参考 `.env.example` 修改：

```dotenv
VITE_OSS_URL="/api"
VITE_CLASSROOM_DATASET="v2/2026-fall"
```

开发环境下，Vite 会将 `/api` 请求代理至远程教室数据目录。也可以将 `VITE_OSS_URL` 配置为自建数据服务或对象存储的完整地址；地址末尾的 `/` 可省略。

## 常用命令

```bash
# 启动开发服务器
pnpm dev

# 执行 TypeScript 类型检查并构建生产版本
pnpm build

# 仅执行类型检查
pnpm type-check

# 仅构建生产版本
pnpm build-only

# 本地预览生产构建
pnpm preview
```

生产构建产物位于 `dist/` 目录。

## 数据说明

页面不会逐栋请求数据，而是按“数据版本 + 校区 + 周”加载合并后的 JSON：

```text
{VITE_OSS_URL}/{VITE_CLASSROOM_DATASET}/{campusName}/{mondayKey}.json
```

例如，查询南湖校区某一周时，请求路径可能为：

```text
/api/v2/2026-fall/%E5%8D%97%E6%B9%96%E6%A0%A1%E5%8C%BA/2026.9.7.json
```

数据结构如下：

```json
{
  "schemaVersion": 2,
  "campus": "南湖校区",
  "week": 1,
  "monday": "2026.9.7",
  "buildings": {
    "博学主楼": {
      "101": [3, 0, 28, 0, 0, 0, 0]
    }
  }
}
```

`buildings` 下依次为教学楼名和教室名。每个教室保存长度为 7 的数组，对应周一至周日；每天的整数是课节占用位图，第 N 位为 1 表示第 N+1 节被占用。前端将所选时段转换为位图，一次按位与运算即可判断教室是否全程空闲。

根目录的 `manifest.json` 记录教学周范围、校区、楼栋和教室数量。当前数据覆盖 2026-09-07 至 2027-01-17，共 19 个教学周。

如需从逐教室课程表压缩包生成数据，运行：

```bash
node data_process/classes-to-json.mjs \
  --input=/path/to/classes.tar \
  --out=cos-upload/classroom/v2/2026-fall \
  --term=2026-09-07
```

- `--input`：逐教室 JSON 所在目录或包含这些文件的 tar 包，必须指定
- `--out`：输出目录，默认为 `cos-upload/classroom/v2/2026-fall`
- `--term`：第一教学周的周一，默认为 `2026-09-07`

转换器使用楼栋白名单，只生成以下查询区域：

- 南湖校区：博学北楼、博学东楼、博学西楼、博学主楼
- 东院：弘毅楼（主楼）、弘毅楼（附楼）、致远楼
- 西院：东教学楼、南配楼、工大楼
- 鉴湖：爱特楼、北院第一教学楼、北院第二教学楼、北院第三教学楼、学海楼
- 余家头校区：东配楼、西配楼、航海楼、余区教学大楼
- 军山校区：保留源数据中的全部楼栋和场地

名称包含“不要教室”以及“校外教学”的占位文件也会被排除；课程周次为空的“系统提示”按整个有效学期占用处理。

将 `cos-upload` 下的内容上传到 COS 桶根目录后，数据对象路径为
`classroom/v2/2026-fall/{campusName}/{mondayKey}.json`。旧版对象无需覆盖，可以与 v2 并存。

## 项目结构

```text
.
├── data_process/             # SQL 数据转换脚本
├── public/                   # 静态资源及本地教室数据
├── src/
│   ├── assets/               # 全局样式与主题变量
│   ├── components/
│   │   ├── ChooseView.vue    # 日期、时段和校区筛选
│   │   ├── ClassView.vue     # 教学楼与空闲教室列表
│   │   └── TimeView.vue      # 当前查询条件和结果统计
│   ├── router/               # 路由配置
│   ├── stores/               # Pinia 查询状态
│   ├── views/                # 页面级组件
│   ├── request.ts            # 数据地址拼装与空闲教室计算
│   ├── rpc.ts                # 原生容器持久化适配
│   └── main.ts               # 应用入口
├── .env.example              # 环境变量示例
├── package.json
└── vite.config.ts
```

## 核心流程

1. 应用启动后读取 NativeRPC 中保存的校区；读取失败时沿用默认的南湖校区。
2. 根据所选日期计算该周的周一，并请求对应数据版本及校区的周数据。
3. 根据星期和课节生成查询位图，与每间教室的占用位图比较。
4. 查询结果按教学楼、楼层分组展示，同时更新总教室数。

## 开发说明

- 路径别名 `@` 指向 `src/`。
- 新增校区时，需要同步维护筛选选项和 NativeRPC 的有效校区列表；教学楼和教室从数据文件动态读取。
- 新增或调整查询时段时，需要同步修改 `src/components/ChooseView.vue` 和 `src/stores/selectionStore.ts` 中的时段配置。
- NativeRPC 使用的持久化键为 `classroom.campus`。

## 许可证

当前仓库暂未声明开源许可证。
