"use client";

import { useState } from "react";
import type { AnalysisResult, ProgressEvent } from "@/lib/types";
import HelperIcon from "./HelperIcon";
import InputForm, { type InputValues } from "./InputForm";
import Progress from "./Progress";
import Results from "./Results";
import { shortDate } from "./format";

type View =
  | { kind: "input" }
  | { kind: "progress"; steps: string[] }
  | { kind: "results"; result: AnalysisResult; exampleLabel?: string }
  | { kind: "error"; message: string };

const FALLBACK_ERROR = "Clippy could not finish. Please check your connection and try again.";

export default function Clippy({ example }: { example: AnalysisResult | null }) {
  const [view, setView] = useState<View>({ kind: "input" });

  async function analyze(v: InputValues) {
    setView({ kind: "progress", steps: [] });
    const form = new FormData();
    if (v.file) form.append("invoice", v.file);
    if (v.list) form.append("list", v.list);
    form.append("ordersPerMonth", String(v.ordersPerMonth));

    try {
      const res = await fetch("/api/analyze", { method: "POST", body: form });
      if (!res.ok || !res.body) {
        const body = await res.json().catch(() => null);
        setView({ kind: "error", message: body?.error || FALLBACK_ERROR });
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finished = false;

      const handle = (line: string) => {
        if (!line.trim()) return;
        let ev: ProgressEvent;
        try {
          ev = JSON.parse(line);
        } catch {
          return;
        }
        if (ev.type === "progress") {
          setView((cur) => (cur.kind === "progress" ? { kind: "progress", steps: [...cur.steps, ev.message] } : cur));
        } else if (ev.type === "result") {
          finished = true;
          setView({ kind: "results", result: ev.data });
        } else if (ev.type === "error") {
          finished = true;
          setView({ kind: "error", message: ev.message || FALLBACK_ERROR });
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        lines.forEach(handle);
      }
      handle(buffer + decoder.decode());
      if (!finished) setView({ kind: "error", message: FALLBACK_ERROR });
    } catch {
      setView({ kind: "error", message: FALLBACK_ERROR });
    }
  }

  const restart = () => setView({ kind: "input" });

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:py-12">
      <header className={`mb-8 flex items-center gap-4 ${view.kind === "results" ? "" : "mx-auto max-w-xl"}`}>
        <HelperIcon className="h-14 w-14 shrink-0" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Clippy 2.0</h1>
          <p className="text-slate-600">Upload your supply invoice. See where you overpay.</p>
        </div>
      </header>

      {view.kind === "input" && (
        <div className="mx-auto max-w-xl rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
          <InputForm
            onSubmit={analyze}
            onExample={
              example
                ? () =>
                    setView({
                      kind: "results",
                      result: example,
                      exampleLabel: `Saved real result from ${shortDate(example.generatedAt)}. Prices may have changed.`,
                    })
                : undefined
            }
          />
        </div>
      )}

      {view.kind === "progress" && (
        <div className="mx-auto max-w-xl">
          <Progress steps={view.steps} />
        </div>
      )}

      {view.kind === "results" && (
        <Results result={view.result} exampleLabel={view.exampleLabel} onRestart={restart} />
      )}

      {view.kind === "error" && (
        <div
          data-testid="error"
          role="alert"
          className="mx-auto max-w-xl rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-rose-200"
        >
          <p className="text-lg font-semibold text-slate-900">Sorry, that did not work</p>
          <p className="mt-2 text-slate-600">{view.message}</p>
          <button
            type="button"
            onClick={restart}
            className="mt-5 rounded-2xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700"
          >
            Try again
          </button>
        </div>
      )}
    </main>
  );
}
