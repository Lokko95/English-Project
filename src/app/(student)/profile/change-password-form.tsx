"use client";

import { useActionState } from "react";

import { changePassword, type ProfileFormState } from "./actions";

const initialState: ProfileFormState = {};

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePassword, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="nb-label flex flex-col gap-1.5">
        <label htmlFor="password">Новый пароль</label>
        <input id="password" name="password" type="password" required minLength={8} className="nb-input" />
      </div>

      <div className="nb-label flex flex-col gap-1.5">
        <label htmlFor="password_confirm">Повторите пароль</label>
        <input
          id="password_confirm"
          name="password_confirm"
          type="password"
          required
          minLength={8}
          className="nb-input"
        />
      </div>

      {state?.error && <p className="nb-callout-danger">{state.error}</p>}
      {state?.success && <p className="nb-callout-success">Пароль изменён</p>}

      <button type="submit" disabled={pending} className="nb-btn nb-btn-primary w-full sm:w-fit">
        {pending ? "Сохраняем..." : "Сменить пароль"}
      </button>
    </form>
  );
}
