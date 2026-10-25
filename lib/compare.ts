import type { LineItem, Offer, RankedOffer } from "./types";
import { sameDimension, toBase } from "./units";

// Offers whose pack is far smaller or bigger than what the owner buys aren't a fair comparison.
const MIN_PACK_RATIO = 0.25;
const MAX_PACK_RATIO = 4;

export function rankOffers(item: LineItem, offers: Offer[]): RankedOffer[] {
  const itemBase = toBase(item.packSize, item.unit).qty;
  const ranked: RankedOffer[] = [];
  for (const offer of offers) {
    if (!sameDimension(offer.unit, item.unit)) continue;
    if (offer.confidence === "low") continue;
    if (offer.price <= 0) continue;
    const { qty, baseUnit } = toBase(offer.packSize, offer.unit);
    if (!(qty > 0)) continue;
    const ratio = qty / itemBase;
    if (ratio < MIN_PACK_RATIO || ratio > MAX_PACK_RATIO) continue;
    const unitCost = (offer.price + (offer.shipping ?? 0)) / qty;
    ranked.push({ ...offer, unitCost, baseUnit });
  }
  return ranked.sort((a, b) => a.unitCost - b.unitCost);
}
