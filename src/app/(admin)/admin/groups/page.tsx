import Link from "next/link";

import { createGroup } from "@/app/(admin)/admin/groups/actions";
import { requireAdmin } from "@/lib/dal/admin";
import { createClient } from "@/lib/supabase/server";
import type { Group, Profile } from "@/lib/types";

export default async function AdminGroupsPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [{ data: groupsData }, { data: teachersData }, { data: studentsData }] = await Promise.all([
    supabase
      .from("groups")
      .select("id, name, level, teacher_id, meeting_url, evening_time, current_lesson_id")
      .order("name"),
    supabase.from("profiles").select("id, full_name, role, created_at").eq("role", "TEACHER").order("full_name"),
    supabase.from("students").select("id, group_id"),
  ]);

  const groups = (groupsData as Group[]) ?? [];
  const teachers = (teachersData as Profile[]) ?? [];
  const teacherById = new Map(teachers.map((teacher) => [teacher.id, teacher]));
  const countByGroup = new Map<string, number>();
  for (const student of studentsData ?? []) {
    if (!student.group_id) continue;
    countByGroup.set(student.group_id, (countByGroup.get(student.group_id) ?? 0) + 1);
  }

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="nb-heading-1">Группы</h1>
        <p className="mt-1 text-muted">Новая группа пустая: без уроков и без студентов. Уровень не копирует программу.</p>
      </section>

      <section>
        <h2 className="nb-heading-2 mb-3">Новая группа</h2>
        <form action={createGroup} className="nb-card flex flex-col gap-3">
          <input name="name" required placeholder="Название" className="nb-input" />
          <select name="level" required defaultValue="A1" className="nb-input">
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="B1">B1</option>
            <option value="B2">B2</option>
          </select>
          <select name="teacher_id" defaultValue="" className="nb-input">
            <option value="">Без преподавателя</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.full_name}
              </option>
            ))}
          </select>
          <input name="evening_time" placeholder="Время урока, например 19:00 МСК" className="nb-input" />
          <input name="meeting_url" type="url" placeholder="Ссылка на встречу" className="nb-input" />
          <button type="submit" className="nb-btn nb-btn-primary w-full sm:w-fit">
            Создать группу
          </button>
        </form>
      </section>

      <section>
        <h2 className="nb-heading-2 mb-3">Список</h2>
        {groups.length === 0 ? (
          <p className="text-muted">Пока нет групп.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {groups.map((group) => (
              <li key={group.id} className="nb-card">
                <Link href={`/admin/groups/${group.id}`} className="nb-link">
                  {group.name}
                </Link>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
                  <span className="nb-badge nb-badge-primary">{group.level}</span>
                  <span>
                    преподаватель: {group.teacher_id ? (teacherById.get(group.teacher_id)?.full_name ?? "не найден") : "нет"}
                  </span>
                  <span>студентов: {countByGroup.get(group.id) ?? 0}</span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
