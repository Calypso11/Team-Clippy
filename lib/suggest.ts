import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { ItemResult } from "./types";
import { unitLabel } from "./units";

const MAX_TIPS = 3;
const MAX_WORDS = 24;
export const GOOD_PRICES_TIP = "Great news: you already pay good prices for these items. Keep it up!";

export interface SuggestionRow {
  item: string;
  store: string;
  savingsPerOrder: string; // "$12.40"
  youPayNow: string; // "$0.119 per cup"
  bestPrice: string;
}

const money = (n: number) => `$${n.toFixed(2)}`;
const unitMoney = (n: number) => `$${n < 1 ? n.toFixed(3) : n.toFixed(2)}`;

// Items with a real saving, biggest first, with every number already written as text.
export function buildSuggestionInput(results: ItemResult[]): SuggestionRow[] {
  return results
    .filter((r) => r.best && r.currentUnitCost !== null && (r.savingsPerOrder ?? 0) > 0)
    .sort((a, b) => (b.savingsPerOrder ?? 0) - (a.savingsPerOrder ?? 0))
    .map((r) => {
      const label = unitLabel(r.best!.baseUnit, r.item.name);
      return {
        item: r.item.name,
        store: r.best!.store,
        savingsPerOrder: money(r.savingsPerOrder!),
        youPayNow: `${unitMoney(r.currentUnitCost!)} ${label}`,
        bestPrice: `${unitMoney(r.best!.unitCost)} ${label}`,
      };
    });
}

export function templateSuggestions(rows: SuggestionRow[]): string[] {
  if (rows.length === 0) return [GOOD_PRICES_TIP];
  return rows
    .slice(0, MAX_TIPS)
    .map((r) => `Buy ${r.item} at ${r.store} and save ${r.savingsPerOrder} per order.`);
}

const numbersIn = (text: string) => text.match(/\d+(?:[.,]\d+)*/g)?.map((n) => n.replace(/,/g, "")) ?? [];
const wordCount = (text: string) => text.trim().split(/\s+/).length;

const TipsSchema = z.object({ tips: z.array(z.string().min(1)) });

const SAVE_TIPS_TOOL: Anthropic.Tool = {
  name: "save_tips",
  description: "Save the tips for the business owner.",
  input_schema: {
    type: "object",
    properties: { tips: { type: "array", items: { type: "string" }, maxItems: MAX_TIPS } },
    required: ["tips"],
  },
};

let client: Anthropic | undefined;

export async function writeSuggestions(results: ItemResult[], ordersPerMonth: number): Promise<string[]> {
  const rows = buildSuggestionInput(results);
  if (rows.length === 0) return [GOOD_PRICES_TIP];
  const input = JSON.stringify({ ordersPerMonth, items: rows }, null, 2);
  try {
    client ??= new Anthropic();
    const res = await client.messages.create({
      model: "claude-haiku-5-5",
      max_tokens: 1024,
      tools: [SAVE_TIPS_TOOL],
      tool_choice: { type: "tool", name: "save_tips" },
      messages: [
        {
          role: "user",
          content: `You are Clippy, a friendly helper for a small-business owner. Write at most ${MAX_TIPS} money-saving tips from the data below and call save_tips.
- One tip per item, one short sentence of at most 20 words, friendly, simple English. No greeting.
- Each tip names the store and the saving per order. Biggest saving first (the items are already in that order).
- Use ONLY numbers that appear in the data, copied exactly. Do not calculate new numbers (no monthly or yearly totals).

Data:
${input}`,
        },
      ],
    });
    const block = res.content.find((b) => b.type === "tool_use");
    if (!block || block.type !== "tool_use") throw new Error("no tips returned");
    const allowed = new Set(numbersIn(input));
    const tips = TipsSchema.parse(block.input)
      .tips.map((t) => t.trim())
      .filter((t) => wordCount(t) <= MAX_WORDS && numbersIn(t).every((n) => allowed.has(n)))
      .slice(0, MAX_TIPS);
    if (tips.length === 0) throw new Error("no usable tips");
    return tips;
  } catch {
    return templateSuggestions(rows);
  }
}
