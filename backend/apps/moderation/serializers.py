from rest_framework import serializers

from apps.posts.models import Comment, Post


class AdminPostSerializer(serializers.ModelSerializer):
    """Moderator view of a post. Unlike the public serializer this always
    exposes the real author (even for anonymous posts) — moderation requires
    knowing who wrote what."""

    author = serializers.SerializerMethodField()
    reaction_count = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = (
            "id",
            "title",
            "content",
            "type",
            "tags",
            "is_hidden",
            "is_anonymous",
            "roast_mode",
            "author",
            "reaction_count",
            "comment_count",
            "created_at",
        )

    def get_author(self, obj):
        user = obj.user
        return {
            "id": user.id,
            "username": user.username,
            "avatar_url": user.avatar_url,
            "rank": user.rank,
        }

    def get_reaction_count(self, obj) -> int:
        annotated = getattr(obj, "reaction_count", None)
        return annotated if annotated is not None else obj.reactions.count()

    def get_comment_count(self, obj) -> int:
        annotated = getattr(obj, "comment_count", None)
        return annotated if annotated is not None else obj.comments.count()


class AdminCommentSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    post = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ("id", "content", "is_hidden", "author", "post", "created_at")

    def get_author(self, obj):
        return {
            "id": obj.user.id,
            "username": obj.user.username,
            "avatar_url": obj.user.avatar_url,
        }

    def get_post(self, obj):
        return {"id": obj.post.id, "title": obj.post.title, "type": obj.post.type}
