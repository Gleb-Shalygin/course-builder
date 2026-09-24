import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import type { Ref } from 'vue';

const FLOATING_CLASS = 'test-form__footer--floating';
const SHIFT_THRESHOLD = 1;

export function useTestFormFooter() {
    const footerElement: Ref<HTMLElement | null> = ref(null);
    const isLifted = ref(false);
    const isScrolled = ref(false);
    let observer: ResizeObserver | null = null;

    const isFloating = computed((): boolean => isLifted.value && isScrolled.value);
    const footerClass = computed((): string => (isFloating.value ? FLOATING_CLASS : ''));

    function updateFloating(): void {
        const element = footerElement.value;

        if (element === null) return;

        const container = element.parentElement;

        if (container === null) return;

        const shift = container.getBoundingClientRect().bottom - element.getBoundingClientRect().bottom;

        isLifted.value = shift > SHIFT_THRESHOLD;
        isScrolled.value = window.scrollY > 0;
    }
    function observeContainer(): void {
        const container = footerElement.value?.parentElement ?? null;

        if (container === null) return;

        observer = new ResizeObserver(updateFloating);
        observer.observe(container);
    }
    function stopObserve(): void {
        if (observer === null) return;

        observer.disconnect();
        observer = null;
    }

    onMounted((): void => {
        window.addEventListener('scroll', updateFloating, { passive: true });
        window.addEventListener('resize', updateFloating);
        observeContainer();
        updateFloating();
    });
    onBeforeUnmount((): void => {
        window.removeEventListener('scroll', updateFloating);
        window.removeEventListener('resize', updateFloating);
        stopObserve();
    });

    return {
        footerElement,
        footerClass,
    };
}
