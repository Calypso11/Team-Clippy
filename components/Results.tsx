"use client";

import { useState } from "react";
import type { AnalysisResult, ItemResult, RankedOffer } from "@/lib/types";
import { toBase, unitLabel } from "@/lib/units";
import { money, safeHref, shortDate, unitMoney } from "./format";

// Shown inside Clippy's chat reply: tips first (Clippy talking), then the numbers.
export default function Results({ result, exampleLabel }: { result: AnalysisResult; exampleLabel?: string }) {
  const month = result.totalSavingsPerMonth;
  const saves = Number.isFinite(month) && month >= 0.01;
  const knowsPrices = result.items.some((r) => r.currentUnitCost !== null && r.best);

  return (
    <section data-testid="results" className="space-y-4">
      {exampleLabel && (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">{exampleLabel}</p>
      )}

      {result.suggestions.length > 0 && (
        <ul className="space-y-2 text-[15px] leading-relaxed text-slate-800">
          {result.suggestions.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      )}

      <div className="rounded-2xl bg-emerald-600 p-5 text-white">
        {saves ? (
          <>
            <p className="text-sm font-medium text-emerald-100">You could</p>
            <p data-testid="total-month" className="text-2xl font-bold tracking-tight sm:text-4xl">
              Save {money(month)} per month
            </p>
            <p className="mt-1 text-base text-emerald-50">{money(result.totalSavingsPerYear)} per year</p>
            <p className="mt-2 text-xs text-emerald-100">
              Based on {result.ordersPerMonth} {result.ordersPerMonth === 1 ? "order" : "orders"} per month ·{" "}
              {money(result.totalSavingsPerOrder)} per order
            </p>
          </>
        ) : (
          <p data-testid="total-month" className="text-xl font-bold sm:text-2xl">
            {knowsPrices ? "You already pay good prices" : "Here are the best prices Clippy found"}
          </p>
        )}
      </div>

      {result.notice && (
        <p className="rounded-2xl bg-sky-50 px-4 py-3 text-sm text-sky-900 ring-1 ring-sky-200">{result.notice}</p>
      )}

      {/* Phones: cards */}
      <div className="space-y-3 md:hidden">
        {result.items.map((r) => (
          <ItemCard key={r.item.id} r={r} />
        ))}
      </div>

      {/* Computers: table */}
      <div className="hidden overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-3">Item</th>
              <th className="px-3 py-3">You pay now</th>
              <th className="px-3 py-3">Best store</th>
              <th className="px-3 py-3">Best price</th>
              <th className="px-3 py-3">Savings per order</th>
              <th className="px-3 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {result.items.map((r) => (
              <ItemTableRow key={r.item.id} r={r} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function per(r: ItemResult, offer?: RankedOffer | null) {
  const base = offer?.baseUnit ?? toBase(r.item.packSize, r.item.unit).baseUnit;
  return unitLabel(base, r.item.name);
}

function current(r: ItemResult) {
  return r.currentUnitCost !== null ? `${unitMoney(r.currentUnitCost)} ${per(r)}` : "Not given";
}

function savings(r: ItemResult) {
  if (r.savingsPerOrder === null) return "—";
  return r.savingsPerOrder >= 0.01 ? money(r.savingsPerOrder) : "None, your price is good";
}

function OpenLink({ offer }: { offer: RankedOffer }) {
  const href = safeHref(offer.url);
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block whitespace-nowrap rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
    >
      Open product
    </a>
  );
}

function OtherOffers({ r }: { r: ItemResult }) {
  const [open, setOpen] = useState(false);
  const others = r.offers.filter((o) => o !== r.best && o.url !== r.best?.url);
  if (others.length === 0) return null;
  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="text-sm font-medium text-emerald-700 hover:underline"
      >
        {open ? "Hide other offers" : `See other offers (${others.length})`}
      </button>
      {open && (
        <ul className="mt-2 space-y-2">
          {others.map((o, i) => {
            const href = safeHref(o.url);
            return (
              <li key={i} className="rounded-xl bg-slate-50 p-3 text-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-medium text-slate-800">{o.store}</span>
                  <span className="text-slate-700">
                    {unitMoney(o.unitCost)} {per(r, o)}
                  </span>
                </div>
                <p className="truncate text-xs text-slate-500">{o.title}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {href && (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline">
                      Open product
                    </a>
                  )}{" "}
                  · checked {shortDate(o.checkedAt)}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function ItemCard({ r }: { r: ItemResult }) {
  return (
    <article data-testid="item-row" className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <h3 className="font-semibold text-slate-900">{r.item.name}</h3>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <dt className="text-slate-500">You pay now</dt>
        <dd className="text-right text-slate-800">{current(r)}</dd>
        {r.best ? (
          <>
            <dt className="text-slate-500">Best store</dt>
            <dd className="text-right font-medium text-slate-800">{r.best.store}</dd>
            <dt className="text-slate-500">Best price</dt>
            <dd className="text-right text-slate-800">
              {unitMoney(r.best.unitCost)} {per(r, r.best)}
            </dd>
            {r.savingsPerOrder !== null && (
              <>
                <dt className="text-slate-500">Savings per order</dt>
                <dd className="text-right font-semibold text-emerald-700">{savings(r)}</dd>
              </>
            )}
          </>
        ) : null}
      </dl>
      {r.best ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <OpenLink offer={r.best} />
          <span className="text-xs text-slate-500">checked {shortDate(r.best.checkedAt)}</span>
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-500">No reliable price found.</p>
      )}
      <OtherOffers r={r} />
    </article>
  );
}

function ItemTableRow({ r }: { r: ItemResult }) {
  return (
    <tr data-testid="item-row" className="border-t border-slate-100 align-top">
      <td className="px-3 py-4 font-medium text-slate-900">
        {r.item.name}
        <OtherOffers r={r} />
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-slate-700">{current(r)}</td>
      {r.best ? (
        <>
          <td className="px-3 py-4 text-slate-800">{r.best.store}</td>
          <td className="whitespace-nowrap px-3 py-4 text-slate-800">
            {unitMoney(r.best.unitCost)} {per(r, r.best)}
          </td>
          <td className="px-3 py-4 font-semibold text-emerald-700">{savings(r)}</td>
          <td className="px-3 py-4 text-right">
            <OpenLink offer={r.best} />
            <p className="mt-1 whitespace-nowrap text-xs text-slate-500">checked {shortDate(r.best.checkedAt)}</p>
          </td>
        </>
      ) : (
        <td colSpan={4} className="px-3 py-4 text-slate-500">
          No reliable price found.
        </td>
      )}
    </tr>
  );
}
