import { createApp } from 'vue';
import type { App } from 'vue';

export function withSetup<T>(composable: () => T): [T, App] {
    let result!: T;

    const app = createApp({
        setup() {
            result = composable();
            return () => null;
        },
    });
    app.mount(document.createElement('div'));

    return [result, app];
}
