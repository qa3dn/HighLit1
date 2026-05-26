import logging

from .models import AuditEvent

logger = logging.getLogger("highlit.audit")


def _client_ip(request):
    if request is None:
        return None
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


def record_event(actor, action, *, target_type="", target_id="", payload=None, request=None):
    """Write an audit row. Auditing must never break the main operation, so a
    storage failure is logged (with context) rather than raised."""
    try:
        return AuditEvent.objects.create(
            actor=actor if (actor and getattr(actor, "is_authenticated", False)) else None,
            action=action,
            target_type=target_type,
            target_id=str(target_id),
            payload=payload or {},
            ip=_client_ip(request),
            request_id=getattr(request, "request_id", "") or "",
        )
    except Exception:
        logger.exception("audit_write_failed", extra={"action": action, "target_id": str(target_id)})
        return None
