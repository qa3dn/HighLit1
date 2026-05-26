import math

from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from .models import Comment, Job, JobApplication, JobReview, Post, Reaction, Space
from .serializers import (
    CommentSerializer,
    JobApplicantSerializer,
    JobApplicationSerializer,
    JobCreateSerializer,
    JobReviewSerializer,
    JobSerializer,
    PostCreateSerializer,
    PostSerializer,
    SpaceSerializer,
    reaction_totals,
)

ANON_FEED_LIMIT = 5
DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 50
HOT_CANDIDATE_WINDOW = 300


def visible_posts():
    """Posts the public may see — excludes admin-hidden content. Every public
    read path builds on this so a hidden post disappears site-wide."""
    return Post.objects.filter(is_hidden=False)


def annotate_engagement(queryset):
    """Attach reaction/comment counts so the serializer never lazy-loads them."""
    return queryset.annotate(
        reaction_count=Count("reactions", distinct=True),
        comment_count=Count("comments", distinct=True),
    )


def viewer_reactions_map(user, posts):
    """Map post_id -> [reaction types] for the current user, in one query."""
    if not user.is_authenticated or not posts:
        return {}
    rows = Reaction.objects.filter(
        user=user, post_id__in=[p.id for p in posts]
    ).values_list("post_id", "type")
    result: dict[int, list[str]] = {}
    for post_id, reaction_type in rows:
        result.setdefault(post_id, []).append(reaction_type)
    return result


def reaction_totals_map(posts):
    """Map post_id -> [{type, count}] for a page of posts, in one query."""
    if not posts:
        return {}
    rows = (
        Reaction.objects.filter(post_id__in=[p.id for p in posts])
        .values("post_id", "type")
        .annotate(count=Count("id"))
    )
    result: dict[int, list[dict]] = {}
    for row in rows:
        result.setdefault(row["post_id"], []).append({"type": row["type"], "count": row["count"]})
    return result


def post_list_context(request, posts):
    """Shared serializer context for a list/page of posts (no N+1)."""
    return {
        "request": request,
        "viewer_reactions": viewer_reactions_map(request.user, posts),
        "reaction_totals": reaction_totals_map(posts),
    }


def hot_score(reaction_count: int, comment_count: int, created_at) -> float:
    """Time-decayed engagement score. Comments weigh more than reactions
    (discussion > a tap), and freshness decays with a gravity exponent."""
    engagement = reaction_count + 2 * comment_count
    age_hours = max((timezone.now() - created_at).total_seconds() / 3600, 0)
    return (engagement + 1) / math.pow(age_hours + 2, 1.5)


def _clamp_page_size(raw) -> int:
    try:
        size = int(raw)
    except (TypeError, ValueError):
        return DEFAULT_PAGE_SIZE
    return max(1, min(size, MAX_PAGE_SIZE))


