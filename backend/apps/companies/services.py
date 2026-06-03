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


# ── Billing ──────────────────────────────────────────────────────────────────


def compute_discount(amount, promo) -> "Decimal":
    """Discount for `amount` under `promo` (clamped to 0..amount). Returns 0 if
    the promo is missing or not currently redeemable."""
    from decimal import Decimal

    amount = Decimal(amount)
    if promo is None or not promo.is_redeemable():
        return Decimal("0")
    if promo.discount_type == promo.DiscountType.PERCENT:
        disc = (amount * Decimal(promo.amount)) / Decimal("100")
    else:
        disc = Decimal(promo.amount)
    disc = max(Decimal("0"), min(disc, amount))
    return disc.quantize(Decimal("0.01"))


def create_subscription_invoice(subscription, promo=None):
    """Open an invoice for a subscription's plan, applying an optional promo."""
    from decimal import Decimal

    from .models import Invoice

    plan = subscription.plan
    amount = Decimal(plan.price)
    discount = compute_discount(amount, promo)
    total = (amount - discount).quantize(Decimal("0.01"))
    return Invoice.objects.create(
        company=subscription.company,
        subscription=subscription,
        description=f"اشتراك باقة {plan.name}",
        amount=amount,
        discount_amount=discount,
        total=total,
        currency=plan.currency,
        promo_code=promo if (promo is not None and discount > 0) else None,
        status=Invoice.Status.OPEN,
    )


def settle_invoice(invoice_id, *, amount, gateway, idempotency_key, gateway_ref="", raw=None, created_by=None):
    """Idempotently settle an invoice: create a SUCCEEDED Payment and mark the
    invoice PAID under a row lock. Re-running with the same idempotency_key (a
    retried manual settle or re-delivered webhook) is a safe no-op.

    Returns (payment, created: bool)."""
    from django.db import transaction
    from django.db.models import F
    from django.utils import timezone

    from .models import Invoice, Payment, PromoCode

    with transaction.atomic():
        invoice = Invoice.objects.select_for_update().get(pk=invoice_id)
        payment, created = Payment.objects.get_or_create(
            idempotency_key=idempotency_key,
            defaults={
                "invoice": invoice,
                "amount": amount,
                "currency": invoice.currency,
                "gateway": gateway,
                "gateway_ref": gateway_ref or "",
                "status": Payment.Status.SUCCEEDED,
                "raw": raw or {},
                "created_by": created_by,
                "settled_at": timezone.now(),
            },
        )
        if not created:
            return payment, False
        if invoice.status == Invoice.Status.OPEN:
            invoice.status = Invoice.Status.PAID
            invoice.paid_at = timezone.now()
            invoice.save(update_fields=["status", "paid_at"])
            if invoice.promo_code_id:
                PromoCode.objects.filter(pk=invoice.promo_code_id).update(
                    used_count=F("used_count") + 1
                )
        return payment, True
