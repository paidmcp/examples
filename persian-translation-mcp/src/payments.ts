import { HTTPFacilitatorClient } from "@x402/core/server";
import type { RouteConfig } from "@x402/core/server";

type Accepts = RouteConfig["accepts"];
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { x402ResourceServer } from "@x402/express";
import { BASE_NETWORK, PLASMA_NETWORK, config } from "./config.js";
import { logCall } from "./log.js";
import type { PaidTool } from "./tools.js";

function atomic(priceUsdt: number): string {
  // USDC and USDT0 both use 6 decimals.
  return Math.round(priceUsdt * 1_000_000).toString();
}

/**
 * Two payment options per tool: USDC on Base and USDT0 on Plasma.
 * The asset/amount are bound explicitly so the requirement never depends on a
 * facilitator-side USD->token registry (which does not know Plasma USDT0).
 */
function acceptsFor(tool: PaidTool, payTo: string): Accepts {
  const amount = atomic(tool.priceUsdt);
  return [
    {
      scheme: "exact",
      network: BASE_NETWORK,
      payTo,
      price: { asset: config.USDC_ADDRESS, amount, extra: { name: "USD Coin", version: "2", decimals: 6 } }
    },
    {
      scheme: "exact",
      network: PLASMA_NETWORK,
      payTo,
      price: { asset: config.USDT0_ADDRESS, amount, extra: { name: "USDT0", version: "1", decimals: 6 } }
    }
  ];
}

export function buildRoutes(tools: PaidTool[], payTo: string): Record<string, RouteConfig> {
  const routes: Record<string, RouteConfig> = {};
  for (const tool of tools) {
    routes[`POST /tools/${tool.name}`] = {
      accepts: acceptsFor(tool, payTo),
      description: tool.description,
      mimeType: "application/json"
    };
  }
  return routes;
}

function toolNameFromContext(ctx: {
  transportContext?: unknown;
  paymentPayload?: { resource?: { url?: string } };
}): string {
  const tc = ctx.transportContext as { request?: { path?: string }; path?: string } | undefined;
  const path = tc?.request?.path ?? tc?.path;
  if (path?.startsWith("/tools/")) return path.slice("/tools/".length);

  const url = ctx.paymentPayload?.resource?.url;
  if (url) {
    try {
      const pathname = new URL(url).pathname;
      if (pathname.startsWith("/tools/")) return pathname.slice("/tools/".length);
    } catch {
      // ignore malformed resource url
    }
  }
  return "unknown";
}

/**
 * One resource server, both facilitators. The server routes each network to the
 * facilitator that advertises support for it (Heurist -> Base, Semantic -> Plasma).
 * Successful settlements are logged here so the SQLite row carries the tx hash and payer.
 */
export function buildResourceServer(tools: PaidTool[]): x402ResourceServer {
  const heurist = new HTTPFacilitatorClient({ url: config.HEURIST_FACILITATOR_URL });
  const semantic = new HTTPFacilitatorClient({ url: config.SEMANTIC_FACILITATOR_URL });

  const priceByTool = new Map(tools.map((t) => [t.name, t.priceUsdt]));

  const server = new x402ResourceServer([heurist, semantic])
    .register(BASE_NETWORK, new ExactEvmScheme())
    .register(PLASMA_NETWORK, new ExactEvmScheme());

  server.onAfterSettle(async (ctx) => {
    if (!ctx.result.success) return;
    const toolName = toolNameFromContext(ctx);
    logCall({
      toolName,
      payerAddress: ctx.result.payer,
      amountUsdt: priceByTool.get(toolName),
      txHash: ctx.result.transaction,
      success: true
    });
    console.log(`[x402] settled ${toolName}: ${ctx.result.transaction} from ${ctx.result.payer}`);
  });

  server.onSettleFailure(async (ctx) => {
    const toolName = toolNameFromContext(ctx);
    console.error(
      `[x402] settlement failed${toolName ? ` for ${toolName}` : ""}:`,
      ctx.error
    );
  });

  return server;
}
