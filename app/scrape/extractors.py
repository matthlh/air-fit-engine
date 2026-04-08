from dataclasses import dataclass
from typing import Optional
from urllib.parse import urljoin

from bs4 import BeautifulSoup

from app.utils.text_cleaning import clean_text, truncate


@dataclass
class PageLink:
    href: str
    text: str


@dataclass
class PageContent:
    url: str
    title: Optional[str]
    meta_description: Optional[str]
    headings: list[str]
    links: list[PageLink]
    visible_text: str


def extract_page_content(html: str, url: str) -> PageContent:
    soup = BeautifulSoup(html, "html.parser")

    # Strip non-visible tags before extracting text
    for tag in soup(["script", "style", "noscript"]):
        tag.decompose()

    title: Optional[str] = None
    if soup.title and soup.title.string:
        title = soup.title.string.strip()

    meta_description: Optional[str] = None
    meta_tag = soup.find("meta", attrs={"name": "description"})
    if meta_tag and meta_tag.get("content"):
        meta_description = str(meta_tag["content"]).strip()

    headings: list[str] = []
    for tag in soup.find_all(["h1", "h2", "h3"]):
        text = tag.get_text(strip=True)
        if text:
            headings.append(text)

    links: list[PageLink] = []
    for a in soup.find_all("a", href=True):
        href = urljoin(url, str(a["href"]))
        if href.startswith("http"):
            links.append(PageLink(href=href, text=a.get_text(strip=True)))

    visible_text = truncate(clean_text(soup.get_text(separator=" ")))

    return PageContent(
        url=url,
        title=title,
        meta_description=meta_description,
        headings=headings,
        links=links,
        visible_text=visible_text,
    )
