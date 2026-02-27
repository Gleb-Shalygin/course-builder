import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { useUserStore } from '@/store/userStore';

import LoginPage from '@/pages/LoginPage.vue';
import ProfilePage from '@/pages/profile/ProfilePage.vue';
import RegisterPage from '@/pages/RegisterPage.vue';
import Welcome from '@/pages/Welcome.vue';
import TestCreatePage from '@/pages/tests/TestCreatePage.vue';
import ProfileTestsPage from '@/pages/profile/ProfileTestsPage.vue';

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
        meta: { requiresGuest: true },
    },
    {
        path: '/register',
        name: 'register',
        component: RegisterPage,
        meta: { requiresGuest: true },
    },
    {
        path: '/profile',
        name: 'profile',
        component: ProfilePage,
        meta: { requiresAuth: true },
    },
    {
        path: '/profile/tests',
        name: 'profile-tests',
        component: ProfileTestsPage,
        meta: { requiresAuth: true },
    },
    {
        path: '/profile/test-create',
        name: 'test-create',
        component: TestCreatePage,
        meta: { requiresAuth: true },
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// Глобальный guard для проверки авторизации
router.beforeEach(async (to, from, next) => {
    // Инициализация useAuth должна быть внутри функции, но мы используем singleton pattern
    // через ref в composable, поэтому вызываем init только один раз
    const userStore = useUserStore();

    // Инициализация при первом переходе
    if (!userStore.initialized) {
        await userStore.init();
    }

    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
    const requiresGuest = to.matched.some((record) => record.meta.requiresGuest);

    // Проверка авторизации для защищенных маршрутов
    if (requiresAuth) {
        const authenticated = await userStore.checkAuth();
        if (!authenticated) {
            next({ name: 'login', query: { redirect: to.fullPath } });
            return;
        }
    }

    // Редирект авторизованных пользователей со страниц login/register
    if (requiresGuest && userStore.isAuthenticated) {
        next({ name: 'profile' });
        return;
    }

    next();
});

export default router;


