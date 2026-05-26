from django.contrib.auth import get_user_model
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.audit.models import AuditEvent
from apps.audit.serializers import AuditEventSerializer
from apps.audit.services import record_event
from apps.companies.models import Company
from apps.posts.models import Comment, Job, Post, Reaction
from apps.posts.serializers import JobSerializer
from apps.student_projects.models import StudentProject
from common.permissions import IsAdmin

from .serializers import AdminCommentSerializer, AdminPostSerializer

User = get_user_model()

ADMIN_PAGE_SIZE = 20
ADMIN_MAX_PAGE_SIZE = 100


def _paginate(request, queryset):
    """Offset pagination shared by the admin content lists."""
    try:
        page = max(1, int(request.query_params.get("page", 1)))
    except (TypeError, ValueError):
        page = 1
    try:
        limit = int(request.query_params.get("limit", ADMIN_PAGE_SIZE))
    except (TypeError, ValueError):
        limit = ADMIN_PAGE_SIZE
    limit = max(1, min(limit, ADMIN_MAX_PAGE_SIZE))
    total = queryset.count()
    offset = (page - 1) * limit
    items = list(queryset[offset : offset + limit])
    return items, {"total": total, "page": page, "limit": limit, "has_more": offset + limit < total}


def _hidden_filter(value):
    """Translate the ?hidden= query param into a filter kwarg (or None=all)."""
    if value in ("true", "false"):
        return {"is_hidden": value == "true"}
    return None


class ModerationOverviewView(APIView):
    """Single-call snapshot for the admin dashboard home (one screen → one call)."""

    permission_classes = [IsAdmin]

    def get(self, request):
        projects_by_status = {
            row["status"]: row["count"]
            for row in StudentProject.objects.values("status").order_by().annotate(count=Count("id"))
        }
        return Response(
            {
                "users": {
                    "total": User.objects.count(),
                    "banned": User.objects.filter(is_active=False).count(),
                    "admins": User.objects.filter(role=User.Role.ADMIN).count(),
                    "companies": User.objects.filter(role=User.Role.COMPANY).count(),
                },
                "content": {
                    "posts": Post.objects.count(),
                    "comments": Comment.objects.count(),
                    "reactions": Reaction.objects.count(),
                },
                "projects": {
                    "published": projects_by_status.get(StudentProject.Status.PUBLISHED, 0),
                    "hidden": projects_by_status.get(StudentProject.Status.HIDDEN, 0),
                    "rejected": projects_by_status.get(StudentProject.Status.REJECTED, 0),
                },
                "companies": {
                    "total": Company.objects.count(),
                    "verified": Company.objects.filter(is_verified=True).count(),
                    "jobs": Job.objects.count(),
                },
                "recent_activity": AuditEventSerializer(
                    AuditEvent.objects.select_related("actor")[:10], many=True
                ).data,
            }
        )


class ModerationQueueView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        data = Post.objects.order_by("-created_at").values("id", "title", "type", "created_at")[:100]
        return Response(list(data))


class ApprovePostView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, post_id):
        post = get_object_or_404(Post, pk=post_id)
        post.roast_mode = False
        post.save(update_fields=["roast_mode"])
        record_event(request.user, "post.approved", target_type="post", target_id=str(post.id), request=request)
        return Response({"post_id": post.id, "status": "approved"})


class RejectPostView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, post_id):
        post = get_object_or_404(Post, pk=post_id)
        post.roast_mode = True
        post.save(update_fields=["roast_mode"])
        record_event(request.user, "post.rejected", target_type="post", target_id=str(post.id), request=request)
        return Response({"post_id": post.id, "status": "rejected"})


class AdminPostListView(APIView):
    """Full post list for moderators: search, filter, ordering, pagination.
    Admins see everything, including hidden posts and the real author of
    anonymous posts."""

    permission_classes = [IsAdmin]

    def get(self, request):
        q = request.query_params.get("q", "").strip()
        post_type = request.query_params.get("type", "").strip()
        ordering = request.query_params.get("ordering", "recent")

        queryset = Post.objects.select_related("user").annotate(
            reaction_count=Count("reactions", distinct=True),
            comment_count=Count("comments", distinct=True),
        )
        if q:
            queryset = queryset.filter(
                Q(title__icontains=q) | Q(content__icontains=q) | Q(user__username__icontains=q)
            )
        if post_type:
            queryset = queryset.filter(type=post_type)
        hidden = _hidden_filter(request.query_params.get("hidden"))
        if hidden is not None:
            queryset = queryset.filter(**hidden)
        if ordering == "top":
            queryset = queryset.order_by("-reaction_count", "-comment_count", "-created_at")
        else:
            queryset = queryset.order_by("-created_at")

        items, meta = _paginate(request, queryset)
        return Response({"results": AdminPostSerializer(items, many=True).data, **meta})


