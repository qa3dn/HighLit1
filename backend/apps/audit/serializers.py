from rest_framework import serializers

from .models import AuditEvent


class AuditEventSerializer(serializers.ModelSerializer):
    actor_username = serializers.CharField(source="actor.username", read_only=True, default=None)

    class Meta:
        model = AuditEvent
        fields = (
            "id",
            "actor",
            "actor_username",
            "action",
            "target_type",
            "target_id",
            "payload",
            "ip",
            "request_id",
            "created_at",
        )
        read_only_fields = fields
