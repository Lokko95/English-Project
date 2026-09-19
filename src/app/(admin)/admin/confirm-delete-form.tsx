"use client";

export function ConfirmDeleteForm({
  action,
  label = "Удалить",
  message = "Удалить безвозвратно?",
}: {
  action: (formData: FormData) => void;
  label?: string;
  message?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(message)) {
          event.preventDefault();
        }
      }}
    >
      <button type="submit" className="nb-btn nb-btn-danger nb-btn-sm">
        {label}
      </button>
    </form>
  );
}
