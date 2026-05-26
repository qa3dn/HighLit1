from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.code_projects.models import CodeProject
from apps.code_projects.serializers import CodeProjectListSerializer
from apps.posts.models import Post, Reaction
from apps.posts.serializers import PostSerializer
from apps.posts.views import annotate_engagement
from apps.room.models import CodeStorage, Idea
from apps.room.serializers import CodeStorageSerializer, IdeaSerializer
from common.permissions import is_admin
from .github import fetch_public_repos
from .serializers import PublicProfileSerializer

User = get_user_model()

PUBLIC_POSTS_LIMIT = 10
PUBLIC_CODE_LIMIT = 12
PUBLIC_IDEAS_LIMIT = 12
SHAREABLE_VISIBILITY = ("PUBLIC", "SHARED")


class PublicProfileView(APIView):
    """One-call public profile. Privacy is enforced here, server-side: hidden
    sections are never serialized into the response (not just hidden in the UI)."""

    permission_classes = [permissions.AllowAny]

    def get(self, request, user_id):
        user = get_object_or_404(User, pk=user_id, is_active=True)
        viewer = request.user
        is_owner = bool(viewer.is_authenticated and viewer.id == user.id)
        privileged = is_owner or is_admin(viewer)

        if user.profile_visibility == User.Visibility.PRIVATE and not privileged:
            return Response(
                {
                    "id": user.id,
                    "username": user.username,
                    "avatar_url": user.avatar_url,
                    "is_private": True,
                    "is_owner": False,
                }
            )

        can = lambda flag: privileged or getattr(user, flag)  # noqa: E731

        posts = []
        if can("show_posts"):
            qs = annotate_engagement(
                Post.objects.select_related("user").filter(user=user, is_anonymous=False)
            ).order_by("-created_at")[:PUBLIC_POSTS_LIMIT]
            posts = PostSerializer(qs, many=True, context={"request": request}).data

        code = []
        projects = []
        if can("show_code"):
            qs = CodeStorage.objects.filter(
                user=user, visibility__in=SHAREABLE_VISIBILITY
            ).order_by("-created_at")[:PUBLIC_CODE_LIMIT]
            code = CodeStorageSerializer(qs, many=True).data
            project_qs = (
                CodeProject.objects.select_related("owner")
                .filter(owner=user, visibility=CodeProject.Visibility.PUBLIC)
                .order_by("-updated_at")[:PUBLIC_CODE_LIMIT]
            )
            projects = CodeProjectListSerializer(project_qs, many=True).data

        ideas = []
        if can("show_ideas"):
            qs = Idea.objects.filter(user=user).order_by("-created_at")[:PUBLIC_IDEAS_LIMIT]
            ideas = IdeaSerializer(qs, many=True).data

        github_repos = []
        if can("show_code") and user.github_username:
            github_repos = fetch_public_repos(user.github_username)

        activity = None
        if can("show_activity"):
            activity = {
                "posts": Post.objects.filter(user=user, is_anonymous=False).count(),
                "code": CodeStorage.objects.filter(
                    user=user, visibility__in=SHAREABLE_VISIBILITY
                ).count(),
                "ideas": Idea.objects.filter(user=user).count(),
                "reactions_received": Reaction.objects.filter(post__user=user).count(),
            }

        return Response(
            {
                "profile": PublicProfileSerializer(user).data,
                "is_private": False,
                "is_owner": is_owner,
                "visibility": {
                    "profile_visibility": user.profile_visibility,
                    "show_posts": user.show_posts,
                    "show_code": user.show_code,
                    "show_ideas": user.show_ideas,
                    "show_activity": user.show_activity,
                },
                "activity": activity,
                "posts": posts,
                "code": code,
                "projects": projects,
                "ideas": ideas,
                "github_repos": github_repos,
            }
        )


class GithubReposView(APIView):
    """Public GitHub repos for a handle (used by the Code Repository section)."""

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        username = request.query_params.get("username", "")
        return Response({"repos": fetch_public_repos(username)})
