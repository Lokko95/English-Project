"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export interface ProfileFormState {
  error?: string;
  success?: boolean;
}

export async function updateFullName(
  _prevState: ProfileFormState | undefined,
  formData: FormData,
): Promise<ProfileFormState> {
  const { userId } = await requireRole("STUDENT");
  const fullName = String(formData.get("full_name") ?? "").trim();

  if (!fullName) {
    return { error: "Имя не может быть пустым" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/profile");
  return { success: true };
}

export async function changePassword(
  _prevState: ProfileFormState | undefined,
  formData: FormData,
): Promise<ProfileFormState> {
  await requireRole("STUDENT");

  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("password_confirm") ?? "");

  if (password.length < 8) {
    return { error: "Пароль должен быть не короче 8 символов" };
  }

  if (password !== confirmPassword) {
    return { error: "Пароли не совпадают" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
