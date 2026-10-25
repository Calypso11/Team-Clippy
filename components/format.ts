const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const usdSmall = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
});

const clean = (n: number) => (Object.is(n, -0) || Math.abs(n) < 0.00005 ? 0 : n);

// Whole-dollar-and-cents amounts. Returns "—" for anything that is not a real number.
export function money(n: number | null | undefined): string {
  if (typeof n !== "number" || !Number.isFinite(n)) return "—";
  const v = clean(Math.round(n * 100) / 100);
  return usd.format(Object.is(v, -0) ? 0 : v);
}

// Per-unit prices are often fractions of a cent, so show up to 4 decimals.
export function unitMoney(n: number | null | undefined): string {
  if (typeof n !== "number" || !Number.isFinite(n)) return "—";
  const v = clean(n);
  return Math.abs(v) >= 1 ? usd.format(v) : usdSmall.format(v);
}

export function shortDate(iso: string | null | undefined): string {
  if (!iso) return "unknown date";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "unknown date";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function safeHref(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}
