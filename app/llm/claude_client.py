import anthropic
from app.config import ANTHROPIC_API_KEY
from app.utils.logger import get_logger

logger = get_logger(__name__)

_client: anthropic.Anthropic | None = None


def _get_client() -> anthropic.Anthropic:
    global _client
    if _client is None:
        if not ANTHROPIC_API_KEY:
            raise RuntimeError("ANTHROPIC_API_KEY is not set. Add it to your .env file.")
        _client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    return _client


def call_claude(
    system: str,
    user: str,
    model: str = "claude-haiku-4-5-20251001",
    max_tokens: int = 1024,
) -> str:
    logger.info(f"Calling Claude ({model})")
    message = _get_client().messages.create(
        model=model,
        max_tokens=max_tokens,
        system=system,
        messages=[{"role": "user", "content": user}],
    )
    return message.content[0].text
