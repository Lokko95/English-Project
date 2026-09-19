"use server";

import { revalidatePath } from "next/cache";

import { requireTeacher, todayInMoscow } from "@/lib/dal/teacher";
import { createClient } from "@/lib/supabase/server";

export async function setAttendance(studentId: string, groupId: string, present: boolean) {
  await requireTeacher();
  const supabase = await createClient();

  const { data: student } = await supabase
    .from("students")
    .select("id, group_id")
    .eq("id", studentId)
    .maybeSingle();

  if (!student || student.group_id !== groupId) {
    throw new Error("Студент не в этой группе");
  }

  const attendedOn = todayInMoscow();

  const { error } = await supabase.from("attendance").upsert(
    {
      student_id: studentId,
      group_id: groupId,
      attended_on: attendedOn,
      present,
    },
    { onConflict: "student_id,attended_on" },
  );

  if (error) {
    throw new Error(`Не удалось сохранить посещаемость: ${error.message}`);
  }

  revalidatePath(`/teacher/groups/${groupId}`);
}

export async function addStudentNote(studentId: string, groupId: string, formData: FormData) {
  const { userId } = await requireTeacher();
  const body = String(formData.get("body") ?? "").trim();

  if (!body) {
    return;
  }

  const supabase = await createClient();
  const { data: student } = await supabase
    .from("students")
    .select("id, group_id")
    .eq("id", studentId)
    .maybeSingle();

  if (!student || student.group_id !== groupId) {
    throw new Error("Студент не в этой группе");
  }

  const { error } = await supabase.from("student_notes").insert({
    student_id: studentId,
    author_id: userId,
    body,
  });

  if (error) {
    throw new Error(`Не удалось добавить заметку: ${error.message}`);
  }

  revalidatePath(`/teacher/groups/${groupId}`);
}
