# Air-Fit Signal Engine

![Python](https://img.shields.io/badge/Python-3.11%2B-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-backend-009688)
![Playwright](https://img.shields.io/badge/Playwright-scraping-45ba63)
![SQLite](https://img.shields.io/badge/SQLite-local%20storage-003b57)
![Claude](https://img.shields.io/badge/Claude-structured%20analysis-orange)
![Status](https://img.shields.io/badge/Status-backend%20complete-brightgreen)
![License](https://img.shields.io/badge/License-MIT-lightgrey)

Internal GTM prototype for identifying companies likely to have creative-operations pain points relevant to Air. Given company domains, it scrapes public websites and hiring pages, extracts creative-ops signals, computes a deterministic fit score\*, and optionally generates structured reasoning with Claude LLM.

> The fit score is rule-based and deterministic. Claude is used only for structured reasoning, summary generation, and optional outreach angles.

## Table of Contents

- [What it does](#what-it-does)
- [Why this matters](#why-this-matters)
- [Status](#status)
- [Example Output](#example-output)
- [Potential next steps](#potential-next-steps)
- [Stack](#stack)
- [Setup](#setup)
- [Usage](#usage)
- [Testing](#testing)
- [Architecture Overview](#architecture-overview)
- [License](#license)

## What it does

1. Accepts a CSV of company domains
2. Fetches homepage and careers page via headless browser
3. Extracts signals (asset management, review workflows, brand ops, etc.)
4. Computes a deterministic fit score (0–100) from a scoring rubric
5. Optionally calls Claude for a structured explanation and outreach angle
6. Stores results in SQLite and exposes them via a FastAPI backend

## Why this matters

This project simulates a GTM engineering workflow for Air: turning public account signals into structured enrichment, lead scoring, and outbound research that a sales team can actually use.

## Status

- [x] Scraping foundation (Playwright + BeautifulSoup)
- [x] Signal extraction (rule-based, 8 categories)
- [x] Fit scoring (rubric-driven, 0–100)
- [x] Claude structured analysis (Pydantic-validated JSON)
- [x] SQLite storage + FastAPI backend
- [ ] Dashboard / Review UI (in progress)

## Example Output

```json
{
	"domain": "figma.com",
	"fit_score": 78,
	"signals": ["brand operations", "creative workflow", "high content scale"],
	"reason_summary": "Likely strong fit due to creative tooling overlap and workflow complexity.",
	"persona_guess": "Brand Operations / Creative Ops"
}
```

## Potential next steps

- Dashboard review queue with account status and notes
- Batch CSV upload with progress tracking
- Signal transparency view showing score breakdown
- Claude-generated persona guess and outreach angle
- ATS detection and hiring signal enrichment
- Tool-stack detection for stronger Air-fit analysis
- Export formats for CRM / Clay-style workflows
- Scheduled rescans for changing company signals

## Stack

- Python 3.11+
- Playwright — headless browser for JS-rendered pages
- BeautifulSoup4 — HTML parsing
- FastAPI + Uvicorn — REST API
- Anthropic API — structured fit analysis
- Pydantic — output validation
- SQLite — local result storage
- Pandas — CSV export

## Setup

```bash
# Install dependencies
python -m venv .venv
source .venv/bin/activate
pip install -e .
playwright install chromium

# Add your API key
cp .env.example .env
# Edit .env and set ANTHROPIC_API_KEY
```

## Usage

**CLI — analyze one or more domains:**

```bash
python scripts/run_batch.py figma.com
python scripts/run_batch.py figma.com canva.com notion.so
```

**API — start the server:**

```bash
uvicorn app.main:app --reload
```

Then open `http://localhost:8000/docs` for the interactive API.

Key endpoints:

- `POST /analyze/` — `{"domains": ["figma.com", "canva.com"]}`
- `GET /companies/` — list all stored results
- `GET /companies/{domain}` — get one result
- `GET /companies/export/csv` — download results as CSV

## Testing

```bash
pytest
```

### Architecture Overview

```md
- `app/scrape/` — page fetching, parsing, careers-page discovery
- `app/signals/` / scoring logic — signal extraction and deterministic fit scoring
- `app/llm/` — Claude structured reasoning
- `app/api/` — FastAPI routes
- `app/db.py` — SQLite persistence
- `scripts/run_batch.py` — CLI batch runner
```

## License

MIT

```

```
