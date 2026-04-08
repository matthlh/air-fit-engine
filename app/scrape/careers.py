from typing import Optional

from app.scrape.extractors import PageLink

_CAREERS_KEYWORDS = [
    "careers",
    "jobs",
    "work-with-us",
    "work with us",
    "join-us",
    "join us",
    "we're hiring",
    "hiring",
    "open-roles",
    "open roles",
    "job openings",
]


def find_careers_url(links: list[PageLink], base_domain: str) -> Optional[str]:
    """
    Search page links for a careers/jobs page.
    Prefers same-domain links; falls back to any link if nothing same-domain matches.
    """
    same_domain = [l for l in links if base_domain in l.href]
    other_domain = [l for l in links if base_domain not in l.href]

    for candidates in (same_domain, other_domain):
        for link in candidates:
            href_lower = link.href.lower()
            text_lower = link.text.lower()
            for keyword in _CAREERS_KEYWORDS:
                if keyword in href_lower or keyword in text_lower:
                    return link.href

    return None
