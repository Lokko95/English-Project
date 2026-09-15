import { requireStudent } from "@/lib/dal/student";
import { createClient } from "@/lib/supabase/server";
import type { Lesson, VocabularyItem } from "@/lib/types";

export default async function WordsPage() {
  const { userId } = await requireStudent();
  const supabase = await createClient();

  const { data: completedRows } = await supabase
    .from("student_lesson_progress")
    .select("lesson_id")
    .eq("student_id", userId)
    .eq("status", "COMPLETED");

  const lessonIds = (completedRows ?? []).map((row) => row.lesson_id as string);

  if (lessonIds.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-semibold">Все слова</h1>
        <p className="mt-2 text-gray-600">
          Здесь появятся слова из уроков, которые вы отметите как подготовленные.
        </p>
      </div>
    );
  }

  const { data: lessonsData } = await supabase
    .from("lessons")
    .select("id, order_index, title, grammar_title, grammar_body, materials, created_at")
    .in("id", lessonIds)
    .order("order_index");
  const lessons = (lessonsData as Lesson[]) ?? [];

  const { data: vocabData } = await supabase
    .from("vocabulary_items")
    .select("id, lesson_id, word, translation, example, transcription, order_index")
    .in("lesson_id", lessonIds)
    .order("order_index");
  const vocabulary = (vocabData as VocabularyItem[]) ?? [];

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold">Все слова</h1>
      {lessons.map((lesson) => (
        <section key={lesson.id}>
          <h2 className="font-medium">
            {lesson.order_index}. {lesson.title}
          </h2>
          <ul className="mt-2 flex flex-col gap-2">
            {vocabulary
              .filter((item) => item.lesson_id === lesson.id)
              .map((item) => (
                <li key={item.id} className="rounded-md border border-gray-200 p-3">
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium text-gray-900">{item.word}</span>
                    {item.transcription && (
                      <span className="text-sm text-gray-500">{item.transcription}</span>
                    )}
                    <span className="text-gray-600">— {item.translation}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{item.example}</p>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
