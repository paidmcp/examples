import WalletManagerEvm from "@tetherto/wdk-wallet-evm";
import { config } from "./config.js";

let cachedAccount: Awaited<ReturnType<WalletManagerEvm["getAccount"]>> | null = null;

async function getAccount() {
  if (!cachedAccount) {
    cachedAccount = await new WalletManagerEvm(config.SEED_PHRASE, { provider: config.BASE_RPC_URL }).getAccount();
  }
  return cachedAccount;
}

export async function getReceiverAddress(): Promise<string> {
  return (await getAccount()).getAddress();
}
