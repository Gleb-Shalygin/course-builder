import type { TestTableItem } from '@/types/tests/TestTableItem';

export function makeTestTableItem(overrides: Partial<TestTableItem> = {}): TestTableItem {
    return {
        id: 1,
        link: null,
        title: 'Арифметика',
        description: 'Проверка устного счёта',
        is_public: false,
        attempts: 1,
        count_finished: 0,
        ...overrides,
    };
}
