"use client";

import { useEffect, useRef, useState } from "react";
import type { AnalysisResult, ProgressEvent } from "@/lib/types";
import Composer, { type InputValues } from "./Composer";
import HelperIcon from "./HelperIcon";
import Progress from "./Progress";
import Results from "./Results";
import { shortDate } from "./format";

type Reply =
  | { kind: "progress"; steps: string[] }
  | { kind: "results"; result: AnalysisResult; exampleLabel?: string }
  | { kind: "error"; message: string; retry?: InputValues };

type Message =
  | { id: number; role: "user"; text: string; imageUrl?: string; fileName?: string }
  | ({ id: number; role: "clippy" } & Reply);

const FALLBACK_ERROR = "Clippy could not finish. Please check your connection and try again.";
const DISCLAIMER = "Prices come from public store pages and can change. Check before you buy. Clippy never buys for you.";

let nextId = 1;

export default function Clippy({ example }: { example: AnalysisResult | null }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const busy = messages.some((m) => m.role === "clippy" && m.kind === "progress");

  // Follow the chat while Clippy works; when an answer lands, show it from the top (the savings come first).
  useEffect(() => {
    const last = messages.at(-1);
    if (last?.role === "clippy" && last.kind === "results") {
      document.getElementById(`msg-${last.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  const setReply = (id: number, update: (m: Reply) => Reply) =>
    setMessages((all) => all.map((m) => (m.id === id && m.role === "clippy" ? { ...m, ...update(m) } : m)));

  async function run(v: InputValues, replyId: number) {
    const fail = (message: string) => setReply(replyId, () => ({ kind: "error", message, retry: v }));
    const form = new FormData();
    if (v.file) form.append("invoice", v.file);
    if (v.list) form.append("list", v.list);
    form.append("ordersPerMonth", String(v.ordersPerMonth));

    try {
      const res = await fetch("/api/analyze", { method: "POST", body: form });
      if (!res.ok || !res.body) {
        const body = await res.json().catch(() => null);
        return fail(body?.error || FALLBACK_ERROR);
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
          setReply(replyId, (m) => (m.kind === "progress" ? { kind: "progress", steps: [...m.steps, ev.message] } : m));
        } else if (ev.type === "result") {
          finished = true;
          setReply(replyId, () => ({ kind: "results", result: ev.data }));
        } else if (ev.type === "error") {
          finished = true;
          fail(ev.message || FALLBACK_ERROR);
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
      if (!finished) fail(FALLBACK_ERROR);
    } catch {
      fail(FALLBACK_ERROR);
    }
  }

  function send(v: InputValues) {
    const replyId = nextId++;
    setMessages((all) => [
      ...all,
      {
        id: nextId++,
        role: "user",
        text: v.list,
        imageUrl: v.file ? URL.createObjectURL(v.file) : undefined,
        fileName: v.file?.name,
      },
      { id: replyId, role: "clippy", kind: "progress", steps: [] },
    ]);
    run(v, replyId);
  }

  function retry(id: number, v: InputValues) {
    setReply(id, () => ({ kind: "progress", steps: [] }));
    run(v, id);
  }

  function showExample() {
    if (!example) return;
    setMessages((all) => [
      ...all,
      { id: nextId++, role: "user", text: "Show me a real example." },
      {
        id: nextId++,
        role: "clippy",
        kind: "results",
        result: example,
        exampleLabel: `Saved real result from ${shortDate(example.generatedAt)}. Prices may have changed.`,
      },
    ]);
  }

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex items-center gap-3 border-b border-slate-200 bg-white/80 px-4 py-2.5 backdrop-blur">
        <HelperIcon className="h-9 w-9 shrink-0" />
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-bold leading-tight text-slate-900">Clippy 2.0</h1>
          <p className="truncate text-xs text-slate-500">Upload your supply invoice. See where you overpay.</p>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={() => setMessages([])}
            disabled={busy}
            className="rounded-full px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50 disabled:opacity-50"
          >
            Start again
          </button>
        )}
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6">
          <ClippyTurn>
            <p className="text-[15px] leading-relaxed text-slate-800">
              Hi, I&apos;m Clippy! Send me a photo of your supply invoice, or type what you buy. I&apos;ll check real
              store prices and show you where you overpay.
            </p>
            {messages.length === 0 && example && (
              <button
                type="button"
                data-testid="example-btn"
                onClick={showExample}
                className="mt-3 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50"
              >
                See a real example
              </button>
            )}
          </ClippyTurn>

          {messages.map((m) =>
            m.role === "user" ? (
              <UserTurn key={m.id} text={m.text} imageUrl={m.imageUrl} fileName={m.fileName} />
            ) : (
              <ClippyTurn key={m.id} id={`msg-${m.id}`}>
                {m.kind === "progress" && <Progress steps={m.steps} />}
                {m.kind === "results" && <Results result={m.result} exampleLabel={m.exampleLabel} />}
                {m.kind === "error" && (
                  <div data-testid="error" role="alert" className="rounded-2xl bg-rose-50 p-4 ring-1 ring-rose-200">
                    <p className="font-semibold text-slate-900">Sorry, that did not work</p>
                    <p className="mt-1 text-slate-700">{m.message}</p>
                    {m.retry && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => retry(m.id, m.retry!)}
                        className="mt-3 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        Try again
                      </button>
                    )}
                  </div>
                )}
              </ClippyTurn>
            ),
          )}
          <div ref={bottomRef} />
        </div>
      </main>

      <div className="bg-gradient-to-t from-slate-50 via-slate-50 to-transparent px-4 pb-3 pt-2">
        <div className="mx-auto w-full max-w-4xl">
          <Composer busy={busy} onSend={send} />
          <p className="mt-2 text-center text-[11px] leading-snug text-slate-500">{DISCLAIMER}</p>
        </div>
      </div>
    </div>
  );
}

function ClippyTurn({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <div id={id} className="flex scroll-mt-4 items-start gap-3">
      <HelperIcon className="h-8 w-8 shrink-0" />
      <div className="min-w-0 flex-1 pt-1">{children}</div>
    </div>
  );
}

function UserTurn({ text, imageUrl, fileName }: { text: string; imageUrl?: string; fileName?: string }) {
  return (
    <div className="flex flex-col items-end gap-2">
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={fileName ?? "Invoice photo"}
          className="max-h-60 max-w-[70%] rounded-2xl object-cover ring-1 ring-slate-200"
        />
      )}
      {text && (
        <p className="max-w-[85%] whitespace-pre-wrap rounded-3xl bg-slate-200/70 px-4 py-2.5 text-[15px] text-slate-900">
          {text}
        </p>
      )}
    </div>
  );
}
