# crypto-prices-mcp

Paid MCP for crypto market data with CoinGecko-backed tools.

## Tools

- `get_price`
- `get_price_history`
- `get_token_info`

## Run locally

```bash
npm install
cp .env.example .env
npm run wallet:create
# add seed to .env
npm run dev
```

Endpoints:

- MCP SSE: `GET /sse`
- Paid HTTP tools: `POST /tools/<tool-name>`
- Tool discovery for proxy: `GET /mcp/tools`
