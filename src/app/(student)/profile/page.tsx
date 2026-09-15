import { requireStudent } from "@/lib/dal/student";

import { ChangePasswordForm } from "./change-password-form";
import { UpdateNameForm } from "./update-name-form";

export default async function ProfilePage() {
  const { email, profile, group } = await requireStudent();

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="text-2xl font-semibold">Профиль</h1>
        <dl className="mt-4 flex flex-col gap-1 text-gray-700">
          <div className="flex gap-2">
            <dt className="text-gray-500">Email:</dt>
            <dd>{email}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-gray-500">Группа:</dt>
            <dd>{group?.name ?? "не назначена"}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-md border border-gray-200 p-4">
        <h2 className="mb-3 font-medium">Имя</h2>
        <UpdateNameForm currentName={profile.full_name} />
      </section>

      <section className="rounded-md border border-gray-200 p-4">
        <h2 className="mb-3 font-medium">Смена пароля</h2>
        <ChangePasswordForm />
      </section>
    </div>
  );
}
