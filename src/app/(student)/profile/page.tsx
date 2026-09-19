import { requireStudent } from "@/lib/dal/student";

import { ChangePasswordForm } from "./change-password-form";
import { UpdateNameForm } from "./update-name-form";

export default async function ProfilePage() {
  const { email, profile, group } = await requireStudent();

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="nb-heading-1">Профиль</h1>
        <dl className="mt-4 flex flex-col gap-1 text-ink">
          <div className="flex flex-wrap gap-2">
            <dt className="text-muted">Email:</dt>
            <dd className="font-semibold break-all">{email}</dd>
          </div>
          <div className="flex flex-wrap gap-2">
            <dt className="text-muted">Группа:</dt>
            <dd className="font-semibold">{group?.name ?? "не назначена"}</dd>
          </div>
        </dl>
      </section>

      <section className="nb-card">
        <h2 className="nb-heading-2 mb-3">Имя</h2>
        <UpdateNameForm currentName={profile.full_name} />
      </section>

      <section className="nb-card">
        <h2 className="nb-heading-2 mb-3">Смена пароля</h2>
        <ChangePasswordForm />
      </section>
    </div>
  );
}
