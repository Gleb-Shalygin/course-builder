import '../scss/app.scss';
import 'ant-design-vue/dist/reset.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue';
import axios from 'axios';

import App from './App.vue';
import router from './router';

// Компоненты
import QuestionCardList from '@/components/tests/QuestionCardList.vue';
import QuestionCard from '@/components/tests/QuestionCard.vue';

const pinia = createPinia();
const app = createApp(App);

axios.defaults.withCredentials = true;

app.config.globalProperties.$axios = axios;

app.use(pinia);
app.use(Antd);
app.use(router);

app.component('question-card-list', QuestionCardList);
app.component('question-card', QuestionCard);

app.mount('#app');

