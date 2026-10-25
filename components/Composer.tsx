"use client";

import { useEffect, useRef, useState } from "react";

const MAX_BYTES = 5 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

export interface InputValues {
  file: File | null;
  list: string;
  ordersPerMonth: number;
}

// Chat-style input bar: attach a photo, type a list, set orders per month, send.
export default function Composer({ busy, onSend }: { busy: boolean; onSend: (v: InputValues) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [list, setList] = useState("");
  const [orders, setOrders] = useState("4");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!file) return setPreview(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Grow the text box with its content, up to a limit.
  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [list]);

  function pick(f: File | undefined) {
    if (!f) return;
    if (!TYPES.includes(f.type)) {
      setFile(null);
      setFileError("Please use a JPEG, PNG or WebP photo.");
    } else if (f.size > MAX_BYTES) {
      setFile(null);
      setFileError("That photo is larger than 5 MB. Please use a smaller one.");
    } else {
      setFile(f);
      setFileError(null);
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  const ordersNum = Number(orders);
  const ordersOk = Number.isInteger(ordersNum) && ordersNum >= 1 && ordersNum <= 30;
  const canSend = !busy && (file !== null || list.trim().length > 0) && ordersOk;

  function send() {
    if (!canSend) return;
    onSend({ file, list: list.trim(), ordersPerMonth: ordersNum });
    setFile(null);
    setList("");
    setFileError(null);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        pick(e.dataTransfer.files[0]);
      }}
      className={`rounded-3xl border bg-white p-2 shadow-sm transition-colors ${
        dragging ? "border-emerald-500 ring-2 ring-emerald-200" : "border-slate-300 focus-within:border-slate-400"
      }`}
    >
      {file && preview && (
        <div className="mb-1 flex items-center gap-3 px-2 pt-1">
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Invoice preview" className="h-16 w-16 rounded-xl object-cover ring-1 ring-slate-200" />
            <button
              type="button"
              aria-label="Remove"
              onClick={() => setFile(null)}
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-white hover:bg-slate-700"
            >
              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" aria-hidden>
                <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <div className="min-w-0 text-xs text-slate-500">
            <p className="truncate font-medium text-slate-700">{file.name}</p>
            <p>{(file.size / 1024 / 1024).toFixed(1)} MB</p>
          </div>
        </div>
      )}

      <textarea
        ref={textRef}
        data-testid="list-input"
        aria-label="Type what you buy"
        rows={1}
        maxLength={5000}
        value={list}
        onChange={(e) => setList(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            send();
          }
        }}
        placeholder={file ? "Add a note, or just press send" : "Or type what you buy: 50 lb bread flour, 1000 12 oz cups…"}
        className="block max-h-[180px] w-full resize-none bg-transparent px-3 py-2 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
      />

      <div className="flex items-center gap-2 px-1">
        <label
          title="Attach a photo of your invoice"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-slate-600 hover:bg-slate-100"
        >
          <span className="sr-only">Attach invoice photo</span>
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <rect x="3" y="4" width="18" height="16" rx="3" />
            <circle cx="9" cy="10" r="1.8" />
            <path d="M4 18l5-5 4 4 3-3 4 4" strokeLinejoin="round" />
          </svg>
          <input
            ref={inputRef}
            data-testid="upload-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => pick(e.target.files?.[0])}
          />
        </label>

        <label className="flex items-center gap-1.5 rounded-full px-2 py-1 text-xs text-slate-600 ring-1 ring-slate-200">
          <input
            data-testid="orders-input"
            type="number"
            inputMode="numeric"
            min={1}
            max={30}
            value={orders}
            onChange={(e) => setOrders(e.target.value)}
            aria-label="Orders per month"
            className={`w-9 bg-transparent text-center text-sm font-medium focus:outline-none ${
              ordersOk ? "text-slate-900" : "text-rose-600"
            }`}
          />
          orders / month
        </label>

        <button
          type="submit"
          data-testid="submit-btn"
          aria-label="Find my savings"
          title="Find my savings"
          disabled={!canSend}
          className="ml-auto flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
          <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden>
            <path d="M10 15V5M5.5 9.5L10 5l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {(fileError || !ordersOk) && (
        <p data-testid={fileError ? "error" : undefined} role="alert" className="px-3 pb-1 pt-1 text-sm text-rose-600">
          {fileError ?? "Orders per month must be a whole number from 1 to 30."}
        </p>
      )}
    </form>
  );
}
