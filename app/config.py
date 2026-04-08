import os
from dotenv import load_dotenv

load_dotenv()

ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
PLAYWRIGHT_TIMEOUT: int = 20_000  # ms
MAX_TEXT_CHARS: int = 8_000
DEFAULT_CLAUDE_MODEL: str = os.getenv("CLAUDE_MODEL", "claude-haiku-4-5-20251001")
BATCH_CONCURRENCY: int = int(os.getenv("BATCH_CONCURRENCY", "4"))
ALLOWED_ORIGINS: list[str] = os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:4173"
).split(",")
