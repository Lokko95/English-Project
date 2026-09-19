import Link from "next/link";
import { notFound } from "next/navigation";

import { ConfirmDeleteForm } from "@/app/(admin)/admin/confirm-delete-form";
import {
  addVocabularyItem,
  deleteLesson,
  deleteVocabularyItem,
  updateLesson,
} from "@/app/(admin)/admin/lessons/actions";
import { LessonForm } from "@/app/(admin)/admin/lessons/lesson-form";
import { requireAdmin } from "@/lib/dal/admin";
import { createClient } from "@/lib/supabase/server";
import type { Group, Lesson, VocabularyItem } from "@/lib/types";

export default async function EditLessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireAdmin();
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

  const group = (groupData as Group | null) ?? null;
  const vocabulary = (vocabData as VocabularyItem[]) ?? [];
  const plan = (planData?.body as string | undefined) ?? "";

  return (
    <div className="flex flex-col gap-8">
      <section>
        <p className="mb-1 flex flex-wrap items-center gap-1">
          <Link href="/admin/lessons" className="nb-breadcrumb">
            Уроки
          </Link>
          {group && (
            <>
              <span className="text-muted">·</span>
              <Link href={`/admin/groups/${group.id}`} className="nb-breadcrumb">
                {group.name}
              </Link>
            </>
          )}
        </p>
        <h1 className="nb-heading-1">Редактировать урок</h1>
      </section>

      <LessonForm
        action={updateLesson.bind(null, lesson.id)}
        submitLabel="Сохранить урок"
        groupId={lesson.group_id}
        defaultValues={{
          order_index: lesson.order_index,
          title: lesson.title,
          grammar_title: lesson.grammar_title,
          grammar_body: lesson.grammar_body,
          materials: lesson.materials ?? "",
          plan,
        }}
      />

      <section>
        <h2 className="nb-heading-2 mb-3">Слова</h2>
        <ul className="flex flex-col gap-2">
          {vocabulary.map((item) => (
            <li key={item.id} className="nb-card-flat flex items-start justify-between gap-3">
              <div>
                <p>
                  <span className="font-bold text-ink">{item.word}</span>
                  {item.transcription && <span className="text-sm text-muted"> {item.transcription}</span>}
                  <span className="text-ink"> — {item.translation}</span>
                </p>
                <p className="text-sm text-muted">{item.example}</p>
              </div>
              <ConfirmDeleteForm
                action={deleteVocabularyItem.bind(null, lesson.id, item.id)}
                label="Удалить"
                message="Удалить слово?"
              />
            </li>
          ))}
        </ul>
        <form action={addVocabularyItem.bind(null, lesson.id)} className="mt-3 grid gap-2 sm:grid-cols-2">
          <input name="word" required placeholder="word" className="nb-input" />
          <input name="translation" required placeholder="перевод" className="nb-input" />
          <input name="example" placeholder="example" className="nb-input" />
          <input name="transcription" placeholder="transcription" className="nb-input" />
          <button type="submit" className="nb-btn nb-btn-secondary w-full sm:col-span-2 sm:w-fit">
            Добавить слово
          </button>
        </form>
      </section>

      <section>
        <ConfirmDeleteForm
          action={deleteLesson.bind(null, lesson.id, lesson.group_id)}
          label="Удалить урок"
          message="Удалить урок вместе со словами и планом?"
        />
      </section>
    </div>
  );
}
