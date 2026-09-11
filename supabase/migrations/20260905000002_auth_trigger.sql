-- Аккаунты создаёт только админ (Admin API, service role). Этот триггер
-- превращает новую запись в auth.users в строку profiles (+ students, если
-- роль STUDENT), чтобы админ не делал два отдельных шага.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role public.user_role;
begin
  v_role := case upper(coalesce(new.raw_user_meta_data ->> 'role', 'STUDENT'))
    when 'TEACHER' then 'TEACHER'::public.user_role
    when 'ADMIN' then 'ADMIN'::public.user_role
    else 'STUDENT'::public.user_role
  end;

  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    v_role
  );

  if v_role = 'STUDENT' then
    insert into public.students (id) values (new.id);
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
