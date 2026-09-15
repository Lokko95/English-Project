import { redirect } from "next/navigation";

import { getCurrentProfile, homePathForRole } from "@/lib/auth/session";

import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const current = await getCurrentProfile();

  if (current) {
    redirect(homePathForRole(current.profile.role));
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-6">
      <h1 className="text-2xl font-semibold">Вход</h1>
      <p className="text-sm text-gray-600">
        Публичной регистрации нет — учётные данные выдаёт администратор.
      </p>
      <LoginForm />
    </main>
  );
}
