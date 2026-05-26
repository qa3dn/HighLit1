import logging

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler

logger = logging.getLogger("highlit.request")


def exception_handler(exc, context):
    """DRF exception handler that never leaks internals.

    - Handled API errors keep DRF's body shape (so existing clients that read
      ``detail``/field errors keep working) but gain a ``request_id``.
    - Unhandled exceptions are logged server-side with full context and the
      client receives only a generic envelope — never ``str(exc)`` or a
      traceback.
    """
    response = drf_exception_handler(exc, context)
    request = context.get("request")
    request_id = getattr(request, "request_id", None)

    if response is not None:
        if isinstance(response.data, dict):
            response.data.setdefault("request_id", request_id)
        return response

    logger.exception(
        "unhandled_exception",
        extra={
            "request_id": request_id,
            "path": getattr(request, "path", None),
            "user_id": getattr(getattr(request, "user", None), "id", None),
        },
    )
    return Response(
        {"error": {"code": "INTERNAL", "message": "Internal server error", "request_id": request_id}},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
