# Air-Fit Signal Engine

## Goal
Help identify companies that are likely to have creative-operations pain relevant to Air.

## User
A GTM engineer, sales operator, or SDR reviewing target accounts.

## Input
A CSV containing company domains.

## Output
For each company:
- extracted website signals
- fit score (0-100)
- confidence
- short reason summary
- likely buyer persona

## MVP
- scrape homepage
- attempt to find careers/jobs page
- extract visible text and key metadata
- run LLM-based fit analysis
- calculate a simple score
- save results locally
- expose results through a small API

## Not in MVP
- Salesforce sync
- authentication
- production deployment
- full Clay integration