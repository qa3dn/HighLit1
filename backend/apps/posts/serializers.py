from collections import Counter

from rest_framework import serializers

from .models import Comment, Job, JobReview, Post, Reaction, Space


class PostSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="user.id", read_only=True)

    class Meta:
        model = Post
        fields = ("id", "user_id", "title", "content", "type", "tags", "roast_mode", "created_at")


class CommentSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="user.id", read_only=True)

    class Meta:
        model = Comment
        fields = ("id", "post", "user_id", "content", "created_at")
        read_only_fields = ("post",)


class ReactionSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="user.id", read_only=True)

    class Meta:
        model = Reaction
        fields = ("id", "post", "user_id", "type", "created_at")
        read_only_fields = ("post",)


class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = "__all__"
        read_only_fields = ("created_by",)


class JobReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobReview
        fields = "__all__"
        read_only_fields = ("job", "user")


class SpaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Space
        fields = "__all__"
        read_only_fields = ("host",)


def reaction_totals(post):
    counts = Counter(post.reactions.values_list("type", flat=True))
    return [{"type": key, "count": value} for key, value in counts.items()]
