import { LessonForm } from "@/app/(admin)/admin/lessons/lesson-form";
import { createLesson } from "@/app/(admin)/admin/lessons/actions";
import { requireAdmin } from "@/lib/dal/admin";
import { createClient } from "@/lib/supabase/server";
import type { Group } from "@/lib/types";

export default async function NewLessonPage({
  searchParams,
}: {
  searchParams: Promise<{ group_id?: string }>;
}) {
  const { group_id: groupId } = await searchParams;
  await requireAdmin();
  const supabase = await createClient();
  const { data: groupsData } = await supabase
    .from("groups")
    .select("id, name, level, teacher_id, meeting_url, evening_time, current_lesson_id")
    .order("name");
  const groups = (groupsData as Group[]) ?? [];

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h1 className="nb-heading-1">Новый урок</h1>
        <p className="mt-1 text-muted">Привязывается к выбранной группе. Номер можно потом изменить.</p>
      </section>
      {groups.length === 0 ? (
        <p className="text-muted">Сначала создайте группу.</p>
      ) : (
        <LessonForm
          action={createLesson}
          submitLabel="Создать урок"
          groupId={groupId}
          groups={groups.map((group) => ({ id: group.id, name: group.name }))}
        />
      )}
    </div>
  );
}
