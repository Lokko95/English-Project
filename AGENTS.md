# Правила проекта

MVP веб-платформы для изучения английского. Источник истины по фазам и объёму работ — [ROADMAP.md](ROADMAP.md).

## Модель продукта

Днём студент изучает 10–15 слов, одно грамматическое правило и примеры. Вечером преподаватель проводит групповой урок ровно по тем же материалам, используя готовый план урока, а не создавая его сам. Онлайн-встреча — внешняя ссылка (Zoom).

Роли ровно три: `STUDENT`, `TEACHER`, `ADMIN`. Публичной регистрации нет — аккаунты создаёт админ. Без аутентификации доступен только тест на определение уровня.

Один студент состоит максимум в одной группе. В группе может быть сколько угодно студентов, лимита нет.

## Стек

Next.js (App Router) + TypeScript + React + Tailwind CSS. Данные, авторизация и права — Supabase (PostgreSQL, Auth, RLS), обращение через `@supabase/ssr` и `@supabase/supabase-js`.

Не использовать: Prisma, Auth.js, Docker PostgreSQL, Firebase, отдельный backend, bcrypt (пароли хранит только Supabase Auth), Supabase Storage.

## Безопасность

- `SUPABASE_SERVICE_ROLE_KEY` — только на сервере, только в `src/lib/supabase/admin.ts`, только для Admin Auth API. Никогда в клиентском коде и никогда в переменной с префиксом `NEXT_PUBLIC_`.
- `.env.local` не попадает в Git.
- Авторизация обеспечивается RLS на уровне базы, а не только UI. Middleware — лишь маршрутизация.
- Студент не имеет доступа к `lesson_plans`.
- Преподаватель видит только свои группы. Пользователь не видит данные чужой группы.

## Ограничения MVP

Не реализовывать без отдельного явного запроса: публичную регистрацию, платежи и подписки, собственную видеосвязь, мобильное приложение, ИИ-преподавателя, распознавание речи, сложную геймификацию, соцсеть и чат между студентами, сертификаты, сложную аналитику, CMS для уроков, лимит размера группы.

## Подход к разработке

Сначала минимальная полезная версия. Без оверинжиниринга. Не добавлять функции про запас. Работать последовательно по фазам ROADMAP.md, останавливаясь на подтверждение после каждой.

Интерфейс на русском языке; учебный контент — английские слова и правила с русским переводом.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
