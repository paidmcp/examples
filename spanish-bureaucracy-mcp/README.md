# spanish-bureaucracy-mcp

Paid MCP for Spanish autonomo and tax paperwork workflows using Anthropic Sonnet.

## Tools

- `interpret_aeat_letter`
- `draft_hacienda_response`
- `find_cnae_code`
- `explain_modelo_130`

## Quickstart

Run inside `examples/spanish-bureaucracy-mcp/`:

```bash
npm install
cp .env.example .env
# set ANTHROPIC_API_KEY in .env
npm run wallet:create
# paste seed into .env as SEED_PHRASE
npm run dev
```

## Commands

Run inside `examples/spanish-bureaucracy-mcp/` after `npm install`.

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

Prompt strategy:

- Public baseline prompt: `src/prompts/spanish-autonomo.md`
- Optional private prompt override: set `SPANISH_PROMPT_PATH` to a non-committed file path.
