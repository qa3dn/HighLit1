from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        USER = "USER", "User"
        ADMIN = "ADMIN", "Admin"
        COMPANY = "COMPANY", "Company"

    class Visibility(models.TextChoices):
        PUBLIC = "PUBLIC", "Public"
        PRIVATE = "PRIVATE", "Private"

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.USER)
    rank = models.CharField(max_length=50, default="NOVICE")
    reputation_points = models.IntegerField(default=0)
    bio = models.TextField(blank=True, default="")
    avatar_url = models.URLField(blank=True, default="")
    banner_url = models.URLField(blank=True, default="")
    status_text = models.CharField(max_length=160, blank=True, default="")
    university = models.CharField(max_length=120, blank=True, default="")
    major = models.CharField(max_length=120, blank=True, default="")
    github_username = models.CharField(max_length=39, blank=True, default="")

    # Privacy controls (enforced server-side by the public-profile endpoint).
    profile_visibility = models.CharField(
        max_length=10, choices=Visibility.choices, default=Visibility.PUBLIC
    )
    show_posts = models.BooleanField(default=True)
    show_code = models.BooleanField(default=True)
    show_ideas = models.BooleanField(default=True)
    show_activity = models.BooleanField(default=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]
