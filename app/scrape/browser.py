from playwright.async_api import async_playwright
from app.config import PLAYWRIGHT_TIMEOUT
from app.utils.logger import get_logger

logger = get_logger(__name__)


async def fetch_page(url: str) -> str:
    """Launch a headless browser, load the URL, and return the rendered HTML."""
    logger.info(f"Fetching {url}")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        try:
            page = await browser.new_page(
                user_agent=(
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/124.0.0.0 Safari/537.36"
                )
            )
            await page.goto(url, timeout=PLAYWRIGHT_TIMEOUT, wait_until="domcontentloaded")
            html = await page.content()
        finally:
            await browser.close()
    logger.info(f"Fetched {url} — {len(html):,} chars")
    return html
