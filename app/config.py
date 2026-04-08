import os
from dotenv import load_dotenv

load_dotenv()

ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
PLAYWRIGHT_TIMEOUT: int = 20_000  # ms
MAX_TEXT_CHARS: int = 8_000
