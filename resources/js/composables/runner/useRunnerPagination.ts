import type { RunnerPaginationItem } from '@/types/runner/TestRunner.ts';

export function useRunnerPagination() {
    const itemClass = (item: RunnerPaginationItem): string[] => {
        const classes: string[] = [];
        if (item.isActive) classes.push('runner-pages__item--active');
        if (item.isAnswered) classes.push('runner-pages__item--answered');
        return classes;
    };

    return {
        itemClass,
    };
}
