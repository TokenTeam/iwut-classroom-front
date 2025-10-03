// setupPinia.ts
import { createApp, type App } from 'vue';
import { createPinia, type Pinia, setActivePinia } from 'pinia';

/**
 * Pinia 初始化配置
 */
interface PiniaConfig {
  onInit?: (pinia: Pinia) => void;
}

/**
 * 初始化 Pinia 存储
 */
export const setupPinia = (config: PiniaConfig = {}): { app: App; pinia: Pinia } => {
  const app = createApp({});
  const pinia = createPinia();

  app.use(pinia);
  setActivePinia(pinia);

  config.onInit?.(pinia);

  return { app, pinia };
};

// 默认导出初始化实例
export const { app, pinia } = setupPinia();