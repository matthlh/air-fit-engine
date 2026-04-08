from urllib.parse import urlparse


def normalize_url(domain: str) -> str:
    """Add https:// if missing and strip trailing slash."""
    domain = domain.strip()
    if not domain.startswith(("http://", "https://")):
        domain = f"https://{domain}"
    return domain.rstrip("/")


def get_base_domain(url: str) -> str:
    """Return the netloc (e.g. 'figma.com') from a full URL."""
    return urlparse(url).netloc
