# BoSore

Сервис по обмену описаниями книг, статей и оформлениями их как источники для списка литературы.

Стек: **Next.js (App Router)** + **Auth.js** + **Prisma** + **NeonDB (PostgreSQL)**. Деплой: **Vercel**.

## Аутентификация (Google OAuth)

1. Создайте OAuth Client в [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Authorized redirect URI:
   - локально: `http://localhost:3000/api/auth/callback/google`
   - production: `https://YOUR_DOMAIN/api/auth/callback/google`
3. Добавьте в `.env`:

```env
AUTH_SECRET="..."          # openssl rand -base64 32
AUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

4. Примените миграцию auth: `npm run db:deploy`

**Маршруты:**
- `/login` — вход через Google
- `/dashboard` — личный кабинет (защищён middleware)
- `/my-prompts` — источники пользователя, включая PRIVATE

При первом входе пользователь автоматически создаётся в таблице `User`. Сессии хранятся server-side в таблице `Session`.

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
3. В **Settings → Environment Variables** добавьте:
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `AUTH_URL` (https://your-domain.vercel.app)
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
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
  auth.ts                 # конфигурация Auth.js
  middleware.ts           # защита /dashboard, /my-prompts
  app/
    login/page.tsx        # вход через Google
    dashboard/page.tsx    # личный кабинет
    my-prompts/page.tsx   # источники владельца (PRIVATE + PUBLIC)
    api/auth/[...nextauth]/route.ts
  lib/auth/
    session.ts            # requireAuth(), getCurrentUserId()
    access.ts             # фильтры доступа к Source
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
| `npm run view-db`    | Просмотр БД (порт 3001)         |

## view-db

Тестовая утилита для просмотра и редактирования таблиц PostgreSQL.

```bash
npm run view-db
```

Откройте [http://localhost:3001/view-db](http://localhost:3001/view-db).

1. Выберите **локальную** (`DATABASE_URL`) или **рабочую** (`DATABASE_URL_PROD`) БД.
2. Нажмите **Подключиться** — появится список таблиц.
3. Нажмите **Открыть** — таблица с пагинацией и кнопками Create / Edit / Delete.

На production доступна только при `VIEW_DB_ENABLED=1`.
