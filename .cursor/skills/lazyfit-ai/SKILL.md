---
name: lazyfit-ai
description: >-
  Разработка и доработка LazyFit AI — ленивого фитнес-тренера (Next.js 15, JavaScript,
  Prisma, Auth.js, Gemini). Используй этот навык, когда пользователь просит упражнения
  с дивана, импорт ссылки из TikTok/YouTube, план на неделю, чат «болят запястья»,
  фейсфитнес, похудение без зала, статистику подходов, или работает в репозитории
  LazyFit-AI / lazyfit-ai — даже если не называет проект явно. Также применяй при
  правках каталога, OTP-входа, темы, нижней навигации и AI-парсера.
---

# LazyFit AI

Каноническая версия навыка. При работе в репозитории читай этот файл целиком.
Для промптов и JSON ИИ — `references/ai.md`. Для темы и адаптивки — `references/ui.md`.

## Стек

- Язык: **только JavaScript** (`.js` / `.jsx`), не TypeScript.
- Next.js 15 App Router, React 19, Tailwind 3.
- Prisma 5 + SQLite (`DATABASE_URL=file:./dev.db`). Turso — опционально, не ломай локальный SQLite.
- Auth.js v5 (`next-auth` beta): `auth.js` (Node + Prisma), `auth.config.js` (Edge, без Prisma).
- Gemini опционален: `GEMINI_API_KEY`. Без ключа обязателен демо-fallback.
- UI на русском, тон «тренер для дивана»: тепло, коротко, без токсичной мотивации.

Запуск: `npm run setup` (generate + db push + seed), затем `npm run dev`.
Демо-вход: `lazy@lazyfit.app`. Телефон OTP в демо: `123456`.

## Когда открывать какие файлы

| Задача | Куда идти |
|---|---|
| Тема, цвета, зерно | `app/globals.css`, `components/ThemeProvider.js`, `ThemeToggle.js` |
| Навигация, шапка, док | `components/AppShell.js` |
| Вход | `auth.js`, `auth.config.js`, `middleware.js`, `components/LoginForm.js` |
| ИИ-импорт / чат | `lib/ai.js`, `app/api/ai/parse/route.js`, `app/api/ai/chat/route.js` |
| План недели | `lib/plan.js`, `app/api/ai/plan/route.js` |
| Каталог и карточки | `lib/exercises.js`, `lib/constants.js`, `prisma/seed.js` |
| Схема БД | `prisma/schema.prisma` |

Не импортируй Prisma в `middleware.js` и `auth.config.js` — Edge упадёт.

## Маршруты

Публичные: `/`, `/login`.
После входа: `/today`, `/plan`, `/exercises`, `/exercises/[id]`, `/import`, `/chat`, `/stats`, `/profile`.
Защита списка — `middleware.js`.

API: `POST /api/ai/parse`, `/api/ai/chat`, `/api/ai/plan`, `/api/exercises`, `/api/comments`, `/api/log`, `/api/profile`, `/api/auth/otp`.

## Доменные правила

Цели пользователя: `LOSE_WEIGHT` | `GAIN_MUSCLE` | `MAINTAIN`.
Категории (M2M, имена как в сиде): Для лица, Для шеи, Для спины, Для рук, Для ног, Для ягодиц, Для пресса, Для кора, Для ленивых.

Упражнения — для ленивых: диван, ковёр, сериал, бутылка воды. Без зала и сложного инвентаря.
Боль в запросе → щадящая альтернатива и совет врача при острой боли, не «через боль».

Новые упражнения из ИИ: `isCustom: true`, привязка к `userId`, плюс тег «Для ленивых».

## Как менять продукт

1. Сначала найди существующий экран и API — не плоди параллельные маршруты.
2. Валидируй ввод **до** проверки ключа Gemini.
3. Кнопки и активные пункты меню: `bg-fill text-white`, не `bg-sage text-white` (в тёмной теме sage слишком светлый).
4. Тема уже есть (`lazyfit-theme` в localStorage). Не удаляй переключатель; если делаешь новый UI — спроси, нужен ли выбор светлой/тёмной темы.
5. После правок UI проверь поток в браузере: клик, форма, соседние экраны, мобильная ширина (~390) и десктоп (~1280). Нижняя навигация не должна перекрывать кнопки — используй `.safe-bottom`.
6. `ThemeToggle` рендери иконку только после `mounted`, без lucide-id на гидрации.

## Тон копирайта

Русский. Можно лежать. Нельзя стыдить. Короткие заголовки в `.display` (шрифт Unbounded).
