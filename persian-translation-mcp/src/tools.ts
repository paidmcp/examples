import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "node:fs";
import { z } from "zod";
import { config } from "./config.js";

const systemPrompt = readFileSync(
  new URL("./prompts/persian.md", import.meta.url),
  "utf-8",
);
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
    model: "claude-haiku-4-5-20251001",
    max_tokens: 900,
    system: systemPrompt,
    messages: [{ role: "user", content: prompt }],
  });
  const text = response.content.find((block) => block.type === "text");
  if (!text || text.type !== "text") {
    throw new Error("No text response from model.");
  }
  try {
    return JSON.parse(text.text);
  } catch {
    return { raw: text.text };
  }
}

export const tools: Array<PaidTool<any, any>> = [
  definePaidTool({
    name: "translate_to_persian",
    description: "Translate English to Persian/Farsi with formality control.",
    priceUsdt: 0.005,
    inputSchema: z.object({
      text: z.string(),
      formality: z.enum(["formal", "casual"]).default("formal"),
    }),
    handler: async ({ text, formality }) =>
      askClaude(
        `Translate to ${formality} Persian. Return JSON with fields: translation, notes (optional).\n\nText:\n${text}`,
      ),
  }),
  definePaidTool({
    name: "translate_from_persian",
    description:
      "Translate Persian/Farsi text to English while preserving nuance.",
    priceUsdt: 0.005,
    inputSchema: z.object({
      text: z.string(),
    }),
    handler: async ({ text }) =>
      askClaude(
        `Translate this Persian text to English. Return JSON with fields: translation, notes.\n\nText:\n${text}`,
      ),
  }),
  definePaidTool({
    name: "explain_persian_idiom",
    description: "Explain Persian idioms with literal and cultural meaning.",
    priceUsdt: 0.005,
    inputSchema: z.object({
      phrase: z.string(),
    }),
    handler: async ({ phrase }) =>
      askClaude(
        `Explain this Persian idiom. Return JSON with fields: literal, meaning, english_equivalent, usage_example.\n\nPhrase:\n${phrase}`,
      ),
  }),
];
