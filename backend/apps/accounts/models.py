from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        USER = "USER", "User"
        ADMIN = "ADMIN", "Admin"
        COMPANY = "COMPANY", "Company"

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.USER)
    rank = models.CharField(max_length=50, default="NOVICE")
    reputation_points = models.IntegerField(default=0)
    bio = models.TextField(blank=True, default="")
    avatar_url = models.URLField(blank=True, default="")
    status_text = models.CharField(max_length=160, blank=True, default="")

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]
