"""Subscription gating — the single source of truth for what a company's
current plan lets it do (job-post quota, applicant visibility, featured ads).

Callers in the jobs domain import these lazily to avoid an app-load cycle
(companies already imports apps.posts at module level)."""

from django.db.models import Q
from django.utils import timezone

from .models import CompanySubscription, SubscriptionPlan

# Defensive fallback if the FREE plan row is somehow missing (the seed data
# migration creates it). Mirrors the seeded FREE tier.
FREE_DEFAULTS = {
    "tier": "FREE",
    "name": "مجاني",
    "max_active_jobs": 1,
    "max_visible_applicants": 5,
    "can_view_applicant_contact": True,
    "allows_featured_jobs": False,
}


def active_subscription(company):
    """The company's current ACTIVE, non-expired subscription (or None)."""
    now = timezone.now()
    return (
        CompanySubscription.objects.filter(
            company=company, status=CompanySubscription.Status.ACTIVE
        )
        .filter(Q(expires_at__isnull=True) | Q(expires_at__gt=now))
        .select_related("plan")
        .order_by("-activated_at")
        .first()
    )


def effective_plan(company):
    """The plan whose limits apply right now — the active sub's plan, else FREE."""
    sub = active_subscription(company)
    if sub:
        return sub.plan
    return SubscriptionPlan.objects.filter(tier=SubscriptionPlan.Tier.FREE).first()


def plan_limits(company) -> dict:
    """Plain dict of the limits in force, safe even if no plan rows exist."""
    plan = effective_plan(company)
    if plan is None:
        return dict(FREE_DEFAULTS)
    return {
        "tier": plan.tier,
        "name": plan.name,
        "max_active_jobs": plan.max_active_jobs,
        "max_visible_applicants": plan.max_visible_applicants,
        "can_view_applicant_contact": plan.can_view_applicant_contact,
        "allows_featured_jobs": plan.allows_featured_jobs,
    }


def active_job_count(company) -> int:
    from apps.posts.models import Job  # lazy: avoid posts<->companies load cycle

    return Job.objects.filter(company_profile=company, status=Job.Status.PUBLISHED).count()


def can_post_job(company) -> bool:
    return active_job_count(company) < plan_limits(company)["max_active_jobs"]
