<template>
    <div class="welcome-page">
        <a-layout-header class="welcome-header">
            <div class="welcome-header__content">
                <div class="welcome-header__logo">
                    <h2>Конструктор курсов</h2>
                </div>
                <div class="welcome-header__actions">
                    <template v-if="!isAuthenticated">
                        <Link href="/login">
                            <a-button type="text" size="large">Войти</a-button>
                        </Link>
                        <Link href="/register">
                            <a-button type="primary" size="large">Регистрироваться</a-button>
                        </Link>
                    </template>
                    <template v-else>
                        <Link href="/profile">
                            <a-button type="primary" size="large">Перейти в профиль</a-button>
                        </Link>
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
                        <Link href="/register">
                            <a-button type="primary" size="large" class="welcome-hero__cta"> Начать создавать </a-button>
                        </Link>
                        <Link href="/login">
                            <a-button size="large" class="welcome-hero__secondary"> Войти в аккаунт </a-button>
                        </Link>
                    </template>
                    <template v-else>
                        <Link href="/profile">
                            <a-button type="primary" size="large" class="welcome-hero__cta"> Создать курс </a-button>
                        </Link>
                    </template>
                </div>
            </div>

            <div class="welcome-features">
                <div class="welcome-features__item">
                    <div class="welcome-features__icon">
                        <svg-icon name="document-text" />
                    </div>
                    <h3 class="welcome-features__title">Создание курсов</h3>
                    <p class="welcome-features__description">
                        Создавайте структурированные образовательные курсы с уроками, материалами и заданиями. Простой интерфейс без сложных настроек.
                    </p>
                </div>

                <div class="welcome-features__item">
                    <div class="welcome-features__icon">
                        <svg-icon name="clock" />
                    </div>
                    <h3 class="welcome-features__title">Тестирование</h3>
                    <p class="welcome-features__description">
                        Разрабатывайте тесты с различными типами вопросов. Проверяйте знания учащихся и получайте результаты автоматически.
                    </p>
                </div>

                <div class="welcome-features__item">
                    <div class="welcome-features__icon">
                        <svg-icon name="check-circle" />
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
import { Link } from '@inertiajs/vue3';
import { useAuth } from '@/composables/auth/useAuth';

const { isAuthenticated } = useAuth();
</script>
