# Agent Rules

## Project

Air-Fit Signal Engine

## Stack

Python, FastAPI, Playwright, BeautifulSoup, Anthropic API, Pandas.

## Priorities

1. Keep the app working end-to-end.
2. Prefer simple, readable code.
3. Use typed Python where reasonable.
4. Keep changes scoped to the requested files.

## Constraints

- No auth
- No deployment work yet
- No Salesforce integration in MVP
- No major framework additions

## Architecture rules

- API routes go in app/api
- scraping logic goes in app/scrape
- LLM code goes in app/llm
- orchestration goes in app/services

## Prompting rules

- Return structured outputs from Claude
- Avoid hidden assumptions
- Validate model output before using it
