from django.conf import settings
from django.db import models


class AuditEvent(models.Model):
    """Append-only record of privileged / security-relevant actions.

    Never updated or deleted in normal operation. ``actor`` is SET_NULL so the
    trail survives account deletion.
    """

    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="audit_events",
    )
    action = models.CharField(max_length=80)
    target_type = models.CharField(max_length=40, blank=True, default="")
    target_id = models.CharField(max_length=64, blank=True, default="")
    payload = models.JSONField(default=dict, blank=True)
    ip = models.GenericIPAddressField(null=True, blank=True)
    request_id = models.CharField(max_length=64, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["-created_at"], name="audit_created_idx"),
            models.Index(fields=["action"], name="audit_action_idx"),
            models.Index(fields=["actor"], name="audit_actor_idx"),
        ]

    def __str__(self):
        return f"{self.action} by {self.actor_id} @ {self.created_at:%Y-%m-%d %H:%M}"
