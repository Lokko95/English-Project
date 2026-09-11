-- Security definer хелперы для RLS-политик. Без них политика вида
-- "SELECT ... FROM profiles WHERE role = 'TEACHER'" внутри policy для самой
-- таблицы profiles уходит в рекурсию. Функции стабильны, с закреплённым
-- search_path (защита от подмены схемы).
--
-- Названо current_app_role(), а не current_role() из черновика плана:
-- current_role — зарезервированное имя в Postgres (роль подключения к БД),
-- совпадающее имя функции в public могло бы путать при чтении миграций.

create or replace function public.current_app_role()
returns public.user_role
language sql
security definer
stable
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select public.current_app_role() = 'ADMIN';
$$;

create or replace function public.current_student_group_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select group_id from public.students where id = auth.uid();
$$;

create or replace function public.teaches_group(p_group_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.groups g
    where g.id = p_group_id and g.teacher_id = auth.uid()
  );
$$;

grant execute on function public.current_app_role() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.current_student_group_id() to authenticated;
grant execute on function public.teaches_group(uuid) to authenticated;

-- Явная защита от повышения своей роли: студент не может сам сделать себя
-- ADMIN/TEACHER, даже отправив прямой UPDATE к profiles. Это отдельная сеть
-- безопасности сверх RLS-политики profiles_update_self.
create or replace function public.prevent_role_self_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role <> old.role and not public.is_admin() then
    raise exception 'Изменение роли доступно только администратору';
  end if;
  return new;
end;
$$;

create trigger profiles_prevent_role_escalation
  before update on public.profiles
  for each row execute function public.prevent_role_self_escalation();
