export default function Progress({ steps }: { steps: string[] }) {
  return (
    <div data-testid="progress" className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Clippy is checking prices…</h2>
      <ol className="space-y-3" aria-live="polite">
        {steps.length === 0 && <Step text="Getting started" current />}
        {steps.map((s, i) => (
          <Step key={i} text={s} current={i === steps.length - 1} />
        ))}
      </ol>
      <p className="mt-5 text-xs text-slate-500">This usually takes under a minute.</p>
    </div>
  );
}

function Step({ text, current }: { text: string; current: boolean }) {
  return (
    <li className="flex items-start gap-3 text-sm">
      {current ? (
        <span
          aria-label="in progress"
          className="mt-0.5 h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600"
        />
      ) : (
        <svg viewBox="0 0 20 20" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-label="done">
          <circle cx="10" cy="10" r="9" fill="currentColor" />
          <path d="M6 10.5l2.5 2.5L14 7.5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      <span className={current ? "font-medium text-slate-900" : "text-slate-600"}>{text}</span>
    </li>
  );
}
