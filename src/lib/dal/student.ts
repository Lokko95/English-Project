import "server-only";

import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { Group, Student } from "@/lib/types";

/**
 * Требует роль STUDENT и подгружает строку students + группу (если уже
 * назначена админом). group === null — нормальная ситуация до назначения.
 */
export async function requireStudent() {
  const { userId, email, profile } = await requireRole("STUDENT");
  const supabase = await createClient();

  const { data: student } = await supabase
    .from("students")
    .select("id, group_id")
    .eq("id", userId)
    .single();

  let group: Group | null = null;
  if (student?.group_id) {
    const { data } = await supabase
      .from("groups")
      .select("id, name, teacher_id, meeting_url, evening_time, current_lesson_id")
      .eq("id", student.group_id)
      .single();
    group = (data as Group) ?? null;
  }

  return {
    userId,
    email,
    profile,
    student: (student as Student | null) ?? null,
    group,
  };
}
