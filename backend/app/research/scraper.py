import hashlib
import logging
from datetime import datetime, timezone
from typing import List, Dict, Optional, Tuple, Set
from urllib.parse import urljoin, urlparse
import urllib.robotparser

import httpx
from bs4 import BeautifulSoup
import trafilatura

from app.core.config import settings
from app.core.security import validate_url_safety, SecurityValidationError

logger = logging.getLogger(__name__)

# Key page paths to look for during discovery
DISCOVERY_KEYWORDS = {
    "PRICING": ["pricing", "price", "plans", "tier", "subscription", "cost"],
    "ABOUT": ["about", "about-us", "company", "team", "mission", "story"],
    "FEATURES": ["features", "product", "platform", "capabilities", "solutions", "technology"],
    "BLOG": ["blog", "news", "articles", "resources"],
}


class ScrapedPageData:
    def __init__(
        self,
        url: str,
        page_type: str,
        status_code: Optional[int] = None,
        title: Optional[str] = None,
        meta_description: Optional[str] = None,
        headings: Optional[List[str]] = None,
        main_text: Optional[str] = None,
        content_hash: Optional[str] = None,
        char_count: int = 0,
        retrieved_at: Optional[datetime] = None,
        error: Optional[str] = None
    ):
        self.url = url
        self.page_type = page_type
        self.status_code = status_code
        self.title = title or ""
        self.meta_description = meta_description or ""
        self.headings = headings or []
        self.main_text = main_text or ""
        self.content_hash = content_hash or ""
        self.char_count = char_count
        self.retrieved_at = retrieved_at or datetime.now(timezone.utc)
        self.error = error

    def to_dict(self) -> Dict:
        return {
            "url": self.url,
            "page_type": self.page_type,
            "status_code": self.status_code,
            "title": self.title,
            "meta_description": self.meta_description,
            "headings": self.headings,
            "main_text": self.main_text,
            "char_count": self.char_count,
            "retrieved_at": self.retrieved_at.isoformat(),
            "error": self.error
        }


