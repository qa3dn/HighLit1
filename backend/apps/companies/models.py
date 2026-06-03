from django.conf import settings
from django.db import models


class TimestampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Company(TimestampedModel):
    class Size(models.TextChoices):
        SOLO = "SOLO", "1"
        SMALL = "SMALL", "2-10"
        MEDIUM = "MEDIUM", "11-50"
        LARGE = "LARGE", "51-200"
        ENTERPRISE = "ENTERPRISE", "201+"

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="owned_companies"
    )
    name = models.CharField(max_length=160)
    slug = models.SlugField(max_length=180, unique=True)
    tagline = models.CharField(max_length=200, blank=True, default="")
    about = models.TextField(blank=True, default="")
    industry = models.CharField(max_length=120, blank=True, default="")
    size = models.CharField(max_length=12, choices=Size.choices, default=Size.SMALL)
    location = models.CharField(max_length=160, blank=True, default="")
    website = models.URLField(blank=True, default="")
    logo_url = models.URLField(blank=True, default="")
    banner_url = models.URLField(blank=True, default="")
    founded_year = models.PositiveIntegerField(null=True, blank=True)
    # Approval workflow: a user submits a company (PENDING); an admin approves
    # it (APPROVED) before it is publicly visible / can post jobs.
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    review_note = models.CharField(max_length=300, blank=True, default="")
    # Verified badge — distinct from approval (a vetted/official company).
    is_verified = models.BooleanField(default=False)
    follower_count = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["slug"], name="comp_slug_idx"),
            models.Index(fields=["industry"], name="comp_indus_idx"),
            models.Index(fields=["is_verified"], name="comp_verif_idx"),
            models.Index(fields=["owner"], name="comp_owner_idx"),
            models.Index(fields=["status"], name="comp_status_idx"),
        ]

    def __str__(self):
        return self.name


class CompanyMember(models.Model):
    class Role(models.TextChoices):
        OWNER = "OWNER", "Owner"
        ADMIN = "ADMIN", "Admin"
        EMPLOYEE = "EMPLOYEE", "Employee"

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="members")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="company_memberships"
    )
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.EMPLOYEE)
    title = models.CharField(max_length=120, blank=True, default="")
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["company", "user"], name="uniq_company_member"),
        ]
        indexes = [
            models.Index(fields=["company"], name="cmember_comp_idx"),
            models.Index(fields=["user"], name="cmember_user_idx"),
        ]


class CompanyFollow(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="followers")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="company_follows"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["company", "user"], name="uniq_company_follow"),
        ]
        indexes = [
            models.Index(fields=["company"], name="cfollow_comp_idx"),
            models.Index(fields=["user"], name="cfollow_user_idx"),
        ]


class CompanyPost(TimestampedModel):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="posts")
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="company_posts"
    )
    content = models.TextField()
    media_url = models.URLField(blank=True, default="")
    comment_count = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["company", "-created_at"], name="cpost_comp_created_idx"),
        ]


class CompanyPostReaction(models.Model):
    post = models.ForeignKey(CompanyPost, on_delete=models.CASCADE, related_name="reactions")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="company_post_reactions"
    )
    type = models.CharField(max_length=30, default="LIKE")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["post", "user", "type"], name="uniq_company_post_reaction"
            ),
        ]
        indexes = [models.Index(fields=["post"], name="creaction_post_idx")]


class CompanyPostComment(models.Model):
    post = models.ForeignKey(CompanyPost, on_delete=models.CASCADE, related_name="comments")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="company_post_comments"
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["post", "-created_at"], name="ccomment_post_created_idx")]


class CompanyMedia(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="media")
    url = models.URLField()
    caption = models.CharField(max_length=200, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["company"], name="cmedia_comp_idx")]


class SubscriptionPlan(models.Model):
    """A billing tier. Seeded as editable data (see the seed data migration),
    so prices/limits change without a schema change. The limits drive job-post
    quotas and how many applicants a company may see per job."""

    class Tier(models.TextChoices):
        FREE = "FREE", "Free"
        BASIC = "BASIC", "Basic"
        PRO = "PRO", "Pro"
        ENTERPRISE = "ENTERPRISE", "Enterprise"

    tier = models.CharField(max_length=12, choices=Tier.choices, unique=True)
    name = models.CharField(max_length=80)
    description = models.CharField(max_length=255, blank=True, default="")
    price = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    currency = models.CharField(max_length=8, default="JOD")
    max_active_jobs = models.PositiveIntegerField(default=1)
    max_visible_applicants = models.PositiveIntegerField(default=5)
    can_view_applicant_contact = models.BooleanField(default=False)
    allows_featured_jobs = models.BooleanField(default=False)
    duration_days = models.PositiveIntegerField(default=30)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "price"]

    def __str__(self):
        return self.name


class CompanySubscription(TimestampedModel):
    """A company's request for / grant of a plan. Created PENDING by the
    company; an admin activates or rejects it (no payment gateway — manual
    activation per product spec)."""

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        ACTIVE = "ACTIVE", "Active"
        REJECTED = "REJECTED", "Rejected"
        EXPIRED = "EXPIRED", "Expired"
        CANCELLED = "CANCELLED", "Cancelled"

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="subscriptions")
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.PROTECT, related_name="subscriptions")
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.PENDING)
    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="requested_subscriptions",
    )
    activated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="activated_subscriptions",
    )
    activated_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    note = models.CharField(max_length=300, blank=True, default="")

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["company", "status"], name="csub_comp_status_idx"),
            models.Index(fields=["status"], name="csub_status_idx"),
        ]


