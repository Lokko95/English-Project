import "server-only";

import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { Group } from "@/lib/types";

/** Дата «сегодня» в МСК — вечерние уроки идут по московскому календарю. */
export function todayInMoscow(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Moscow",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export async function requireTeacher() {
  return requireRole("TEACHER");
}

/**
 * Группа, которую преподаёт текущий учитель. Чужие группы RLS скроет → 404,
 * а не 403: не палим, что группа существует.
 */
export async function requireTeacherGroup(groupId: string): Promise<Group> {
  await requireTeacher();
  const supabase = await createClient();
  const { data } = await supabase
    .from("groups")
    .select("id, name, level, teacher_id, meeting_url, evening_time, current_lesson_id")
    .eq("id", groupId)
    .maybeSingle();

  if (!data) {
    notFound();
  }

  return data as Group;
}
