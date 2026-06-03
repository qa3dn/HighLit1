import uuid
from collections import Counter
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import F, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.text import slugify
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.audit.services import record_event
from apps.posts.models import Job
from apps.posts.serializers import JobSerializer
from common.pagination import DefaultPagination
from common.permissions import IsAdmin
from .gateways import GatewayError, get_gateway
from .models import (
    Company,
    CompanyFollow,
    CompanyMedia,
    CompanyMember,
    CompanyPost,
    CompanyPostComment,
    CompanyPostReaction,
    CompanySubscription,
    Invoice,
    Payment,
    PromoCode,
    PromotionCampaign,
    SubscriptionPlan,
)
from .permissions import is_company_manager
from .serializers import (
    CompanyDetailSerializer,
    CompanyMediaSerializer,
    CompanyMemberSerializer,
    CompanyPostCommentSerializer,
    CompanyPostSerializer,
    CompanySerializer,
    CompanySubscriptionSerializer,
    InvoiceSerializer,
    PromoCodeSerializer,
    PromotionCampaignSerializer,
    SubscriptionPlanSerializer,
)
from .services import (
    active_job_count,
    active_subscription,
    create_subscription_invoice,
    plan_limits,
    settle_invoice,
)

User = get_user_model()


def _unique_slug(name: str) -> str:
    base = slugify(name, allow_unicode=False) or f"company-{uuid.uuid4().hex[:8]}"
    slug = base
    suffix = 1
    while Company.objects.filter(slug=slug).exists():
        suffix += 1
        slug = f"{base}-{suffix}"
    return slug


def _require_manager(user, company):
    if not is_company_manager(user, company):
        from rest_framework.exceptions import PermissionDenied

        raise PermissionDenied("Company manager rights required.")


