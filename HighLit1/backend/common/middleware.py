import uuid

from django.urls import is_valid_path

SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
    "X-Frame-Options": "DENY",
}


class ApiTrailingSlashMiddleware:
    """Make `/api/...` collection roots resolve with or without a trailing
    slash, for every HTTP method.

    DRF + `APPEND_SLASH=False` means a route registered as `posts/` only
    matches `/api/v1/posts/`, but every client calls `/api/v1/posts`. Rather
    than redirect (which APPEND_SLASH can't do for POST bodies), we rewrite the
    path internally — only when the slash-less form doesn't resolve but the
    slashed form does, so slash-less sub-routes are left untouched.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        path = request.path_info
        if (
            path.startswith("/api/")
            and not path.endswith("/")
            and not is_valid_path(path)
            and is_valid_path(path + "/")
        ):
            request.path_info = path + "/"
            request.path = request.path + "/"
        return self.get_response(request)


class RequestContextMiddleware:
    """Assigns a request id (for tracing/log correlation) and applies a
    baseline set of security headers to every response."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request_id = request.headers.get("X-Request-ID") or uuid.uuid4().hex
        request.request_id = request_id

        response = self.get_response(request)

        response["X-Request-ID"] = request_id
        for header, value in SECURITY_HEADERS.items():
            response.setdefault(header, value)
        return response
