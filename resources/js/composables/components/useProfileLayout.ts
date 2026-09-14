import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';

const isMobileMenuOpen = ref(false);

export function useProfileLayout() {
    const route = useRoute();

    const pageTitle = computed((): string => (typeof route.meta.title === 'string' ? route.meta.title : 'Личный кабинет'));

    function openMobileMenu(): void {
        isMobileMenuOpen.value = true;
    }

    function closeMobileMenu(): void {
        isMobileMenuOpen.value = false;
    }

    return {
        isMobileMenuOpen,
        pageTitle,
        openMobileMenu,
        closeMobileMenu,
    };
}
