import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { config } from "./config.js";

mkdirSync(dirname(config.DB_PATH), { recursive: true });
const db = new Database(config.DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS calls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tool_name TEXT NOT NULL,
    payer_address TEXT,
    amount_usdt REAL,
    tx_hash TEXT,
    timestamp INTEGER NOT NULL,
    success INTEGER NOT NULL,
    error_message TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_tool_name ON calls(tool_name);
  CREATE INDEX IF NOT EXISTS idx_timestamp ON calls(timestamp);
`);

function ensureColumn(name: string, definition: string): void {
  const columns = db
    .prepare("SELECT name FROM pragma_table_info('calls') WHERE name = ?")
    .all(name) as Array<{ name: string }>;
  if (columns.length === 0) {
    db.exec(`ALTER TABLE calls ADD COLUMN ${name} ${definition}`);
  }
}

ensureColumn("network", "TEXT");
ensureColumn("asset", "TEXT");
ensureColumn("facilitator", "TEXT");

export function logCall(entry: {
  toolName: string;
  payerAddress?: string;
  amountUsdt?: number;
  txHash?: string;
  network?: string;
  asset?: string;
  facilitator?: string;
  success: boolean;
  errorMessage?: string;
}): void {
  db.prepare(
    `INSERT INTO calls (
      tool_name, payer_address, amount_usdt, tx_hash, network, asset, facilitator, timestamp, success, error_message
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    entry.toolName,
    entry.payerAddress ?? null,
    entry.amountUsdt ?? null,
    entry.txHash ?? null,
    entry.network ?? null,
    entry.asset ?? null,
    entry.facilitator ?? null,
    Date.now(),
    entry.success ? 1 : 0,
    entry.errorMessage ?? null
  );
}
