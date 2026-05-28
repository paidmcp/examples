# persian-translation-mcp

Paid MCP for Persian translation and idiom explanation using Anthropic Haiku.

## Tools

- `translate_to_persian`
- `translate_from_persian`
- `explain_persian_idiom`

## Run locally

```bash
npm install
cp .env.example .env
# set ANTHROPIC_API_KEY in .env
npm run wallet:create
# add seed to .env
npm run dev
```

Prompt source: `src/prompts/persian.md`
