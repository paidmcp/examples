import Anthropic from "@anthropic-ai/sdk";
import { existsSync, readFileSync } from "node:fs";
import { z } from "zod";
import { config } from "./config.js";

const defaultPromptPath = new URL(
  "./prompts/spanish-autonomo.md",
  import.meta.url,
);
const effectivePrompt =
  config.SPANISH_PROMPT_PATH && existsSync(config.SPANISH_PROMPT_PATH)
    ? readFileSync(config.SPANISH_PROMPT_PATH, "utf-8")
    : readFileSync(defaultPromptPath, "utf-8");

const anthropic = new Anthropic({ apiKey: config.ANTHROPIC_API_KEY });

export interface PaidTool<TInput = unknown, TOutput = unknown> {
  name: string;
  description: string;
  priceUsdt: number;
  inputSchema: z.ZodTypeAny;
  handler: (input: TInput) => Promise<TOutput>;
}

export function definePaidTool<TInput, TOutput>(
  tool: PaidTool<TInput, TOutput>,
): PaidTool<TInput, TOutput> {
  return tool;
}

async function askClaude(prompt: string): Promise<unknown> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 1200,
    system: effectivePrompt,
    messages: [{ role: "user", content: prompt }],
  });
  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from model.");
  }
  try {
    return JSON.parse(textBlock.text);
  } catch {
    return { raw: textBlock.text };
  }
}

export const tools: Array<PaidTool<any, any>> = [
  definePaidTool({
    name: "interpret_aeat_letter",
    description: "Interpret an AEAT/Hacienda letter and propose next actions.",
    priceUsdt: 0.05,
    inputSchema: z.object({ text: z.string() }),
    handler: async ({ text }) =>
      askClaude(
        `Interpret this AEAT letter. Return JSON: { summary, urgency, required_actions: string[], deadlines: string[], risks: string[] }.\n\n${text}`,
      ),
  }),
  definePaidTool({
    name: "draft_hacienda_response",
    description:
      "Draft a professional Spanish response for a Hacienda situation.",
    priceUsdt: 0.05,
    inputSchema: z.object({
      situation: z.string(),
      tone: z.enum(["formal", "concise", "assertive"]).default("formal"),
    }),
    handler: async ({ situation, tone }) =>
      askClaude(
        `Draft a Spanish response letter. Tone: ${tone}. Return JSON: { subject, draft_spanish, checklist: string[] }.\n\nSituation:\n${situation}`,
      ),
  }),
  definePaidTool({
    name: "find_cnae_code",
    description: "Suggest likely CNAE and IAE codes from business description.",
    priceUsdt: 0.02,
    inputSchema: z.object({ business_description: z.string() }),
    handler: async ({ business_description }) =>
      askClaude(
        `Suggest likely CNAE and IAE options. Return JSON: { primary_cnae, possible_cnae: string[], primary_iae, possible_iae: string[], notes }.\n\nDescription:\n${business_description}`,
      ),
  }),
  definePaidTool({
    name: "explain_modelo_130",
    description:
      "Explain Modelo 130 estimate and likely fields from income and expenses.",
    priceUsdt: 0.05,
    inputSchema: z.object({
      quarterly_income: z.number().nonnegative(),
      expenses: z.number().nonnegative(),
    }),
    handler: async ({ quarterly_income, expenses }) =>
      askClaude(
        `Explain Modelo 130 with quarterly_income=${quarterly_income}, expenses=${expenses}. Return JSON: { taxable_base_estimate, payment_estimate, field_notes: string[], assumptions: string[] }.`,
      ),
  }),
];
