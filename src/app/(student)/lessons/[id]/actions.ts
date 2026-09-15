"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function markLessonPrepared(lessonId: string) {
  const { userId } = await requireRole("STUDENT");
  const supabase = await createClient();

  const { error } = await supabase.from("student_lesson_progress").upsert({
    student_id: userId,
    lesson_id: lessonId,
    status: "COMPLETED",
    completed_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(`Не удалось сохранить прогресс: ${error.message}`);
  }

  revalidatePath(`/lessons/${lessonId}`);
  revalidatePath("/dashboard");
  revalidatePath("/words");
}
