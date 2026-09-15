"use client";

import { useActionState } from "react";

import { updateFullName, type ProfileFormState } from "./actions";

const initialState: ProfileFormState = {};

export function UpdateNameForm({ currentName }: { currentName: string }) {
  const [state, formAction, pending] = useActionState(updateFullName, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="full_name" className="text-sm text-gray-700">
          Имя
        </label>
        <input
          id="full_name"
          name="full_name"
          defaultValue={currentName}
          required
          className="rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
        />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-700">Сохранено</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-md bg-gray-900 px-4 py-2 text-white transition hover:bg-gray-700 disabled:opacity-50"
      >
        {pending ? "Сохраняем..." : "Сохранить имя"}
      </button>
    </form>
  );
}
