from app.scrape.extractors import extract_page_content
from app.scrape.careers import find_careers_url

SAMPLE_HTML = """
<html>
  <head>
    <title>Acme Corp — Creative Tools</title>
    <meta name="description" content="We make tools for creative teams.">
  </head>
  <body>
    <h1>Welcome to Acme</h1>
    <h2>What we do</h2>
    <h3>Our story</h3>
    <p>We build creative ops software for brand and marketing teams.</p>
    <a href="/careers">Join our team</a>
    <a href="https://acme.com/jobs">Open roles</a>
    <a href="https://other.com/page">External link</a>
    <script>console.log("should be excluded")</script>
    <style>.hidden { display: none; }</style>
  </body>
</html>
"""


def test_title():
    content = extract_page_content(SAMPLE_HTML, "https://acme.com")
    assert content.title == "Acme Corp — Creative Tools"


def test_meta_description():
    content = extract_page_content(SAMPLE_HTML, "https://acme.com")
    assert content.meta_description == "We make tools for creative teams."


def test_headings():
    content = extract_page_content(SAMPLE_HTML, "https://acme.com")
    assert content.headings == ["Welcome to Acme", "What we do", "Our story"]


def test_links_resolved():
    content = extract_page_content(SAMPLE_HTML, "https://acme.com")
    hrefs = [l.href for l in content.links]
    assert "https://acme.com/careers" in hrefs
    assert "https://acme.com/jobs" in hrefs
    assert "https://other.com/page" in hrefs


def test_script_and_style_excluded():
    content = extract_page_content(SAMPLE_HTML, "https://acme.com")
    assert "should be excluded" not in content.visible_text
    assert "hidden" not in content.visible_text


def test_find_careers_url_by_href():
    content = extract_page_content(SAMPLE_HTML, "https://acme.com")
    careers = find_careers_url(content.links, "acme.com")
    assert careers is not None
    assert "careers" in careers or "jobs" in careers


def test_find_careers_url_no_match():
    from app.scrape.extractors import PageLink
    links = [PageLink(href="https://acme.com/about", text="About us")]
    assert find_careers_url(links, "acme.com") is None
