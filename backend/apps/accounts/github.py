import json
import logging
import re
import urllib.error
import urllib.request

from django.core.cache import cache

logger = logging.getLogger("highlit.github")

GITHUB_API = "https://api.github.com"
HANDLE_RE = re.compile(r"^[A-Za-z0-9-]{1,39}$")
CACHE_TTL_SECONDS = 600  # GitHub's unauthenticated rate limit is low; cache hard.
REQUEST_TIMEOUT = 6
MAX_REPOS = 12


def fetch_public_repos(username: str) -> list[dict]:
    """Return a user's public GitHub repos (name, language, stars, forks, ...).

    Public data only — no credentials are stored or sent. The handle is
    validated against GitHub's character set so the URL host stays pinned to
    api.github.com (SSRF-safe), and results are cached to respect rate limits.
    """
    handle = (username or "").strip().lstrip("@")
    if not handle or not HANDLE_RE.match(handle):
        return []

    cache_key = f"gh_repos:{handle.lower()}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    url = f"{GITHUB_API}/users/{handle}/repos?sort=updated&per_page={MAX_REPOS}"
    request = urllib.request.Request(
        url,
        headers={"Accept": "application/vnd.github+json", "User-Agent": "HighLit"},
    )
    try:
        with urllib.request.urlopen(request, timeout=REQUEST_TIMEOUT) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except (urllib.error.URLError, TimeoutError, ValueError) as exc:
        logger.warning("github_fetch_failed", extra={"handle": handle, "error": str(exc)})
        return []

    if not isinstance(payload, list):
        return []

    repos = [
        {
            "name": repo.get("name"),
            "description": repo.get("description") or "",
            "language": repo.get("language") or "",
            "stars": repo.get("stargazers_count", 0),
            "forks": repo.get("forks_count", 0),
            "url": repo.get("html_url"),
            "updated_at": repo.get("updated_at"),
        }
        for repo in payload
        if isinstance(repo, dict) and not repo.get("private") and not repo.get("fork")
    ]
    cache.set(cache_key, repos, CACHE_TTL_SECONDS)
    return repos
