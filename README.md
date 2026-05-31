# paidmcp/examples

Three flagship paid MCP servers built as independent deployable projects.

## Projects

- `crypto-prices-mcp` - CoinGecko-backed pricing/data tools
- `persian-translation-mcp` - Persian translation and idiom tools (Claude Haiku)
- `spanish-bureaucracy-mcp` - Spanish tax/bureaucracy assistant tools (Claude Sonnet)

Each directory is a standalone native MCP + x402 server with:
- Streamable HTTP MCP endpoint at `/mcp`
- testnet-first defaults (`NETWORK_MODE=test`)
- free-trial calls before paid settlement

## Run any example

```bash
cd <example-name>
npm install
npm run setup
npm run dev
```

For LLM examples, set `ANTHROPIC_API_KEY` in `.env` first.

## Commands available in each example

Run inside each example directory after `npm install`.

| Command | What it does |
| --- | --- |
| `npm run setup` | generates receiver wallet and testnet-ready `.env` |
| `npm run wallet:create` | prints a replacement seed phrase |
| `npm run wallet:info` | shows receiver address and balances |
| `npm run calls:recent` | shows recent paid/trial calls from SQLite |
| `npm run dev` | starts native MCP server (`/mcp`) |

## Two-wallet model

- **Receiver wallet (example server):** stored in each example `.env` as `SEED_PHRASE`.
- **Payer wallet (managed client mode):** generated in `client/` with `npm run init`.

## Connect snippets

- Native MCP mode: connect to `https://<your-host>/mcp`
- Managed wallet mode: `npx paidmcp-client run https://<your-host>`

See [REAL_PAYMENT_TEST_PATH.md](../REAL_PAYMENT_TEST_PATH.md) for an end-to-end local payment runbook.

## License

MIT. See `LICENSE`.
