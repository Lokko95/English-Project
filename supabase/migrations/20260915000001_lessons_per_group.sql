-- Уроки больше не глобальный каталог: каждый урок принадлежит конкретной
-- группе. order_index локален для группы. У группы есть уровень (A1–B2),
-- но уровень не создаёт уроки автоматически.

-- ── groups.level ───────────────────────────────────────────────────────────

alter table public.groups
  add column if not exists level text not null default 'A1';

alter table public.groups
  drop constraint if exists groups_level_check;

alter table public.groups
  add constraint groups_level_check check (level in ('A1', 'A2', 'B1', 'B2'));

-- ── lessons.group_id ───────────────────────────────────────────────────────

alter table public.lessons
  add column if not exists group_id uuid references public.groups (id) on delete cascade;

-- Существующие глобальные уроки (seed Фазы 1) привязываем к группе, которая
-- уже ссылается на них через current_lesson_id; иначе — к самой старой
-- группе; если групп нет — создаём демо-группу. Не клонируем контент:
-- одинаковый глобальный урок не может одновременно быть текущим у двух групп.
do $$
declare
  v_group_id uuid;
begin
  if exists (select 1 from public.lessons where group_id is null) then
    select g.id into v_group_id
    from public.groups g
    where g.current_lesson_id in (select id from public.lessons where group_id is null)
    order by g.created_at
    limit 1;

    if v_group_id is null then
      select id into v_group_id from public.groups order by created_at limit 1;
    end if;

    if v_group_id is null then
      insert into public.groups (id, name, level)
      values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Демо-группа', 'A1')
      returning id into v_group_id;
    end if;

    update public.lessons
    set group_id = v_group_id
    where group_id is null;
  end if;
end $$;

alter table public.lessons
  alter column group_id set not null;

create index if not exists lessons_group_id_idx on public.lessons (group_id);

drop index if exists public.lessons_order_index_key;

alter table public.lessons
  drop constraint if exists lessons_group_id_order_index_key;

alter table public.lessons
  add constraint lessons_group_id_order_index_key unique (group_id, order_index);

-- current_lesson_id должен указывать на урок ЭТОЙ группы. Составной FK
-- (current_lesson_id, id) → lessons(id, group_id) нельзя с ON DELETE SET NULL:
-- Postgres обнулил бы и groups.id. Поэтому оставляем простой FK SET NULL
-- и проверяем принадлежность триггером.

create or replace function public.enforce_current_lesson_same_group()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.current_lesson_id is null then
    return new;
  end if;

  if not exists (
    select 1 from public.lessons l
    where l.id = new.current_lesson_id and l.group_id = new.id
  ) then
    raise exception 'current_lesson_id должен быть уроком этой группы';
  end if;

  return new;
end;
$$;

drop trigger if exists groups_current_lesson_same_group on public.groups;
create trigger groups_current_lesson_same_group
  before insert or update of current_lesson_id, id on public.groups
  for each row execute function public.enforce_current_lesson_same_group();

-- Нельзя перенести текущий урок в другую группу, не сбросив current_lesson_id.
create or replace function public.prevent_moving_current_lesson()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.group_id is distinct from old.group_id
     and exists (
       select 1 from public.groups g
       where g.current_lesson_id = old.id
     )
  then
    raise exception 'Сначала снимите current_lesson_id у группы, затем меняйте group_id урока';
  end if;
  return new;
end;
$$;

drop trigger if exists lessons_prevent_moving_current on public.lessons;
create trigger lessons_prevent_moving_current
  before update of group_id on public.lessons
  for each row execute function public.prevent_moving_current_lesson();

-- После привязки уроков сбросить current_lesson_id, если он указывает
-- на урок чужой группы (вторая группа, которая смотрела на бывший глобальный урок).
update public.groups g
set current_lesson_id = null
where g.current_lesson_id is not null
  and not exists (
    select 1 from public.lessons l
    where l.id = g.current_lesson_id and l.group_id = g.id
  );

-- Студент не меняет свою группу сам — только админ (доп. сеть сверх RLS).
create or replace function public.prevent_student_group_self_assign()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.group_id is distinct from old.group_id and not public.is_admin() then
    raise exception 'Назначение группы доступно только администратору';
  end if;
  return new;
end;
$$;

drop trigger if exists students_prevent_group_self_assign on public.students;
create trigger students_prevent_group_self_assign
  before update on public.students
  for each row execute function public.prevent_student_group_self_assign();

-- ── Хелпер доступа к уроку (security definer, без рекурсии RLS) ────────────
-- STUDENT: уроки своей группы с order_index <= текущему уроку группы.
-- TEACHER: все уроки групп, которые преподаёт (включая будущие).
-- ADMIN: все.

create or replace function public.can_read_lesson(p_lesson_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.lessons l
    join public.groups g on g.id = l.group_id
    where l.id = p_lesson_id
      and (
        public.is_admin()
        or (
          public.current_app_role() = 'TEACHER'
          and g.teacher_id = auth.uid()
        )
        or (
          public.current_app_role() = 'STUDENT'
          and l.group_id = public.current_student_group_id()
          and g.current_lesson_id is not null
          and l.order_index <= (
            select current_l.order_index
            from public.lessons current_l
            where current_l.id = g.current_lesson_id
          )
        )
      )
  );
$$;

grant execute on function public.can_read_lesson(uuid) to authenticated;

-- ── RLS: уроки больше не общий каталог ─────────────────────────────────────

drop policy if exists lessons_select_authenticated on public.lessons;
drop policy if exists lessons_select_student on public.lessons;
drop policy if exists lessons_select_teacher on public.lessons;
drop policy if exists lessons_select_admin on public.lessons;

create policy lessons_select_student on public.lessons
  for select using (
    public.current_app_role() = 'STUDENT'
    and public.can_read_lesson(id)
  );

create policy lessons_select_teacher on public.lessons
  for select using (
    public.current_app_role() = 'TEACHER'
    and public.teaches_group(group_id)
  );

create policy lessons_select_admin on public.lessons
  for select using (public.is_admin());

drop policy if exists vocabulary_items_select_authenticated on public.vocabulary_items;
drop policy if exists vocabulary_items_select_via_lesson on public.vocabulary_items;

create policy vocabulary_items_select_via_lesson on public.vocabulary_items
  for select using (public.can_read_lesson(lesson_id));

drop policy if exists lesson_plans_select_teacher on public.lesson_plans;

create policy lesson_plans_select_teacher on public.lesson_plans
  for select using (
    public.current_app_role() = 'TEACHER'
    and public.can_read_lesson(lesson_id)
  );

drop policy if exists progress_insert_self on public.student_lesson_progress;
drop policy if exists progress_update_self on public.student_lesson_progress;

create policy progress_insert_self on public.student_lesson_progress
  for insert with check (
    student_id = auth.uid()
    and public.can_read_lesson(lesson_id)
  );

create policy progress_update_self on public.student_lesson_progress
  for update
  using (student_id = auth.uid())
  with check (
    student_id = auth.uid()
    and public.can_read_lesson(lesson_id)
  );
