"use client";

import { useActionState } from "react";

export interface SecretState {
  error?: string;
  password?: string;
}

export function ResetPasswordForm({
  action,
}: {
  action: (state: SecretState | undefined, formData: FormData) => Promise<SecretState>;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-1.5">
      <button type="submit" disabled={pending} className="nb-btn nb-btn-secondary nb-btn-sm">
        {pending ? "Сбрасываем..." : "Новый пароль"}
      </button>
      {state.error && <p className="nb-callout-danger">{state.error}</p>}
      {state.password && (
        <p className="nb-callout-warning break-words">
          Новый пароль (один раз): <code className="font-mono">{state.password}</code>
        </p>
      )}
    </form>
  );
}
