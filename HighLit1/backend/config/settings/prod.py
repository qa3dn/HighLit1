from django.core.exceptions import ImproperlyConfigured

from .base import *  # noqa: F401,F403
from .base import DATABASES, SECRET_KEY

DEBUG = False

# Fail fast on insecure configuration rather than booting a vulnerable server.
if SECRET_KEY in ("", "change-me", "django-insecure"):
    raise ImproperlyConfigured("SECRET_KEY must be set to a strong unique value in production.")
if len(SECRET_KEY) < 32:
    raise ImproperlyConfigured("SECRET_KEY must be at least 32 characters in production.")
if DATABASES["default"]["ENGINE"].endswith("sqlite3"):
    raise ImproperlyConfigured("SQLite is not permitted in production; use PostgreSQL.")

# Swagger / schema are not exposed in production.
SPECTACULAR_SETTINGS = {**globals().get("SPECTACULAR_SETTINGS", {}), "SERVE_INCLUDE_SCHEMA": False}
EXPOSE_API_DOCS = False

# HTTPS / transport hardening.
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_HSTS_SECONDS = 63072000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"
