import type { AnalysisResult, ItemResult, LineItem, Offer, RankedOffer } from "./types";
import { sameDimension, toBase } from "./units";

export function rankOffers(item: LineItem, offers: Offer[]): RankedOffer[] {
  const itemBase = toBase(item.packSize, item.unit).qty;
  const ranked: RankedOffer[] = [];
  for (const offer of offers) {
    if (!sameDimension(offer.unit, item.unit)) continue;
    if (offer.confidence === "low") continue;
    if (offer.price <= 0) continue;
    const { qty, baseUnit } = toBase(offer.packSize, offer.unit);
    if (qty < itemBase * 0.25 || qty > itemBase * 4) continue;
    const unitCost = (offer.price + (offer.shipping ?? 0)) / qty;
    ranked.push({ ...offer, unitCost, baseUnit });
  }
  return ranked.sort((a, b) => a.unitCost - b.unitCost);
}

const toCents = (usd: number) => Math.round(usd * 100);

export function analyzeItem(item: LineItem, offers: Offer[]): ItemResult {
  const ranked = rankOffers(item, offers);
  const best = ranked[0] ?? null;
  const itemBase = toBase(item.packSize, item.unit).qty;
  const currentUnitCost =
    item.pricePaid !== undefined && itemBase > 0 ? (item.pricePaid + (item.shippingPaid ?? 0)) / itemBase : null;
  const savingsPerOrder =
    currentUnitCost !== null && best
      ? Math.max(0, toCents((currentUnitCost - best.unitCost) * itemBase * item.qtyPerOrder)) / 100
      : null;
  return { item, best, offers: ranked, currentUnitCost, savingsPerOrder };
}

export function buildResult(
  items: ItemResult[],
  ordersPerMonth: number,
  suggestions: string[],
  notice?: string,
): AnalysisResult {
  const perOrderCents = items.reduce((sum, r) => sum + (r.savingsPerOrder === null ? 0 : toCents(r.savingsPerOrder)), 0);
  const perMonthCents = Math.round(perOrderCents * ordersPerMonth);
  return {
    items,
    totalSavingsPerOrder: perOrderCents / 100,
    totalSavingsPerMonth: perMonthCents / 100,
    totalSavingsPerYear: (perMonthCents * 12) / 100,
    ordersPerMonth,
    suggestions,
    generatedAt: new Date().toISOString(),
    ...(notice ? { notice } : {}),
  };
}
