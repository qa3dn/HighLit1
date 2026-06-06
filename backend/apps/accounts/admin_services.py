"""Read-only aggregation for the admin user-detail screen.

Keeps the view thin (CLAUDE.md §2): every ORM read for the "one screen, one
call" admin detail lives here. Imported lazily by the view, so by call time all
apps are loaded and top-level cross-app imports are safe.
"""

from django.db.models import Count

from apps.audit.models import AuditEvent
from apps.audit.serializers import AuditEventSerializer
from apps.companies.models import Company, CompanyMember
from apps.posts.models import Comment, Job, JobApplication, Post
from apps.student_projects.models import StudentProject

from .serializers import AdminUserDetailSerializer

RECENT_ACTIVITY_LIMIT = 10


def build_user_stats(user) -> dict:
    """Per-account counts across the platform (one COUNT per relation)."""
    return {
        "posts": Post.objects.filter(user=user).count(),
        "comments": Comment.objects.filter(user=user).count(),
        "projects": StudentProject.objects.filter(user=user).count(),
        "jobs_created": Job.objects.filter(created_by=user).count(),
        "applications": JobApplication.objects.filter(applicant=user).count(),
        "reputation_points": user.reputation_points,
        "rank": user.rank,
    }


def build_user_companies(user) -> dict:
    """Companies the user owns, with job counts and a status breakdown."""
    companies = list(
        Company.objects.filter(owner=user)
        .annotate(job_count=Count("jobs"))
        .order_by("-created_at")
    )
    items = [
        {
            "id": company.id,
            "name": company.name,
            "slug": company.slug,
            "tagline": company.tagline,
            "about": company.about,
            "industry": company.industry,
            "size": company.size,
            "location": company.location,
            "website": company.website,
            "status": company.status,
            "is_verified": company.is_verified,
            "follower_count": company.follower_count,
            "job_count": company.job_count,
            "created_at": company.created_at.isoformat(),
        }
        for company in companies
    ]
    counts = {status: 0 for status in Company.Status.values}
    for company in companies:
        counts[company.status] = counts.get(company.status, 0) + 1
    return {"items": items, "counts": counts, "total": len(items)}


def build_user_memberships(user) -> list[dict]:
    """Companies the user belongs to but does NOT own (employee/admin roles)."""
    members = (
        CompanyMember.objects.filter(user=user)
        .exclude(company__owner=user)
        .select_related("company")
        .order_by("-joined_at")
    )
    return [
        {
            "company_id": member.company_id,
            "name": member.company.name,
            "slug": member.company.slug,
            "status": member.company.status,
            "is_verified": member.company.is_verified,
            "role": member.role,
        }
        for member in members
    ]


def build_user_recent_activity(user, limit: int = RECENT_ACTIVITY_LIMIT) -> list:
    events = AuditEvent.objects.filter(actor=user).select_related("actor")[:limit]
    return AuditEventSerializer(events, many=True).data


def build_admin_user_detail(user) -> dict:
    """The full admin user-detail payload — one screen, one call."""
    return {
        "user": AdminUserDetailSerializer(user).data,
        "stats": build_user_stats(user),
        "companies": build_user_companies(user),
        "memberships": build_user_memberships(user),
        "recent_activity": build_user_recent_activity(user),
    }
