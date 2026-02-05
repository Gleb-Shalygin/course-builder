<template>
    <div class="welcome-page">
        <a-layout-header class="welcome-header">
            <div class="welcome-header__content">
                <div class="welcome-header__logo">
                    <h2>Конструктор курсов</h2>
                </div>
                <div class="welcome-header__actions">
                    <template v-if="!isAuthenticated">
                        <router-link to="/login">
                            <a-button type="text" size="large">Войти</a-button>
                        </router-link>
                        <router-link to="/register">
                            <a-button type="primary" size="large">Регистрироваться</a-button>
                        </router-link>
                    </template>
                    <template v-else>
                        <router-link to="/profile">
                            <a-button type="primary" size="large">Перейти в профиль</a-button>
                        </router-link>
                    </template>
                </div>
            </div>
        </a-layout-header>

        <div class="welcome-content">
            <div class="welcome-hero">
                <h1 class="welcome-hero__title">Создавайте курсы и тесты легко и быстро</h1>
                <p class="welcome-hero__description">
                    Простой конструктор для создания образовательных курсов и тестов. Не требуется технических знаний — просто выберите формат и
                    начните создавать.
                </p>
                <div class="welcome-hero__actions">
                    <template v-if="!isAuthenticated">
                        <router-link to="/register">
                            <a-button type="primary" size="large" class="welcome-hero__cta"> Начать создавать </a-button>
                        </router-link>
                        <router-link to="/login">
                            <a-button size="large" class="welcome-hero__secondary"> Войти в аккаунт </a-button>
                        </router-link>
                    </template>
                    <template v-else>
                        <router-link to="/profile">
                            <a-button type="primary" size="large" class="welcome-hero__cta"> Создать курс </a-button>
                        </router-link>
                    </template>
                </div>
            </div>

            <div class="welcome-features">
                <div class="welcome-features__item">
                    <div class="welcome-features__icon">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#1677ff"
                            stroke-width="2"
                        >
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                    </div>
                    <h3 class="welcome-features__title">Создание курсов</h3>
                    <p class="welcome-features__description">
                        Создавайте структурированные образовательные курсы с уроками, материалами и заданиями. Простой интерфейс без сложных настроек.
                    </p>
                </div>

                <div class="welcome-features__item">
                    <div class="welcome-features__icon">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#1677ff"
                            stroke-width="2"
                        >
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                    </div>
                    <h3 class="welcome-features__title">Тестирование</h3>
                    <p class="welcome-features__description">
                        Разрабатывайте тесты с различными типами вопросов. Проверяйте знания учащихся и получайте результаты автоматически.
                    </p>
                </div>

                <div class="welcome-features__item">
                    <div class="welcome-features__icon">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#1677ff"
                            stroke-width="2"
                        >
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                    </div>
                    <h3 class="welcome-features__title">Простое управление</h3>
                    <p class="welcome-features__description">
                        Управляйте всеми своими курсами и тестами в одном месте. Редактируйте, публикуйте и отслеживайте прогресс учащихся.
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store/userStore';

const { isAuthenticated  } = useUserStore();
</script>
