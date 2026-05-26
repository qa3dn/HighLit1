from django.conf import settings
from django.db import models


class Post(models.Model):
    class PostType(models.TextChoices):
        RANT = "RANT", "Rant"
        CODE = "CODE", "Code"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="posts")
    title = models.CharField(max_length=180, blank=True, default="")
    content = models.TextField()
    type = models.CharField(max_length=10, choices=PostType.choices, default=PostType.RANT)
    tags = models.JSONField(default=list, blank=True)
    roast_mode = models.BooleanField(default=False)
    # Admin moderation: hidden content stays in the DB (reversible) but is
    # excluded from every public-facing query. Distinct from roast_mode.
    is_hidden = models.BooleanField(default=False)
    is_anonymous = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["type", "-created_at"], name="post_type_created_idx"),
            models.Index(fields=["-created_at"], name="post_created_idx"),
            models.Index(fields=["user"], name="post_user_idx"),
        ]


class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comments")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="comments")
    content = models.TextField()
    is_hidden = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)


class Reaction(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="reactions")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reactions")
    type = models.CharField(max_length=30)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("post", "user", "type")


class Job(models.Model):
    class JobType(models.TextChoices):
        PAID = "PAID", "Paid"
        INTERNSHIP = "INTERNSHIP", "Internship"
        FREELANCE = "FREELANCE", "Freelance"

    class Employment(models.TextChoices):
        FULL_TIME = "FULL_TIME", "Full time"
        PART_TIME = "PART_TIME", "Part time"
        CONTRACT = "CONTRACT", "Contract"
        TEMPORARY = "TEMPORARY", "Temporary"

    class Workplace(models.TextChoices):
        ONSITE = "ONSITE", "On-site"
        REMOTE = "REMOTE", "Remote"
        HYBRID = "HYBRID", "Hybrid"

    class Experience(models.TextChoices):
        ENTRY = "ENTRY", "Entry"
        MID = "MID", "Mid"
        SENIOR = "SENIOR", "Senior"
        LEAD = "LEAD", "Lead"

    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        PUBLISHED = "PUBLISHED", "Published"
        CLOSED = "CLOSED", "Closed"

    title = models.CharField(max_length=180)
    company = models.CharField(max_length=180)  # display name (legacy / free text)
    # Optional link to a structured company profile (LinkedIn-style portal).
    company_profile = models.ForeignKey(
        "companies.Company",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="jobs",
    )
    location = models.CharField(max_length=120, blank=True, default="")
    description = models.TextField()
    min_salary = models.IntegerField(default=0)
    max_salary = models.IntegerField(default=0)
    currency = models.CharField(max_length=8, default="JOD")
    job_type = models.CharField(max_length=12, choices=JobType.choices, default=JobType.PAID)
    employment_type = models.CharField(max_length=12, choices=Employment.choices, default=Employment.FULL_TIME)
    workplace_type = models.CharField(max_length=8, choices=Workplace.choices, default=Workplace.ONSITE)
    experience_level = models.CharField(max_length=8, choices=Experience.choices, default=Experience.ENTRY)
    skills = models.JSONField(default=list, blank=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PUBLISHED)
    # Paid promotion ("advertising") — surfaced first in listings.
    is_featured = models.BooleanField(default=False)
    application_deadline = models.DateField(null=True, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="jobs")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-is_featured", "-created_at"]
        indexes = [
            models.Index(fields=["status", "job_type", "-created_at"], name="job_status_type_idx"),
        ]


class JobReview(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="reviews")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="job_reviews")
    rating = models.IntegerField(default=5)
    comment = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)


class JobApplication(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        REVIEWED = "REVIEWED", "Reviewed"
        SHORTLISTED = "SHORTLISTED", "Shortlisted"
        REJECTED = "REJECTED", "Rejected"
        ACCEPTED = "ACCEPTED", "Accepted"

    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="applications")
    applicant = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="job_applications"
    )
    cover_letter = models.TextField(blank=True, default="")
    resume_url = models.URLField(blank=True, default="")
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(fields=["job", "applicant"], name="uniq_job_application"),
        ]
        indexes = [
            models.Index(fields=["job", "-created_at"], name="japp_job_created_idx"),
            models.Index(fields=["applicant"], name="japp_applicant_idx"),
        ]


class Space(models.Model):
    title = models.CharField(max_length=180)
    description = models.TextField(blank=True, default="")
    is_live = models.BooleanField(default=False)
    host = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="spaces")
    created_at = models.DateTimeField(auto_now_add=True)
