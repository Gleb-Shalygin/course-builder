import { computed, watch, type Ref } from 'vue';
import type { SvgIconsMap } from '@/types/ui/SvgIcon.ts';

const ICONS_DIR = '../../../icons/';

const rawIcons = import.meta.glob('../../../icons/**/*.svg', {
    query: '?raw',
    import: 'default',
    eager: true,
}) as SvgIconsMap;

const icons: SvgIconsMap = Object.entries(rawIcons).reduce<SvgIconsMap>((map, [path, content]) => {
    map[path.slice(ICONS_DIR.length).replace(/\.svg$/, '')] = content;

    return map;
}, {});

const normalizeName = (value: string): string =>
    value
        .trim()
        .replace(/^\/+/, '')
        .replace(/^resources\//, '')
        .replace(/^icons\//, '')
        .replace(/\.svg$/, '');

export function useSvgIcon(name: Ref<string>) {
    const iconName = computed((): string => normalizeName(name.value));
    const svgContent = computed((): string | null => icons[iconName.value] ?? null);
    const isIconFound = computed((): boolean => svgContent.value !== null);

    watch(
        isIconFound,
        (): void => {
            if (isIconFound.value) {
                return;
            }

            console.error(`[SvgIcon] Иконка "${iconName.value}" не найдена в resources/icons.`);
        },
        { immediate: true },
    );

    return {
        iconName,
        svgContent,
        isIconFound,
    };
}
