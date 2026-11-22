// src/components/menu/menuUi.js
// Small form pieces shared by the menu editor panels.

export const inputClass =
  "w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-3 text-base text-white outline-none focus:border-orange-500";

export function Field({ label, value, onChange, placeholder, type = "text", inputMode }) {
  return (
    <div>
      <label className="block text-xs text-neutral-400 mb-1">{label}</label>
      <input
        value={value}
        type={type}
        inputMode={inputMode}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputClass}
      />
    </div>
  );
}

export function TextArea({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <div>
      <label className="block text-xs text-neutral-400 mb-1">{label}</label>
      <textarea
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputClass} resize-y`}
      />
    </div>
  );
}

export function SelectField({ label, value, onChange, children }) {
  return (
    <div>
      {label && <label className="block text-xs text-neutral-400 mb-1">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      >
        {children}
      </select>
    </div>
  );
}

export function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-3 text-sm">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 accent-orange-500"
      />
    </label>
  );
}

export function Card({ title, help, children }) {
  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 sm:p-5">
      {title && <h2 className="text-lg font-bold text-orange-400">{title}</h2>}
      {help && <p className="mt-1 text-sm text-neutral-400">{help}</p>}
      <div className={title || help ? "mt-4" : ""}>{children}</div>
    </section>
  );
}

export function PrimaryButton({ children, ...props }) {
  return (
    <button
      {...props}
      className={`rounded-lg bg-orange-500 px-4 py-3 text-sm font-semibold text-black transition hover:bg-orange-600 disabled:opacity-50 ${props.className || ""}`}
    >
      {children}
    </button>
  );
}
