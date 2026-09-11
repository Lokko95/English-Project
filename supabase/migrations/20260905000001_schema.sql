-- Роли и таблицы MVP. RLS подключается отдельной миграцией (20260905000004),
-- поэтому до её применения таблицы открыты только для service_role/postgres.

create type public.user_role as enum ('STUDENT', 'TEACHER', 'ADMIN');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role public.user_role not null default 'STUDENT',
  created_at timestamptz not null default now()
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  order_index integer not null,
  title text not null,
  grammar_title text not null,
  grammar_body text not null,
  materials text,
  created_at timestamptz not null default now()
);
create unique index lessons_order_index_key on public.lessons (order_index);

create table public.vocabulary_items (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  word text not null,
  translation text not null,
  example text not null,
  transcription text,
  order_index integer not null
);
create index vocabulary_items_lesson_id_idx on public.vocabulary_items (lesson_id);

-- Отдельная таблица (не колонка в lessons), чтобы политика RLS могла закрыть
-- план урока от студентов независимо от общего контента урока.
create table public.lesson_plans (
  lesson_id uuid primary key references public.lessons (id) on delete cascade,
  body text not null
);

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  teacher_id uuid references public.profiles (id) on delete set null,
  meeting_url text,
  evening_time text,
  current_lesson_id uuid references public.lessons (id) on delete set null,
  created_at timestamptz not null default now()
);
create index groups_teacher_id_idx on public.groups (teacher_id);

-- id = profiles.id: один студент — максимум одна группа (group_id nullable
-- до назначения). Лимита на число студентов в группе нет.
create table public.students (
  id uuid primary key references public.profiles (id) on delete cascade,
  group_id uuid references public.groups (id) on delete set null
);
create index students_group_id_idx on public.students (group_id);

create table public.student_lesson_progress (
  student_id uuid not null references public.students (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  status text not null default 'IN_PROGRESS' check (status in ('IN_PROGRESS', 'COMPLETED')),
  completed_at timestamptz,
  primary key (student_id, lesson_id)
);

create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  group_id uuid not null references public.groups (id) on delete cascade,
  attended_on date not null default current_date,
  present boolean not null default true,
  unique (student_id, attended_on)
);
create index attendance_group_id_idx on public.attendance (group_id);

create table public.student_notes (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  author_id uuid references public.profiles (id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);
create index student_notes_student_id_idx on public.student_notes (student_id);

-- Результаты теста не храним: гость отвечает и видит уровень в браузере.
create table public.placement_questions (
  id uuid primary key default gen_random_uuid(),
  order_index integer not null,
  question text not null,
  options jsonb not null,
  level_hint text
);
create unique index placement_questions_order_index_key on public.placement_questions (order_index);
