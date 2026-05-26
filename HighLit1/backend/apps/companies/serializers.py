from rest_framework import serializers

from .models import (
    Company,
    CompanyFollow,
    CompanyMedia,
    CompanyMember,
    CompanyPost,
    CompanyPostComment,
    CompanySubscription,
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
