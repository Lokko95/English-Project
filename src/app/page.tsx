import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentProfile, homePathForRole } from "@/lib/auth/session";

export default async function HomePage() {
  const current = await getCurrentProfile();

  if (current) {
    redirect(homePathForRole(current.profile.role));
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 px-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold">Платформа изучения английского</h1>
        <p className="text-gray-600">
          Днём студент изучает слова и грамматику, вечером преподаватель ведёт групповой урок по
          тем же материалам.
        </p>
      </div>
      <Link
        href="/login"
        className="w-fit rounded-md bg-gray-900 px-4 py-2 text-white transition hover:bg-gray-700"
      >
        Войти
      </Link>
    </main>
  );
}
