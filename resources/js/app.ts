import '../scss/app.scss';
import 'ant-design-vue/dist/reset.css';

import { createApp, h, type DefineComponent } from 'vue';
import { createPinia } from 'pinia';
import { createInertiaApp } from '@inertiajs/vue3';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import Antd from 'ant-design-vue';
import axios from 'axios';

import SvgIcon from '@/components/SvgIcon.vue';

axios.defaults.withCredentials = true;

void createInertiaApp({
    resolve: (name: string) =>
        resolvePageComponent(`./pages/${name}.vue`, import.meta.glob<DefineComponent>('./pages/**/*.vue')),
    setup({ el, App, props, plugin }) {
        createApp({ render: () => h(App, props) })
            .use(plugin)
            .use(createPinia())
            .use(Antd)
            .component('SvgIcon', SvgIcon)
            .mount(el);
    },
    progress: {
        color: '#1677ff',
    },
});
