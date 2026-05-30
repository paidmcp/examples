import { z } from "zod";

export interface PaidTool<TInput = unknown, TOutput = unknown> {
  name: string;
  description: string;
  priceUsdt: number;
  inputSchema: z.ZodTypeAny;
  handler: (input: TInput) => Promise<TOutput>;
}

export function definePaidTool<TInput, TOutput>(tool: PaidTool<TInput, TOutput>): PaidTool<TInput, TOutput> {
  return tool;
}

const coingeckoIdSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9-]+$/, "Use a lowercase CoinGecko ID like bitcoin, ethereum, tether");

const CACHE_TTL = 60_000;
const cache = new Map<string, { data: unknown; ts: number }>();

async function json<T>(url: string): Promise<T> {
  const hit = cache.get(url);
  if (hit && Date.now() - hit.ts < CACHE_TTL) {
    return hit.data as T;
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Upstream API error ${response.status}`);
  }
  const data = (await response.json()) as T;
  cache.set(url, { data, ts: Date.now() });
  return data;
}

export const tools: Array<PaidTool<any, any>> = [
  definePaidTool({
    name: "get_price",
    description: "Get current USD price and 24h change for a token by CoinGecko ID.",
    priceUsdt: 0.001,
    inputSchema: z.object({
      id: coingeckoIdSchema.describe("CoinGecko ID like bitcoin, ethereum, tether")
    }),
    handler: async ({ id }) => {
      const data = await json<Record<string, { usd?: number; usd_24h_change?: number }>>(
        `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(id)}&vs_currencies=usd&include_24hr_change=true`
      );
      return {
        id,
        usd: data[id]?.usd ?? null,
        change_24h_pct: data[id]?.usd_24h_change ?? null
      };
    }
  }),
  definePaidTool({
    name: "get_price_history",
    description: "Get historical USD price points for a token.",
    priceUsdt: 0.002,
    inputSchema: z.object({
      id: coingeckoIdSchema,
      days: z.number().int().min(1).max(365)
    }),
    handler: async ({ id, days }) => {
      const data = await json<{ prices?: Array<[number, number]> }>(
        `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(id)}/market_chart?vs_currency=usd&days=${days}`
      );
      return { id, days, prices: data.prices ?? [] };
    }
  }),
  definePaidTool({
    name: "get_token_info",
    description: "Get market cap, volume, and rank for a token.",
    priceUsdt: 0.001,
    inputSchema: z.object({
      id: coingeckoIdSchema
    }),
    handler: async ({ id }) => {
      const data = await json<{
        name?: string;
        symbol?: string;
        market_cap_rank?: number;
        market_data?: { market_cap?: { usd?: number }; total_volume?: { usd?: number } };
      }>(`https://api.coingecko.com/api/v3/coins/${encodeURIComponent(id)}`);
      return {
        id,
        name: data.name ?? null,
        symbol: data.symbol ?? null,
        market_cap_usd: data.market_data?.market_cap?.usd ?? null,
        volume_24h_usd: data.market_data?.total_volume?.usd ?? null,
        rank: data.market_cap_rank ?? null
      };
    }
  })
];
