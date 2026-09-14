import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { AppstoreOutlined, UserOutlined } from '@ant-design/icons-vue';
import type { ProfileMenuItem } from '@/types/ProfileMenuItem';
import { useProfileLayout } from '@/composables/components/useProfileLayout';

const items: ProfileMenuItem[] = [
    { key: 'profile', label: 'Профиль', icon: UserOutlined },
    { key: 'profile-tests', label: 'Тесты', icon: AppstoreOutlined },
];

export function useProfileNavigation() {
    const route = useRoute();
    const router = useRouter();
    const { closeMobileMenu } = useProfileLayout();

    const menuItems = computed((): ProfileMenuItem[] => items);
    const selectedKeys = computed((): string[] => [String(route.name ?? '')]);

    function handleSelect(key: string): void {
        closeMobileMenu();
        router.push({ name: key });
    }

    return {
        menuItems,
        selectedKeys,
        handleSelect,
    };
}
