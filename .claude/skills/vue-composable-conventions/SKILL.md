---
name: vue-composable-conventions
description: MUST be used when creating or editing any composable in resources/js/composables/**/*.ts (or .js). Project-specific rules for file structure, ordering of computed/watch/functions, naming, and store access that override the generic vue-core skill when they conflict.
---

# Composable-функции — конвенции проекта

Применяется к файлам `resources/js/composables/**/*.ts` и `resources/js/composables/**/*.js`.

> Эти правила специфичны для проекта и имеют приоритет над общими рекомендациями из скилла `vue-core`, если они противоречат друг другу.

## Структура

- Одна composable функция — один файл. Имя файла = имя функции в camelCase.
- Все новые файлы пишутся на языке TypeScript.
- Если в одном `if` два и более условий — выносить в отдельный computed.
- Все `type`, `interface` хранятся в отдельной папке `resources/js/types`.
- Вместо `toValue` обращаться к переменным через `.value`.
- `computed`, `watch` и функции определять каждые своими списками, например: сначала идут все `computed`, потом все `watch`, потом функции.
- `onMounted`, `onCreated` и тому подобные объявлять в конце composable функции.
- Делать пробелы между блоками (например, между блоком `computed` и блоком функций).

## Именование

- Файлы: camelCase (`useProduct`, `useGifts`).

## Данные

- Все запросы к api объявляем в `resources/js/api`.
- Состояния загрузки и ошибок обрабатываем явно — без скрытых fallback.
- State из store выносим в отдельное computed свойство и к нему уже обращаемся.
- Геттеры из store выносим в отдельное computed свойство и к нему уже обращаемся.

## Что НЕ делать

- Не использовать `any` — только `unknown` с явной валидацией.
- Не хранить описание `type` и `interface` в composable функциях.
- Не обращаться к геттерам store напрямую.
- Не обращаться к state store напрямую.
- Не создавать новые composable функции в JavaScript файлах.
- Не использовать `toValue`.
- Не делать пробелы между функциями, `computed`, `watch` внутри одного блока — только между блоками операций.
