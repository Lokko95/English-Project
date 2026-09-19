import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentProfile, homePathForRole } from "@/lib/auth/session";

import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const current = await getCurrentProfile();

  if (current) {
    redirect(homePathForRole(current.profile.role));
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center gap-6 px-4 py-12 sm:px-6">
      <div>
        <h1 className="nb-heading-1">Вход</h1>
        <p className="mt-2 text-sm text-muted">
          Публичной регистрации нет — учётные данные выдаёт администратор.
        </p>
      </div>
      <div className="nb-card">
        <LoginForm />
      </div>
      <p className="text-sm text-muted">
        Нет аккаунта? Можно пройти{" "}
        <Link href="/placement-test" className="nb-link">
          тест на уровень
        </Link>{" "}
        без регистрации.
      </p>
    </main>
  );
}