class CompanyListCreateView(generics.ListCreateAPIView):
    serializer_class = CompanySerializer
    pagination_class = DefaultPagination

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        # Public directory shows only approved companies.
        qs = Company.objects.filter(status=Company.Status.APPROVED)
        q = self.request.query_params.get("q")
        industry = self.request.query_params.get("industry")
        verified = self.request.query_params.get("verified")
        if q:
            qs = qs.filter(Q(name__icontains=q) | Q(tagline__icontains=q) | Q(industry__icontains=q))
        if industry:
            qs = qs.filter(industry__icontains=industry)
        if verified in ("true", "false"):
            qs = qs.filter(is_verified=(verified == "true"))
        return qs.order_by("-is_verified", "-follower_count", "-created_at")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            company = serializer.save(owner=request.user, slug=_unique_slug(serializer.validated_data["name"]))
            CompanyMember.objects.create(
                company=company, user=request.user, role=CompanyMember.Role.OWNER
            )
        return Response(
            CompanySerializer(company, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class MyCompaniesView(generics.ListAPIView):
    serializer_class = CompanySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Company.objects.filter(
            Q(owner=self.request.user) | Q(members__user=self.request.user)
        ).distinct().order_by("-created_at")


class CompanyDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CompanyDetailSerializer
    lookup_field = "slug"
    queryset = Company.objects.prefetch_related("members__user", "media")

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        if request.method not in permissions.SAFE_METHODS:
            _require_manager(request.user, obj)

    def retrieve(self, request, *args, **kwargs):
        company = self.get_object()
        # A non-approved company is visible only to its managers / admins.
        if company.status != Company.Status.APPROVED and not is_company_manager(request.user, company):
            from django.http import Http404

            raise Http404
        return Response(self.get_serializer(company).data)


class CompanyFollowView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, slug):
        company = get_object_or_404(Company, slug=slug)
        with transaction.atomic():
            _, created = CompanyFollow.objects.get_or_create(company=company, user=request.user)
            if created:
                Company.objects.filter(pk=company.pk).update(follower_count=F("follower_count") + 1)
        company.refresh_from_db(fields=["follower_count"])
        return Response({"following": True, "follower_count": company.follower_count})

    def delete(self, request, slug):
        company = get_object_or_404(Company, slug=slug)
        with transaction.atomic():
            deleted, _ = CompanyFollow.objects.filter(company=company, user=request.user).delete()
            if deleted:
                Company.objects.filter(pk=company.pk, follower_count__gt=0).update(
                    follower_count=F("follower_count") - 1
                )
        company.refresh_from_db(fields=["follower_count"])
        return Response({"following": False, "follower_count": company.follower_count})


class CompanyMembersView(generics.ListCreateAPIView):
    serializer_class = CompanyMemberSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def _company(self):
        return get_object_or_404(Company, slug=self.kwargs["slug"])

    def get_queryset(self):
        return CompanyMember.objects.filter(company=self._company()).select_related("user")

    def create(self, request, *args, **kwargs):
        company = self._company()
        _require_manager(request.user, company)
        # Resolve the target user by id or username (username is the usable UX).
        target = None
        if request.data.get("user_id"):
            target = User.objects.filter(pk=request.data["user_id"]).first()
        elif request.data.get("username"):
            target = User.objects.filter(username=str(request.data["username"]).strip()).first()
        if not target:
            return Response({"detail": "المستخدم غير موجود."}, status=status.HTTP_400_BAD_REQUEST)
        role = request.data.get("role") or CompanyMember.Role.EMPLOYEE
        if role not in CompanyMember.Role.values:
            role = CompanyMember.Role.EMPLOYEE
        member, _ = CompanyMember.objects.update_or_create(
            company=company,
            user=target,
            defaults={"role": role, "title": request.data.get("title", "")},
        )
        return Response(CompanyMemberSerializer(member).data, status=status.HTTP_201_CREATED)


class CompanyMemberDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CompanyMemberSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_url_kwarg = "member_id"

    def get_queryset(self):
        return CompanyMember.objects.filter(company__slug=self.kwargs["slug"]).select_related("user")

    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        _require_manager(request.user, obj.company)


class CompanyPostListCreateView(generics.ListCreateAPIView):
    serializer_class = CompanyPostSerializer
    pagination_class = DefaultPagination

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def _company(self):
        return get_object_or_404(Company, slug=self.kwargs["slug"])

    def get_queryset(self):
        return CompanyPost.objects.filter(company__slug=self.kwargs["slug"]).select_related("author")

    def create(self, request, *args, **kwargs):
        company = self._company()
        _require_manager(request.user, company)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        post = serializer.save(company=company, author=request.user)
        return Response(CompanyPostSerializer(post).data, status=status.HTTP_201_CREATED)


class CompanyPostReactionView(APIView):
    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get(self, request, post_id):
        post = get_object_or_404(CompanyPost, pk=post_id)
        counts = Counter(post.reactions.values_list("type", flat=True))
        return Response([{"type": k, "count": v} for k, v in counts.items()])

    def post(self, request, post_id):
        post = get_object_or_404(CompanyPost, pk=post_id)
        CompanyPostReaction.objects.get_or_create(
            post=post, user=request.user, type=request.data.get("type", "LIKE")
        )
        return Response({"ok": True})


class CompanyPostCommentView(APIView):
    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get(self, request, post_id):
        post = get_object_or_404(CompanyPost, pk=post_id)
        comments = post.comments.select_related("user")
        return Response(CompanyPostCommentSerializer(comments, many=True).data)

    def post(self, request, post_id):
        post = get_object_or_404(CompanyPost, pk=post_id)
        serializer = CompanyPostCommentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            serializer.save(post=post, user=request.user)
            CompanyPost.objects.filter(pk=post.pk).update(comment_count=F("comment_count") + 1)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CompanyMediaView(generics.ListCreateAPIView):
    serializer_class = CompanyMediaSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def _company(self):
        return get_object_or_404(Company, slug=self.kwargs["slug"])

    def get_queryset(self):
        return CompanyMedia.objects.filter(company__slug=self.kwargs["slug"])

    def create(self, request, *args, **kwargs):
        company = self._company()
        _require_manager(request.user, company)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        media = serializer.save(company=company)
        return Response(CompanyMediaSerializer(media).data, status=status.HTTP_201_CREATED)


class CompanyJobsView(generics.ListAPIView):
    serializer_class = JobSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = DefaultPagination

    def get_queryset(self):
        # Public: published jobs of an approved company only.
        return Job.objects.filter(
            company_profile__slug=self.kwargs["slug"],
            company_profile__status=Company.Status.APPROVED,
            status=Job.Status.PUBLISHED,
        ).order_by("-created_at")


class CompanyAnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, slug):
        company = get_object_or_404(Company, slug=slug)
        _require_manager(request.user, company)
        return Response(
            {
                "followers": company.follower_count,
                "members": company.members.count(),
                "posts": company.posts.count(),
                "jobs": Job.objects.filter(company_profile=company).count(),
                "media": company.media.count(),
                "is_verified": company.is_verified,
            }
        )


