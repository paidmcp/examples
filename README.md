# paidmcp/examples

Three flagship paid MCP servers built as independent deployable projects.

## Projects

- `crypto-prices-mcp` - CoinGecko-backed pricing/data tools
- `persian-translation-mcp` - Persian translation and idiom tools (Claude Haiku)
- `spanish-bureaucracy-mcp` - Spanish tax/bureaucracy assistant tools (Claude Sonnet)

Each directory is a standalone TypeScript project with its own `package.json`, `.env.example`, wallet scripts, and paid x402 routes.

## Run any example

```bash
cd <example-name>
npm install
cp .env.example .env
npm run wallet:create
# paste seed into .env as SEED_PHRASE
npm run dev
```

For LLM examples, set `ANTHROPIC_API_KEY` in `.env` first.

## Commands available in each example

Run inside each example directory after `npm install`.

| Command | Role | What it does |
|---------|------|--------------|
| `npm run wallet:create` | Server receiver | Prints a seed phrase to store in that example's `.env`. |
| `npm run wallet:info` | Server receiver | Shows receiver address and token balances. |
| `npm run calls:recent` | Server operator | Shows recent paid calls from SQLite. |
| `npm run dev` | Server operator | Starts local server for that example. |

## Two-wallet model

- **Receiver wallet (example server):** generated with `npm run wallet:create` in each example.
- **Payer wallet (client app):** generated in `client/` with `npm run init`.

See [REAL_PAYMENT_TEST_PATH.md](../REAL_PAYMENT_TEST_PATH.md) for an end-to-end local payment runbook.
