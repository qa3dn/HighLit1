from django.conf import settings
from django.db import models


class StudentProject(models.Model):
    class ProjectType(models.TextChoices):
        IMAGE = "IMAGE", "Image"
        GITHUB = "GITHUB", "GitHub"
        VIDEO = "VIDEO", "Video"
        MIXED = "MIXED", "Mixed"

    class Status(models.TextChoices):
        PUBLISHED = "PUBLISHED", "Published"
        HIDDEN = "HIDDEN", "Hidden"
        REJECTED = "REJECTED", "Rejected"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="student_projects",
    )
    title = models.CharField(max_length=200)
    summary = models.TextField()
    description = models.TextField(blank=True, default="")
    university = models.CharField(max_length=120)
    major = models.CharField(max_length=120)
    academic_year = models.CharField(max_length=20, blank=True, default="")
    project_type = models.CharField(
        max_length=10,
        choices=ProjectType.choices,
        default=ProjectType.MIXED,
    )
    github_url = models.URLField(blank=True, default="")
    demo_url = models.URLField(blank=True, default="")
    video_url = models.URLField(blank=True, default="")
    cover_image = models.URLField(blank=True, default="")
    gallery_images = models.JSONField(default=list, blank=True)
    tech_stack = models.JSONField(default=list, blank=True)
    tags = models.JSONField(default=list, blank=True)
    status = models.CharField(
        max_length=12,
        choices=Status.choices,
        default=Status.PUBLISHED,
    )
    rejection_reason = models.TextField(blank=True, default="")
    view_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user"], name="sproj_user_idx"),
        ]

    def __str__(self):
        return self.title
