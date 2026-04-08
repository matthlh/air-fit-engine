"""
CLI runner for the fit analysis pipeline.

Usage:
    python scripts/run_batch.py figma.com
    python scripts/run_batch.py figma.com notion.so canva.com
"""

import asyncio
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.pipeline import run_pipeline
from app.utils.logger import get_logger

logger = get_logger("run_batch")


async def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: python scripts/run_batch.py <domain> [domain2 ...]", file=sys.stderr)
        sys.exit(1)

    domains = sys.argv[1:]
    results = []
    for domain in domains:
        logger.info(f"--- {domain} ---")
        try:
            result = await run_pipeline(domain)
            results.append(result)
        except Exception as exc:
            logger.error(f"Failed on {domain}: {exc}")
            results.append({"domain": domain, "error": str(exc)})

    output = results[0] if len(results) == 1 else results
    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    asyncio.run(main())
