import Link from "next/link";

import { requireTeacher } from "@/lib/dal/teacher";
import { createClient } from "@/lib/supabase/server";
import type { Group, Lesson } from "@/lib/types";

export default async function TeacherHomePage() {
  await requireTeacher();
  const supabase = await createClient();

  const { data: groupsData } = await supabase
    .from("groups")
    .select("id, name, level, teacher_id, meeting_url, evening_time, current_lesson_id")
    .order("name");
  const groups = (groupsData as Group[]) ?? [];

  const currentLessonIds = groups
    .map((group) => group.current_lesson_id)
    .filter((id): id is string => Boolean(id));

  let lessonsById = new Map<string, Lesson>();
  if (currentLessonIds.length > 0) {
    const { data: lessonsData } = await supabase
      .from("lessons")
      .select("id, group_id, order_index, title, grammar_title, grammar_body, materials, created_at")
      .in("id", currentLessonIds);
    lessonsById = new Map(((lessonsData as Lesson[]) ?? []).map((lesson) => [lesson.id, lesson]));
  }

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="nb-heading-1">Мои группы</h1>
        <p className="mt-1 text-muted">Вечерний урок — по готовому плану, без составления с нуля.</p>
      </section>

      {groups.length === 0 ? (
        <section className="nb-callout-warning">Группы пока не назначены. Обратитесь к администратору.</section>
      ) : (
        <ul className="flex flex-col gap-4">
          {groups.map((group) => {
            const currentLesson = group.current_lesson_id
              ? (lessonsById.get(group.current_lesson_id) ?? null)
              : null;
            return (
              <li key={group.id} className="nb-card">
                <h2 className="nb-heading-2">
                  {group.name} <span className="font-normal text-muted">({group.level})</span>
                </h2>
                {group.evening_time && <p className="mt-1 text-ink">Время: {group.evening_time}</p>}
                {group.meeting_url ? (
                  <a href={group.meeting_url} target="_blank" rel="noreferrer" className="nb-link mt-1 inline-block">
                    Ссылка на онлайн-урок
                  </a>
                ) : (
                  <p className="mt-1 text-muted">Ссылка на встречу пока не указана</p>
                )}
                {currentLesson ? (
                  <p className="mt-2 text-ink">
                    Текущий урок: {currentLesson.order_index}. {currentLesson.title}
                  </p>
                ) : (
                  <p className="mt-2 text-muted">Текущий урок не назначен</p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href={`/teacher/groups/${group.id}`} className="nb-btn nb-btn-secondary nb-btn-sm">
                    Студенты и посещаемость
                  </Link>
                  {currentLesson && (
                    <Link href={`/teacher/lessons/${currentLesson.id}`} className="nb-btn nb-btn-secondary nb-btn-sm">
                      План текущего урока
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
