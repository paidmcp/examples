# paidmcp/examples

Three flagship paid MCP servers built as independent deployable projects.

## Projects

- `crypto-prices-mcp` - CoinGecko-backed pricing/data tools
- `persian-translation-mcp` - Persian translation and idiom tools (Claude Haiku)
- `spanish-bureaucracy-mcp` - Spanish tax/bureaucracy assistant tools (Claude Sonnet)

Each directory is a standalone TypeScript project with its own:

- `package.json`
- `.env.example`
- wallet scripts
- paid x402 routes + MCP SSE endpoint

## Run any example

```bash
cd <example-name>
npm install
cp .env.example .env
npm run wallet:create
# paste seed into .env
npm run dev
```

For LLM examples, set `ANTHROPIC_API_KEY` in `.env` first.
