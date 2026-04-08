import asyncio

from app.config import BATCH_CONCURRENCY
from app.db import upsert_result
from app.services.pipeline import run_pipeline
from app.utils.logger import get_logger

logger = get_logger(__name__)


async def _run_one(domain: str, sem: asyncio.Semaphore) -> dict:
    async with sem:
        logger.info(f"Processing {domain}")
        try:
            result = await run_pipeline(domain)
            upsert_result(result)
            return result
        except Exception as exc:
            logger.error(f"Pipeline failed for {domain}: {exc}")
            return {"domain": domain, "error": str(exc)}


async def run_batch(
    domains: list[str],
    concurrency: int = BATCH_CONCURRENCY,
) -> list[dict]:
    """Run the pipeline for each domain concurrently, store results, return all."""
    clean = [d.strip() for d in domains if d.strip()]
    sem = asyncio.Semaphore(concurrency)
    return list(await asyncio.gather(*(_run_one(d, sem) for d in clean)))
