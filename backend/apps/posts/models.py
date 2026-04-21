from django.conf import settings
from django.db import models


class Post(models.Model):
    class PostType(models.TextChoices):
        RANT = "RANT", "Rant"
        CODE = "CODE", "Code"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="posts")
    title = models.CharField(max_length=180)
    content = models.TextField()
    type = models.CharField(max_length=10, choices=PostType.choices, default=PostType.RANT)
    tags = models.JSONField(default=list, blank=True)
    roast_mode = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)


class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comments")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="comments")
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)


class Reaction(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="reactions")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reactions")
    type = models.CharField(max_length=30)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("post", "user", "type")


class Job(models.Model):
    title = models.CharField(max_length=180)
    company = models.CharField(max_length=180)
    location = models.CharField(max_length=120, blank=True, default="")
    description = models.TextField()
    min_salary = models.IntegerField(default=0)
    max_salary = models.IntegerField(default=0)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="jobs")
    created_at = models.DateTimeField(auto_now_add=True)


class JobReview(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="reviews")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="job_reviews")
    rating = models.IntegerField(default=5)
    comment = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)


class Space(models.Model):
    title = models.CharField(max_length=180)
    description = models.TextField(blank=True, default="")
    is_live = models.BooleanField(default=False)
    host = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="spaces")
    created_at = models.DateTimeField(auto_now_add=True)