class PostFeedView(APIView):
    """Reddit-inspired ranked feed with backend-enforced gating.

    Anonymous callers can never receive more than ``ANON_FEED_LIMIT`` posts no
    matter what query params they send — the cap is applied to the queryset
    itself, so the UI lock cannot be bypassed via the API.
    """

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        sort = request.query_params.get("sort", "hot")
        tag = request.query_params.get("tag")
        search = request.query_params.get("q")
        post_type = request.query_params.get("type", Post.PostType.RANT)

        queryset = visible_posts().select_related("user")
        if post_type:
            queryset = queryset.filter(type=post_type)
        if tag:
            queryset = queryset.filter(tags__contains=[tag])
        if search:
            queryset = queryset.filter(Q(content__icontains=search) | Q(title__icontains=search))

        total = queryset.count()
        is_authenticated = request.user.is_authenticated

        page_size = _clamp_page_size(request.query_params.get("limit"))
        try:
            page = max(1, int(request.query_params.get("page", 1)))
        except (TypeError, ValueError):
            page = 1

        if not is_authenticated:
            posts = list(self._rank(queryset, sort)[:ANON_FEED_LIMIT])
            return Response(
                {
                    "posts": self._serialize(posts, request),
                    "total": total,
                    "page": 1,
                    "limit": ANON_FEED_LIMIT,
                    "has_more": False,
                    "locked": total > ANON_FEED_LIMIT,
                    "remaining_locked": max(total - ANON_FEED_LIMIT, 0),
                    "is_authenticated": False,
                    "sort": sort,
                }
            )

        offset = (page - 1) * page_size
        posts = list(self._rank(queryset, sort)[offset : offset + page_size])
        return Response(
            {
                "posts": self._serialize(posts, request),
                "total": total,
                "page": page,
                "limit": page_size,
                "has_more": offset + page_size < total,
                "locked": False,
                "remaining_locked": 0,
                "is_authenticated": True,
                "sort": sort,
            }
        )

    def _rank(self, queryset, sort):
        annotated = annotate_engagement(queryset)
        if sort == "recent":
            return annotated.order_by("-created_at")
        if sort == "top":
            return annotated.order_by("-reaction_count", "-comment_count", "-created_at")
        # "hot": rank a bounded recency window in Python so the formula stays
        # DB-agnostic; that window is exactly what "hot" cares about anyway.
        window = list(annotated.order_by("-created_at")[:HOT_CANDIDATE_WINDOW])
        window.sort(
            key=lambda p: hot_score(p.reaction_count, p.comment_count, p.created_at),
            reverse=True,
        )
        return window

    def _serialize(self, posts, request):
        return PostSerializer(posts, many=True, context=post_list_context(request, posts)).data


class PostListCreateView(generics.ListCreateAPIView):
    def get_serializer_class(self):
        return PostCreateSerializer if self.request.method == "POST" else PostSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_throttles(self):
        # Spam control: throttle only the write path.
        if self.request.method == "POST":
            self.throttle_scope = "post"
            return [ScopedRateThrottle()]
        return super().get_throttles()

    def get_queryset(self):
        queryset = annotate_engagement(visible_posts().select_related("user")).order_by("-created_at")
        post_type = self.request.query_params.get("type")
        user_id = self.request.query_params.get("user_id")
        if post_type:
            queryset = queryset.filter(type=post_type)
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        # Backend-enforced gate: anonymous callers cannot page past the limit.
        if not self.request.user.is_authenticated:
            return queryset[:ANON_FEED_LIMIT]
        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        if self.request.method == "GET":
            posts = list(self.get_queryset())
            context["viewer_reactions"] = viewer_reactions_map(self.request.user, posts)
            context["reaction_totals"] = reaction_totals_map(posts)
        return context

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        post = serializer.save(user=request.user)
        return Response(PostSerializer(post, context={"request": request}).data, status=201)


class PostDetailView(generics.RetrieveAPIView):
    queryset = annotate_engagement(visible_posts().select_related("user"))
    serializer_class = PostSerializer
    permission_classes = [permissions.AllowAny]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        posts = [self.get_object()]
        context["viewer_reactions"] = viewer_reactions_map(self.request.user, posts)
        context["reaction_totals"] = reaction_totals_map(posts)
        return context


