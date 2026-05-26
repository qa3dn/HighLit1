from rest_framework import serializers

from .models import CodeStorage, DevNote, Idea, SavedItem


class CodeStorageSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="user.id", read_only=True)

    class Meta:
        model = CodeStorage
        fields = "__all__"
        read_only_fields = ("user", "share_token")


class DevNoteSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="user.id", read_only=True)

    class Meta:
        model = DevNote
        fields = "__all__"
        read_only_fields = ("user",)


class IdeaSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="user.id", read_only=True)

    class Meta:
        model = Idea
        fields = "__all__"
        read_only_fields = ("user",)


class SavedItemSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="user.id", read_only=True)

    class Meta:
        model = SavedItem
        fields = "__all__"
        read_only_fields = ("user",)
