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
npm run setup
npm run dev
```

## Commands

Run inside `examples/crypto-prices-mcp/` after `npm install`.

| Command                      | Role            | What it does                                                           |
| ---------------------------- | --------------- | ---------------------------------------------------------------------- |
| `npm run setup`              | Server operator | Creates `.env` with generated `SEED_PHRASE` and testnet mode defaults. |
| `npm run wallet:create`      | Server receiver | Prints a replacement seed phrase.                                      |
| `npm run wallet:info`        | Server receiver | Shows receiver address plus Base USDC and Plasma USDT0 balances.       |
| `npm run calls:recent`       | Server operator | Shows the latest paid calls from SQLite.                               |
| `npm run dev`                | Server operator | Starts the server locally.                                             |
| `npm run build && npm start` | Server operator | Runs compiled server code.                                             |

## Two wallets to keep separate

- **Receiver wallet (server):** created by `npm run setup` or `npm run wallet:create`, stored in this project's `.env` (`SEED_PHRASE`).
- **Payer wallet (client):** created in `client/` with `npm run init`, stored in `~/.paidmcp/config.json`.

Fund the payer wallet to test paid calls. Do not fund the receiver wallet manually for normal flow.

## Facilitator configuration

- **Base (USDC):** `BASE_FACILITATOR_URL` (default is Coinbase CDP).
- **Plasma (USDT0):** `PLASMA_FACILITATOR_URL` (default is Semantic).
- Set either URL to `""` to disable that network.
- If Base uses Coinbase CDP, set `CDP_API_KEY_ID` and `CDP_API_KEY_SECRET`.

## Endpoints

- Native MCP endpoint: `/mcp`
- Discovery endpoint: `/mcp/tools`

## Connect

- Native mode: add `http://localhost:4021/mcp` to your MCP client
- Managed wallet mode: `npx paidmcp-client run http://localhost:4021`
