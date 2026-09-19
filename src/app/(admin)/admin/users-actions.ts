"use server";

import { revalidatePath } from "next/cache";

import { createAuthUser, deleteAuthUser, resetAuthPassword } from "@/lib/admin/users";
import type { CreateUserState } from "@/app/(admin)/admin/create-user-form";
import type { SecretState } from "@/app/(admin)/admin/reset-password-form";
import { requireAdmin } from "@/lib/dal/admin";
import { createClient } from "@/lib/supabase/server";

function readUserFields(formData: FormData) {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  return { fullName, email };
}

export async function createStudent(
  _prev: CreateUserState | undefined,
  formData: FormData,
): Promise<CreateUserState> {
  const { fullName, email } = readUserFields(formData);
  const groupId = String(formData.get("group_id") ?? "").trim() || null;

  if (!fullName || !email) {
    return { error: "Имя и email обязательны" };
  }

  const created = await createAuthUser({ email, fullName, role: "STUDENT" });
  if ("error" in created) {
    return { error: created.error };
  }

  if (groupId) {
    const supabase = await createClient();
    const { error } = await supabase.from("students").update({ group_id: groupId }).eq("id", created.userId);
    if (error) {
      return { error: `Пользователь создан, но группу назначить не удалось: ${error.message}`, email, password: created.password };
    }
  }

  revalidatePath("/admin/students");
  revalidatePath("/admin/groups");
  return { email: created.email, password: created.password };
}

export async function createTeacher(
  _prev: CreateUserState | undefined,
  formData: FormData,
): Promise<CreateUserState> {
  const { fullName, email } = readUserFields(formData);
  if (!fullName || !email) {
    return { error: "Имя и email обязательны" };
  }

  const created = await createAuthUser({ email, fullName, role: "TEACHER" });
  if ("error" in created) {
    return { error: created.error };
  }

  revalidatePath("/admin/teachers");
  return { email: created.email, password: created.password };
}

export async function deleteUser(userId: string) {
  await requireAdmin();
  const result = await deleteAuthUser(userId);
  if (result.error) {
    throw new Error(result.error);
  }
  revalidatePath("/admin/students");
  revalidatePath("/admin/teachers");
  revalidatePath("/admin/groups");
}

export async function resetUserPassword(userId: string): Promise<SecretState> {
  const result = await resetAuthPassword(userId);
  if ("error" in result) {
    return { error: result.error };
  }
  return { password: result.password };
}

export async function updateProfileName(userId: string, formData: FormData) {
  await requireAdmin();
  const fullName = String(formData.get("full_name") ?? "").trim();
  if (!fullName) {
    return;
  }
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("id", userId);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/admin/students");
  revalidatePath("/admin/teachers");
}

export async function assignStudentGroup(studentId: string, formData: FormData) {
  await requireAdmin();
  const groupId = String(formData.get("group_id") ?? "").trim() || null;
  const supabase = await createClient();
  const { error } = await supabase.from("students").update({ group_id: groupId }).eq("id", studentId);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/admin/students");
  revalidatePath("/admin/groups");
}
