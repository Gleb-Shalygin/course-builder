import { computed } from 'vue';
import { router, usePage } from '@inertiajs/vue3';
import { AppstoreOutlined, UserOutlined } from '@ant-design/icons-vue';
import type { ProfileMenuItem } from '@/types/ProfileMenuItem';
import { useProfileLayout } from '@/composables/components/useProfileLayout';

const items: ProfileMenuItem[] = [
    { key: '/profile', label: 'Профиль', icon: UserOutlined },
    { key: '/profile/tests', label: 'Тесты', icon: AppstoreOutlined },
];

export function useProfileNavigation() {
    const page = usePage();
    const { closeMobileMenu } = useProfileLayout();

    const menuItems = computed((): ProfileMenuItem[] => items);
    const currentPath = computed((): string => page.url.split('?')[0]);
    const selectedKeys = computed((): string[] => [currentPath.value]);

    const handleSelect = (key: string): void => {
        closeMobileMenu();
        router.visit(key);
    };

    return {
        menuItems,
        selectedKeys,
        handleSelect,
    };
}
