# 武汉理工大学空闲教室查询

一个面向移动端的空闲教室查询页面。用户可以按日期、上课时段和校区筛选教室，查看各教学楼、楼层在所选时间段内持续可用的教室。

## 功能特性

- 支持东院、西院、鉴湖、南湖和余家头 5 个校区
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

页面不会逐栋请求数据，而是按“校区 + 周”加载合并后的 JSON：

```text
{VITE_OSS_URL}/{campusCode}/{mondayKey}.json
```

例如，查询南湖校区某一周时，请求路径可能为：

```text
/api/0202/2026.2.23.json
```

数据结构如下：

```json
{
  "020204": {
    "1": {
      "1": ["101", "102"],
      "2": ["101"]
    }
  }
}
```

各层级依次为：教学楼代码、星期（`1` 至 `7`）、课节（`1` 至 `16`）和空闲教室列表。查询跨多个课节的时段时，前端会取每一节空闲教室列表的交集。

如需从 `empty_classrooms` 的 SQL 导出生成数据，请将导出文件保存为 `data_process/classroom.sql`，然后运行：

```bash
node data_process/sql-to-json.mjs --out=public --term=2026-02-23
```

- `--out`：输出目录，默认为 `public`
- `--term`：第一教学周的周一，默认为 `2026-02-23`

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
2. 根据所选日期计算该周的周一，并请求对应校区的周数据。
3. 根据星期和课节筛选数据；跨课节查询会计算教室集合的交集。
4. 查询结果按教学楼、楼层分组展示，同时更新总教室数。

## 开发说明

- 路径别名 `@` 指向 `src/`。
- 新增校区或教学楼时，需要同步维护 `src/request.ts` 中的映射。
- 新增或调整查询时段时，需要同步修改 `src/components/ChooseView.vue` 和 `src/stores/selectionStore.ts` 中的时段配置。
- NativeRPC 使用的持久化键为 `classroom.campus`。

## 许可证

当前仓库暂未声明开源许可证。