class SafeWebScraper:
    def __init__(self, allow_local_for_test: bool = False):
        self.allow_local = allow_local_for_test or settings.ALLOW_LOCAL_URLS_FOR_TESTING
        self.headers = {
            "User-Agent": settings.USER_AGENT,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.7",
            "DNT": "1",
        }

    async def can_fetch_robots(self, client: httpx.AsyncClient, base_url: str, target_url: str) -> bool:
        """
        Checks robots.txt for permission to scrape the target URL.
        Defaults to allowed if robots.txt is missing or returns 404.
        """
        try:
            parsed = urlparse(base_url)
            robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
            
            is_safe, _ = validate_url_safety(robots_url, allow_local=self.allow_local)
            if not is_safe:
                return False

            resp = await client.get(robots_url, timeout=5.0)
            if resp.status_code == 200:
                parser = urllib.robotparser.RobotFileParser()
                parser.parse(resp.text.splitlines())
                return parser.can_fetch(settings.USER_AGENT, target_url)
            return True
        except Exception:
            # If robots.txt cannot be reached, proceed with conservative standard crawling
            return True

    def classify_page_type(self, url: str) -> str:
        """Categorizes URL based on path indicators."""
        path_lower = urlparse(url).path.lower()
        if path_lower in ("", "/", "/index.html", "/index.php"):
            return "HOMEPAGE"

        for page_type, keywords in DISCOVERY_KEYWORDS.items():
            for kw in keywords:
                if kw in path_lower:
                    return page_type
        return "OTHER"

    def extract_links_to_discover(self, base_url: str, html: str, max_links: int = 5) -> List[Tuple[str, str]]:
        """
        Extracts relevant internal links for key competitor pages (Pricing, About, Features).
        Only stays within the same root domain.
        """
        discovered: List[Tuple[str, str]] = []
        parsed_base = urlparse(base_url)
        base_domain = parsed_base.netloc.lower()

        try:
            soup = BeautifulSoup(html, "html.parser")
            seen_urls: Set[str] = {base_url.rstrip("/")}

            for a_tag in soup.find_all("a", href=True):
                href = a_tag["href"].strip()
                if not href or href.startswith("#") or href.startswith("mailto:") or href.startswith("tel:"):
                    continue

                full_url = urljoin(base_url, href)
                parsed_target = urlparse(full_url)

                # Ensure same domain
                if parsed_target.netloc.lower() != base_domain:
                    continue

                clean_target = f"{parsed_target.scheme}://{parsed_target.netloc}{parsed_target.path}".rstrip("/")

                if clean_target in seen_urls:
                    continue

                page_type = self.classify_page_type(clean_target)
                if page_type in ("PRICING", "FEATURES", "ABOUT", "BLOG"):
                    seen_urls.add(clean_target)
                    discovered.append((clean_target, page_type))
                    if len(discovered) >= max_links:
                        break

        except Exception as e:
            logger.warning(f"Error extracting links from {base_url}: {e}")

        return discovered

    async def fetch_page(self, client: httpx.AsyncClient, url: str, page_type: str = "HOMEPAGE") -> ScrapedPageData:
        """
        Safely fetches and parses a single web page.
        Enforces SSRF validation, size limits, redirect verification, and timeout.
        """
        is_safe, sanitized_url = validate_url_safety(url, allow_local=self.allow_local)
        if not is_safe:
            return ScrapedPageData(
                url=url,
                page_type=page_type,
                error=f"Security check failed: {sanitized_url}"
            )

        try:
            # We follow redirects manually up to 3 hops to validate each redirect URL
            current_url = sanitized_url
            max_redirects = 3
            response = None

            for _ in range(max_redirects + 1):
                resp = await client.get(
                    current_url,
                    headers=self.headers,
                    timeout=settings.SCRAPE_TIMEOUT_SECONDS,
                    follow_redirects=False
                )
                if resp.is_redirect:
                    location = resp.headers.get("Location")
                    if not location:
                        break
                    next_url = urljoin(current_url, location)
                    is_safe_redirect, sanitized_next = validate_url_safety(next_url, allow_local=self.allow_local)
                    if not is_safe_redirect:
                        return ScrapedPageData(
                            url=current_url,
                            page_type=page_type,
                            error=f"Unsafe redirect destination: {sanitized_next}"
                        )
                    current_url = sanitized_next
                else:
                    response = resp
                    break

            if response is None:
                return ScrapedPageData(
                    url=current_url,
                    page_type=page_type,
                    error="Exceeded maximum redirects"
                )

            # Check response status
            if response.status_code >= 400:
                return ScrapedPageData(
                    url=current_url,
                    page_type=page_type,
                    status_code=response.status_code,
                    error=f"HTTP {response.status_code} Error"
                )

            # Enforce content size limit
            content_bytes = response.content
            if len(content_bytes) > settings.MAX_PAGE_SIZE_BYTES:
                return ScrapedPageData(
                    url=current_url,
                    page_type=page_type,
                    status_code=response.status_code,
                    error=f"Page size ({len(content_bytes)} bytes) exceeds maximum allowable limit"
                )

            html_text = response.text
            content_hash = hashlib.sha256(content_bytes).hexdigest()

            # Extract main content via trafilatura
            main_text = trafilatura.extract(
                html_text,
                include_comments=False,
                include_tables=True,
                no_fallback=False
            )

            # Extract metadata and headings via BeautifulSoup
            soup = BeautifulSoup(html_text, "html.parser")

            title = ""
            if soup.title and soup.title.string:
                title = soup.title.string.strip()
            elif soup.find("meta", property="og:title"):
                title = soup.find("meta", property="og:title").get("content", "").strip()

            meta_desc = ""
            desc_tag = soup.find("meta", attrs={"name": "description"}) or soup.find("meta", property="og:description")
            if desc_tag and desc_tag.get("content"):
                meta_desc = desc_tag["content"].strip()

            headings = []
            for h in soup.find_all(["h1", "h2", "h3"]):
                text = h.get_text().strip()
                if text and len(text) < 200 and text not in headings:
                    headings.append(text)
                if len(headings) >= 15:
                    break

            # Fallback for main_text if trafilatura extracted nothing
            if not main_text or len(main_text.strip()) < 50:
                # Remove scripts and styles
                for script in soup(["script", "style", "noscript", "svg"]):
                    script.decompose()
                main_text = " ".join(soup.stripped_strings)

            # Truncate main_text to a sensible max per page for research (e.g. 15,000 chars)
            main_text = main_text[:15000].strip() if main_text else ""

            return ScrapedPageData(
                url=current_url,
                page_type=page_type,
                status_code=response.status_code,
                title=title,
                meta_description=meta_desc,
                headings=headings,
                main_text=main_text,
                content_hash=content_hash,
                char_count=len(main_text),
                retrieved_at=datetime.now(timezone.utc)
            )

        except httpx.TimeoutException:
            return ScrapedPageData(url=url, page_type=page_type, error="Request timed out")
        except httpx.RequestError as e:
            return ScrapedPageData(url=url, page_type=page_type, error=f"Connection error: {str(e)}")
        except Exception as e:
            return ScrapedPageData(url=url, page_type=page_type, error=f"Extraction failure: {str(e)}")

    async def scrape_competitor(self, base_url: str, max_pages: int = 5) -> List[ScrapedPageData]:
        """
        Crawls competitor website starting from homepage, then discovers and fetches
        useful sub-pages (About, Features, Pricing).
        """
        results: List[ScrapedPageData] = []
        limits = httpx.Limits(max_keepalive_connections=5, max_connections=10)

        async with httpx.AsyncClient(limits=limits, timeout=settings.SCRAPE_TIMEOUT_SECONDS) as client:
            # 1. Fetch homepage
            home_data = await self.fetch_page(client, base_url, page_type="HOMEPAGE")
            results.append(home_data)

            if home_data.error or not home_data.main_text:
                return results

            # 2. Discover relevant subpages from homepage HTML or heuristics
            discovered = self.extract_links_to_discover(home_data.url, home_data.main_text, max_links=max_pages - 1)

            # If discovery from text didn't find specific key pages, add common target paths
            existing_types = {d[1] for d in discovered}
            parsed = urlparse(base_url)
            common_candidates = [
                (urljoin(base_url, "/pricing"), "PRICING"),
                (urljoin(base_url, "/features"), "FEATURES"),
                (urljoin(base_url, "/about"), "ABOUT"),
            ]
            for candidate_url, ptype in common_candidates:
                if len(discovered) >= max_pages - 1:
                    break
                if ptype not in existing_types and candidate_url != base_url:
                    discovered.append((candidate_url, ptype))
                    existing_types.add(ptype)

            # 3. Fetch discovered subpages
            for url, page_type in discovered:
                if len(results) >= max_pages:
                    break
                subpage_data = await self.fetch_page(client, url, page_type=page_type)
                # Keep successful pages or pages that returned status codes
                if subpage_data.main_text and len(subpage_data.main_text) > 100:
                    results.append(subpage_data)

        return results
