"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/dal/admin";
import { createClient } from "@/lib/supabase/server";
import type { GroupLevel } from "@/lib/types";

const LEVELS = new Set<GroupLevel>(["A1", "A2", "B1", "B2"]);

function readGroupFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const level = String(formData.get("level") ?? "").trim() as GroupLevel;
  const teacherId = String(formData.get("teacher_id") ?? "").trim() || null;
  const meetingUrl = String(formData.get("meeting_url") ?? "").trim() || null;
  const eveningTime = String(formData.get("evening_time") ?? "").trim() || null;
  const currentLessonId = String(formData.get("current_lesson_id") ?? "").trim() || null;
  return { name, level, teacherId, meetingUrl, eveningTime, currentLessonId };
}

export async function createGroup(formData: FormData) {
  await requireAdmin();
  const fields = readGroupFields(formData);
  if (!fields.name || !LEVELS.has(fields.level)) {
    throw new Error("Название и уровень обязательны");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("groups")
    .insert({
      name: fields.name,
      level: fields.level,
      teacher_id: fields.teacherId,
      meeting_url: fields.meetingUrl,
      evening_time: fields.eveningTime,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Не удалось создать группу");
  }

  revalidatePath("/admin/groups");
  redirect(`/admin/groups/${data.id}`);
}

export async function updateGroup(groupId: string, formData: FormData) {
  await requireAdmin();
  const fields = readGroupFields(formData);
  if (!fields.name || !LEVELS.has(fields.level)) {
    throw new Error("Название и уровень обязательны");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("groups")
    .update({
      name: fields.name,
      level: fields.level,
      teacher_id: fields.teacherId,
      meeting_url: fields.meetingUrl,
      evening_time: fields.eveningTime,
      current_lesson_id: fields.currentLessonId,
    })
    .eq("id", groupId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/groups");
  revalidatePath(`/admin/groups/${groupId}`);
  revalidatePath("/teacher");
}

export async function deleteGroup(groupId: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("groups").delete().eq("id", groupId);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/admin/groups");
  revalidatePath("/admin/lessons");
  revalidatePath("/admin/students");
  redirect("/admin/groups");
}

export async function addStudentToGroup(groupId: string, formData: FormData) {
  await requireAdmin();
  const studentId = String(formData.get("student_id") ?? "").trim();
  if (!studentId) {
    return;
  }
  const supabase = await createClient();
  const { error } = await supabase.from("students").update({ group_id: groupId }).eq("id", studentId);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath(`/admin/groups/${groupId}`);
  revalidatePath("/admin/students");
}

export async function removeStudentFromGroup(groupId: string, studentId: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("students").update({ group_id: null }).eq("id", studentId).eq("group_id", groupId);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath(`/admin/groups/${groupId}`);
  revalidatePath("/admin/students");
}
