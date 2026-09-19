"use client";

import { useActionState } from "react";

import { login, type LoginState } from "./actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="nb-label flex flex-col gap-1.5">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" className="nb-input" />
      </div>

      <div className="nb-label flex flex-col gap-1.5">
        <label htmlFor="password">Пароль</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="nb-input"
        />
      </div>

      {state?.error && <p className="nb-callout-danger">{state.error}</p>}

      <button type="submit" disabled={pending} className="nb-btn nb-btn-primary w-full">
        {pending ? "Входим..." : "Войти"}
      </button>
    </form>
  );
}
