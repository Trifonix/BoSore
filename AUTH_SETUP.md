# Настройка аутентификации (Google OAuth)

BoSore использует **Auth.js** с OAuth-провайдером **Google** и server-side сессиями в PostgreSQL.

## 1. Google Cloud Console — создание OAuth Client ID

### Шаг 1. Проект

1. Откройте [Google Cloud Console](https://console.cloud.google.com/).
2. Создайте новый проект или выберите существующий (например, `BoSore`).

### Шаг 2. OAuth consent screen

1. Перейдите в **APIs & Services → OAuth consent screen**.
2. User Type: **External** (для тестирования) или **Internal** (только для Google Workspace).
3. Заполните обязательные поля:
   - App name: `BoSore`
   - User support email
   - Developer contact email
4. Scopes: достаточно базовых (`email`, `profile`, `openid`) — Auth.js запросит их автоматически.
5. Test users (если приложение в статусе **Testing**): добавьте email-адреса, с которых будете входить.

### Шаг 3. Credentials — OAuth Client ID

1. Перейдите в **APIs & Services → Credentials**.
2. Нажмите **Create Credentials → OAuth client ID**.
3. Application type: **Web application**.
4. Name: `BoSore Web` (любое понятное имя).
5. **Authorized JavaScript origins** (опционально, для локальной разработки):
   ```
   http://localhost:3000
   https://YOUR_DOMAIN.vercel.app
   ```
6. **Authorized redirect URIs** — обязательно:
   ```
   http://localhost:3000/api/auth/callback/google
   https://YOUR_DOMAIN.vercel.app/api/auth/callback/google
   ```
7. Нажмите **Create**.
8. Скопируйте **Client ID** и **Client Secret**.

> Redirect URI должен совпадать **точно** (протокол, домен, путь).  
> Для Vercel замените `YOUR_DOMAIN.vercel.app` на реальный домен проекта.

## 2. Переменные окружения

Скопируйте `.env.example` в `.env` и заполните:

```env
# PostgreSQL (Neon)
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require"

# Auth.js — секрет для подписи сессий
# Сгенерировать: openssl rand -base64 32
AUTH_SECRET="your-auth-secret"

# URL приложения
AUTH_URL="http://localhost:3000"

# Google OAuth (из шага 3)
GOOGLE_CLIENT_ID="123456789-abc.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-..."
```

### Production (Vercel)

В **Settings → Environment Variables** добавьте те же переменные:

| Переменная | Пример |
|------------|--------|
| `DATABASE_URL` | Neon connection string |
| `AUTH_SECRET` | тот же или новый секрет |
| `AUTH_URL` | `https://your-domain.vercel.app` |
| `GOOGLE_CLIENT_ID` | Client ID из Google Console |
| `GOOGLE_CLIENT_SECRET` | Client Secret |

Redirect URI в Google Console для production:
```
https://your-domain.vercel.app/api/auth/callback/google
```

## 3. Миграция базы данных

Auth.js хранит пользователей и сессии в таблицах `User`, `Account`, `Session`.

```bash
npm run db:deploy
```

## 4. Проверка

```bash
npm run dev
```

1. Откройте [http://localhost:3000/login](http://localhost:3000/login).
2. Нажмите **Войти через Google**.
3. После входа — редирект на `/dashboard`.
4. В БД появится запись в `User` и `Session`.

## Маршруты

| URL | Описание |
|-----|----------|
| `/login` | Страница входа |
| `/dashboard` | Личный кабинет (требует авторизации) |
| `/my-prompts` | Источники пользователя, включая PRIVATE |

## Частые проблемы

**`redirect_uri_mismatch`**  
Redirect URI в Google Console не совпадает с фактическим URL callback. Проверьте `AUTH_URL` и URI в credentials.

**`Access blocked: This app's request is invalid`**  
Не заполнен OAuth consent screen или приложение не опубликовано / пользователь не в списке Test users.

**Пользователь не создаётся в БД**  
Убедитесь, что миграция auth применена (`npm run db:deploy`) и `DATABASE_URL` доступен.

**Сессия не сохраняется на Vercel**  
Проверьте `AUTH_SECRET` и `AUTH_URL` в environment variables production-окружения.
