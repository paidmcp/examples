# spanish-bureaucracy-mcp

Paid MCP for Spanish autonomo and tax paperwork workflows using Anthropic Sonnet.

## Tools

- `interpret_aeat_letter`
- `draft_hacienda_response`
- `find_cnae_code`
- `explain_modelo_130`

## Run locally

```bash
npm install
cp .env.example .env
# set ANTHROPIC_API_KEY in .env
npm run wallet:create
# add seed to .env
npm run dev
```

Prompt strategy:

- Public baseline prompt: `src/prompts/spanish-autonomo.md`
- Optional private prompt override: set `SPANISH_PROMPT_PATH` to a non-committed file path.
