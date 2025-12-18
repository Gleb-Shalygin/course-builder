import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

import LoginPage from '@/pages/LoginPage.vue';
import ProfilePage from '@/pages/profile/ProfilePage.vue';
import RegisterPage from '@/pages/RegisterPage.vue';
import Welcome from '@/pages/Welcome.vue';

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'home',
        component: Welcome,
    },
    {
        path: '/login',
        name: 'login',
        component: LoginPage,
    },
    {
        path: '/register',
        name: 'register',
        component: RegisterPage,
    },
    {
        path: '/profile',
        name: 'profile',
        component: ProfilePage,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;


