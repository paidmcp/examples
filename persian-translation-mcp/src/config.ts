import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const evmAddress = z.string().regex(/^0x[a-fA-F0-9]{40}$/, "must be a 0x EVM address");

const ConfigSchema = z.object({
  SEED_PHRASE: z.string().min(20),
  BASE_RPC_URL: z.string().url(),
  PLASMA_RPC_URL: z.string().url(),
  USDC_ADDRESS: evmAddress,
  USDT0_ADDRESS: evmAddress,
  HEURIST_FACILITATOR_URL: z.string().url(),
  SEMANTIC_FACILITATOR_URL: z.string().url(),
  PORT: z.coerce.number().default(4022),
  DB_PATH: z.string().default("./persian-translation.db"),
  ANTHROPIC_API_KEY: z.string().min(10)
});

export const config = ConfigSchema.parse(process.env);

export const BASE_NETWORK = "eip155:8453" as const;
export const PLASMA_NETWORK = "eip155:9745" as const;
