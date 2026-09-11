# Roadmap — English Platform MVP

Источник истины: план `english_platform_mvp_532b8ba0`. Этот файл — рабочий чек-лист по фазам, чтобы двигаться маленькими проверяемыми шагами и не сваливаться в оверинжиниринг.

Продукт одной строкой: админ создаёт аккаунты и контент → студент днём готовится (10–15 слов, одно правило, примеры) → вечером преподаватель ведёт групповой урок по тем же материалам и готовому плану, не создавая его с нуля.

## Стек (зафиксировано)

- **Next.js (App Router) + TypeScript**, Tailwind CSS
- **Supabase**: Postgres + Auth + Row Level Security. Свой backend не пишем.
- `@supabase/ssr` + `@supabase/supabase-js` — уже установлены
- Публичной регистрации нет: аккаунты создаёт админ через Admin API (`service role`, только на сервере)
- Явно НЕ используем: Prisma, Docker Postgres, Auth.js, bcrypt в своём коде — пароли хранит только Supabase Auth

## Статус на сейчас

- [x] `package.json` с `@supabase/ssr`, `@supabase/supabase-js`
- [x] `.env.local` заполнен: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- [x] Next.js 16 + React 19 + Tailwind 4 + TypeScript установлены, сборка проходит
- [x] `.gitignore` есть, `.env.local` не попадает в Git
- [x] Git-репозиторий инициализирован
- [ ] Схема БД, RLS, seed — не созданы

Supabase CLI в системе не установлен: миграции Фазы 1 применяем через SQL Editor либо ставим CLI отдельно.

**Важно:** `SUPABASE_SERVICE_ROLE_KEY` в `.env.local` даёт полный доступ к базе в обход RLS. Он должен попасть в `.gitignore` до первого коммита и никогда не использоваться в клиентском коде.

## Фаза 0 — Каркас проекта

- [x] Next.js (TypeScript, App Router, Tailwind) развёрнут вручную поверх существующей папки — `create-next-app` не применим из-за конфликта с уже существующими `package.json`, `.git`, `ROADMAP.md`
- [x] `.gitignore` (`node_modules`, `.env*.local`, `.next`, `*.tsbuildinfo`)
- [x] `AGENTS.md` в корне — продуктовые правила и ограничения MVP
- [x] `.cursor/rules/product.mdc` — то же самое как rule для агента
- [x] `src/lib/supabase/client.ts` (браузер), `server.ts` (RSC/Server Actions), `admin.ts` (service role, `server-only`, только Admin Auth API)
- [x] Проверка: `npm run dev` поднимается, главная страница отдаёт 200; `build`, `lint`, `typecheck` чистые; `sb_secret_` отсутствует в клиентских чанках

## Фаза 1 — Схема БД, Auth, RLS

- [x] `supabase/migrations/` — таблицы: `profiles`, `groups`, `students`, `lessons`, `vocabulary_items`, `lesson_plans`, `student_lesson_progress`, `attendance`, `student_notes`, `placement_questions`
- [x] Enum роли `STUDENT | TEACHER | ADMIN`
- [x] Триггер `on_auth_user_created` → авто-создание строки в `profiles` (+ `students`, если роль `STUDENT`)
- [x] Хелперы (security definer): `public.current_app_role()`, `public.is_admin()`, `public.current_student_group_id()`, `public.teaches_group()` — без рекурсии RLS. Названо `current_app_role()`, а не `current_role()` из черновика, чтобы не совпадать с зарезервированным именем Postgres
- [x] Триггер `prevent_role_self_escalation` — доп. защита от смены своей роли напрямую через UPDATE, сверх RLS-политики
- [x] RLS-политики на все 10 таблиц по разделу «RLS» плана
- [x] `supabase/seed.sql` — 2 урока (11 и 10 слов, грамматика, план урока), 12 вопросов placement-теста. Идемпотентно (фиксированные id + `on conflict do nothing`)
- [ ] В Supabase Dashboard → Auth: выключить публичный Sign up
- [ ] Первый ADMIN создаётся вручную (Dashboard/SQL), проверка входа
- [ ] Применить миграции к hosted-проекту и проверить, что применились без ошибок

SQL-файлы написаны и вычитаны вручную (нет локального Postgres/Docker для реального прогона — по правилам проекта не поднимаем Docker Postgres). Применение к вашему hosted-проекту и создание первого админа — ждут вашего решения по способу применения (см. следующее сообщение) и остаются открытыми пунктами.

## Фаза 2 — Студент

- [ ] `middleware.ts`: нет сессии → `/login`; есть сессия → редирект по роли
- [ ] `/login` — email/пароль через Supabase Auth
- [ ] `/dashboard` — прогресс, текущий урок группы, список уроков, вечернее время + ссылка на встречу, ссылка на «Все слова»
- [ ] `/lessons/[id]` — слова, правило, примеры, кнопка «Я подготовился» → `student_lesson_progress`
- [ ] `/words` — слова из завершённых уроков
- [ ] `/profile` — имя, email, группа, смена пароля (`supabase.auth.updateUser`)
- [ ] Проверка: студент не видит чужую группу и `lesson_plans` даже прямым запросом (RLS, не только UI)

## Фаза 3 — Преподаватель

- [ ] `/teacher` — свои группы, текущий урок, ссылка на встречу
- [ ] `/teacher/groups/[id]` — студенты группы, прогресс, посещаемость на сегодня, заметки
- [ ] `/teacher/lessons/[id]` — словарь, грамматика, план урока (read-only)
- [ ] Server Actions: отметка посещаемости, добавление заметки
- [ ] Проверка: преподаватель видит только свои группы

## Фаза 4 — Админ

- [ ] `/admin/students`, `/admin/teachers` — CRUD + создание через Admin API (`auth.admin.createUser`), начальный пароль показывается один раз
- [ ] `/admin/groups` — название, преподаватель, ссылка на встречу, время урока, текущий урок, состав (без лимита студентов)
- [ ] `/admin/lessons` — заголовок, порядок, грамматика, список слов, план для преподавателя, материалы
- [ ] Проверка: полный цикл — создать преподавателя, нескольких студентов, группу, 2 урока, назначить текущий урок

## Фаза 5 — Публичный placement-test

- [ ] `/placement-test` — 10–15 вопросов без аутентификации (`anon` SELECT по RLS)
- [ ] Результат считается и показывается в браузере сразу, никуда не сохраняется
- [ ] Проверка: доступен без логина, не создаёт запись пользователя

## Фаза 6 — Сквозная проверка

- [ ] Сценарий полностью: админ → преподаватель → студент → вечерний план у преподавателя совпадает с тем, что готовил студент
- [ ] Гость проходит placement-test
- [ ] Явная проверка изоляции данных между двумя разными группами

## Не делаем в MVP (пока не будет отдельного запроса)

Публичная регистрация, платежи/подписки, собственная видеосвязь, мобильное приложение, ИИ-преподаватель, распознавание речи, сложная геймификация, соцсеть/чат между студентами, сертификаты, сложная аналитика, Supabase Storage, лимит размера группы, CMS для уроков.