class CompanyVerifyView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, slug):
        from apps.audit.services import record_event

        company = get_object_or_404(Company, slug=slug)
        verified = bool(request.data.get("is_verified", True))
        company.is_verified = verified
        company.save(update_fields=["is_verified", "updated_at"])
        record_event(
            request.user,
            "company.verified" if verified else "company.unverified",
            target_type="company",
            target_id=str(company.pk),
            request=request,
        )
        return Response(CompanySerializer(company, context={"request": request}).data)


class AdminCompanyListView(generics.ListAPIView):
    """Company requests for the admin — filter by status (default all)."""

    serializer_class = CompanySerializer
    permission_classes = [IsAdmin]
    pagination_class = DefaultPagination

    def get_queryset(self):
        qs = Company.objects.all()
        q = self.request.query_params.get("q")
        status_param = self.request.query_params.get("status")
        verified = self.request.query_params.get("verified")
        if q:
            qs = qs.filter(Q(name__icontains=q) | Q(tagline__icontains=q) | Q(industry__icontains=q))
        if status_param:
            qs = qs.filter(status=status_param)
        if verified in ("true", "false"):
            qs = qs.filter(is_verified=(verified == "true"))
        return qs.order_by("-created_at")


class CompanyApproveView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, slug):
        company = get_object_or_404(Company, slug=slug)
        company.status = Company.Status.APPROVED
        company.review_note = request.data.get("note", "")
        company.save(update_fields=["status", "review_note", "updated_at"])
        record_event(
            request.user,
            "company.approved",
            target_type="company",
            target_id=str(company.pk),
            request=request,
        )
        return Response(CompanySerializer(company, context={"request": request}).data)


class CompanyRejectView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, slug):
        company = get_object_or_404(Company, slug=slug)
        company.status = Company.Status.REJECTED
        company.review_note = request.data.get("note", "")
        company.save(update_fields=["status", "review_note", "updated_at"])
        record_event(
            request.user,
            "company.rejected",
            target_type="company",
            target_id=str(company.pk),
            request=request,
        )
        return Response(CompanySerializer(company, context={"request": request}).data)


class SubscriptionPlanListView(generics.ListAPIView):
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return SubscriptionPlan.objects.filter(is_active=True)


