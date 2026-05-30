# crypto-prices-mcp

Paid MCP for crypto market data with CoinGecko-backed tools.

## Tools

- `get_price`
- `get_price_history`
- `get_token_info`

## Quickstart

Run inside `examples/crypto-prices-mcp/`:

```bash
npm install
cp .env.example .env
npm run wallet:create
# paste seed into .env as SEED_PHRASE
npm run dev
```

## Commands

Run inside `examples/crypto-prices-mcp/` after `npm install`.

| Command | Role | What it does |
|---------|------|--------------|
| `npm run wallet:create` | Server receiver | Prints a new seed phrase. Paste it into `.env` as `SEED_PHRASE`. |
| `npm run wallet:info` | Server receiver | Shows receiver address plus Base USDC and Plasma USDT0 balances. |
| `npm run calls:recent` | Server operator | Shows the latest paid calls from SQLite. |
| `npm run dev` | Server operator | Starts the server locally. |
| `npm run build && npm start` | Server operator | Runs compiled server code. |

## Two wallets to keep separate

- **Receiver wallet (server):** created by `npm run wallet:create`, stored in this project's `.env` (`SEED_PHRASE`).
- **Payer wallet (client):** created in `client/` with `npm run init`, stored in `~/.paidmcp/config.json`.

Fund the payer wallet to test paid calls. Do not fund the receiver wallet manually for normal flow.

## Facilitator configuration

- **Base (USDC):** `BASE_FACILITATOR_URL` (default is Coinbase CDP).
- **Plasma (USDT0):** `PLASMA_FACILITATOR_URL` (default is Semantic).
- Set either URL to `""` to disable that network.
- If Base uses Coinbase CDP, set `CDP_API_KEY_ID` and `CDP_API_KEY_SECRET`.

## Endpoints

- Paid HTTP tools: `POST /tools/<tool-name>`
- Tool discovery for proxy: `GET /mcp/tools`
