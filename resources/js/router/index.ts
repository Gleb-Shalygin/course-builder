import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuth } from '@/composables/useAuth';

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
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// Глобальный guard для проверки авторизации
router.beforeEach(async (to, from, next) => {
    // Инициализация useAuth должна быть внутри функции, но мы используем singleton pattern
    // через ref в composable, поэтому вызываем init только один раз
    const auth = useAuth();
    
    // Инициализация при первом переходе
    if (!auth.initialized.value) {
        await auth.init();
    }

    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
    const requiresGuest = to.matched.some((record) => record.meta.requiresGuest);

    // Проверка авторизации для защищенных маршрутов
    if (requiresAuth) {
        const authenticated = await auth.checkAuth();
        if (!authenticated) {
            next({ name: 'login', query: { redirect: to.fullPath } });
            return;
        }
    }

    // Редирект авторизованных пользователей со страниц login/register
    if (requiresGuest && auth.isAuthenticated.value) {
        next({ name: 'profile' });
        return;
    }

    next();
});

export default router;


