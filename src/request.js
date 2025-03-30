import './setupPinia.js';
import { useSelectionStore } from './stores/selectionStore.js';

const store = useSelectionStore();

// 移除 Node.js 专用模块
const url = "/api/get_classrooms";
const url2 = "/api/get_available_buildings";


// 现代 Promise 风格 API
const handleResponse = (response) => {
  if (!response.ok) {
    throw new Error(`HTTP 错误! 状态码: ${response.status}`);
  }
  return response.json().then(data => data.data);
};

// 统一封装的请求函数 (修复版)
const createRequest = (url) => (params) => {
  // 修复点 1: 移除 Content-Type 请求头
  const safeHeaders = {
    "accept": "application/json"
    // 注意: GET 请求不需要 Content-Type
  };

  // 修复点 2: 增强参数编码
  const encodeParam = (k, v) =>
    `${encodeURIComponent(k)}=${encodeURIComponent(v)}`;

  const queryString = Object.entries(params)
    .map(([key, value]) => encodeParam(key, value))
    .join('&');

  // 修复点 3: 添加请求模式配置
  return fetch(`${url}?${queryString}`, {
    headers: safeHeaders,
    mode: 'cors' // 明确请求模式
  })
  .then(response => {
    // 修复点 4: 增强错误处理
    if (!response.ok) {
      throw new Error(`请求失败: ${response.status} ${response.statusText}`);
    }
    return handleResponse(response); // 保持原有处理逻辑
  })
  .catch(error => {
    // 修复点 5: 明确错误类型判断
    const errorMsg = error.message.includes('Failed to fetch')
      ? '网络连接失败，请检查网络状态'
      : error.message;

    console.error('API 请求失败详情:', {
      url,
      params,
      error: errorMsg
    });

    throw new Error(errorMsg); // 保持向外抛出错误
  });
};
// 创建具体请求方法
export const getAvailableBuildingsData = createRequest(url2);
export const getClassroomsData = createRequest(url);

// 移除立即执行代码，改为按需调用
export const fetchAllData = async () => {
  try {
    // 实时获取最新 store 值
    const store = useSelectionStore();
    const currentParams = {
      campus_code: store.campus,
      start_time: Number(store.time),
      end_time: Number(store.section)
    };

    // 获取建筑数据
    const buildingsData = await getAvailableBuildingsData(currentParams);
    console.log("建筑数据:", buildingsData);

    // 并行获取所有教室数据
    const requests = buildingsData.map(buildingCode =>
      getClassroomsData({ ...currentParams, building_code: buildingCode })
        .then(data => ({ [buildingCode]: data }))
    );

    // 等待所有请求完成
    const results = await Promise.all(requests);

    // 合并数据
    const buildings = Object.assign({}, ...results);
    console.log("完整数据:", buildings);
    return buildings;
  } catch (error) {
    console.error("数据获取失败:", error.message);
    throw error;
  }
};
