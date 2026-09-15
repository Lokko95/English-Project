import Link from "next/link";

import { requireStudent } from "@/lib/dal/student";
import { createClient } from "@/lib/supabase/server";
import type { Lesson, LessonProgressStatus } from "@/lib/types";

export default async function DashboardPage() {
  const { userId, group } = await requireStudent();
  const supabase = await createClient();

  const { data: lessonsData } = await supabase
    .from("lessons")
    .select("id, order_index, title, grammar_title, grammar_body, materials, created_at")
    .order("order_index");
  const lessons = (lessonsData as Lesson[]) ?? [];

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
        <h1 className="text-2xl font-semibold">Дашборд</h1>
        <p className="mt-1 text-gray-600">
          Прогресс: {completedCount} из {lessons.length} уроков подготовлено
        </p>
      </section>

      {!group && (
        <section className="rounded-md border border-amber-300 bg-amber-50 p-4 text-amber-800">
          Группа пока не назначена. Обратитесь к администратору.
        </section>
      )}

      {group && (
        <section className="rounded-md border border-gray-200 p-4">
          <h2 className="font-medium">Вечерний урок</h2>
          <p className="mt-1 text-gray-600">Группа: {group.name}</p>
          {group.evening_time && <p className="text-gray-600">Время: {group.evening_time}</p>}
          {group.meeting_url ? (
            <a
              href={group.meeting_url}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-blue-600 underline"
            >
              Ссылка на онлайн-урок
            </a>
          ) : (
            <p className="mt-2 text-gray-500">Ссылка на встречу пока не указана</p>
          )}
        </section>
      )}

      {currentLesson && (
        <section className="rounded-md border border-gray-900 p-4">
          <h2 className="font-medium">Текущий урок</h2>
          <p className="mt-1 text-gray-800">{currentLesson.title}</p>
          <Link href={`/lessons/${currentLesson.id}`} className="mt-2 inline-block text-blue-600 underline">
            Готовиться к уроку
          </Link>
        </section>
      )}

      <section>
        <h2 className="font-medium">Список уроков</h2>
        <ul className="mt-2 flex flex-col gap-2">
          {lessons.map((lesson) => {
            const status = progressByLesson.get(lesson.id);
            return (
              <li
                key={lesson.id}
                className="flex items-center justify-between rounded-md border border-gray-200 px-4 py-2"
              >
                <Link href={`/lessons/${lesson.id}`} className="text-gray-900 hover:underline">
                  {lesson.order_index}. {lesson.title}
                </Link>
                <span className="text-sm text-gray-500">
                  {status === "COMPLETED" ? "подготовлено ✓" : "не начато"}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <Link href="/words" className="text-blue-600 underline">
          Все ранее изученные слова
        </Link>
      </section>
    </div>
  );
}
