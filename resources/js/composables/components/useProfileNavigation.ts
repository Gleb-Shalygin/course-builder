import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { AppstoreOutlined, PlusCircleOutlined, UserOutlined } from '@ant-design/icons-vue';
import type { ProfileMenuItem } from '@/types/ProfileMenuItem';

const items: ProfileMenuItem[] = [
    { key: 'profile', label: 'Профиль', icon: UserOutlined },
    { key: 'profile-tests', label: 'Тесты', icon: AppstoreOutlined },
    { key: 'test-create', label: 'Создать тест', icon: PlusCircleOutlined },
];

export function useProfileNavigation() {
    const route = useRoute();
    const router = useRouter();

    const menuItems = computed((): ProfileMenuItem[] => items);
    const selectedKeys = computed((): string[] => [String(route.name ?? '')]);

    function handleSelect(key: string): void {
        router.push({ name: key });
    }

    return {
        menuItems,
        selectedKeys,
        handleSelect,
    };
}
