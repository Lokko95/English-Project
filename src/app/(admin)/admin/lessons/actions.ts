"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/dal/admin";
import { createClient } from "@/lib/supabase/server";

export interface LessonFormState {
  error?: string;
}

function uniqueViolation(message: string) {
  return message.includes("lessons_group_id_order_index_key") || message.includes("duplicate key");
}

function readLessonFields(formData: FormData) {
  const groupId = String(formData.get("group_id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const orderIndex = Number(formData.get("order_index"));
  const grammarTitle = String(formData.get("grammar_title") ?? "").trim();
  const grammarBody = String(formData.get("grammar_body") ?? "").trim();
  const materials = String(formData.get("materials") ?? "").trim() || null;
  const plan = String(formData.get("plan") ?? "").trim();
  return { groupId, title, orderIndex, grammarTitle, grammarBody, materials, plan };
}

function parseVocabularyLines(raw: string) {
  const lines = raw.split("\n").map((line) => line.trim()).filter(Boolean);
  const items: {
    word: string;
    translation: string;
    example: string;
    transcription: string | null;
    order_index: number;
  }[] = [];

  for (const [index, line] of lines.entries()) {
    const [word, translation, example, transcription] = line.split("|").map((part) => part.trim());
    if (!word || !translation) {
      throw new Error(`Строка ${index + 1}: нужны слово и перевод через |`);
    }
    items.push({
      word,
      translation,
      example: example ?? "",
      transcription: transcription || null,
      order_index: index + 1,
    });
  }

  return items;
}

export async function createLesson(
  _prev: LessonFormState | undefined,
  formData: FormData,
): Promise<LessonFormState> {
  await requireAdmin();
  const fields = readLessonFields(formData);
  if (!fields.groupId || !fields.title || !fields.grammarTitle || !fields.grammarBody || !Number.isInteger(fields.orderIndex)) {
    return { error: "Заполните группу, номер, название и грамматику" };
  }

  let vocab: ReturnType<typeof parseVocabularyLines> = [];
  try {
    vocab = parseVocabularyLines(String(formData.get("vocabulary") ?? ""));
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Некорректный список слов" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lessons")
    .insert({
      group_id: fields.groupId,
      order_index: fields.orderIndex,
      title: fields.title,
      grammar_title: fields.grammarTitle,
      grammar_body: fields.grammarBody,
      materials: fields.materials,
    })
    .select("id")
    .single();

  if (error || !data) {
    return {
      error: uniqueViolation(error?.message ?? "")
        ? "В этой группе уже есть урок с таким номером"
        : (error?.message ?? "Не удалось создать урок"),
    };
  }

  if (fields.plan) {
    const planResult = await supabase.from("lesson_plans").insert({ lesson_id: data.id, body: fields.plan });
    if (planResult.error) {
      return { error: planResult.error.message };
    }
  }

  if (vocab.length > 0) {
    const vocabResult = await supabase.from("vocabulary_items").insert(
      vocab.map((item) => ({ ...item, lesson_id: data.id })),
    );
    if (vocabResult.error) {
      return { error: vocabResult.error.message };
    }
  }

  revalidatePath("/admin/lessons");
  revalidatePath(`/admin/groups/${fields.groupId}`);
  redirect(`/admin/lessons/${data.id}`);
}

export async function updateLesson(
  lessonId: string,
  _prev: LessonFormState | undefined,
  formData: FormData,
): Promise<LessonFormState> {
  await requireAdmin();
  const fields = readLessonFields(formData);
  if (!fields.title || !fields.grammarTitle || !fields.grammarBody || !Number.isInteger(fields.orderIndex)) {
    return { error: "Заполните номер, название и грамматику" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("lessons")
    .update({
      order_index: fields.orderIndex,
      title: fields.title,
      grammar_title: fields.grammarTitle,
      grammar_body: fields.grammarBody,
      materials: fields.materials,
    })
    .eq("id", lessonId);

  if (error) {
    return {
      error: uniqueViolation(error.message)
        ? "В этой группе уже есть урок с таким номером"
        : error.message,
    };
  }

  if (fields.plan) {
    const { error: planError } = await supabase.from("lesson_plans").upsert({
      lesson_id: lessonId,
      body: fields.plan,
    });
    if (planError) {
      return { error: planError.message };
    }
  } else {
    await supabase.from("lesson_plans").delete().eq("lesson_id", lessonId);
  }

  revalidatePath(`/admin/lessons/${lessonId}`);
  revalidatePath("/admin/lessons");
  return {};
}

export async function deleteLesson(lessonId: string, groupId: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("lessons").delete().eq("id", lessonId);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/admin/lessons");
  revalidatePath(`/admin/groups/${groupId}`);
  redirect("/admin/lessons");
}

export async function addVocabularyItem(lessonId: string, formData: FormData) {
  await requireAdmin();
  const word = String(formData.get("word") ?? "").trim();
  const translation = String(formData.get("translation") ?? "").trim();
  const example = String(formData.get("example") ?? "").trim();
  const transcription = String(formData.get("transcription") ?? "").trim() || null;
  if (!word || !translation) {
    throw new Error("Нужны слово и перевод");
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("vocabulary_items")
    .select("order_index")
    .eq("lesson_id", lessonId)
    .order("order_index", { ascending: false })
    .limit(1);

  const orderIndex = ((existing?.[0]?.order_index as number | undefined) ?? 0) + 1;
  const { error } = await supabase.from("vocabulary_items").insert({
    lesson_id: lessonId,
    word,
    translation,
    example,
    transcription,
    order_index: orderIndex,
  });
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath(`/admin/lessons/${lessonId}`);
}

export async function deleteVocabularyItem(lessonId: string, itemId: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("vocabulary_items").delete().eq("id", itemId).eq("lesson_id", lessonId);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath(`/admin/lessons/${lessonId}`);
}
