import Link from "next/link";

import { requireStudent } from "@/lib/dal/student";
import { createClient } from "@/lib/supabase/server";
import type { Lesson, LessonProgressStatus } from "@/lib/types";

export default async function DashboardPage() {
  const { userId, group } = await requireStudent();
  const supabase = await createClient();

  let lessons: Lesson[] = [];
  if (group) {
    const { data: lessonsData } = await supabase
      .from("lessons")
      .select("id, group_id, order_index, title, grammar_title, grammar_body, materials, created_at")
      .eq("group_id", group.id)
      .order("order_index");
    lessons = (lessonsData as Lesson[]) ?? [];
  }

  const { data: progressData } = await supabase
    .from("student_lesson_progress")
    .select("lesson_id, status")
    .eq("student_id", userId);

  const progressByLesson = new Map<string, LessonProgressStatus>(
    (progressData ?? []).map((row) => [row.lesson_id as string, row.status as LessonProgressStatus]),
  );

  const completedCount = lessons.filter((lesson) => progressByLesson.get(lesson.id) === "COMPLETED").length;
  const currentLesson = lessons.find((lesson) => lesson.id === group?.current_lesson_id) ?? null;

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="nb-heading-1">Дашборд</h1>
        <p className="mt-1 text-muted">
          Прогресс: {completedCount} из {lessons.length} уроков подготовлено
        </p>
      </section>

      {!group && <section className="nb-callout-warning">Группа пока не назначена. Обратитесь к администратору.</section>}

      {group && (
        <section className="nb-card">
          <h2 className="nb-heading-2">Вечерний урок</h2>
          <p className="mt-1 text-ink">
            Группа: {group.name} ({group.level})
          </p>
          {group.evening_time && <p className="text-ink">Время: {group.evening_time}</p>}
          {group.meeting_url ? (
            <a href={group.meeting_url} target="_blank" rel="noreferrer" className="nb-link mt-2 inline-block">
              Ссылка на онлайн-урок
            </a>
          ) : (
            <p className="mt-2 text-muted">Ссылка на встречу пока не указана</p>
          )}
        </section>
      )}

      {currentLesson && (
        <section className="nb-card-highlight">
          <h2 className="nb-heading-2">Текущий урок</h2>
          <p className="mt-1 text-ink">{currentLesson.title}</p>
          <Link href={`/lessons/${currentLesson.id}`} className="nb-btn nb-btn-primary mt-3 w-full sm:w-fit">
            Готовиться к уроку
          </Link>
        </section>
      )}

      {group && (
        <section>
          <h2 className="nb-heading-2">Список уроков</h2>
          {lessons.length === 0 ? (
            <p className="mt-2 text-muted">Доступных уроков пока нет.</p>
          ) : (
            <ul className="mt-2 flex flex-col gap-2">
              {lessons.map((lesson) => {
                const status = progressByLesson.get(lesson.id);
                return (
                  <li key={lesson.id} className="nb-card-flat flex items-center justify-between gap-3">
                    <Link href={`/lessons/${lesson.id}`} className="font-semibold text-ink hover:underline">
                      {lesson.order_index}. {lesson.title}
                    </Link>
                    {status === "COMPLETED" ? (
                      <span className="nb-badge nb-badge-success">Подготовлено ✓</span>
                    ) : (
                      <span className="nb-badge nb-badge-muted">Не начато</span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      <section>
        <Link href="/words" className="nb-link">
          Все ранее изученные слова
        </Link>
      </section>
    </div>
  );
}
