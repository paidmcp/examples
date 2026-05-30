import { createFacilitatorConfig } from "@coinbase/x402";
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
 * facilitator that advertises support for it (CDP or Heurist -> Base, Semantic -> Plasma).
 * Successful settlements are logged here so the SQLite row carries the tx hash and payer.
 */
function buildBaseFacilitatorClient(): HTTPFacilitatorClient {
  const baseUrl = config.BASE_FACILITATOR_URL ?? config.HEURIST_FACILITATOR_URL;
  if (!baseUrl) {
    throw new Error("Base facilitator disabled. Set BASE_FACILITATOR_URL to enable Base payments.");
  }
  if (baseUrl.includes("api.cdp.coinbase.com")) {
    if (!config.CDP_API_KEY_ID || !config.CDP_API_KEY_SECRET) {
      throw new Error("CDP_API_KEY_ID and CDP_API_KEY_SECRET are required for Coinbase facilitator.");
    }
    return new HTTPFacilitatorClient(
      createFacilitatorConfig(config.CDP_API_KEY_ID, config.CDP_API_KEY_SECRET)
    );
  }
  return new HTTPFacilitatorClient({ url: baseUrl });
}

function facilitatorForNetwork(network: string): string {
  const baseUrl = config.BASE_FACILITATOR_URL ?? config.HEURIST_FACILITATOR_URL;
  const plasmaUrl = config.PLASMA_FACILITATOR_URL ?? config.SEMANTIC_FACILITATOR_URL;
  if (network === BASE_NETWORK) {
    if (!baseUrl) return "disabled";
    return baseUrl.includes("api.cdp.coinbase.com") ? "cdp" : baseUrl;
  }
  if (network === PLASMA_NETWORK) {
    return plasmaUrl ? (plasmaUrl.includes("semanticpay.io") ? "semantic" : plasmaUrl) : "disabled";
  }
  return "unknown";
}

export function buildResourceServer(tools: PaidTool[]): x402ResourceServer {
  const base = config.BASE_FACILITATOR_URL || config.HEURIST_FACILITATOR_URL ? buildBaseFacilitatorClient() : null;
  const plasmaUrl = config.PLASMA_FACILITATOR_URL ?? config.SEMANTIC_FACILITATOR_URL;
  const semantic = plasmaUrl ? new HTTPFacilitatorClient({ url: plasmaUrl }) : null;
  const facilitators = [base, semantic].filter(Boolean) as HTTPFacilitatorClient[];
  if (facilitators.length === 0) {
    throw new Error("No facilitator enabled. Set BASE_FACILITATOR_URL or PLASMA_FACILITATOR_URL.");
  }

  const priceByTool = new Map(tools.map((t) => [t.name, t.priceUsdt]));

  const server = new x402ResourceServer(facilitators);
  if (base) server.register(BASE_NETWORK, new ExactEvmScheme());
  if (semantic) server.register(PLASMA_NETWORK, new ExactEvmScheme());

  server.onAfterSettle(async (ctx) => {
    if (!ctx.result.success) return;
    const toolName = toolNameFromContext(ctx);
    logCall({
      toolName,
      payerAddress: ctx.result.payer,
      amountUsdt: priceByTool.get(toolName),
      txHash: ctx.result.transaction,
      network: ctx.requirements.network,
      asset: ctx.requirements.asset,
      facilitator: facilitatorForNetwork(ctx.requirements.network),
      success: true
    });
    console.log(
      `[x402] settled ${toolName}: ${ctx.result.transaction} from ${ctx.result.payer}`
    );
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
