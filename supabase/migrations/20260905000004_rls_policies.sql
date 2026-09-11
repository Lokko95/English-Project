-- Авторизация обеспечивается здесь, на уровне базы. Middleware в Next.js
-- отвечает только за редиректы по роли, а не за реальные права доступа.

alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.students enable row level security;
alter table public.lessons enable row level security;
alter table public.vocabulary_items enable row level security;
alter table public.lesson_plans enable row level security;
alter table public.student_lesson_progress enable row level security;
alter table public.attendance enable row level security;
alter table public.student_notes enable row level security;
alter table public.placement_questions enable row level security;

-- profiles: своя строка, админ — все, учитель — профили студентов своих групп.
create policy profiles_select_self on public.profiles
  for select using (id = auth.uid());

create policy profiles_select_admin on public.profiles
  for select using (public.is_admin());

create policy profiles_select_teacher_of_group on public.profiles
  for select using (
    public.current_app_role() = 'TEACHER'
    and exists (
      select 1
      from public.students s
      where s.id = profiles.id and public.teaches_group(s.group_id)
    )
  );

create policy profiles_update_self on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

create policy profiles_update_admin on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());

-- groups: студент — только свою группу, учитель — свои, админ — все + запись.
create policy groups_select_own_student on public.groups
  for select using (
    public.current_app_role() = 'STUDENT' and id = public.current_student_group_id()
  );

create policy groups_select_own_teacher on public.groups
  for select using (teacher_id = auth.uid());

create policy groups_select_admin on public.groups
  for select using (public.is_admin());

create policy groups_write_admin on public.groups
  for all using (public.is_admin()) with check (public.is_admin());

-- students: своя строка, учитель — студенты своих групп, админ — все + запись
-- (в т.ч. назначение group_id).
create policy students_select_self on public.students
  for select using (id = auth.uid());

create policy students_select_teacher on public.students
  for select using (public.teaches_group(group_id));

create policy students_select_admin on public.students
  for select using (public.is_admin());

create policy students_write_admin on public.students
  for all using (public.is_admin()) with check (public.is_admin());

-- lessons / vocabulary_items: общий контент курса, читают все залогиненные,
-- пишет только админ.
create policy lessons_select_authenticated on public.lessons
  for select using (auth.role() = 'authenticated');

create policy lessons_write_admin on public.lessons
  for all using (public.is_admin()) with check (public.is_admin());

create policy vocabulary_items_select_authenticated on public.vocabulary_items
  for select using (auth.role() = 'authenticated');

create policy vocabulary_items_write_admin on public.vocabulary_items
  for all using (public.is_admin()) with check (public.is_admin());

-- lesson_plans: студенту недоступно ни при каких условиях. Читают TEACHER и
-- ADMIN, пишет только ADMIN.
create policy lesson_plans_select_teacher on public.lesson_plans
  for select using (public.current_app_role() = 'TEACHER');

create policy lesson_plans_select_admin on public.lesson_plans
  for select using (public.is_admin());

create policy lesson_plans_write_admin on public.lesson_plans
  for all using (public.is_admin()) with check (public.is_admin());

-- student_lesson_progress: студент читает/пишет свои строки, учитель читает
-- по своим группам, админ — всё.
create policy progress_select_self on public.student_lesson_progress
  for select using (student_id = auth.uid());

create policy progress_insert_self on public.student_lesson_progress
  for insert with check (student_id = auth.uid());

create policy progress_update_self on public.student_lesson_progress
  for update using (student_id = auth.uid()) with check (student_id = auth.uid());

create policy progress_select_teacher on public.student_lesson_progress
  for select using (
    exists (
      select 1 from public.students s
      where s.id = student_lesson_progress.student_id and public.teaches_group(s.group_id)
    )
  );

create policy progress_admin_all on public.student_lesson_progress
  for all using (public.is_admin()) with check (public.is_admin());

-- attendance: пишет/читает только учитель своих групп и админ. Студенту в
-- MVP не показываем (посещаемость — рабочий инструмент преподавателя).
create policy attendance_teacher on public.attendance
  for all using (public.teaches_group(group_id)) with check (public.teaches_group(group_id));

create policy attendance_admin on public.attendance
  for all using (public.is_admin()) with check (public.is_admin());

-- student_notes: учитель читает/пишет заметки о студентах своих групп и
-- является автором записи; админ — всё.
create policy student_notes_teacher on public.student_notes
  for all using (
    exists (
      select 1 from public.students s
      where s.id = student_notes.student_id and public.teaches_group(s.group_id)
    )
  )
  with check (
    author_id = auth.uid()
    and exists (
      select 1 from public.students s
      where s.id = student_notes.student_id and public.teaches_group(s.group_id)
    )
  );

create policy student_notes_admin on public.student_notes
  for all using (public.is_admin()) with check (public.is_admin());

-- placement_questions: читает кто угодно (в т.ч. анонимный гость), пишет
-- только админ. Результаты теста никуда не пишутся — insert-политики нет.
create policy placement_questions_select_anyone on public.placement_questions
  for select using (true);

create policy placement_questions_write_admin on public.placement_questions
  for all using (public.is_admin()) with check (public.is_admin());
