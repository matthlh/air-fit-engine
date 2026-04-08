# Dashboard Spec

## Purpose

Help a GTM user quickly identify which companies are the strongest fit for Air and understand why.

## Main layout

Single-page dashboard with:

- top control bar
- left company sidebar
- main detail panel

## Top bar actions

- search by domain
- filter by score band
- sort results
- add company URL
- add multiple company URLs
- upload CSV
- export CSV

## Sidebar fields

- domain
- fit_score
- confidence
- selected state

## Main panel fields

- domain
- fit_score
- confidence
- persona_guess
- analyzed_at
- reason_summary
- score_breakdown
- signals
- careers_url
- ats_provider
- claude_reasoning
- outreach_angle

## UI priorities

1. Fit score should be the most visually prominent element
2. Reason summary should be immediately visible
3. Score contributors should be easy to scan
4. Company switching should be fast
5. Include loading, empty, and error states
