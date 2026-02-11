<template>
    <div class="profile-sidebar__content">
        <Logo />

        <ProfileUserCard />

        <!--
          Навигационные ссылки профиля должны располагаться здесь.
          Этот же компонент переиспользуется внутри бургер-меню.
        -->
        <slot />
    </div>
</template>

<script setup lang="ts">
import ProfileUserCard from '@/layout/profile/ProfileUserCard.vue';
import Logo from '@/layout/profile/Logo.vue';
</script>

