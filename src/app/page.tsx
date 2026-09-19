import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentProfile, homePathForRole } from "@/lib/auth/session";

export default async function HomePage() {
  const current = await getCurrentProfile();

  if (current) {
    redirect(homePathForRole(current.profile.role));
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center gap-6 px-4 py-12 sm:px-6">
      <div className="flex flex-col gap-4">
        <span className="w-fit rounded-md border-2 border-ink bg-primary px-3 py-1 text-xs font-bold text-ink">
          Английский по вечерам
        </span>
        <h1 className="text-3xl font-black tracking-tight text-ink sm:text-4xl">
          Платформа изучения английского
        </h1>
        <p className="text-base text-muted sm:text-lg">
          Днём студент изучает слова и грамматику, вечером преподаватель ведёт групповой урок по
          тем же материалам.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link href="/login" className="nb-btn nb-btn-primary w-full sm:w-fit">
          Войти
        </Link>
        <Link href="/placement-test" className="nb-btn nb-btn-secondary w-full sm:w-fit">
          Тест на уровень
        </Link>
      </div>
    </main>
  );
}
