from app.db import upsert_result
from app.services.pipeline import run_pipeline
from app.utils.logger import get_logger

logger = get_logger(__name__)


async def run_batch(domains: list[str]) -> list[dict]:
    """Run the pipeline for each domain, store results, return all."""
    results = []
    for domain in domains:
        domain = domain.strip()
        if not domain:
            continue
        logger.info(f"Processing {domain}")
        try:
            result = await run_pipeline(domain)
            upsert_result(result)
            results.append(result)
        except Exception as exc:
            logger.error(f"Pipeline failed for {domain}: {exc}")
            results.append({"domain": domain, "error": str(exc)})
    return results
