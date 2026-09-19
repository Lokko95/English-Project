-- Гость видит формулировки вопросов, но не ключ. Таблица placement_questions
-- читается только админом; публичная выдача и проверка — security definer RPC.
-- View не используем: у hosted-Supabase view часто security_invoker=on и тогда
-- RLS таблицы обнулил бы выдачу гостю.

drop policy if exists placement_questions_select_anyone on public.placement_questions;
drop policy if exists placement_questions_select_admin on public.placement_questions;

create policy placement_questions_select_admin on public.placement_questions
  for select using (public.is_admin());

drop function if exists public.get_placement_questions_public();
drop function if exists public.grade_placement_answers(jsonb);

create function public.get_placement_questions_public()
returns table(id uuid, order_index integer, question text, choices jsonb)
language sql
stable
security definer
set search_path = public
as $$
  select
    q.id,
    q.order_index,
    q.question,
    coalesce(q.options -> 'choices', '[]'::jsonb) as choices
  from public.placement_questions q
  order by q.order_index;
$$;

create function public.grade_placement_answers(p_answers jsonb)
returns table(level text, is_correct boolean)
language sql
stable
security definer
set search_path = public
as $$
  select
    q.level_hint as level,
    (
      (p_answers ->> q.id::text) ~ '^[0-9]+$'
      and (p_answers ->> q.id::text)::integer = (q.options ->> 'correct')::integer
    ) as is_correct
  from public.placement_questions q
  order by q.order_index;
$$;

revoke all on function public.get_placement_questions_public() from public;
revoke all on function public.grade_placement_answers(jsonb) from public;
grant execute on function public.get_placement_questions_public() to anon, authenticated, service_role;
grant execute on function public.grade_placement_answers(jsonb) to anon, authenticated, service_role;
