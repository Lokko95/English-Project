"use client";

import { useActionState } from "react";

import type { LessonFormState } from "./actions";

export function LessonForm({
  action,
  submitLabel,
  groupId,
  groups,
  defaultValues,
}: {
  action: (state: LessonFormState | undefined, formData: FormData) => Promise<LessonFormState>;
  submitLabel: string;
  groupId?: string;
  groups?: { id: string; name: string }[];
  defaultValues?: {
    order_index: number;
    title: string;
    grammar_title: string;
    grammar_body: string;
    materials: string;
    plan: string;
    vocabulary?: string;
  };
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const isCreate = Boolean(groups);

  return (
    <form action={formAction} className="nb-card flex flex-col gap-3">
      {groups ? (
        <select name="group_id" required defaultValue={groupId ?? ""} className="nb-input">
          <option value="" disabled>
            Группа
          </option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      ) : (
        <input type="hidden" name="group_id" value={groupId ?? ""} />
      )}

      <label className="nb-label flex flex-col gap-1.5">
        Номер в группе
        <input
          name="order_index"
          type="number"
          required
          min={1}
          defaultValue={defaultValues?.order_index ?? 1}
          className="nb-input"
        />
      </label>
      <input
        name="title"
        required
        placeholder="Название урока"
        defaultValue={defaultValues?.title ?? ""}
        className="nb-input"
      />
      <input
        name="grammar_title"
        required
        placeholder="Правило (заголовок)"
        defaultValue={defaultValues?.grammar_title ?? ""}
        className="nb-input"
      />
      <textarea
        name="grammar_body"
        required
        rows={6}
        placeholder="Текст правила"
        defaultValue={defaultValues?.grammar_body ?? ""}
        className="nb-input"
      />
      <textarea
        name="materials"
        rows={4}
        placeholder="Примеры и материалы"
        defaultValue={defaultValues?.materials ?? ""}
        className="nb-input"
      />
      <textarea
        name="plan"
        rows={8}
        placeholder="План для преподавателя"
        defaultValue={defaultValues?.plan ?? ""}
        className="nb-input"
      />
      {isCreate && (
        <label className="nb-label flex flex-col gap-1.5">
          Слова (по строке: word | перевод | example | transcription)
          <textarea
            name="vocabulary"
            rows={8}
            defaultValue={defaultValues?.vocabulary ?? ""}
            className="nb-input font-mono text-sm"
          />
        </label>
      )}
      {state.error && <p className="nb-callout-danger">{state.error}</p>}
      <button type="submit" disabled={pending} className="nb-btn nb-btn-primary w-full sm:w-fit">
        {pending ? "Сохраняем..." : submitLabel}
      </button>
    </form>
  );
}
