declare module 'vite/client' {}

declare module 'vue' {
    interface GlobalComponents {
        SvgIcon: (typeof import('@/components/SvgIcon.vue'))['default'];
    }
}

