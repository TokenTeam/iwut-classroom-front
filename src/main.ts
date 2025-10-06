import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import TDesign from 'tdesign-mobile-vue';
import 'tdesign-mobile-vue/es/style/index.css';

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(TDesign)
app.mount('#app')