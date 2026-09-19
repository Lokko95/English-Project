import Link from "next/link";

import { requireAdmin } from "@/lib/dal/admin";
import { createClient } from "@/lib/supabase/server";
import type { Group, Lesson } from "@/lib/types";

export default async function AdminLessonsPage({
  searchParams,
}: {
  searchParams: Promise<{ group_id?: string }>;
}) {
  const { group_id: groupId } = await searchParams;
  await requireAdmin();
  const supabase = await createClient();

  const { data: groupsData } = await supabase
    .from("groups")
    .select("id, name, level, teacher_id, meeting_url, evening_time, current_lesson_id")
    .order("name");
  const groups = (groupsData as Group[]) ?? [];

  let lessonsQuery = supabase
    .from("lessons")
    .select("id, group_id, order_index, title, grammar_title, grammar_body, materials, created_at")
    .order("order_index");
  if (groupId) {
    lessonsQuery = lessonsQuery.eq("group_id", groupId);
  }
  const { data: lessonsData } = await lessonsQuery;
  const lessons = (lessonsData as Lesson[]) ?? [];
  const groupById = new Map(groups.map((group) => [group.id, group]));

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="nb-heading-1">Уроки</h1>
        <p className="mt-1 text-muted">Урок принадлежит группе. Номер уникален внутри группы, не глобально.</p>
      </section>

      <form className="flex flex-wrap gap-2">
        <select name="group_id" defaultValue={groupId ?? ""} className="nb-input flex-1 sm:max-w-xs">
          <option value="">Все группы</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
        <button type="submit" className="nb-btn nb-btn-secondary">
          Фильтр
        </button>
        <Link href="/admin/lessons/new" className="nb-btn nb-btn-primary">
          Новый урок
        </Link>
      </form>

      {lessons.length === 0 ? (
        <p className="text-muted">Уроков нет.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {lessons.map((lesson) => (
            <li key={lesson.id} className="nb-card-flat">
              <Link href={`/admin/lessons/${lesson.id}`} className="nb-link">
                {lesson.order_index}. {lesson.title}
              </Link>
              <p className="mt-1 text-sm text-muted">{groupById.get(lesson.group_id)?.name ?? "группа удалена"}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
