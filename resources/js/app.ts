import '../css/app.scss';
import 'ant-design-vue/dist/reset.css';

import { createApp } from 'vue';
import Antd from 'ant-design-vue';
import axios from 'axios';

import App from './App.vue';
import router from './router';

const app = createApp(App);

axios.defaults.withCredentials = true;

app.config.globalProperties.$axios = axios;

app.use(Antd);
app.use(router);

app.mount('#app');

