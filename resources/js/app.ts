import '../css/app.scss';
import 'ant-design-vue/dist/reset.css';


import type { DefineComponent } from 'vue';
import { createApp, h } from 'vue';

// Libs
import Antd from 'ant-design-vue';
import { createInertiaApp } from '@inertiajs/vue3';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => resolvePageComponent(`./pages/${name}.vue`, import.meta.glob<DefineComponent>('./pages/**/*.vue')),
    setup({ el, App, props, plugin }) {
        createApp({ render: () => h(App, props) })
            .use(Antd)
            .use(plugin)
            .mount(el);
    },
    progress: {
        color: '#4B5563',
    },
});
