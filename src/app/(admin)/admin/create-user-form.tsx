"use client";

import { useActionState, type ReactNode } from "react";

export interface CreateUserState {
  error?: string;
  email?: string;
  password?: string;
}

export function CreateUserForm({
  action,
  submitLabel,
  extraFields,
}: {
  action: (state: CreateUserState | undefined, formData: FormData) => Promise<CreateUserState>;
  submitLabel: string;
  extraFields?: ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="nb-card flex flex-col gap-3">
      <div className="nb-label flex flex-col gap-1.5">
        <label htmlFor="full_name">Имя</label>
        <input id="full_name" name="full_name" required className="nb-input" />
      </div>
      <div className="nb-label flex flex-col gap-1.5">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="off" className="nb-input" />
      </div>
      {extraFields}
      {state.error && <p className="nb-callout-danger">{state.error}</p>}
      {state.password && (
        <p className="nb-callout-warning break-words">
          Пароль показывается один раз:{" "}
          <code className="font-mono">
            {state.email} / {state.password}
          </code>
        </p>
      )}
      <button type="submit" disabled={pending} className="nb-btn nb-btn-primary w-full sm:w-fit">
        {pending ? "Создаём..." : submitLabel}
      </button>
    </form>
  );
}