class CompanySubscriptionView(APIView):
    """A company manager's view of their plan + usage, and where they request
    a new plan (creates a PENDING subscription for an admin to activate)."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, slug):
        company = get_object_or_404(Company, slug=slug)
        _require_manager(request.user, company)
        sub = active_subscription(company)
        pending = (
            company.subscriptions.filter(status=CompanySubscription.Status.PENDING)
            .select_related("plan")
            .first()
        )
        return Response(
            {
                "current": CompanySubscriptionSerializer(sub).data if sub else None,
                "pending": CompanySubscriptionSerializer(pending).data if pending else None,
                "limits": plan_limits(company),
                "usage": {"active_jobs": active_job_count(company)},
            }
        )

    def post(self, request, slug):
        company = get_object_or_404(Company, slug=slug)
        _require_manager(request.user, company)
        plan = get_object_or_404(
            SubscriptionPlan, pk=request.data.get("plan_id") or request.data.get("plan"), is_active=True
        )
        if company.subscriptions.filter(status=CompanySubscription.Status.PENDING).exists():
            return Response(
                {"detail": "لديك طلب اشتراك قيد المراجعة بالفعل."}, status=status.HTTP_409_CONFLICT
            )
        sub = CompanySubscription.objects.create(
            company=company,
            plan=plan,
            requested_by=request.user,
            status=CompanySubscription.Status.PENDING,
        )
        record_event(
            request.user,
            "subscription.requested",
            target_type="company_subscription",
            target_id=str(sub.id),
            payload={"company": company.slug, "plan": plan.tier},
            request=request,
        )
        return Response(CompanySubscriptionSerializer(sub).data, status=status.HTTP_201_CREATED)


class AdminSubscriptionListView(generics.ListAPIView):
    serializer_class = CompanySubscriptionSerializer
    permission_classes = [IsAdmin]
    pagination_class = DefaultPagination

    def get_queryset(self):
        qs = CompanySubscription.objects.select_related("company", "plan", "requested_by")
        status_param = self.request.query_params.get("status")
        if status_param:
            qs = qs.filter(status=status_param)
        return qs.order_by("-created_at")


class AdminSubscriptionActivateView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        sub = get_object_or_404(
            CompanySubscription.objects.select_related("company", "plan"), pk=pk
        )
        now = timezone.now()
        with transaction.atomic():
            # A company has at most one ACTIVE subscription — supersede the rest.
            CompanySubscription.objects.filter(
                company=sub.company, status=CompanySubscription.Status.ACTIVE
            ).exclude(pk=sub.pk).update(status=CompanySubscription.Status.EXPIRED)
            sub.status = CompanySubscription.Status.ACTIVE
            sub.activated_by = request.user
            sub.activated_at = now
            sub.expires_at = now + timedelta(days=sub.plan.duration_days)
            sub.note = request.data.get("note", sub.note)
            sub.save(
                update_fields=["status", "activated_by", "activated_at", "expires_at", "note", "updated_at"]
            )
        record_event(
            request.user,
            "subscription.activated",
            target_type="company_subscription",
            target_id=str(sub.id),
            payload={"company": sub.company.slug, "plan": sub.plan.tier},
            request=request,
        )
        # Open an invoice for paid plans (settled manually or via the gateway
        # webhook). An optional promo code applies a discount.
        from decimal import Decimal

        if Decimal(sub.plan.price) > 0:
            promo = None
            code = (request.data.get("promo_code") or "").strip()
            if code:
                candidate = PromoCode.objects.filter(code=code).first()
                if candidate and candidate.is_redeemable() and candidate.plan_id in (None, sub.plan_id):
                    promo = candidate
            create_subscription_invoice(sub, promo)
        return Response(CompanySubscriptionSerializer(sub).data)


class AdminSubscriptionRejectView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        sub = get_object_or_404(
            CompanySubscription.objects.select_related("company", "plan"), pk=pk
        )
        sub.status = CompanySubscription.Status.REJECTED
        sub.note = request.data.get("note", "")
        sub.save(update_fields=["status", "note", "updated_at"])
        record_event(
            request.user,
            "subscription.rejected",
            target_type="company_subscription",
            target_id=str(sub.id),
            payload={"company": sub.company.slug},
            request=request,
        )
        return Response(CompanySubscriptionSerializer(sub).data)


# ── Admin: subscription-plan management ──────────────────────────────────────


class AdminPlanListCreateView(generics.ListCreateAPIView):
    """Admin CRUD over billing tiers (lists inactive plans too, unlike the
    public /plans endpoint)."""

    serializer_class = SubscriptionPlanSerializer
    permission_classes = [IsAdmin]
    queryset = SubscriptionPlan.objects.all().order_by("sort_order", "price")

    def perform_create(self, serializer):
        plan = serializer.save()
        record_event(
            self.request.user, "plan.created", target_type="subscription_plan",
            target_id=str(plan.id), payload={"tier": plan.tier}, request=self.request,
        )


class AdminPlanDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [IsAdmin]
    queryset = SubscriptionPlan.objects.all()

    def perform_update(self, serializer):
        plan = serializer.save()
        record_event(
            self.request.user, "plan.updated", target_type="subscription_plan",
            target_id=str(plan.id), request=self.request,
        )

    def destroy(self, request, *args, **kwargs):
        plan = self.get_object()
        # plan FK is PROTECT on CompanySubscription — refuse if any reference it.
        if plan.subscriptions.exists():
            return Response(
                {"detail": "لا يمكن حذف باقة مرتبطة باشتراكات. عطّلها بدلاً من حذفها."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        record_event(
            request.user, "plan.deleted", target_type="subscription_plan",
            target_id=str(plan.id), payload={"tier": plan.tier}, request=request,
        )
        plan.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ── Admin: promo codes (discount campaigns) ──────────────────────────────────


class AdminPromoCodeListCreateView(generics.ListCreateAPIView):
    serializer_class = PromoCodeSerializer
    permission_classes = [IsAdmin]
    queryset = PromoCode.objects.select_related("plan").all()

    def perform_create(self, serializer):
        promo = serializer.save()
        record_event(
            self.request.user, "promocode.created", target_type="promo_code",
            target_id=str(promo.id), payload={"code": promo.code}, request=self.request,
        )


class AdminPromoCodeDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PromoCodeSerializer
    permission_classes = [IsAdmin]
    queryset = PromoCode.objects.select_related("plan").all()

    def perform_update(self, serializer):
        promo = serializer.save()
        record_event(
            self.request.user, "promocode.updated", target_type="promo_code",
            target_id=str(promo.id), request=self.request,
        )

    def perform_destroy(self, instance):
        record_event(
            self.request.user, "promocode.deleted", target_type="promo_code",
            target_id=str(instance.id), payload={"code": instance.code}, request=self.request,
        )
        instance.delete()


# ── Billing: invoices, manual settlement, gateway webhook ────────────────────


class AdminInvoiceListView(generics.ListAPIView):
    serializer_class = InvoiceSerializer
    permission_classes = [IsAdmin]
    pagination_class = DefaultPagination

    def get_queryset(self):
        qs = Invoice.objects.select_related("company", "promo_code").prefetch_related("payments")
        status_param = self.request.query_params.get("status")
        company = self.request.query_params.get("company")
        if status_param:
            qs = qs.filter(status=status_param)
        if company:
            qs = qs.filter(company__slug=company)
        return qs.order_by("-created_at")


class AdminInvoiceDetailView(generics.RetrieveAPIView):
    serializer_class = InvoiceSerializer
    permission_classes = [IsAdmin]
    queryset = Invoice.objects.select_related("company", "promo_code").prefetch_related("payments")


class AdminRecordPaymentView(APIView):
    """Manual settlement — an admin marks an OPEN invoice paid. Idempotent via an
    optional client-supplied key (otherwise generated)."""

    permission_classes = [IsAdmin]

    def post(self, request, pk):
        invoice = get_object_or_404(Invoice, pk=pk)
        if invoice.status == Invoice.Status.VOID:
            return Response({"detail": "الفاتورة ملغاة."}, status=status.HTTP_400_BAD_REQUEST)
        key = request.data.get("idempotency_key") or f"manual-{invoice.id}-{uuid.uuid4().hex}"
        _, created = settle_invoice(
            invoice.id,
            amount=invoice.total,
            gateway=Payment.Gateway.MANUAL,
            idempotency_key=key,
            created_by=request.user,
        )
        if created:
            record_event(
                request.user, "invoice.paid", target_type="invoice", target_id=str(invoice.id),
                payload={"gateway": "MANUAL", "amount": str(invoice.total)}, request=request,
            )
        invoice.refresh_from_db()
        return Response(InvoiceSerializer(invoice).data)


class AdminVoidInvoiceView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        invoice = get_object_or_404(Invoice, pk=pk)
        if invoice.status == Invoice.Status.PAID:
            return Response({"detail": "لا يمكن إبطال فاتورة مدفوعة."}, status=status.HTTP_400_BAD_REQUEST)
        invoice.status = Invoice.Status.VOID
        invoice.save(update_fields=["status"])
        record_event(
            request.user, "invoice.voided", target_type="invoice", target_id=str(invoice.id), request=request
        )
        return Response(InvoiceSerializer(invoice).data)


class PaymentWebhookView(APIView):
    """Gateway → platform. Authenticated by the provider's HMAC signature (not
    DRF auth). Idempotent: a re-delivered event settles at most once."""

    permission_classes = [permissions.AllowAny]
    authentication_classes: list = []

    def post(self, request):
        try:
            gateway = get_gateway(request.query_params.get("gateway", "CLIQ"))
            event = gateway.verify_webhook(request.headers, request.body)
        except GatewayError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        if event.get("status") != "SUCCEEDED":
            return Response({"ok": True, "ignored": True})
        invoice_id, key = event.get("invoice_id"), event.get("idempotency_key")
        if not invoice_id or not key:
            return Response({"detail": "missing invoice_id or event id"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            invoice = Invoice.objects.get(pk=invoice_id)
        except Invoice.DoesNotExist:
            return Response({"detail": "unknown invoice"}, status=status.HTTP_404_NOT_FOUND)
        _, created = settle_invoice(
            invoice.id,
            amount=event.get("amount") or invoice.total,
            gateway=gateway.name,
            idempotency_key=key,
            gateway_ref=event.get("gateway_ref", ""),
            raw=event,
        )
        if created:
            record_event(
                None, "invoice.paid", target_type="invoice", target_id=str(invoice.id),
                payload={"gateway": gateway.name}, request=request,
            )
        return Response({"ok": True})


# ── Promotion campaigns (paid, time-boxed featuring) ─────────────────────────


class AdminCampaignListCreateView(generics.ListCreateAPIView):
    serializer_class = PromotionCampaignSerializer
    permission_classes = [IsAdmin]
    pagination_class = DefaultPagination

    def get_queryset(self):
        qs = PromotionCampaign.objects.select_related("company", "job")
        status_param = self.request.query_params.get("status")
        if status_param:
            qs = qs.filter(status=status_param)
        return qs.order_by("-created_at")

    def perform_create(self, serializer):
        campaign = serializer.save(
            created_by=self.request.user, status=PromotionCampaign.Status.PENDING
        )
        record_event(
            self.request.user, "campaign.created", target_type="campaign",
            target_id=str(campaign.id), payload={"name": campaign.name}, request=self.request,
        )


class AdminCampaignDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PromotionCampaignSerializer
    permission_classes = [IsAdmin]
    queryset = PromotionCampaign.objects.select_related("company", "job")

    def perform_destroy(self, instance):
        # If an active job promotion is deleted, clear the feature flag.
        if (
            instance.status == PromotionCampaign.Status.ACTIVE
            and instance.target_type == PromotionCampaign.Target.JOB
            and instance.job_id
        ):
            Job.objects.filter(pk=instance.job_id).update(is_featured=False)
        record_event(
            self.request.user, "campaign.deleted", target_type="campaign",
            target_id=str(instance.id), request=self.request,
        )
        instance.delete()


class AdminCampaignActivateView(APIView):
    """Activate a campaign: feature the target job and (for paid campaigns) open
    an invoice. Atomic so the feature flag and invoice move together."""

    permission_classes = [IsAdmin]

    def post(self, request, pk):
        from decimal import Decimal

        campaign = get_object_or_404(
            PromotionCampaign.objects.select_related("company", "job"), pk=pk
        )
        with transaction.atomic():
            campaign.status = PromotionCampaign.Status.ACTIVE
            campaign.activated_by = request.user
            if campaign.target_type == PromotionCampaign.Target.JOB and campaign.job_id:
                Job.objects.filter(pk=campaign.job_id).update(is_featured=True)
            if campaign.invoice_id is None and Decimal(campaign.price) > 0:
                campaign.invoice = Invoice.objects.create(
                    company=campaign.company,
                    description=f"حملة ترويجية: {campaign.name}",
                    amount=campaign.price,
                    total=campaign.price,
                    currency=campaign.currency,
                    status=Invoice.Status.OPEN,
                )
            campaign.save(update_fields=["status", "activated_by", "invoice", "updated_at"])
        record_event(
            request.user, "campaign.activated", target_type="campaign",
            target_id=str(campaign.id), payload={"company": campaign.company.slug}, request=request,
        )
        return Response(PromotionCampaignSerializer(campaign).data)


class AdminCampaignEndView(APIView):
    """End a campaign (EXPIRED) and clear the target job's feature flag."""

    permission_classes = [IsAdmin]

    def post(self, request, pk):
        campaign = get_object_or_404(PromotionCampaign.objects.select_related("job"), pk=pk)
        campaign.status = PromotionCampaign.Status.EXPIRED
        if campaign.target_type == PromotionCampaign.Target.JOB and campaign.job_id:
            Job.objects.filter(pk=campaign.job_id).update(is_featured=False)
        campaign.save(update_fields=["status", "updated_at"])
        record_event(
            request.user, "campaign.ended", target_type="campaign",
            target_id=str(campaign.id), request=request,
        )
        return Response(PromotionCampaignSerializer(campaign).data)
