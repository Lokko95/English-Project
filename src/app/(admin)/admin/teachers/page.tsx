import { ConfirmDeleteForm } from "@/app/(admin)/admin/confirm-delete-form";
import { CreateUserForm } from "@/app/(admin)/admin/create-user-form";
import { ResetPasswordForm } from "@/app/(admin)/admin/reset-password-form";
import {
  createTeacher,
  deleteUser,
  resetUserPassword,
  updateProfileName,
} from "@/app/(admin)/admin/users-actions";
import { getAuthEmailMap, requireAdmin } from "@/lib/dal/admin";
import { createClient } from "@/lib/supabase/server";
import type { Group, Profile } from "@/lib/types";

export default async function AdminTeachersPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [{ data: profilesData }, { data: groupsData }, emails] = await Promise.all([
    supabase.from("profiles").select("id, full_name, role, created_at").eq("role", "TEACHER").order("full_name"),
    supabase.from("groups").select("id, name, level, teacher_id, meeting_url, evening_time, current_lesson_id"),
    getAuthEmailMap(),
  ]);

  const profiles = (profilesData as Profile[]) ?? [];
  const groups = (groupsData as Group[]) ?? [];

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="nb-heading-1">Преподаватели</h1>
      </section>

      <section>
        <h2 className="nb-heading-2 mb-3">Новый преподаватель</h2>
        <CreateUserForm action={createTeacher} submitLabel="Создать преподавателя" />
      </section>

      <section>
        <h2 className="nb-heading-2 mb-3">Список</h2>
        {profiles.length === 0 ? (
          <p className="text-muted">Пока нет преподавателей.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {profiles.map((profile) => {
              const taught = groups.filter((group) => group.teacher_id === profile.id);
              return (
                <li key={profile.id} className="nb-card">
                  <p className="font-bold text-ink">{profile.full_name}</p>
                  <p className="text-sm text-muted break-all">{emails.get(profile.id) || "email неизвестен"}</p>
                  <p className="mt-1 text-sm text-muted">
                    Группы: {taught.length === 0 ? "нет" : taught.map((group) => group.name).join(", ")}
                  </p>

                  <form action={updateProfileName.bind(null, profile.id)} className="mt-3 flex flex-wrap gap-2">
                    <input
                      name="full_name"
                      defaultValue={profile.full_name}
                      required
                      className="nb-input nb-input-sm flex-1 sm:max-w-xs"
                    />
                    <button type="submit" className="nb-btn nb-btn-secondary nb-btn-sm">
                      Сохранить имя
                    </button>
                  </form>

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <ResetPasswordForm action={resetUserPassword.bind(null, profile.id)} />
                    <ConfirmDeleteForm
                      action={deleteUser.bind(null, profile.id)}
                      message={`Удалить преподавателя ${profile.full_name}?`}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
