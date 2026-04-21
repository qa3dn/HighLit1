from django.conf import settings
from django.db import models


class TimestampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class CodeStorage(TimestampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="code_storage")
    title = models.CharField(max_length=180)
    language = models.CharField(max_length=50, default="typescript")
    code_body = models.TextField()
    description = models.TextField(blank=True, default="")
    tags = models.JSONField(default=list, blank=True)
    visibility = models.CharField(max_length=20, default="PRIVATE")
    share_token = models.CharField(max_length=120, blank=True, default="")
    notes = models.TextField(blank=True, default="")
    linked_post_id = models.IntegerField(null=True, blank=True)


class DevNote(TimestampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="dev_notes")
    title = models.CharField(max_length=180)
    content = models.TextField()
    tags = models.JSONField(default=list, blank=True)
    linked_code_id = models.IntegerField(null=True, blank=True)


class Idea(TimestampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="ideas")
    title = models.CharField(max_length=180)
    description = models.TextField(blank=True, default="")
    status = models.CharField(max_length=20, default="IDEA")
    linked_code_id = models.IntegerField(null=True, blank=True)


class SavedItem(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="saved_items")
    item_type = models.CharField(max_length=20)
    item_id = models.CharField(max_length=64)
    notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
