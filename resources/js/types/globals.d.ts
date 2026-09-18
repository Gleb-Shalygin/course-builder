declare module 'vite/client' {}

declare module 'vue' {
    interface GlobalComponents {
        SvgIcon: (typeof import('@/components/ui/SvgIcon.vue'))['default'];
    }
}


export {};
