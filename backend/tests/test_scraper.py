import pytest
from app.research.scraper import SafeWebScraper, ScrapedPageData


def test_classify_page_types():
    scraper = SafeWebScraper()
    assert scraper.classify_page_type("https://example.com") == "HOMEPAGE"
    assert scraper.classify_page_type("https://example.com/") == "HOMEPAGE"
    assert scraper.classify_page_type("https://example.com/pricing") == "PRICING"
    assert scraper.classify_page_type("https://example.com/plans-and-pricing") == "PRICING"
    assert scraper.classify_page_type("https://example.com/about-us") == "ABOUT"
    assert scraper.classify_page_type("https://example.com/features") == "FEATURES"
    assert scraper.classify_page_type("https://example.com/blog/article-1") == "BLOG"
    assert scraper.classify_page_type("https://example.com/contact") == "OTHER"


def test_extract_internal_links():
    scraper = SafeWebScraper()
    base_url = "https://saas-example.com"
    sample_html = """
    <html>
      <body>
        <nav>
          <a href="/pricing">View Plans</a>
          <a href="/features">Product Features</a>
          <a href="/about">About Us</a>
          <a href="https://external-ad.com">External Link</a>
          <a href="#anchor">Skip to content</a>
          <a href="mailto:support@saas-example.com">Email Us</a>
        </nav>
      </body>
    </html>
    """
    links = scraper.extract_links_to_discover(base_url, sample_html)
    extracted_urls = [url for url, ptype in links]

    assert "https://saas-example.com/pricing" in extracted_urls
    assert "https://saas-example.com/features" in extracted_urls
    assert "https://saas-example.com/about" in extracted_urls
    # External link should not be crawled
    assert "https://external-ad.com" not in extracted_urls


def test_scraped_page_data_serialization():
    data = ScrapedPageData(
        url="https://example.com/pricing",
        page_type="PRICING",
        status_code=200,
        title="Sample Pricing",
        meta_description="Tiered plans starting at $10",
        headings=["Starter Plan", "Pro Plan"],
        main_text="Full pricing disclosure content here.",
        char_count=35
    )
    d = data.to_dict()
    assert d["url"] == "https://example.com/pricing"
    assert d["page_type"] == "PRICING"
    assert len(d["headings"]) == 2
    assert d["char_count"] == 35
