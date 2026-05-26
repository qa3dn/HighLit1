from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import StudentProject

User = get_user_model()


class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "avatar_url", "university", "major")


class StudentProjectSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    author = AuthorSerializer(source="user", read_only=True)

    class Meta:
        model = StudentProject
        fields = (
            "id",
            "user_id",
            "author",
            "title",
            "summary",
            "description",
            "university",
            "major",
            "academic_year",
            "project_type",
            "github_url",
            "demo_url",
            "video_url",
            "cover_image",
            "gallery_images",
            "tech_stack",
            "tags",
            "status",
            "rejection_reason",
            "view_count",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "user_id", "author", "status", "rejection_reason", "view_count", "created_at", "updated_at")

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        validated_data["status"] = StudentProject.Status.PUBLISHED
        return super().create(validated_data)


class StudentProjectCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProject
        fields = (
            "title",
            "summary",
            "description",
            "university",
            "major",
            "academic_year",
            "project_type",
            "github_url",
            "demo_url",
            "video_url",
            "cover_image",
            "gallery_images",
            "tech_stack",
            "tags",
        )

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        validated_data["status"] = StudentProject.Status.PUBLISHED
        return super().create(validated_data)


class RejectProjectSerializer(serializers.Serializer):
    reason = serializers.CharField(required=False, allow_blank=True, default="")
