import "server-only";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/lib/types";

/**
 * Домашняя страница роли. Middleware/proxy сюда не заглядывает — только
 * страницы, чтобы не делать запрос к profiles на каждый запрос без разбора.
 */
export function homePathForRole(role: UserRole): string {
  switch (role) {
    case "STUDENT":
      return "/dashboard";
    case "TEACHER":
      return "/teacher";
    case "ADMIN":
      return "/admin";
  }
}

/**
 * Читает текущего пользователя и его профиль. Возвращает null, если сессии
 * нет. Это единственная точка, где мы доверяем auth.getUser() (реальный
 * запрос к Auth-серверу, а не просто разбор cookie).
 */
export async function getCurrentProfile(): Promise<{
  userId: string;
  email: string | null;
  profile: Profile;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role, created_at")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return null;
  }

  return { userId: user.id, email: user.email ?? null, profile: profile as Profile };
}

/**
 * Требует конкретную роль. Нет сессии → /login. Сессия есть, но роль другая
 * → домашняя страница фактической роли (а не 403), чтобы не путать
 * пользователя. RLS в базе — основная защита; это лишь удобная навигация.
 */
export async function requireRole(role: UserRole) {
  const result = await getCurrentProfile();

  if (!result) {
    redirect("/login");
  }

  if (result.profile.role !== role) {
    redirect(homePathForRole(result.profile.role));
  }

  return result;
}
