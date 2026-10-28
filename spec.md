# Technical Specification: AI Lazy Trainer ("LazyFit AI")
## Stack: Next.js 15, Turso (LibSQL), Prisma, Auth.js v5
## Deployment: Vercel

---

## 1. Архитектурный стек (Tech Stack)

*   **Фронтенд & Бэкенд:** Next.js 15 (App Router, Server Actions, API Routes)
*   **База данных:** Turso (Распределенная база данных на основе SQLite / libSQL)
*   **ORM:** Prisma с официальным драйвером `@prisma/adapter-libsql`
*   **Авторизация:** Auth.js v5 (NextAuth.js) — Google OAuth, Email (Magic Links), Phone (SMS OTP via Credentials Provider)
*   **Хранилище медиа (Видео/Фото):** AWS S3 или Cloudflare R2 (загрузка через Presigned URLs)
*   **ИИ-слой:** OpenAI API (GPT-4o) / Gemini API (для анализа длинных видео по ссылкам)
*   **Хостинг приложения:** Vercel

---

## 2. Схема базы данных (Prisma Schema для Turso)

Turso использует libSQL (SQLite-совместимый движок). В SQLite нет нативного типа `Enum`, поэтому роли, типы целей и статусы хранятся как `String` с валидацией на уровне приложения. Связи Many-to-Many реализуются через явную промежуточную таблицу.

```prisma
datasource db {
  provider = "sqlite"
  url      = "libsql://your-database.turso.io"
}

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}

model User {
  id            String          @id @default(uuid())
  name          String?
  email         String?         @unique
  emailVerified DateTime?
  phone         String?         @unique
  phoneVerified DateTime?
  image         String?
  targetGoal    String          @default("MAINTAIN") // "LOSE_WEIGHT", "GAIN_MUSCLE", "MAINTAIN"
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  accounts      Account[]
  sessions      Session[]
  exercises     Exercise[]      @relation("UserExercises")
  workoutPlans  WorkoutPlan[]
  comments      Comment[]
  otps          OtpVerification[]
}

model Account {
  id                String  @id @default(uuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(uuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model OtpVerification {
  id        String   @id @default(uuid())
  phone     String
  code      String
  expiresAt DateTime
  createdAt DateTime @default(now())
  user      User?    @relation(fields: [phone], references: [phone])
}

model Exercise {
  id          String                   @id @default(uuid())
  title       String
  description String
  mediaUrl    String?                  // Ссылка на S3/R2 (видео, картинка, gif)
  mediaType   String?                  // "VIDEO", "IMAGE", "GIF", "LINK"
  sourceUrl   String?                  // Исходная ссылка, откуда спарсил AI
  isCustom    Boolean                  @default(false)
  userId      String?                  // null для общих упражнений
  user        User?                    @relation("UserExercises", fields: [userId], references: [id])
  categories  CategoriesOnExercises[]
  workoutDays WorkoutDayToExercise[]
}

model Category {
  id        String                   @id @default(uuid())
  name      String                   @unique // Например: "Для лица", "Для спины", "Для рук"
  exercises CategoriesOnExercises[]
}

model CategoriesOnExercises {
  exerciseId String
  categoryId String
  exercise   Exercise @relation(fields: [exerciseId], references: [id], onDelete: Cascade)
  category   Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  @@id([exerciseId, categoryId])
}

model WorkoutPlan {
  id        String       @id @default(uuid())
  userId    String
  user      User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  days      WorkoutDay[]
  createdAt DateTime     @default(now())
}

model WorkoutDay {
  id            String                 @id @default(uuid())
  planId        String
  workoutPlan   WorkoutPlan            @relation(fields: [planId], references: [id], onDelete: Cascade)
  dayOfWeek     Int                    // 1 = Понедельник, 7 = Воскресенье
  exercises     WorkoutDayToExercise[]
  notes         String?                // Комментарий AI к этому дню (например, "Легкий день")
}

model WorkoutDayToExercise {
  workoutDayId String
  exerciseId   String
  order        Int                    // Порядок выполнения ленивым пользователем
  workoutDay   WorkoutDay             @relation(fields: [workoutDayId], references: [id], onDelete: Cascade)
  exercise     Exercise               @relation(fields: [exerciseId], references: [id], onDelete: Cascade)

  @@id([workoutDayId, exerciseId])
}

model Comment {
  id         String   @id @default(uuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  contextType String  // "PLAN_DAY", "EXERCISE"
  contextId   String  // ID дня тренировки или конкретного упражнения
  text       String
  createdAt  DateTime @default(now())
}
```

