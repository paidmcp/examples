import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const ConfigSchema = z.object({
  SEED_PHRASE: z.string().min(20),
  NETWORK_ID: z.string().regex(/^eip155:\d+$/),
  USDT0_ADDRESS: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  RPC_URL: z.string().url(),
  FACILITATOR_URL: z.string().url(),
  PORT: z.coerce.number().default(4022),
  DB_PATH: z.string().default("./persian-translation.db"),
  ANTHROPIC_API_KEY: z.string().min(10)
});

export const config = ConfigSchema.parse(process.env);