class RantsView(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = annotate_engagement(
            visible_posts().select_related("user").filter(type=Post.PostType.RANT)
        ).order_by("-created_at")
        if not self.request.user.is_authenticated:
            return queryset[:ANON_FEED_LIMIT]
        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        posts = list(self.get_queryset())
        context["viewer_reactions"] = viewer_reactions_map(self.request.user, posts)
        context["reaction_totals"] = reaction_totals_map(posts)
        return context


class TrendingView(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return annotate_engagement(visible_posts().select_related("user")).order_by(
            "-reaction_count", "-comment_count", "-created_at"
        )[:50]


class TagsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        tags: dict[str, int] = {}
        for post in visible_posts().only("tags"):
            for tag in post.tags:
                tags[tag] = tags.get(tag, 0) + 1
        ordered = sorted(tags.items(), key=lambda item: -item[1])
        return Response([{"tag": name, "count": count} for name, count in ordered])


class PostsByTagView(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = annotate_engagement(
            visible_posts().select_related("user").filter(tags__contains=[self.kwargs["tag"]])
        ).order_by("-created_at")
        if not self.request.user.is_authenticated:
            return queryset[:ANON_FEED_LIMIT]
        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        posts = list(self.get_queryset())
        context["viewer_reactions"] = viewer_reactions_map(self.request.user, posts)
        context["reaction_totals"] = reaction_totals_map(posts)
        return context


class PostReactionView(APIView):
    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def post(self, request, pk):
        post = get_object_or_404(Post, pk=pk)
        reaction_type = request.data.get("type", "LIKE")
        existing = Reaction.objects.filter(post=post, user=request.user, type=reaction_type).first()
        if existing:
            existing.delete()
            reacted = False
        else:
            Reaction.objects.get_or_create(post=post, user=request.user, type=reaction_type)
            reacted = True
        return Response(
            {
                "reacted": reacted,
                "totals": reaction_totals(post),
                "reaction_count": post.reactions.count(),
            }
        )

    def get(self, request, pk):
        post = get_object_or_404(Post, pk=pk)
        return Response(reaction_totals(post))


class PostCommentView(APIView):
    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get(self, request, pk):
        post = get_object_or_404(Post, pk=pk)
        queryset = post.comments.filter(is_hidden=False).select_related("user").order_by("-created_at")
        return Response(CommentSerializer(queryset, many=True).data)

    def post(self, request, pk):
        post = get_object_or_404(Post, pk=pk)
        serializer = CommentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(post=post, user=request.user)
        return Response(serializer.data, status=201)


class DailyStatsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response(
            {
                "total_posts": visible_posts().count(),
                "total_comments": Comment.objects.filter(is_hidden=False).count(),
                "total_reactions": Reaction.objects.count(),
            }
        )


class StressView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({"stress_level": "LOW", "score": 20})


class JobListCreateView(generics.ListCreateAPIView):
    """Public listing of PUBLISHED jobs (featured first) + company posting."""

    def get_serializer_class(self):
        return JobCreateSerializer if self.request.method == "POST" else JobSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        queryset = (
            Job.objects.select_related("company_profile")
            .annotate(application_count=Count("applications", distinct=True))
            .filter(status=Job.Status.PUBLISHED)
            # Only surface jobs from approved companies (legacy free-text jobs
            # without a company profile remain visible).
            .filter(Q(company_profile__isnull=True) | Q(company_profile__status="APPROVED"))
        )
        params = self.request.query_params
        job_type = params.get("type")
        location = params.get("location")
        workplace = params.get("workplace")
        experience = params.get("experience")
        search = params.get("q")
        if job_type:
            queryset = queryset.filter(job_type=job_type)
        if location:
            queryset = queryset.filter(location__icontains=location)
        if workplace:
            queryset = queryset.filter(workplace_type=workplace)
        if experience:
            queryset = queryset.filter(experience_level=experience)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(company__icontains=search) | Q(description__icontains=search)
            )
        return queryset.order_by("-is_featured", "-created_at")

    def get_serializer_context(self):
        context = super().get_serializer_context()
        if self.request.method == "GET" and self.request.user.is_authenticated:
            context["viewer_applied_ids"] = set(
                JobApplication.objects.filter(applicant=self.request.user).values_list("job_id", flat=True)
            )
        return context

    def _resolve_company(self, request):
        from apps.companies.models import Company

        memberships = Company.objects.filter(
            Q(owner=request.user) | Q(members__user=request.user)
        ).distinct()
        slug = request.data.get("company_slug")
        if slug:
            return memberships.filter(slug=slug).first()
        return memberships.first()

    def create(self, request, *args, **kwargs):
        from apps.companies.permissions import is_company_manager
        from apps.companies.services import can_post_job

        company = self._resolve_company(request)
        if company is None:
            return Response(
                {"detail": "أنشئ ملف شركة أولاً لنشر وظيفة."}, status=status.HTTP_400_BAD_REQUEST
            )
        if not is_company_manager(request.user, company):
            return Response(
                {"detail": "صلاحيات إدارة الشركة مطلوبة."}, status=status.HTTP_403_FORBIDDEN
            )
        if company.status != "APPROVED":
            return Response(
                {
                    "detail": "شركتك قيد المراجعة من الإدارة. ستتمكّن من نشر الوظائف بعد الموافقة.",
                    "code": "company_not_approved",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        publishing = serializer.validated_data.get("status", Job.Status.PUBLISHED) == Job.Status.PUBLISHED
        if publishing and not can_post_job(company):
            return Response(
                {
                    "detail": "بلغت الحد الأقصى للوظائف النشطة في باقتك. رقِّ باقتك لنشر المزيد.",
                    "code": "job_quota_reached",
                },
                status=status.HTTP_402_PAYMENT_REQUIRED,
            )
        job = serializer.save(created_by=request.user, company_profile=company, company=company.name)
        return Response(
            JobSerializer(job, context={"request": request}).data, status=status.HTTP_201_CREATED
        )


class JobDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Public retrieve (PUBLISHED only) + manager/admin edit & delete."""

    queryset = Job.objects.select_related("company_profile")

    def get_serializer_class(self):
        return JobCreateSerializer if self.request.method in ("PUT", "PATCH") else JobSerializer

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_serializer_context(self):
        return {"request": self.request}

    def _can_manage(self, request, job) -> bool:
        from apps.companies.permissions import is_company_manager
        from common.permissions import is_admin

        user = request.user
        if not user or not user.is_authenticated:
            return False
        if is_admin(user):
            return True
        if job.company_profile and is_company_manager(user, job.company_profile):
            return True
        return job.created_by_id == user.id

    def retrieve(self, request, *args, **kwargs):
        job = self.get_object()
        company_ok = job.company_profile is None or job.company_profile.status == "APPROVED"
        if (job.status != Job.Status.PUBLISHED or not company_ok) and not self._can_manage(request, job):
            from django.http import Http404

            raise Http404
        return Response(JobSerializer(job, context={"request": request}).data)

    def update(self, request, *args, **kwargs):
        from rest_framework.exceptions import PermissionDenied

        job = self.get_object()
        if not self._can_manage(request, job):
            raise PermissionDenied("صلاحيات إدارة الوظيفة مطلوبة.")
        serializer = self.get_serializer(job, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(JobSerializer(job, context={"request": request}).data)

    def destroy(self, request, *args, **kwargs):
        from rest_framework.exceptions import PermissionDenied

        job = self.get_object()
        if not self._can_manage(request, job):
            raise PermissionDenied("صلاحيات إدارة الوظيفة مطلوبة.")
        job.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class MyJobsView(generics.ListAPIView):
    """Jobs for companies the caller manages — all statuses, with applicant counts."""

    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        from apps.companies.models import Company

        managed = Company.objects.filter(
            Q(owner=self.request.user) | Q(members__user=self.request.user)
        ).values_list("id", flat=True)
        return (
            Job.objects.filter(company_profile_id__in=list(managed))
            .select_related("company_profile")
            .annotate(application_count=Count("applications", distinct=True))
            .order_by("-created_at")
        )


class JobApplyView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        from apps.companies.permissions import is_company_manager

        job = get_object_or_404(Job.objects.select_related("company_profile"), pk=pk)
        if job.status != Job.Status.PUBLISHED:
            return Response(
                {"detail": "هذه الوظيفة غير متاحة للتقديم."}, status=status.HTTP_400_BAD_REQUEST
            )
        if job.company_profile and is_company_manager(request.user, job.company_profile):
            return Response(
                {"detail": "لا يمكنك التقديم على وظيفة شركتك."}, status=status.HTTP_400_BAD_REQUEST
            )
        serializer = JobApplicationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        application, created = JobApplication.objects.get_or_create(
            job=job,
            applicant=request.user,
            defaults={
                "cover_letter": serializer.validated_data.get("cover_letter", ""),
                "resume_url": serializer.validated_data.get("resume_url", ""),
            },
        )
        if not created:
            return Response(
                {"detail": "لقد تقدّمت لهذه الوظيفة مسبقاً.", "code": "already_applied"},
                status=status.HTTP_409_CONFLICT,
            )
        return Response(JobApplicationSerializer(application).data, status=status.HTTP_201_CREATED)


class MyApplicationsView(generics.ListAPIView):
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return JobApplication.objects.filter(applicant=self.request.user).select_related(
            "job", "job__company_profile"
        )


class JobApplicantsView(APIView):
    """Applicants for a job. Admin sees all (with contact); a company sees up to
    its plan's `max_visible_applicants` and a locked count for the rest."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        from apps.companies.permissions import is_company_manager
        from apps.companies.services import plan_limits
        from common.permissions import is_admin

        job = get_object_or_404(Job.objects.select_related("company_profile"), pk=pk)
        admin = is_admin(request.user)
        manager = bool(job.company_profile and is_company_manager(request.user, job.company_profile))
        if not (admin or manager):
            return Response(
                {"detail": "صلاحيات إدارة الوظيفة مطلوبة."}, status=status.HTTP_403_FORBIDDEN
            )

        applications = job.applications.select_related("applicant").order_by("-created_at")
        total = applications.count()

        if admin:
            data = JobApplicantSerializer(
                applications, many=True, context={"show_contact": True}
            ).data
            return Response(
                {
                    "results": data,
                    "total": total,
                    "visible": total,
                    "locked_count": 0,
                    "limit": None,
                    "plan": None,
                    "is_admin": True,
                }
            )

        limits = plan_limits(job.company_profile)
        limit = limits["max_visible_applicants"]
        visible = list(applications[:limit])
        data = JobApplicantSerializer(
            visible, many=True, context={"show_contact": limits["can_view_applicant_contact"]}
        ).data
        return Response(
            {
                "results": data,
                "total": total,
                "visible": len(data),
                "locked_count": max(total - len(data), 0),
                "limit": limit,
                "plan": {
                    "tier": limits["tier"],
                    "name": limits["name"],
                    "can_view_applicant_contact": limits["can_view_applicant_contact"],
                },
                "is_admin": False,
            }
        )


class JobApplicationDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, app_id):
        from apps.companies.permissions import is_company_manager
        from common.permissions import is_admin

        application = get_object_or_404(
            JobApplication.objects.select_related("job__company_profile", "applicant"), pk=app_id
        )
        job = application.job
        allowed = is_admin(request.user) or (
            job.company_profile and is_company_manager(request.user, job.company_profile)
        )
        if not allowed:
            return Response(
                {"detail": "صلاحيات إدارة الوظيفة مطلوبة."}, status=status.HTTP_403_FORBIDDEN
            )
        new_status = request.data.get("status")
        if new_status not in {choice[0] for choice in JobApplication.Status.choices}:
            return Response({"detail": "حالة غير صالحة."}, status=status.HTTP_400_BAD_REQUEST)
        application.status = new_status
        application.save(update_fields=["status", "updated_at"])
        return Response(JobApplicantSerializer(application, context={"show_contact": True}).data)


class JobLocationsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        locations = list(Job.objects.exclude(location="").values_list("location", flat=True).distinct())
        return Response({"locations": locations})


class JobReviewView(APIView):
    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get(self, request, pk):
        job = get_object_or_404(Job, pk=pk)
        reviews = job.reviews.all().order_by("-created_at")
        return Response(JobReviewSerializer(reviews, many=True).data)

    def post(self, request, pk):
        job = get_object_or_404(Job, pk=pk)
        serializer = JobReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(job=job, user=request.user)
        return Response(serializer.data, status=201)


class SpaceListCreateView(generics.ListCreateAPIView):
    serializer_class = SpaceSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        return Space.objects.all().order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(host=self.request.user)


class SpaceLiveView(generics.ListAPIView):
    serializer_class = SpaceSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Space.objects.filter(is_live=True).order_by("-created_at")


class SpaceDetailView(generics.RetrieveAPIView):
    queryset = Space.objects.all()
    serializer_class = SpaceSerializer
    permission_classes = [permissions.AllowAny]


class SpaceStartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        space = get_object_or_404(Space, pk=pk)
        if space.host_id != request.user.id:
            return Response({"detail": "Forbidden"}, status=403)
        space.is_live = True
        space.save(update_fields=["is_live"])
        return Response({"is_live": True})


class SpaceEndView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        space = get_object_or_404(Space, pk=pk)
        if space.host_id != request.user.id:
            return Response({"detail": "Forbidden"}, status=403)
        space.is_live = False
        space.save(update_fields=["is_live"])
        return Response({"is_live": False})
