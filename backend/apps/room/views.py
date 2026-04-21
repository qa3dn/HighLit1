from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import User
from .models import CodeStorage, DevNote, Idea, SavedItem
from .serializers import CodeStorageSerializer, DevNoteSerializer, IdeaSerializer, SavedItemSerializer


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
                    CodeStorage.objects.filter(user=user, visibility__in=["PUBLIC", "SHARED"]), many=True
                ).data,
                "dev_notes": [],
                "ideas": IdeaSerializer(Idea.objects.filter(user=user), many=True).data,
                "saved_items": [],
            }
        )


class CodeStorageListCreateView(generics.ListCreateAPIView):
    serializer_class = CodeStorageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user_id = self.request.query_params.get("userId")
        if user_id:
            return CodeStorage.objects.filter(user_id=user_id).order_by("-created_at")
        return CodeStorage.objects.filter(user=self.request.user).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CodeStorageDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CodeStorage.objects.all()
    serializer_class = CodeStorageSerializer
    permission_classes = [permissions.IsAuthenticated]


class DevNoteListCreateView(generics.ListCreateAPIView):
    serializer_class = DevNoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return DevNote.objects.filter(user=self.request.user).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class DevNoteDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = DevNote.objects.all()
    serializer_class = DevNoteSerializer
    permission_classes = [permissions.IsAuthenticated]


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
    queryset = Idea.objects.all()
    serializer_class = IdeaSerializer

    def get_permissions(self):
        if self.request.method in ("PATCH", "DELETE", "PUT"):
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]


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
