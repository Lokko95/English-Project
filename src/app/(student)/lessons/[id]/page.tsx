import { notFound } from "next/navigation";

import { requireStudent } from "@/lib/dal/student";
import { createClient } from "@/lib/supabase/server";
import type { Lesson, VocabularyItem } from "@/lib/types";

import { markLessonPrepared } from "./actions";

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await requireStudent();
  const supabase = await createClient();

  const { data: lessonData } = await supabase
    .from("lessons")
    .select("id, order_index, title, grammar_title, grammar_body, materials, created_at")
    .eq("id", id)
    .single();

  if (!lessonData) {
    notFound();
  }
  const lesson = lessonData as Lesson;

  const { data: vocabData } = await supabase
    .from("vocabulary_items")
    .select("id, lesson_id, word, translation, example, transcription, order_index")
    .eq("lesson_id", id)
    .order("order_index");
  const vocabulary = (vocabData as VocabularyItem[]) ?? [];

  const { data: progress } = await supabase
    .from("student_lesson_progress")
    .select("status")
    .eq("student_id", userId)
    .eq("lesson_id", id)
    .maybeSingle();

  const isCompleted = progress?.status === "COMPLETED";

  return (
    <div className="flex flex-col gap-8">
      <section>
        <p className="text-sm text-gray-500">Урок {lesson.order_index}</p>
        <h1 className="text-2xl font-semibold">{lesson.title}</h1>
      </section>

      <section className="rounded-md border border-gray-200 p-4">
        <h2 className="font-medium">{lesson.grammar_title}</h2>
        <p className="mt-2 whitespace-pre-wrap text-gray-700">{lesson.grammar_body}</p>
      </section>

      {lesson.materials && (
        <section className="rounded-md border border-gray-200 p-4">
          <h2 className="font-medium">Примеры и материалы</h2>
          <p className="mt-2 whitespace-pre-wrap text-gray-700">{lesson.materials}</p>
        </section>
      )}

      <section>
        <h2 className="font-medium">Слова урока</h2>
        <ul className="mt-2 flex flex-col gap-2">
          {vocabulary.map((item) => (
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

      <section>
        {isCompleted ? (
          <p className="rounded-md bg-green-50 px-4 py-2 text-green-700">Подготовлено ✓</p>
        ) : (
          <form action={markLessonPrepared.bind(null, lesson.id)}>
            <button
              type="submit"
              className="rounded-md bg-gray-900 px-4 py-2 text-white transition hover:bg-gray-700"
            >
              Я подготовился
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
