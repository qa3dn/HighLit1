from django.conf import settings
from django.db import models


class CodeProject(models.Model):
    """A multi-file code project (a lightweight, mini-GitHub-style repository)."""

    class Visibility(models.TextChoices):
        PUBLIC = "PUBLIC", "Public"  # listed + viewable by anyone
        UNLISTED = "UNLISTED", "Unlisted"  # viewable by direct link, not listed
        PRIVATE = "PRIVATE", "Private"  # owner only

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="code_projects"
    )
    name = models.CharField(max_length=180)
    slug = models.SlugField(max_length=200, unique=True)
    description = models.TextField(blank=True, default="")
    language = models.CharField(max_length=120, blank=True, default="")
    tags = models.JSONField(default=list, blank=True)
    readme = models.TextField(blank=True, default="")
    visibility = models.CharField(
        max_length=10, choices=Visibility.choices, default=Visibility.PUBLIC
    )
    github_url = models.URLField(blank=True, default="")
    linked_post = models.ForeignKey(
        "posts.Post",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="code_projects",
    )
    view_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]
        indexes = [
            models.Index(fields=["slug"], name="cproj_slug_idx"),
            models.Index(fields=["owner"], name="cproj_owner_idx"),
            models.Index(fields=["visibility"], name="cproj_visibility_idx"),
            models.Index(fields=["-updated_at"], name="cproj_updated_idx"),
        ]

    def __str__(self):
        return self.name


class CodeProjectFile(models.Model):
    """A single text file inside a project. Folder structure is expressed by the
    slash-separated ``path`` (e.g. ``src/index.ts``)."""

    project = models.ForeignKey(CodeProject, on_delete=models.CASCADE, related_name="files")
    path = models.CharField(max_length=300)
    content = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["path"]
        constraints = [
            models.UniqueConstraint(fields=["project", "path"], name="uniq_project_file_path"),
        ]
        indexes = [models.Index(fields=["project"], name="cprojfile_project_idx")]

    def __str__(self):
        return self.path


class CodeProjectUpdate(models.Model):
    """A lightweight, commit-like changelog entry for a project."""

    project = models.ForeignKey(CodeProject, on_delete=models.CASCADE, related_name="updates")
    message = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["project", "-created_at"], name="cprojupd_project_idx")]
