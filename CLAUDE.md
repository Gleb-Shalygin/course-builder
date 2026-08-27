# CLAUDE.md

Инструкции для Claude Code при работе в этом репозитории.

## О проекте

Laravel 12 (PHP 8.2) backend + Vue 3 SPA frontend (Composition API, `<script setup lang="ts">`), сборка через Vite. Стейт — Pinia, роутинг — Vue Router, UI — ant-design-vue + Tailwind CSS. Окружение поднимается через Docker Compose и Laravel Sail.

## Скиллы проекта — обязательно к прочтению

Перед любой работой с Vue-кодом или запуском окружения **обязательно** проверяй и применяй соответствующие скиллы из [`.claude/skills/`](.claude/skills/):

- [`.claude/skills/vue-component-conventions/SKILL.md`](.claude/skills/vue-component-conventions/SKILL.md) — правила для файлов `resources/js/components/**/*.vue` (структура, порядок `template`/`script`, именование, пропсы, что нельзя делать).
- [`.claude/skills/vue-composable-conventions/SKILL.md`](.claude/skills/vue-composable-conventions/SKILL.md) — правила для файлов `resources/js/composables/**/*.ts` (структура, порядок `computed`/`watch`/функций, работа со store).
- [`.claude/skills/vue-core/SKILL.md`](.claude/skills/vue-core/SKILL.md) — общие best practices по Vue 3 (реактивность, SFC, composables, производительность). Применяется, когда вопрос не покрыт проектными конвенциями выше — они имеют приоритет при конфликте.
- [`.claude/skills/start-project/SKILL.md`](.claude/skills/start-project/SKILL.md) — как поднять локальное окружение (Docker Compose + Sail + Vite).

Эти правила специфичны для проекта и не выводятся из кода автоматически — их нужно читать явно перед началом задачи в соответствующей области.

## Ключевые директории

- `app/` — Laravel backend (контроллеры, модели, сервисы).
- `resources/js/components/` — Vue-компоненты.
- `resources/js/composables/` — composable-функции.
- `resources/js/api/` — все запросы к API.
- `resources/js/types/` — `type`/`interface`.
- `resources/js/store/` — Pinia store.
- `resources/scss/` — стили.
- `resources/icons/` — иконки (рендерятся через компонент `<svg-icon>`).

## Общие правила

- Не использовать `any` — только `unknown` с явной валидацией.
- Не использовать default exports в JS/TS.
- Загрузка/ошибки обрабатываются явно, без скрытых fallback.
