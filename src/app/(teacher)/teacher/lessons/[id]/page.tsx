import Link from "next/link";
import { notFound } from "next/navigation";

import { requireTeacher } from "@/lib/dal/teacher";
import { createClient } from "@/lib/supabase/server";
import type { Group, Lesson, VocabularyItem } from "@/lib/types";

export default async function TeacherLessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireTeacher();
  const supabase = await createClient();

  const { data: lessonData } = await supabase
    .from("lessons")
    .select("id, group_id, order_index, title, grammar_title, grammar_body, materials, created_at")
    .eq("id", id)
    .maybeSingle();

  if (!lessonData) {
    notFound();
  }
  const lesson = lessonData as Lesson;

  const [{ data: groupData }, { data: vocabData }, { data: planData }] = await Promise.all([
    supabase
      .from("groups")
      .select("id, name, level, teacher_id, meeting_url, evening_time, current_lesson_id")
      .eq("id", lesson.group_id)
      .maybeSingle(),
    supabase
      .from("vocabulary_items")
      .select("id, lesson_id, word, translation, example, transcription, order_index")
      .eq("lesson_id", id)
      .order("order_index"),
    supabase.from("lesson_plans").select("body").eq("lesson_id", id).maybeSingle(),
  ]);

  if (!groupData) {
    notFound();
  }
  const group = groupData as Group;
  const vocabulary = (vocabData as VocabularyItem[]) ?? [];
  const planBody = (planData?.body as string | undefined) ?? null;

  return (
    <div className="flex flex-col gap-8">
      <section>
        <p className="mb-1">
          <Link href={`/teacher/groups/${group.id}`} className="nb-breadcrumb">
            {group.name}
          </Link>
          <span className="text-muted"> · урок {lesson.order_index}</span>
        </p>
        <h1 className="nb-heading-1">{lesson.title}</h1>
        <p className="mt-1 text-sm text-muted">Только просмотр — план нельзя редактировать.</p>
      </section>

      <section className="nb-card-highlight">
        <h2 className="nb-heading-2">План урока</h2>
        {planBody ? (
          <p className="mt-2 whitespace-pre-wrap break-words text-ink">{planBody}</p>
        ) : (
          <p className="mt-2 text-muted">План пока не добавлен.</p>
        )}
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
    </div>
  );
}
