import re

from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()

GITHUB_HANDLE_RE = re.compile(r"^[A-Za-z0-9-]{1,39}$")


class UserSerializer(serializers.ModelSerializer):
    """Full self-view (returned by /auth/me and editable via PATCH /users/:id)."""

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "role",
            "rank",
            "reputation_points",
            "bio",
            "avatar_url",
            "banner_url",
            "status_text",
            "university",
            "major",
            "github_username",
            "profile_visibility",
            "show_posts",
            "show_code",
            "show_ideas",
            "show_activity",
            "is_active",
        )
        # Privilege-bearing / server-owned fields are never settable through a
        # normal profile update. This blocks self-escalation to ADMIN and
        # tampering with rank/reputation via PATCH /users/:id. `is_active`
        # (ban status) is toggled only via the admin ban endpoint.
        read_only_fields = ("id", "role", "rank", "reputation_points", "is_active")

    def validate_github_username(self, value: str) -> str:
        cleaned = (value or "").strip().lstrip("@")
        if cleaned and not GITHUB_HANDLE_RE.match(cleaned):
            raise serializers.ValidationError("اسم مستخدم GitHub غير صالح.")
        return cleaned


class PublicProfileSerializer(serializers.ModelSerializer):
    """Public-safe identity. Never exposes email or privilege fields."""

    member_since = serializers.DateTimeField(source="date_joined", read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "bio",
            "avatar_url",
            "banner_url",
            "rank",
            "reputation_points",
            "status_text",
            "university",
            "major",
            "github_username",
            "member_since",
        )
        read_only_fields = fields


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        # `role` is intentionally NOT accepted at registration — every public
        # signup is a USER. Elevated roles are granted by an admin afterwards.
        fields = ("username", "email", "password")

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
