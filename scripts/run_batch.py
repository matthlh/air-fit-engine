"""
Scrape one or more domains and print structured JSON results.

Usage:
    python scripts/run_batch.py figma.com
    python scripts/run_batch.py figma.com notion.so canva.com
"""

import asyncio
import json
import os
import sys

# Allow running from the project root without an editable install
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.scrape.browser import fetch_page
from app.scrape.careers import find_careers_url
from app.scrape.extractors import extract_page_content
from app.utils.logger import get_logger
from app.utils.url_helpers import get_base_domain, normalize_url

logger = get_logger("run_batch")


async def scrape_domain(domain: str) -> dict:
    url = normalize_url(domain)
    base_domain = get_base_domain(url)

    html = await fetch_page(url)
    homepage = extract_page_content(html, url)

    careers_url = find_careers_url(homepage.links, base_domain)
    careers_out: dict = {}

    if careers_url:
        try:
            careers_html = await fetch_page(careers_url)
            careers = extract_page_content(careers_html, careers_url)
            careers_out = {
                "headings": careers.headings[:10],
                "visible_text_snippet": careers.visible_text[:600],
            }
        except Exception as exc:
            logger.warning(f"Could not fetch careers page {careers_url}: {exc}")

    return {
        "domain": domain,
        "homepage_url": url,
        "careers_url": careers_url,
        "title": homepage.title,
        "meta_description": homepage.meta_description,
        "headings": homepage.headings[:10],
        "visible_text_snippet": homepage.visible_text[:600],
        "careers": careers_out,
    }


async def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: python scripts/run_batch.py <domain> [domain2 ...]", file=sys.stderr)
        sys.exit(1)

    domains = sys.argv[1:]
    results = []
    for domain in domains:
        logger.info(f"--- {domain} ---")
        try:
            result = await scrape_domain(domain)
            results.append(result)
        except Exception as exc:
            logger.error(f"Failed on {domain}: {exc}")
            results.append({"domain": domain, "error": str(exc)})

    output = results[0] if len(results) == 1 else results
    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    asyncio.run(main())
