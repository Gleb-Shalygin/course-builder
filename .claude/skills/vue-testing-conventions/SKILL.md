---
name: vue-testing-conventions
description: MUST be used when creating or editing any frontend test in resources/js/test/**/*.{test,spec}.ts, or when deciding how to test a Vue composable or component. Project-specific rules for test layout, what to test first, composables with and without a host component (withSetup), mocking api/Inertia/ant-design-vue, and component tests with @testing-library/vue.
---

# Тесты фронтенда — конвенции проекта

Применяется к файлам `resources/js/test/**/*.{test,spec}.ts` и к хелперам в `resources/js/test/helpers/`.

> Стек: Vitest (`globals: true`, окружение `happy-dom`), `@testing-library/vue`, `@vue/test-utils`. Конфиг — блок `test` в `vite.config.ts`.
> Общие правила кода (`vue-composable-conventions`, `vue-component-conventions`) на тесты тоже распространяются: без `any`, без default exports, типы — в `resources/js/types`.

## Раскладка файлов

- Все тесты лежат в `resources/js/test` — Vitest подхватывает только `resources/js/test/**/*.{test,spec}.ts`. Рядом с исходниками тесты не кладём.
- Внутри `test` повторяем путь исходника от `resources/js`: тест на `composables/tests/builder/useValidation.ts` лежит в `test/composables/tests/builder/useValidation.test.ts`.
- Имя файла = имя тестируемого модуля + `.test.ts`.
- Общие хелперы (`withSetup`, `renderWithPlugins`, фабрики фикстур) — в `test/helpers`, по одному хелперу на файл, named export.

Как делать не надо:

```
composables/tests/builder/useValidation.test.ts
test/validation.spec.ts
```

Как делать надо:

```
test/
    composables/
        tests/
            builder/
                useValidation.test.ts
    helpers/
        withSetup.ts
```

## Что тестируем в первую очередь

Логика проекта живёт в composables, компоненты в основном тонкие. Поэтому пирамида такая:

1. Composables без хост-компонента и без внешних зависимостей (валидация, маппинг, фабрики) — дёшево, быстро, большая отдача.
2. Composables без хост-компонента, но с внешними зависимостями (api, Inertia, `localStorage`) — через `vi.mock`.
3. Composables, зависящие от хост-компонента, — через `withSetup`.
4. Компонентные тесты — только на ключевые пользовательские сценарии (прохождение теста, формы авторизации), а не на каждый компонент.

Не дублировать в компонентном тесте то, что уже покрыто тестом composable.

## Composables: две категории

