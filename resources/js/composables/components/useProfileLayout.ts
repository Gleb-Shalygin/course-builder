import { computed, ref } from 'vue';
import { usePage } from '@inertiajs/vue3';
import type { AppPageProps } from '@/types/PageProps';

const isMobileMenuOpen = ref(false);

export function useProfileLayout() {
    const page = usePage<AppPageProps>();

    const pageTitle = computed((): string => page.props.title ?? 'Личный кабинет');

    const openMobileMenu = (): void => {
        isMobileMenuOpen.value = true;
    };
    const closeMobileMenu = (): void => {
        isMobileMenuOpen.value = false;
    };

    return {
        isMobileMenuOpen,
        pageTitle,
        openMobileMenu,
        closeMobileMenu,
    };
}
