# CLAUDE.md

Read `PRD.md` and `AGENTS.md` before making changes.

## Project

Air-Fit Signal Engine

## Goal

Build a small internal GTM tool that:

- takes company domains
- scrapes homepage and careers pages
- extracts creative-ops signals
- scores account fit for Air
- generates a short explainable summary
- stores and exposes results through a simple FastAPI app

## Stack

- Python 3.11+
- FastAPI
- Playwright
- BeautifulSoup4
- Pydantic
- SQLite
- Anthropic API
- Pandas
- Pytest

## Rules

- Keep the MVP simple and end-to-end.
- Prefer small, readable functions.
- Do not add major frameworks without approval.
- Do not implement auth, deployment, or Salesforce in the MVP.
- Keep API routes in `app/api`.
- Keep scraping logic in `app/scrape`.
- Keep LLM logic in `app/llm`.
- Keep orchestration in `app/services`.

## Coding preferences

- Use typed Python where reasonable.
- Validate Claude outputs with Pydantic before use.
- Keep changes scoped to the requested files.
- When unsure, ask before changing architecture.