По [гайду Vue](https://vuejs.org/guide/scaling-up/testing#testing-composables) composables делятся на две категории.

**Не зависят от хост-компонента** — используют только Reactivity API (`ref`, `computed`, `watch`, ...). Вызываем напрямую и проверяем возвращаемое состояние и методы.

```ts
import { useValidation } from '@/composables/tests/builder/useValidation';

describe('useValidation', () => {
    it('rejects test without title', () => {
        const { validateTest } = useValidation();

        expect(validateTest(makeTestPayload({ title: '  ' }))).toEqual({
            valid: false,
            message: 'Введите название теста.',
        });
    });
});
```

**Зависят от хост-компонента** — используют любой из API:

- хуки жизненного цикла (`onMounted`, `onBeforeMount`, `onBeforeUnmount`, `onUnmounted`, `onActivated`, `onDeactivated`, ...);
- `provide` / `inject`, а также всё, что построено на `inject` (`getCurrentInstance`, `useSlots`, `useAttrs`).

Такой composable **нельзя** вызывать напрямую: вне компонента хук не выполнится, Vue выдаст только warning, и тест пройдёт, не проверив логику. Оборачиваем через `withSetup` из `test/helpers/withSetup.ts`:

```ts
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
```

- Каждый `app` из `withSetup` обязательно размонтировать (`app.unmount()`) — в конце теста или в `afterEach`.
- Если composable что-то снимает в `onBeforeUnmount` / `onUnmounted` (слушатели `window`, таймеры, подписки) — отдельным тестом проверяем cleanup: вызываем `app.unmount()` и убеждаемся, что слушатель снят / таймер не сработал.
- Для `provide` / `inject` — передавать значения через `app.provide(...)` до `mount`.
- Прежде чем писать тест, проверить composable на эти API, включая вложенные composables: если `useTestRunner` вызывает `useRunnerGuard` с `onMounted`, то и `useTestRunner` зависит от хоста.

## Внешние зависимости

Это отдельная ось, не связанная с хост-компонентом: composable может не требовать хоста, но ходить наружу.

- Запросы `@/api/*` — мокаем модуль целиком через `vi.mock('@/api/test', ...)`, реальные HTTP-запросы в тестах запрещены. Если composable использует `axios` напрямую — мокаем `axios`.
- Навигация — проект использует `router` / `usePage` из `@inertiajs/vue3`, мокаем этот модуль и проверяем вызовы `router.visit(...)`.
- `message` из `ant-design-vue` — мокаем и проверяем, что показано нужное сообщение.
- `localStorage` есть в `happy-dom`, но очищаем его в `beforeEach`, чтобы тесты не зависели друг от друга.
- Чего нет в `happy-dom` (`window.matchMedia` и т. п.) — подменяем через `vi.stubGlobal`.
- Таймеры (`setTimeout`, дебаунсы) — `vi.useFakeTimers()` и `vi.advanceTimersByTime(...)`, после теста — `vi.useRealTimers()`.
- После каждого теста сбрасываем моки: `vi.restoreAllMocks()` / `vi.unstubAllGlobals()` в `afterEach`.
- Асинхронщину дожидаемся явно: `await flushPromises()` из `@vue/test-utils` или `await nextTick()`, а не `setTimeout` в тесте.

## Компонентные тесты

- Рендерим через `render` из `@testing-library/vue`, а не `mount` из `@vue/test-utils`.
- Ищем элементы так, как их видит пользователь: `getByRole`, `getByLabelText`, `getByText`. Не искать по CSS-классам и внутренней структуре ant-design-vue.
- Проверяем поведение (что увидел пользователь, какой запрос ушёл, куда перешли), а не внутреннее состояние компонента.
- Глобальные плагины (ant-design-vue и т. п.) подключаем через общий хелпер `renderWithPlugins` в `test/helpers`, а не копируем `global.plugins` в каждый тест.

## Фикстуры и типизация

- Тестовые данные собираем фабриками вида `makeTestPayload(overrides: Partial<TestPayload> = {})`, которые возвращают валидный объект с типом из `resources/js/types`. Общие фабрики — в `test/helpers`.
- Не использовать `any` и `as unknown as X`, чтобы протащить невалидные данные. Если нужно проверить реакцию на мусор с бэкенда — тип параметра в коде уже `unknown`, туда и передаём.

## Именование и стиль

- `describe` — имя тестируемого модуля (`useValidation`, `TestRunner`). Вложенный `describe` — имя метода, если их несколько.
- `it` — на английском, описывает поведение: `it('rejects single question with less than two answers')`. Так же, как `test_*` методы в backend-тестах.
- `describe`, `it`, `expect`, `vi`, `beforeEach`, `afterEach` — глобальные, не импортируем.
- Один тест — одна проверяемая ситуация. Блоки arrange / act / assert разделяем пустой строкой.

## Запуск

- `npm run test -- --run` — один прогон (так же в CI).
- `npm run test` — watch-режим.
- `npm run typecheck` — тесты тоже должны проходить `vue-tsc`.

## Что НЕ делать

- Не вызывать напрямую composable с хуками жизненного цикла или `inject` — только через `withSetup`.
- Не оставлять смонтированные `app` после теста.
- Не делать реальных HTTP-запросов и не ходить в реальный роутер Inertia.
- Не класть тесты рядом с исходниками или вне `resources/js/test`.
- Не тестировать детали реализации: приватное состояние, CSS-классы, разметку ant-design-vue.
- Не использовать snapshot-тесты вместо осмысленных проверок.
- Не ждать асинхронщину через `setTimeout` в тесте.
- Не использовать `any` и default exports.
