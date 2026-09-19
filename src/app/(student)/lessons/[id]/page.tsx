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
    .select("id, group_id, order_index, title, grammar_title, grammar_body, materials, created_at")
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
        <span className="nb-badge nb-badge-primary">Урок {lesson.order_index}</span>
        <h1 className="nb-heading-1 mt-2">{lesson.title}</h1>
      </section>

      <section className="nb-card">
        <h2 className="nb-heading-2">{lesson.grammar_title}</h2>
        <p className="mt-2 whitespace-pre-wrap break-words text-ink">{lesson.grammar_body}</p>
      </section>

      {lesson.materials && (
        <section className="nb-card">
          <h2 className="nb-heading-2">Примеры и материалы</h2>
          <p className="mt-2 whitespace-pre-wrap break-words text-ink">{lesson.materials}</p>
        </section>
      )}

      <section>
        <h2 className="nb-heading-2">Слова урока</h2>
        <ul className="mt-2 flex flex-col gap-2">
          {vocabulary.map((item) => (
            <li key={item.id} className="nb-card-flat">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="font-bold text-ink">{item.word}</span>
                {item.transcription && <span className="text-sm text-muted">{item.transcription}</span>}
                <span className="text-ink">— {item.translation}</span>
              </div>
              <p className="mt-1 text-sm text-muted">{item.example}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        {isCompleted ? (
          <p className="nb-callout-success">Подготовлено ✓</p>
        ) : (
          <form action={markLessonPrepared.bind(null, lesson.id)}>
            <button type="submit" className="nb-btn nb-btn-primary w-full sm:w-fit">
              Я подготовился
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
