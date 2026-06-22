# BoSore

Сервис по обмену описаниями книг, статей и оформлениями их как источники для списка литературы.

Стек: **Next.js (App Router)** + **Prisma** + **NeonDB (PostgreSQL)**. Готов к деплою на **Vercel**.

## Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. База данных Neon

1. Создайте проект на [console.neon.tech](https://console.neon.tech).
2. Скопируйте connection string (формат Prisma/PostgreSQL).
3. Создайте `.env` из примера:

```bash
cp .env.example .env
```

4. Вставьте строку подключения в `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require"
```

### 3. Миграция и seed

```bash
npm run db:migrate
npm run db:seed
```

При первой миграции Prisma спросит имя — можно указать `init`.

### 4. Локальный запуск

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) — на главной странице отобразятся записи из PostgreSQL.

## Деплой на Vercel

1. Залейте репозиторий на GitHub.
2. Импортируйте проект в [Vercel](https://vercel.com).
3. В **Settings → Environment Variables** добавьте `DATABASE_URL` (тот же Neon connection string).
4. Деплой. Скрипт `build` автоматически выполнит `prisma generate`.

### Миграции на production

После первого деплоя примените миграции к production-базе:

```bash
DATABASE_URL="postgresql://..." npm run db:deploy
```

Затем заполните данные (один раз):

```bash
DATABASE_URL="postgresql://..." npm run db:seed
```

## Структура

```
src/
  app/
    page.tsx      # главная страница, публичные Source из БД
    layout.tsx
  lib/
    prisma.ts     # singleton Prisma Client
prisma/
  schema.prisma   # модели User, Source, Vote и др.
  seed.ts         # тестовые источники
scripts/
  verify-db.ts    # проверка: пользователь, источник, голос
```

## Модель Source (источник)

| Поле        | Тип      | Описание                                      |
|-------------|----------|-----------------------------------------------|
| content     | String   | Описание книги / статьи                       |
| description | String?  | Оформление источника по ГОСТ                   |
| visibility  | Enum     | PRIVATE / PUBLIC                              |
| title       | String   | Краткая метка записи в системе                |

Подробнее — в [DATABASE.md](./DATABASE.md).

## Полезные команды

| Команда              | Описание                        |
|----------------------|---------------------------------|
| `npm run dev`        | Локальная разработка            |
| `npm run build`      | Сборка (Vercel)                 |
| `npm run db:migrate` | Миграция (dev)                  |
| `npm run db:deploy`  | Миграция (production)           |
| `npm run db:seed`    | Заполнение тестовыми источниками |
| `npm run db:verify`  | Проверка схемы БД               |
| `npm run db:studio`  | Prisma Studio                   |
