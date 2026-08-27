---
name: vue-component-conventions
description: MUST be used when creating or editing any Vue component in resources/js/components/**/*.vue. Project-specific rules for file structure, template/script order, naming, props, and data access that override the generic vue-core skill when they conflict.
---

# Vue-компоненты — конвенции проекта

Применяется к файлам `resources/js/components/**/*.vue`.

> Эти правила специфичны для проекта и имеют приоритет над общими рекомендациями из скилла `vue-core`, если они противоречат друг другу (например, порядок блоков `template`/`script`).

## Структура

- Один компонент — один файл. Имя файла = имя компонента в PascalCase.
- Стиль написания composition api.
- Все файлы TypeScript при импорте указывать в пути `.ts`.
- Стили css для верстки хранятся в `resources/scss`.
- Вся логика хранится в отдельных composable функциях `resources/js/composables`.
- Состояние, которое можно не передавать в пропсах, передавать уже из локальной composable функции.
- Условия, которые используются в верстке, выносить в отдельные computed. Вместо `filteredProductGroups.length > 0` обращаться к `isShowProductGroups`.
- Вместо `$store.state.cart.products` в верстке выносить в отдельный computed и уже обращаться к нему.
- Компонент строим так: сначала блок `template` версткой, потом блок `script`.
- Импорт других компонентов в текущий компонент делать через алиас `@`.
- Все иконки, которые расположены в `resources/icons` — отображаются через компонент `<svg-icon>`.
- Компонент не должен доходить до 100 строк, если больше — стоит задуматься о разделении на подкомпоненты.

## Именование

- Компоненты: PascalCase (`UserProfile`, `OrderList`).
- Пропсы: camelCase, типизированы интерфейсом.
- Интерфейс пропсов: `ИмяКомпонентаProps` (`UserProfileProps`).
- Бизнес-логика — функции с глаголом: `handleSubmit`, `formatPrice`.

## Данные

- Все запросы к api объявляем в `resources/js/api`.
- Состояния загрузки и ошибок обрабатываем явно — без скрытых fallback.

## Что НЕ делать

- Не использовать default exports — поломает рефакторинг.
- Не делать прямые fetch-вызовы в компонентах.
- Не использовать `any` — только `unknown` с явной валидацией.
- Не описывать css и sass стили в компонентах.
- Не плодить пропсы для компонента, стараться допускать максимум 2 пропса на компонент.
- Не описывать саму логику условия в верстке компонента.
- Не прописывать в верстке `$store.state.cart.products`.
- Не писать в компоненте сначала блок `script`, сначала `template`.
