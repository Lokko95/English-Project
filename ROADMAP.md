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
- [x] Схема БД, RLS, seed применены к hosted-проекту, первый ADMIN создан

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
- [x] `supabase/seed.sql` — демо-группа + 2 урока этой группы (11 и 10 слов, грамматика, план урока), 12 вопросов placement-теста. Идемпотентно (фиксированные id + `on conflict do nothing`)
- [x] Применить миграции к hosted-проекту — проверено через REST API (`profiles`, `lessons`, `vocabulary_items`, `placement_questions` отвечают 200 с данными)
- [x] Первый ADMIN создан и подтверждён в `profiles` (роль `ADMIN`)
- [x] В Supabase Dashboard → Auth: выключить публичный Sign up — уточнить у пользователя, сделано ли
- [x] Уроки привязаны к группе (`lessons.group_id`): порядок локален для группы, `groups.level` не генерирует уроки, RLS закрывает чужие и будущие уроки студенту — миграция `20260915000001_lessons_per_group.sql`

Фаза 1 практически закрыта. Остался один пункт для проверки — отключение публичной регистрации в Dashboard.

## Фаза 2 — Студент

- [x] `src/proxy.ts` — в Next.js 16 `middleware.ts` переименован в `proxy.ts` (функция `proxy`, не `middleware`); оптимистичная проверка сессии, без сессии на закрытых путях → `/login`. Ролевые редиректы — в `src/lib/auth/session.ts` (`requireRole`, `getCurrentProfile`), вызываются из страниц/layout, а не из proxy (по рекомендации Next.js — не гонять запросы к БД на каждый префетч)
- [x] `/login` — email/пароль через Supabase Auth (`useActionState` + Server Action)
- [x] `/dashboard` — прогресс (X из Y), текущий урок группы, список уроков со статусом, вечернее время + ссылка на встречу, ссылка на «Все слова»
- [x] `/lessons/[id]` — слова, правило, примеры, кнопка «Я подготовился» → upsert в `student_lesson_progress`
- [x] `/words` — слова из уроков со статусом `COMPLETED`
- [x] `/profile` — имя, email, группа, смена пароля (`supabase.auth.updateUser`)
- [x] Проверка: `typecheck`, `lint`, `build` чистые; `/dashboard` без сессии → 307 на `/login`; `/` и `/login` отдают 200 гостю
- [ ] Проверка вручную: студент не видит чужую группу и `lesson_plans` даже прямым запросом (RLS) — ждёт ручного тестирования пользователем с тестовым аккаунтом

## Фаза 3 — Преподаватель

- [x] `/teacher` — свои группы, текущий урок, ссылка на встречу
- [x] `/teacher/groups/[id]` — студенты группы, прогресс, посещаемость на сегодня, заметки
- [x] `/teacher/lessons/[id]` — словарь, грамматика, план урока (read-only)
- [x] Server Actions: отметка посещаемости, добавление заметки
- [x] Проверка: `typecheck`/`lint`/`build`; чужие группы режет RLS (`teaches_group`) → 404, не 403. Ручная проверка с двумя преподавателями — после появления тестовых аккаунтов в Фазе 4

## Фаза 4 — Админ

- [x] `/admin/students`, `/admin/teachers` — CRUD + создание через Admin API (`auth.admin.createUser`), начальный пароль показывается один раз
- [x] `/admin/groups` — название, преподаватель, ссылка на встречу, время урока, текущий урок, состав (без лимита студентов)
- [x] `/admin/lessons` — заголовок, порядок, грамматика, список слов, план для преподавателя, материалы; урок привязан к группе
- [x] `typecheck`/`lint`/`build`; гость с `/admin` → `/login`. Полный цикл в UI — вручную под аккаунтом ADMIN

## Фаза 5 — Публичный placement-test

- [x] `/placement-test` — 12 вопросов без аутентификации (`anon` SELECT по RLS)
- [x] Результат считается в Server Action и показывается в браузере сразу, никуда не сохраняется
- [x] Правильные ответы не отдаются клиенту вместе с вопросами
- [x] Гость проходит тест без логина, аккаунт не создаётся
- [x] Применить `supabase/migrations/20260916000001_placement_public.sql` в SQL Editor: ключ ответов ушёл из anon REST, проверка — RPC `grade_placement_answers`

## Фаза 6 — Сквозная проверка

- [x] Сценарий полностью: админ → преподаватель → студент → вечерний план у преподавателя совпадает с тем, что готовил студент
- [x] Гость проходит placement-test
- [ ] Явная проверка изоляции данных между двумя разными группами — RLS готов (`can_read_lesson` / `teaches_group`), живой прогон с двумя преподавателями ещё не делали

## Не делаем в MVP (пока не будет отдельного запроса)

Публичная регистрация, платежи/подписки, собственная видеосвязь, мобильное приложение, ИИ-преподаватель, распознавание речи, сложная геймификация, соцсеть/чат между студентами, сертификаты, сложная аналитика, Supabase Storage, лимит размера группы, CMS для уроков.