class AdminPostDetailView(APIView):
    """PATCH toggles is_hidden (reversible); DELETE removes the post for good."""

    permission_classes = [IsAdmin]

    def patch(self, request, post_id):
        post = get_object_or_404(Post, pk=post_id)
        is_hidden = request.data.get("is_hidden")
        if not isinstance(is_hidden, bool):
            return Response({"detail": "is_hidden (bool) required."}, status=status.HTTP_400_BAD_REQUEST)
        post.is_hidden = is_hidden
        post.save(update_fields=["is_hidden"])
        record_event(
            request.user,
            "post.hidden" if is_hidden else "post.unhidden",
            target_type="post",
            target_id=str(post.id),
            request=request,
        )
        return Response({"id": post.id, "is_hidden": post.is_hidden})

    def delete(self, request, post_id):
        post = get_object_or_404(Post, pk=post_id)
        record_event(
            request.user,
            "post.deleted",
            target_type="post",
            target_id=str(post.id),
            payload={"type": post.type, "author_id": post.user_id},
            request=request,
        )
        post.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminCommentListView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        q = request.query_params.get("q", "").strip()
        post_id = request.query_params.get("post_id")

        queryset = Comment.objects.select_related("user", "post").order_by("-created_at")
        if q:
            queryset = queryset.filter(Q(content__icontains=q) | Q(user__username__icontains=q))
        if post_id:
            queryset = queryset.filter(post_id=post_id)
        hidden = _hidden_filter(request.query_params.get("hidden"))
        if hidden is not None:
            queryset = queryset.filter(**hidden)

        items, meta = _paginate(request, queryset)
        return Response({"results": AdminCommentSerializer(items, many=True).data, **meta})


class AdminCommentDetailView(APIView):
    permission_classes = [IsAdmin]

    def patch(self, request, comment_id):
        comment = get_object_or_404(Comment, pk=comment_id)
        is_hidden = request.data.get("is_hidden")
        if not isinstance(is_hidden, bool):
            return Response({"detail": "is_hidden (bool) required."}, status=status.HTTP_400_BAD_REQUEST)
        comment.is_hidden = is_hidden
        comment.save(update_fields=["is_hidden"])
        record_event(
            request.user,
            "comment.hidden" if is_hidden else "comment.unhidden",
            target_type="comment",
            target_id=str(comment.id),
            request=request,
        )
        return Response({"id": comment.id, "is_hidden": comment.is_hidden})

    def delete(self, request, comment_id):
        comment = get_object_or_404(Comment, pk=comment_id)
        record_event(
            request.user,
            "comment.deleted",
            target_type="comment",
            target_id=str(comment.id),
            payload={"post_id": comment.post_id, "author_id": comment.user_id},
            request=request,
        )
        comment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminJobListView(APIView):
    """All jobs for admin oversight — every status/company, with applicant
    counts. Filter by q, status, type, featured."""

    permission_classes = [IsAdmin]

    def get(self, request):
        q = request.query_params.get("q", "").strip()
        status_param = request.query_params.get("status", "").strip()
        job_type = request.query_params.get("type", "").strip()
        featured = request.query_params.get("featured")

        queryset = Job.objects.select_related("company_profile").annotate(
            application_count=Count("applications", distinct=True)
        )
        if q:
            queryset = queryset.filter(Q(title__icontains=q) | Q(company__icontains=q))
        if status_param:
            queryset = queryset.filter(status=status_param)
        if job_type:
            queryset = queryset.filter(job_type=job_type)
        if featured in ("true", "false"):
            queryset = queryset.filter(is_featured=(featured == "true"))
        queryset = queryset.order_by("-is_featured", "-created_at")

        items, meta = _paginate(request, queryset)
        # Empty viewer_applied_ids short-circuits has_applied (no per-row query).
        data = JobSerializer(
            items, many=True, context={"request": request, "viewer_applied_ids": set()}
        ).data
        return Response({"results": data, **meta})


class AdminJobFeatureView(APIView):
    """Toggle a job's paid-promotion flag (admin-only; not self-serve)."""

    permission_classes = [IsAdmin]

    def post(self, request, job_id):
        job = get_object_or_404(Job, pk=job_id)
        is_featured = request.data.get("is_featured")
        if not isinstance(is_featured, bool):
            return Response({"detail": "is_featured (bool) required."}, status=status.HTTP_400_BAD_REQUEST)
        job.is_featured = is_featured
        job.save(update_fields=["is_featured", "updated_at"])
        record_event(
            request.user,
            "job.featured" if is_featured else "job.unfeatured",
            target_type="job",
            target_id=str(job.id),
            request=request,
        )
        return Response({"id": job.id, "is_featured": job.is_featured})
