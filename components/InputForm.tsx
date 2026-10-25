"use client";

import { useEffect, useRef, useState } from "react";

const MAX_BYTES = 5 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

export interface InputValues {
  file: File | null;
  list: string;
  ordersPerMonth: number;
}

export default function InputForm({
  onSubmit,
  onExample,
}: {
  onSubmit: (v: InputValues) => void;
  onExample?: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [list, setList] = useState("");
  const [orders, setOrders] = useState("4");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!file) return setPreview(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

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

  function remove() {
    setFile(null);
    setFileError(null);
  }

  const ordersNum = Number(orders);
  const ordersOk = Number.isInteger(ordersNum) && ordersNum >= 1 && ordersNum <= 30;
  const canSubmit = (file !== null || list.trim().length > 0) && ordersOk;

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit) onSubmit({ file, list: list.trim(), ordersPerMonth: ordersNum });
      }}
    >
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">Photo of your supply invoice</label>
        {file && preview ? (
          <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Invoice preview" className="h-20 w-20 rounded-lg object-cover ring-1 ring-slate-200" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800">{file.name}</p>
              <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
            </div>
            <button
              type="button"
              onClick={remove}
              className="rounded-lg px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"
            >
              Remove
            </button>
          </div>
        ) : (
          <label
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
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
              dragging ? "border-emerald-500 bg-emerald-50" : "border-slate-300 bg-white hover:border-emerald-400"
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-sm font-medium text-slate-800">Tap to choose a photo, or drop it here</span>
            <span className="text-xs text-slate-500">JPEG, PNG or WebP, up to 5 MB</span>
            <input
              ref={inputRef}
              data-testid="upload-input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(e) => pick(e.target.files?.[0])}
            />
          </label>
        )}
        {fileError && (
          <p data-testid="error" role="alert" className="mt-2 text-sm font-medium text-rose-600">
            {fileError}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="list" className="mb-2 block text-sm font-semibold text-slate-700">
          Or type what you buy
        </label>
        <textarea
          id="list"
          data-testid="list-input"
          rows={4}
          maxLength={5000}
          value={list}
          onChange={(e) => setList(e.target.value)}
          placeholder="Or type what you buy: 50 lb bread flour, 1000 12 oz cups…"
          className="w-full rounded-2xl border border-slate-300 bg-white p-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <label htmlFor="orders" className="text-sm font-semibold text-slate-700">
          Orders per month
        </label>
        <input
          id="orders"
          data-testid="orders-input"
          type="number"
          inputMode="numeric"
          min={1}
          max={30}
          value={orders}
          onChange={(e) => setOrders(e.target.value)}
          className={`w-24 rounded-xl border bg-white p-2 text-center text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-200 ${
            ordersOk ? "border-slate-300" : "border-rose-400"
          }`}
        />
      </div>
      {!ordersOk && <p className="-mt-3 text-sm text-rose-600">Use a whole number from 1 to 30.</p>}

      <button
        type="submit"
        data-testid="submit-btn"
        disabled={!canSubmit}
        className="w-full rounded-2xl bg-emerald-600 px-5 py-4 text-lg font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        Find my savings
      </button>

      {onExample && (
        <button
          type="button"
          data-testid="example-btn"
          onClick={onExample}
          className="w-full rounded-2xl border border-slate-300 bg-white px-5 py-3 text-base font-medium text-slate-700 hover:bg-slate-50"
        >
          See a real example
        </button>
      )}
    </form>
  );
}