class PromoCode(models.Model):
    """Admin-managed discount applied to a subscription purchase: a percentage
    (0–100) or a fixed amount in the plan's currency (JOD). Optionally limited to
    one plan, a validity window, and a maximum number of redemptions."""

    class DiscountType(models.TextChoices):
        PERCENT = "PERCENT", "Percent"
        FIXED = "FIXED", "Fixed"

    code = models.CharField(max_length=40, unique=True)
    discount_type = models.CharField(
        max_length=10, choices=DiscountType.choices, default=DiscountType.PERCENT
    )
    amount = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    plan = models.ForeignKey(
        SubscriptionPlan,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="promo_codes",
    )
    valid_from = models.DateTimeField(null=True, blank=True)
    valid_until = models.DateTimeField(null=True, blank=True)
    max_uses = models.PositiveIntegerField(null=True, blank=True)
    used_count = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.code

    def is_redeemable(self) -> bool:
        """Whether the code can be applied right now (active, in-window, under
        its usage cap)."""
        from django.utils import timezone

        if not self.is_active:
            return False
        now = timezone.now()
        if self.valid_from and now < self.valid_from:
            return False
        if self.valid_until and now > self.valid_until:
            return False
        if self.max_uses is not None and self.used_count >= self.max_uses:
            return False
        return True


class Invoice(models.Model):
    """A bill for a subscription (or campaign). Money is Decimal in the plan's
    currency. `total` is the net payable after any promo discount."""

    class Status(models.TextChoices):
        OPEN = "OPEN", "Open"
        PAID = "PAID", "Paid"
        VOID = "VOID", "Void"

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="invoices")
    subscription = models.ForeignKey(
        CompanySubscription,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="invoices",
    )
    description = models.CharField(max_length=200, blank=True, default="")
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    currency = models.CharField(max_length=8, default="JOD")
    promo_code = models.ForeignKey(
        PromoCode, null=True, blank=True, on_delete=models.SET_NULL, related_name="invoices"
    )
    status = models.CharField(max_length=8, choices=Status.choices, default=Status.OPEN)
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["company", "status"], name="invoice_comp_status_idx"),
            models.Index(fields=["status"], name="invoice_status_idx"),
        ]

    def __str__(self):
        return f"Invoice #{self.pk} ({self.total} {self.currency})"


class Payment(models.Model):
    """A settlement record against an invoice. `idempotency_key` is unique so a
    retried manual settle or a re-delivered webhook is a no-op (DB-enforced)."""

    class Gateway(models.TextChoices):
        MANUAL = "MANUAL", "Manual"
        CLIQ = "CLIQ", "CliQ"
        CLICK = "CLICK", "Click"

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        SUCCEEDED = "SUCCEEDED", "Succeeded"
        FAILED = "FAILED", "Failed"

    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name="payments")
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    currency = models.CharField(max_length=8, default="JOD")
    gateway = models.CharField(max_length=10, choices=Gateway.choices, default=Gateway.MANUAL)
    gateway_ref = models.CharField(max_length=128, blank=True, default="")
    idempotency_key = models.CharField(max_length=128, unique=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    raw = models.JSONField(default=dict, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="recorded_payments",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    settled_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["invoice"], name="payment_invoice_idx"),
            models.Index(fields=["status"], name="payment_status_idx"),
        ]

    def __str__(self):
        return f"Payment #{self.pk} {self.status} ({self.gateway})"


class PromotionCampaign(models.Model):
    """A paid, time-boxed promotion — featuring a job (or the company) for a
    period. Activating sets the target job's `is_featured` flag; ending clears
    it. Priced like a one-off invoice (the free `is_featured` toggle, monetized)."""

    class Target(models.TextChoices):
        JOB = "JOB", "Job"
        COMPANY = "COMPANY", "Company"

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        ACTIVE = "ACTIVE", "Active"
        REJECTED = "REJECTED", "Rejected"
        EXPIRED = "EXPIRED", "Expired"
        CANCELLED = "CANCELLED", "Cancelled"

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="campaigns")
    name = models.CharField(max_length=160)
    target_type = models.CharField(max_length=10, choices=Target.choices, default=Target.JOB)
    job = models.ForeignKey(
        "posts.Job", null=True, blank=True, on_delete=models.SET_NULL, related_name="promotions"
    )
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    currency = models.CharField(max_length=8, default="JOD")
    starts_at = models.DateTimeField()
    ends_at = models.DateTimeField()
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    invoice = models.ForeignKey(
        Invoice, null=True, blank=True, on_delete=models.SET_NULL, related_name="campaigns"
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="created_campaigns",
    )
    activated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="activated_campaigns",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status"], name="campaign_status_idx"),
            models.Index(fields=["company", "status"], name="campaign_comp_status_idx"),
        ]

    def __str__(self):
        return self.name
