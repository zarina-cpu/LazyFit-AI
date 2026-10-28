# ИИ-слой LazyFit

Читай этот файл, когда меняешь импорт ссылок, чат-тренера или промпты.

## Файлы

- Промпты, Gemini, демо-парсер: `lib/ai.js`
- Импорт: `POST /api/ai/parse` + страница `/import`
- Чат: `POST /api/ai/chat` + страница `/chat`
- Пересборка недели: `POST /api/ai/plan` → `lib/plan.js` `generatePlan`

## Контракт parse

Вход: FormData `sourceUrl`, `text`, опционально `file`.
Если все пустые → 400 «Нужна ссылка, текст или файл».

Выход упражнения:

```json
{
  "title": "короткое русское название",
  "description": "техника для ленивого новичка, 2–4 предложения",
  "mediaType": "VIDEO | IMAGE | GIF | LINK",
  "categories": ["Для спины", "Для ленивых"],
  "suitability": "LOSE_WEIGHT | GAIN_MUSCLE | MAINTAIN"
}
```

Категории только из списка в `lib/constants.js` / сиде. Всегда добавляй «Для ленивых».
Сохранение: `saveParsedExercise` в `lib/exercises.js`. Файлы — в `public/uploads`.

## Контракт chat

```json
{
  "reply": "дружелюбный ответ",
  "suggestions": [{ "title": "", "description": "", "categories": [], "mediaType": "IMAGE" }]
}
```

Если это болтовня — `suggestions: []`. Кнопка «В каталог» шлёт `POST /api/exercises`.

## Gemini

Модели по очереди: `gemini-2.0-flash` → `gemini-1.5-flash` → `gemini-1.5-pro`.
Ответ без markdown: вытаскивай JSON через `extractJson`.
Нет ключа или ошибка сети → `mockParse` / локальный чат с эвристиками по ключевым словам (спина, запястья, пресс…).

Системные правила тренера уже в `SYSTEM_RULES`: русский, диван, без героизма, осторожность с болью.
