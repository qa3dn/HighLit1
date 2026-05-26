from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import User
from common.permissions import is_admin
from .models import CodeStorage, DevNote, Idea, SavedItem
from .serializers import CodeStorageSerializer, DevNoteSerializer, IdeaSerializer, SavedItemSerializer

SHAREABLE_VISIBILITY = ("PUBLIC", "SHARED")


class MyRoomView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(
            {
                "code_storage": CodeStorageSerializer(CodeStorage.objects.filter(user=request.user), many=True).data,
                "dev_notes": DevNoteSerializer(DevNote.objects.filter(user=request.user), many=True).data,
                "ideas": IdeaSerializer(Idea.objects.filter(user=request.user), many=True).data,
                "saved_items": SavedItemSerializer(SavedItem.objects.filter(user=request.user), many=True).data,
            }
        )


class UserRoomView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, user_id):
        user = get_object_or_404(User, pk=user_id)
        return Response(
            {
                "code_storage": CodeStorageSerializer(
                    CodeStorage.objects.filter(user=user, visibility__in=SHAREABLE_VISIBILITY), many=True
                ).data,
                "dev_notes": [],  # dev notes are always private
                "ideas": IdeaSerializer(Idea.objects.filter(user=user), many=True).data,
                "saved_items": [],  # saved items are always private
            }
        )


class CodeStorageListCreateView(generics.ListCreateAPIView):
    serializer_class = CodeStorageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user_id = self.request.query_params.get("userId")
        # Viewing someone else's storage only ever exposes shareable items;
        # private snippets are visible solely to their owner (or an admin).
        if user_id and str(user_id) != str(self.request.user.id) and not is_admin(self.request.user):
            return CodeStorage.objects.filter(
                user_id=user_id, visibility__in=SHAREABLE_VISIBILITY
            ).order_by("-created_at")
        owner_id = user_id or self.request.user.id
        return CodeStorage.objects.filter(user_id=owner_id).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CodeStorageDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CodeStorageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if is_admin(user):
            return CodeStorage.objects.all()
        # Reads: own items + anyone's shareable items. Writes: own items only.
        if self.request.method in permissions.SAFE_METHODS:
            return CodeStorage.objects.filter(Q(user=user) | Q(visibility__in=SHAREABLE_VISIBILITY))
        return CodeStorage.objects.filter(user=user)


class DevNoteListCreateView(generics.ListCreateAPIView):
    serializer_class = DevNoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return DevNote.objects.filter(user=self.request.user).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class DevNoteDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = DevNoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Dev notes are strictly private — scope every operation to the owner.
        if is_admin(self.request.user):
            return DevNote.objects.all()
        return DevNote.objects.filter(user=self.request.user)


class IdeaListCreateView(generics.ListCreateAPIView):
    serializer_class = IdeaSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        user_id = self.request.query_params.get("userId")
        return Idea.objects.filter(user_id=user_id).order_by("-created_at") if user_id else Idea.objects.none()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class IdeaDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = IdeaSerializer

    def get_permissions(self):
        if self.request.method in ("PATCH", "DELETE", "PUT"):
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        # Ideas are publicly readable, but only the owner (or an admin) may
        # mutate them — scope writes to the owner to prevent cross-user edits.
        if self.request.method in permissions.SAFE_METHODS:
            return Idea.objects.all()
        if is_admin(self.request.user):
            return Idea.objects.all()
        return Idea.objects.filter(user=self.request.user)


class SavedItemListCreateView(generics.ListCreateAPIView):
    serializer_class = SavedItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SavedItem.objects.filter(user=self.request.user).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def delete(self, request, *args, **kwargs):
        item_type = request.query_params.get("itemType")
        item_id = request.query_params.get("itemId")
        SavedItem.objects.filter(user=request.user, item_type=item_type, item_id=item_id).delete()
        return Response(status=204)


class StatusUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request):
        request.user.status_text = request.data.get("status_text", "")
        request.user.save(update_fields=["status_text"])
        return Response({"status_text": request.user.status_text})
