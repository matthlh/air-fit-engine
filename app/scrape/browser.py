from contextlib import asynccontextmanager

from playwright.async_api import async_playwright

from app.config import PLAYWRIGHT_TIMEOUT
from app.utils.logger import get_logger

logger = get_logger(__name__)

_USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/124.0.0.0 Safari/537.36"
)


class BrowserSession:
    """Wraps an open Playwright browser. Fetches pages sequentially within one session."""

    def __init__(self, browser) -> None:
        self._browser = browser

    async def fetch(self, url: str) -> str:
        logger.info(f"Fetching {url}")
        page = await self._browser.new_page(user_agent=_USER_AGENT)
        try:
            await page.goto(url, timeout=PLAYWRIGHT_TIMEOUT, wait_until="domcontentloaded")
            html = await page.content()
        finally:
            await page.close()
        logger.info(f"Fetched {url} — {len(html):,} chars")
        return html


@asynccontextmanager
async def browser_session():
    """
    Open one browser for the duration of the context block.
    Use this to fetch multiple pages per domain without re-launching the browser.
    """
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        try:
            yield BrowserSession(browser)
        finally:
            await browser.close()


async def fetch_page(url: str) -> str:
    """Fetch a single page. Convenience wrapper — opens and closes its own browser."""
    async with browser_session() as session:
        return await session.fetch(url)
