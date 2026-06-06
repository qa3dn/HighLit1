from rest_framework import serializers

from .models import (
    Company,
    CompanyFollow,
    CompanyMedia,
    CompanyMember,
    CompanyPost,
    CompanyPostComment,
    CompanySubscription,
    Invoice,
    Payment,
    PromoCode,
    PromotionCampaign,
    SubscriptionPlan,
)


class CompanyMemberSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    avatar_url = serializers.CharField(source="user.avatar_url", read_only=True)

    class Meta:
        model = CompanyMember
        fields = ("id", "user_id", "username", "avatar_url", "role", "title", "joined_at")
        read_only_fields = ("id", "joined_at")


class CompanyMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyMedia
        fields = ("id", "url", "caption", "created_at")
        read_only_fields = ("id", "created_at")


class CompanySerializer(serializers.ModelSerializer):
    owner_id = serializers.IntegerField(read_only=True)
    is_following = serializers.SerializerMethodField()
    is_manager = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = (
            "id",
            "owner_id",
            "name",
            "slug",
            "tagline",
            "about",
            "industry",
            "size",
            "location",
            "website",
            "logo_url",
            "banner_url",
            "founded_year",
            "status",
            "review_note",
            "is_verified",
            "follower_count",
            "is_following",
            "is_manager",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "owner_id",
            "slug",
            "status",
            "review_note",
            "is_verified",
            "follower_count",
            "created_at",
            "updated_at",
        )

    def _viewer(self):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        return user if (user and user.is_authenticated) else None

    def get_is_following(self, obj) -> bool:
        user = self._viewer()
        if not user:
            return False
        return CompanyFollow.objects.filter(company=obj, user=user).exists()

    def get_is_manager(self, obj) -> bool:
        from .permissions import is_company_manager

        user = self._viewer()
        return bool(user and is_company_manager(user, obj))


class CompanyDetailSerializer(CompanySerializer):
    """One-shot company profile: company meta + members + media gallery."""

    members = CompanyMemberSerializer(many=True, read_only=True)
    media = CompanyMediaSerializer(many=True, read_only=True)

    class Meta(CompanySerializer.Meta):
        fields = CompanySerializer.Meta.fields + ("members", "media")


class CompanyPostSerializer(serializers.ModelSerializer):
    author_id = serializers.IntegerField(read_only=True)
    author_username = serializers.CharField(source="author.username", read_only=True)
    reaction_count = serializers.SerializerMethodField()

    class Meta:
        model = CompanyPost
        fields = (
            "id",
            "company_id",
            "author_id",
            "author_username",
            "content",
            "media_url",
            "comment_count",
            "reaction_count",
            "created_at",
        )
        read_only_fields = ("id", "company_id", "author_id", "comment_count", "created_at")

    def get_reaction_count(self, obj) -> int:
        return obj.reactions.count()


class CompanyPostCommentSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = CompanyPostComment
        fields = ("id", "post", "user_id", "username", "content", "created_at")
        read_only_fields = ("id", "post", "created_at")


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = (
            "id",
            "tier",
            "name",
            "description",
            "price",
            "currency",
            "max_active_jobs",
            "max_visible_applicants",
            "can_view_applicant_contact",
            "allows_featured_jobs",
            "duration_days",
            "is_active",
            "sort_order",
        )


class PromoCodeSerializer(serializers.ModelSerializer):
    is_redeemable = serializers.SerializerMethodField()
    plan_name = serializers.CharField(source="plan.name", read_only=True, default=None)

    class Meta:
        model = PromoCode
        fields = (
            "id",
            "code",
            "discount_type",
            "amount",
            "plan",
            "plan_name",
            "valid_from",
            "valid_until",
            "max_uses",
            "used_count",
            "is_active",
            "is_redeemable",
            "created_at",
        )
        read_only_fields = ("id", "used_count", "is_redeemable", "plan_name", "created_at")

    def get_is_redeemable(self, obj) -> bool:
        return obj.is_redeemable()


class PaymentSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source="created_by.username", read_only=True, default=None)

    class Meta:
        model = Payment
        fields = (
            "id",
            "amount",
            "currency",
            "gateway",
            "gateway_ref",
            "status",
            "created_by",
            "created_by_username",
            "created_at",
            "settled_at",
        )
        read_only_fields = fields


class InvoiceSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source="company.name", read_only=True)
    company_slug = serializers.CharField(source="company.slug", read_only=True)
    promo_code_label = serializers.CharField(source="promo_code.code", read_only=True, default=None)
    payments = PaymentSerializer(many=True, read_only=True)

    class Meta:
        model = Invoice
        fields = (
            "id",
            "company",
            "company_name",
            "company_slug",
            "subscription",
            "description",
            "amount",
            "discount_amount",
            "total",
            "currency",
            "promo_code",
            "promo_code_label",
            "transfer_reference",
            "proof_url",
            "status",
            "created_at",
            "paid_at",
            "payments",
        )
        read_only_fields = fields


class PromotionCampaignSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source="company.name", read_only=True)
    job_title = serializers.CharField(source="job.title", read_only=True, default=None)

    class Meta:
        model = PromotionCampaign
        fields = (
            "id",
            "company",
            "company_name",
            "name",
            "target_type",
            "job",
            "job_title",
            "price",
            "currency",
            "starts_at",
            "ends_at",
            "status",
            "invoice",
            "created_by",
            "activated_by",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "company_name",
            "job_title",
            "status",
            "invoice",
            "created_by",
            "activated_by",
            "created_at",
            "updated_at",
        )

    def validate(self, attrs):
        # A JOB campaign may only target a job that belongs to its own company.
        target = attrs.get("target_type") or getattr(self.instance, "target_type", None)
        job = attrs.get("job", getattr(self.instance, "job", None))
        company = attrs.get("company", getattr(self.instance, "company", None))
        if target == PromotionCampaign.Target.JOB and job is not None and company is not None:
            if job.company_profile_id != company.id:
                raise serializers.ValidationError({"job": "الوظيفة لا تتبع هذه الشركة."})
        return attrs


class CompanySubscriptionSerializer(serializers.ModelSerializer):
    plan = SubscriptionPlanSerializer(read_only=True)
    company_name = serializers.CharField(source="company.name", read_only=True)
    company_slug = serializers.CharField(source="company.slug", read_only=True)
    requested_by_username = serializers.CharField(source="requested_by.username", read_only=True)

    class Meta:
        model = CompanySubscription
        fields = (
            "id",
            "company",
            "company_name",
            "company_slug",
            "plan",
            "status",
            "requested_by",
            "requested_by_username",
            "activated_by",
            "activated_at",
            "expires_at",
            "note",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields
