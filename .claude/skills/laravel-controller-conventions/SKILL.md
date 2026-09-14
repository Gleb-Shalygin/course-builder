---
name: laravel-controller-conventions
description: MUST be used when creating or editing any PHP controller in app/Http/Controllers/**/*.php, а также связанные с ним слои — app/Service, app/Data, app/Http/Requests, app/Http/Resources, app/Exceptions. Правила слоёв, типизации и именования для backend-кода проекта.
---

# Контроллеры и слои backend — конвенции проекта

Применяется к `app/Http/Controllers/**/*.php` и ко всем слоям, которые контроллер использует:
`app/Service`, `app/Data`, `app/Http/Requests`, `app/Http/Resources`, `app/Exceptions`.

## Поток данных

Один и тот же порядок для любого эндпоинта:

```
Request (валидация) → Data (DTO) → Service (бизнес-логика) → Resource (ответ)
                                        └── Exception (ошибка)
```

Контроллер — только связка этих слоёв: принять валидированный реквест, собрать DTO,
вызвать сервис, обернуть результат в ресурс. Ничего больше в контроллере быть не должно.

## Структура

- Вся бизнес-логика хранится в `app/Service`. Контроллер логику не содержит — ни запросов к БД, ни расчётов, ни условий предметной области.
- Валидация входных данных — только через кастомные реквесты в `app/Http/Requests`. Никаких `$request->all()` и ручных `Validator::make` в контроллере.
- Если в сервис нужно передать **более одного параметра** — передаём одним объектом DTO. DTO хранятся в `app/Data` и наследуются от `Spatie\LaravelData\Data`.
- DTO собирается в контроллере из реквеста по ключам: `$request->validated('название ключа')`.
- Контроллер возвращает готовый ресурс из `app/Http/Resources` (`UserResource::make(...)`, `TestsResource::collection(...)`).
- Ошибки — это исключения с телом ошибки: наследники `App\Exceptions\ApiException` из `app/Exceptions`, со своими `$status` и `$errorCode`. Бросаются в сервисе, контроллер их не ловит.
- Метод сервиса **не может вернуть ресурс**. Только конкретный тип (`array`, `int`, `bool`, модель, коллекция), `void` — или исключение.
- Бросающий метод помечается `@throws` в PHPDoc.

## Статические методы

- Методы контроллеров и методы сервисов — **статические** (`public static function`).
- Вызов из контроллера в сервис идёт напрямую по имени класса: `TestService::create($data)`, без создания экземпляра сервиса и без DI через конструктор.
- Это не мешает контроллеру наследовать `Controller` и не требует статических свойств — статик только у самих методов действий/бизнес-логики.

## Именование

- Классы: UpperCamelCase (`TestController`, `TestService`, `UserAuthData`).
- Методы: lowerCamelCase (`register`, `createTest`, `tests`).
- Переменные: lowerCamelCase (`$data`, `$user`, `$createdTest`).
- Реквесты: `<Сущность><Действие>Request` (`UserLoginRequest`, `TestCreateRequest`).
- DTO: `<Сущность><Контекст>Data` (`UserAuthData`).
- Ресурсы: `<Сущность>Resource` (`UserResource`, `TestsResource`).
- Исключения: `<Причина>Exception` (`InvalidCredentialsException`).

## Типизация

- У **каждого** параметра метода указан тип.
- У **каждого** метода указан тип возвращаемого значения (включая `void`).
- Свойства DTO типизированы; необязательные — через `?type` со значением по умолчанию.

## Пример

Реквест — `app/Http/Requests/TestCreateRequest.php`:

```php
class TestCreateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'attempts' => 'required|integer|min:1',
            'questions' => 'required|array|min:1',
        ];
    }
}
```

DTO — `app/Data/TestCreateData.php`:

```php
class TestCreateData extends Data
{
    public function __construct(
        public string $title,
        public int $attempts,
        public array $questions,
    ) {}
}
```

Контроллер — `app/Http/Controllers/Profile/TestController.php`:

```php
/**
 * @throws TestNotCreatedException
 */
public static function create(TestCreateRequest $request): TestsResource
{
    $data = TestCreateData::from([
        'title' => $request->validated('title'),
        'attempts' => $request->validated('attempts'),
        'questions' => $request->validated('questions'),
    ]);

    return TestsResource::make(TestService::create($data));
}
```

Сервис — `app/Service/TestService.php`:

```php
/**
 * @throws TestNotCreatedException
 */
public static function create(TestCreateData $data): array
{
    $test = Test::query()->create([
        'user_id' => auth()->id(),
        'title' => $data->title,
        'attempts' => $data->attempts,
    ]);

    if (!$test->exists) {
        throw new TestNotCreatedException('Не удалось создать тест');
    }

    return [
        'id' => $test->id,
        'title' => $test->title,
    ];
}
```

Исключение — `app/Exceptions/TestNotCreatedException.php`:

```php
class TestNotCreatedException extends ApiException
{
    protected int $status = 422;
    protected string $errorCode = 'TEST_NOT_CREATED';
}
```

## Что НЕ делать

- Не писать бизнес-логику, запросы Eloquent и расчёты в контроллере.
- Не передавать в сервис россыпь параметров, если их больше одного — только DTO.
- Не брать данные из `$request->all()`, `$request->input()`, `$request->get()` — только `$request->validated('ключ')`.
- Не принимать в контроллере голый `Illuminate\Http\Request` там, где есть входные данные — нужен кастомный реквест.
- Не возвращать ресурс (`JsonResource`) из метода сервиса.
- Не возвращать из контроллера сырой массив или модель вместо ресурса.
- Не возвращать ошибку как `response()->json(['error' => ...], 400)` — бросать наследника `ApiException`.
- Не ловить доменные исключения в контроллере, чтобы «переупаковать» ответ — у них есть `render()`.
- Не оставлять метод без типов параметров и без типа возврата.
- Не использовать snake_case в именах методов и переменных.
- Не объявлять методы контроллеров и сервисов как обычные (нестатические).
