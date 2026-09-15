"use client";

import { useActionState } from "react";

import { changePassword, type ProfileFormState } from "./actions";

const initialState: ProfileFormState = {};

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePassword, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm text-gray-700">
          Новый пароль
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          className="rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password_confirm" className="text-sm text-gray-700">
          Повторите пароль
        </label>
        <input
          id="password_confirm"
          name="password_confirm"
          type="password"
          required
          minLength={8}
          className="rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
        />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-700">Пароль изменён</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-md bg-gray-900 px-4 py-2 text-white transition hover:bg-gray-700 disabled:opacity-50"
      >
        {pending ? "Сохраняем..." : "Сменить пароль"}
      </button>
    </form>
  );
}
