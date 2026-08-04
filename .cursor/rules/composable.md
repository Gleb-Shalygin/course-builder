---
description: composable функции
globs: ["resources/js/composables/**/*.ts", "resources/js/composables/**/*.js"]
alwaysApply: false
---

# composable функции

## Структура

- Одна composable функция — один файл. Имя файла = имя компонента в camelCase.
- Все новые файлы пишутся на языке TypeScript.
- Если в одном if два и более условий - выносить в отдельный computed.
- Все type, interface хранятся в отдельной папке resources/js/types.
- Вместо toValue обращаться к переменным через .value.
- computed, watch или функции определять каждые своими списками, например: сначала идут computed, потом watch, потом функции.
- onMounted, onCreated и тому подобные объявлять в конце composable функции.
- Делать пробелы между блоками, например с computed и функций.


## Именование

- Файлы: camelCase (useProduct, useGifts).

## Данные

- Все запросы к api объявляем resources/js/api.
- Состояния загрузки и ошибок обрабатываем явно — без скрытых fallback.
- State из store выносим в отдельное computed свойство и к нему уже обращаемся.
- Геттеры из store выносим в отдельное computed свойство и к нему уже обращаемся.

## Что НЕ делать

- Не использовать any — только unknown с явной валидацией.
- Не хранить описание type и interface в composable функциях.
- Не обращаться к геттерам store напрямую.
- Не обращаться к state store напрямую.
- Не создавать новые composable функции в JavaScript файлах.
- Не использовать toValue.
- Не делать пробелы между функциями, computed, watch - только между блоками операций.