---

## 3. Модуль авторизации (Auth.js + Turso Backend)

### Конфигурация `src/auth.ts`
```typescript
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const libsql = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});
const adapter = new PrismaLibSQL(libsql);
const prisma = new PrismaClient({ adapter });

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      name: "Phone OTP",
      credentials: {
        phone: { label: "Phone Number", type: "text" },
        code: { label: "OTP Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.code) return null;

        const phone = credentials.phone as string;
        const code = credentials.code as string;

        // 1. Проверяем OTP код в базе Turso
        const otpRecord = await prisma.otpVerification.findFirst({
          where: { phone, code, expiresAt: { gte: new Date() } },
        });

        if (!otpRecord) throw new Error("Неверный или просроченный код");

        // Удаляем использованный код
        await prisma.otpVerification.delete({ where: { id: otpRecord.id } });

        // 2. Ищем или создаем пользователя
        let user = await prisma.user.findUnique({ where: { phone } });
        if (!user) {
          user = await prisma.user.create({
            data: { phone, phoneVerified: new Date() },
          });
        }

        return { id: user.id, name: user.name, email: user.email, image: user.image };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
});
```

---

## 4. Спецификация AI API и парсинга ссылок/медиа

### Маршрут: `POST /api/ai/parse`
Принимает ссылку, файл видео, гифку или изображение. Парсит контент и возвращает структуру упражнения.

*   **Если отправлена ссылка (YouTube, TikTok, Telegram):** Бэкенд задействует Gemini 1.5 Pro API (благодаря нативной поддержке анализа длинного видеоконтента по URL/хранилищу) либо вытягивает транскрипцию текста, отправляя её в GPT-4o.
*   **Результат обработки:** ИИ возвращает строго структурированный JSON, который приложение автоматически сохраняет в базу Turso и привязывает к аккаунту пользователя (`isCustom: true`).

**Пример JSON-ответа от AI-обработчика:**
```json
{
  "title": "Ленивый подъем таза (Глютеальный мостик на диване)",
  "description": "Лежа на диване, стопы на полу. Медленно поднимайте таз вверх, задерживаясь в верхней точке на 2 секунды. Идеально во время просмотра сериала.",
  "mediaType": "VIDEO",
  "categories": ["Для ног", "Для ягодиц", "Для ленивых"],
  "suitability": "LOSE_WEIGHT"
}
```

---

## 5. Инструкция по деплою приложения на Vercel с Turso

### Шаг 1: Подготовка Turso DB
1. Установите Turso CLI и создайте базу данных: `turso db create lazyfit-db`
2. Получите URL базы данных: `turso db show lazyfit-db --url`
3. Сгенерируйте токен аутентификации: `turso db tokens create lazyfit-db`

### Шаг 2: Настройка Prisma локально
В файле `.env` пропишите полученные доступы:
```env
TURSO_DATABASE_URL="libsql://lazyfit-db-username.turso.io"
TURSO_AUTH_TOKEN="your-long-auth-token"
```
Запустите генерацию клиента и пуш схемы в Turso:
```bash
npx prisma generate
npx prisma db push
```

### Шаг 3: Деплой на Vercel
1. Импортируйте ваш репозиторий Next.js в панель Vercel.
2. В разделе **Environment Variables** добавьте следующие переменные:
   * `TURSO_DATABASE_URL` (Ссылка на вашу распределенную базу Turso)
   * `TURSO_AUTH_TOKEN` (Токен авторизации Turso)
   * `AUTH_SECRET` (Любая случайная длинная строка для шифрования сессий NextAuth)
   * `AUTH_GOOGLE_ID` & `AUTH_GOOGLE_SECRET` (Из консоли Google Cloud Console)
   * `NEXT_PUBLIC_APP_URL` (URL вашего продакшн-сайта на Vercel)
3. Нажмите **Deploy**. Vercel автоматически соберет проект. Благодаря Edge-архитектуре Turso, запросы к базе данных из серверных функций Next.js будут выполняться с минимальным пингом.