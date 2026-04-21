from django.shortcuts import get_object_or_404
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.posts.models import Post


class AdminOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == "ADMIN")


class ModerationQueueView(APIView):
    permission_classes = [AdminOnly]

    def get(self, request):
        data = Post.objects.order_by("-created_at").values("id", "title", "type", "created_at")[:100]
        return Response(list(data))


class ApprovePostView(APIView):
    permission_classes = [AdminOnly]

    def post(self, request, post_id):
        post = get_object_or_404(Post, pk=post_id)
        post.roast_mode = False
        post.save(update_fields=["roast_mode"])
        return Response({"post_id": post.id, "status": "approved"})


class RejectPostView(APIView):
    permission_classes = [AdminOnly]

    def post(self, request, post_id):
        post = get_object_or_404(Post, pk=post_id)
        post.roast_mode = True
        post.save(update_fields=["roast_mode"])
        return Response({"post_id": post.id, "status": "rejected"})
