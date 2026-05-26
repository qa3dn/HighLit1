from rest_framework import generics

from common.pagination import DefaultPagination
from common.permissions import IsAdmin
from .models import AuditEvent
from .serializers import AuditEventSerializer


class AuditEventListView(generics.ListAPIView):
    serializer_class = AuditEventSerializer
    permission_classes = [IsAdmin]
    pagination_class = DefaultPagination

    def get_queryset(self):
        qs = AuditEvent.objects.select_related("actor").all()
        action = self.request.query_params.get("action")
        actor_id = self.request.query_params.get("actor")
        if action:
            qs = qs.filter(action__icontains=action)
        if actor_id:
            qs = qs.filter(actor_id=actor_id)
        return qs
