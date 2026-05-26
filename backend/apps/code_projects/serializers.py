from rest_framework import serializers

from .models import CodeProject, CodeProjectFile, CodeProjectUpdate

MAX_FILE_BYTES = 200_000  # 200 KB of text per file
MAX_TAGS = 10
MAX_TAG_LENGTH = 40


def clean_path(value: str) -> str:
    """Normalize a project file path and reject traversal/abuse.

    Folder structure is expressed by '/'. We strip leading slashes and forbid
    empty/`.`/`..` segments so a path can never escape the project on export.
    """
    path = (value or "").strip().replace("\\", "/").strip("/")
    if not path:
        raise serializers.ValidationError("مسار الملف مطلوب.")
    segments = path.split("/")
    if any(segment in ("", ".", "..") for segment in segments):
        raise serializers.ValidationError("مسار ملف غير صالح.")
    if len(path) > 300:
        raise serializers.ValidationError("مسار الملف طويل جداً.")
    return path


class CodeProjectFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CodeProjectFile
        fields = ("id", "path", "content", "updated_at")
        read_only_fields = ("id", "updated_at")

    def validate_path(self, value):
        return clean_path(value)

    def validate_content(self, value):
        if len(value.encode("utf-8")) > MAX_FILE_BYTES:
            raise serializers.ValidationError("حجم الملف يتجاوز 200 كيلوبايت.")
        return value


class CodeProjectUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CodeProjectUpdate
        fields = ("id", "message", "created_at")
        read_only_fields = ("id", "created_at")

    def validate_message(self, value):
        cleaned = (value or "").strip()
        if not cleaned:
            raise serializers.ValidationError("رسالة التحديث مطلوبة.")
        return cleaned[:200]


class _ProjectBaseSerializer(serializers.ModelSerializer):
    owner_id = serializers.IntegerField(source="owner.id", read_only=True)
    author = serializers.SerializerMethodField()
    file_count = serializers.SerializerMethodField()

    def get_author(self, obj):
        return {
            "id": obj.owner.id,
            "username": obj.owner.username,
            "avatar_url": obj.owner.avatar_url,
        }

    def get_file_count(self, obj) -> int:
        annotated = getattr(obj, "file_count", None)
        return annotated if annotated is not None else obj.files.count()


class CodeProjectListSerializer(_ProjectBaseSerializer):
    class Meta:
        model = CodeProject
        fields = (
            "id",
            "owner_id",
            "author",
            "name",
            "slug",
            "description",
            "language",
            "tags",
            "visibility",
            "github_url",
            "linked_post",
            "file_count",
            "view_count",
            "created_at",
            "updated_at",
        )


class CodeProjectDetailSerializer(_ProjectBaseSerializer):
    files = CodeProjectFileSerializer(many=True, read_only=True)
    updates = CodeProjectUpdateSerializer(many=True, read_only=True)

    class Meta:
        model = CodeProject
        fields = (
            "id",
            "owner_id",
            "author",
            "name",
            "slug",
            "description",
            "language",
            "tags",
            "readme",
            "visibility",
            "github_url",
            "linked_post",
            "file_count",
            "view_count",
            "files",
            "updates",
            "created_at",
            "updated_at",
        )


class CodeProjectWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = CodeProject
        fields = (
            "name",
            "description",
            "language",
            "tags",
            "readme",
            "visibility",
            "github_url",
            "linked_post",
        )

    def validate_name(self, value):
        cleaned = (value or "").strip()
        if not cleaned:
            raise serializers.ValidationError("اسم المشروع مطلوب.")
        return cleaned[:180]

    def validate_tags(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("الوسوم يجب أن تكون قائمة.")
        cleaned = []
        for raw in value[:MAX_TAGS]:
            tag = str(raw).strip().lstrip("#")
            if tag and tag not in cleaned:
                cleaned.append(tag[:MAX_TAG_LENGTH])
        return cleaned

    def validate_linked_post(self, value):
        # A project may only be linked to a post the user owns.
        request = self.context.get("request")
        if value is not None and request and value.user_id != request.user.id:
            raise serializers.ValidationError("لا يمكنك الربط بمنشور ليس لك.")
        return value
