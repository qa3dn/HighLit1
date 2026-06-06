from collections import Counter

from rest_framework import serializers

from .models import Comment, Job, JobApplication, JobReview, Post, Reaction, Space

MAX_CONTENT_LENGTH = 5000
MAX_TAGS = 10
MAX_TAG_LENGTH = 50


class PostSerializer(serializers.ModelSerializer):
    """Read shape for posts. Engagement counts come from queryset annotations
    when present (the feed/list views annotate them) and fall back to a count
    query for single-object views."""

    user_id = serializers.IntegerField(source="user.id", read_only=True)
    author = serializers.SerializerMethodField()
    reaction_count = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()
    reactions = serializers.SerializerMethodField()
    viewer_reactions = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = (
            "id",
            "user_id",
            "author",
            "is_anonymous",
            "title",
            "content",
            "type",
            "tags",
            "roast_mode",
            "reaction_count",
            "comment_count",
            "reactions",
            "viewer_reactions",
            "created_at",
        )

    def get_author(self, obj):
        # Anonymous posts never expose the real author identity.
        if obj.is_anonymous:
            return None
        user = obj.user
        return {
            "id": user.id,
            "username": user.username,
            "avatar_url": user.avatar_url,
            "rank": user.rank,
        }

    def get_reaction_count(self, obj) -> int:
        annotated = getattr(obj, "reaction_count", None)
        return annotated if annotated is not None else obj.reactions.count()

    def get_comment_count(self, obj) -> int:
        annotated = getattr(obj, "comment_count", None)
        return annotated if annotated is not None else obj.comments.count()

    def get_reactions(self, obj) -> list:
        # Per-type totals [{type, count}]. The view pre-computes a map for the
        # whole page (one query) to avoid an N+1; fall back to a per-object
        # count for single-object views.
        totals_map = self.context.get("reaction_totals")
        if totals_map is not None:
            return totals_map.get(obj.id, [])
        counts = Counter(obj.reactions.values_list("type", flat=True))
        return [{"type": key, "count": value} for key, value in counts.items()]

    def get_viewer_reactions(self, obj) -> list:
        # The view pre-computes {post_id: [types]} for the current user so the
        # feed avoids an N+1; absent that, return empty (anonymous viewer).
        viewer_map = self.context.get("viewer_reactions")
        if viewer_map is None:
            return []
        return list(viewer_map.get(obj.id, []))


class PostCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ("title", "content", "type", "tags", "is_anonymous")

    def validate_content(self, value: str) -> str:
        cleaned = (value or "").strip()
        if not cleaned:
            raise serializers.ValidationError("المحتوى مطلوب.")
        if len(cleaned) > MAX_CONTENT_LENGTH:
            raise serializers.ValidationError(
                f"المحتوى يتجاوز الحد الأقصى ({MAX_CONTENT_LENGTH} حرف)."
            )
        return cleaned

    def validate_title(self, value: str) -> str:
        return (value or "").strip()[:180]

    def validate_tags(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("الوسوم يجب أن تكون قائمة نصية.")
        cleaned = []
        for raw in value[:MAX_TAGS]:
            tag = str(raw).strip().lstrip("#")
            if tag and tag not in cleaned:
                cleaned.append(tag[:MAX_TAG_LENGTH])
        return cleaned


class CommentSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    author = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ("id", "post", "user_id", "author", "content", "created_at")
        read_only_fields = ("post",)

    def get_author(self, obj):
        return {
            "id": obj.user.id,
            "username": obj.user.username,
            "avatar_url": obj.user.avatar_url,
        }

    def validate_content(self, value: str) -> str:
        cleaned = (value or "").strip()
        if not cleaned:
            raise serializers.ValidationError("التعليق فارغ.")
        if len(cleaned) > MAX_CONTENT_LENGTH:
            raise serializers.ValidationError("التعليق طويل جداً.")
        return cleaned


class ReactionSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="user.id", read_only=True)

    class Meta:
        model = Reaction
        fields = ("id", "post", "user_id", "type", "created_at")
        read_only_fields = ("post",)


class JobSerializer(serializers.ModelSerializer):
    """Read shape for a job listing/detail. `company_detail` carries the linked
    company profile; `application_count`/`has_applied` come from view context to
    avoid N+1 (fall back to a per-object query for single-object views)."""

    company_detail = serializers.SerializerMethodField()
    application_count = serializers.SerializerMethodField()
    has_applied = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = (
            "id",
            "title",
            "company",
            "company_profile",
            "company_detail",
            "location",
            "description",
            "min_salary",
            "max_salary",
            "currency",
            "job_type",
            "employment_type",
            "workplace_type",
            "experience_level",
            "skills",
            "status",
            "is_featured",
            "application_deadline",
            "application_count",
            "has_applied",
            "created_by",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("created_by", "company", "is_featured", "status", "created_at", "updated_at")

    def get_company_detail(self, obj):
        company = obj.company_profile
        if not company:
            return None
        return {
            "id": company.id,
            "name": company.name,
            "slug": company.slug,
            "logo_url": company.logo_url,
            "is_verified": company.is_verified,
        }

    def get_application_count(self, obj) -> int:
        annotated = getattr(obj, "application_count", None)
        return annotated if annotated is not None else obj.applications.count()

    def get_has_applied(self, obj) -> bool:
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if not user or not user.is_authenticated:
            return False
        applied_ids = self.context.get("viewer_applied_ids")
        if applied_ids is not None:
            return obj.id in applied_ids
        return obj.applications.filter(applicant=user).exists()


class JobCreateSerializer(serializers.ModelSerializer):
    """Writable fields for a company posting/editing a job. `is_featured` is
    intentionally excluded — featuring is a paid/admin action, not self-serve."""

    class Meta:
        model = Job
        fields = (
            "title",
            "description",
            "location",
            "min_salary",
            "max_salary",
            "currency",
            "job_type",
            "employment_type",
            "workplace_type",
            "experience_level",
            "skills",
            "application_deadline",
            "status",
        )

    def validate_title(self, value: str) -> str:
        cleaned = (value or "").strip()
        if not cleaned:
            raise serializers.ValidationError("عنوان الوظيفة مطلوب.")
        return cleaned[:180]

    def validate_description(self, value: str) -> str:
        cleaned = (value or "").strip()
        if not cleaned:
            raise serializers.ValidationError("وصف الوظيفة مطلوب.")
        return cleaned

    def validate_skills(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("المهارات يجب أن تكون قائمة نصية.")
        cleaned = []
        for raw in value[:30]:
            skill = str(raw).strip()
            if skill and skill not in cleaned:
                cleaned.append(skill[:50])
        return cleaned

    def validate(self, data):
        mn = data.get("min_salary", 0) or 0
        mx = data.get("max_salary", 0) or 0
        if mn and mx and mn > mx:
            raise serializers.ValidationError("الحد الأدنى للراتب أكبر من الحد الأقصى.")
        return data


MAX_SKILLS = 30
MAX_SKILL_LENGTH = 40
MAX_PROFILE_ENTRIES = 12
EDUCATION_ENTRY_FIELDS = {
    "degree": 120,
    "field": 120,
    "institution": 160,
    "start_year": 12,
    "end_year": 12,
}
EXPERIENCE_ENTRY_FIELDS = {
    "title": 120,
    "company": 160,
    "start": 40,
    "end": 40,
    "description": 1000,
}


def normalize_skill_list(value) -> list:
    """Trim, de-duplicate (case-insensitive), and cap a list of skill strings."""
    if not isinstance(value, list):
        raise serializers.ValidationError("المهارات يجب أن تكون قائمة نصوص.")
    seen: set[str] = set()
    out: list[str] = []
    for item in value:
        if not isinstance(item, str):
            continue
        skill = item.strip()[:MAX_SKILL_LENGTH]
        key = skill.lower()
        if skill and key not in seen:
            seen.add(key)
            out.append(skill)
        if len(out) >= MAX_SKILLS:
            break
    return out


def normalize_profile_entries(value, allowed_fields: dict) -> list:
    """Coerce a list of dict entries (education/experience) to a fixed shape:
    only known keys, trimmed to per-field max lengths, empty entries dropped."""
    if not isinstance(value, list):
        raise serializers.ValidationError("القيمة يجب أن تكون قائمة.")
    out: list[dict] = []
    for raw in value[:MAX_PROFILE_ENTRIES]:
        if not isinstance(raw, dict):
            continue
        entry = {}
        for key, max_len in allowed_fields.items():
            field_value = raw.get(key, "")
            entry[key] = ("" if field_value is None else str(field_value)).strip()[:max_len]
        if any(entry.values()):
            out.append(entry)
    return out


APPLICATION_PROFILE_FIELDS = (
    "full_name",
    "headline",
    "email",
    "phone",
    "location",
    "photo_url",
    "cover_letter",
    "resume_url",
    "portfolio_url",
    "linkedin_url",
    "education",
    "experience",
    "skills",
)


class JobApplicationSerializer(serializers.ModelSerializer):
    """The applicant's own view of an application (and the create shape)."""

    job_detail = serializers.SerializerMethodField()

    class Meta:
        model = JobApplication
        fields = ("id", "job", "job_detail", *APPLICATION_PROFILE_FIELDS, "status", "created_at")
        read_only_fields = ("id", "job", "status", "created_at")

    def get_job_detail(self, obj):
        job = obj.job
        return {
            "id": job.id,
            "title": job.title,
            "company": job.company_profile.name if job.company_profile else job.company,
        }

    def validate_cover_letter(self, value: str) -> str:
        return (value or "").strip()[:5000]

    def validate_full_name(self, value: str) -> str:
        return (value or "").strip()[:120]

    def validate_headline(self, value: str) -> str:
        return (value or "").strip()[:160]

    def validate_phone(self, value: str) -> str:
        return (value or "").strip()[:40]

    def validate_location(self, value: str) -> str:
        return (value or "").strip()[:120]

    def validate_skills(self, value) -> list:
        return normalize_skill_list(value)

    def validate_education(self, value) -> list:
        return normalize_profile_entries(value, EDUCATION_ENTRY_FIELDS)

    def validate_experience(self, value) -> list:
        return normalize_profile_entries(value, EXPERIENCE_ENTRY_FIELDS)


class JobApplicantSerializer(serializers.ModelSerializer):
    """A company/admin's view of one applicant. Contact details (email/phone)
    are only serialized when the view sets `show_contact` in context
    (plan-gated). Skill match is computed against the job's required skills."""

    applicant = serializers.SerializerMethodField()
    matched_skills = serializers.SerializerMethodField()
    missing_skills = serializers.SerializerMethodField()
    skill_match = serializers.SerializerMethodField()

    class Meta:
        model = JobApplication
        fields = (
            "id",
            "applicant",
            "full_name",
            "headline",
            "email",
            "phone",
            "location",
            "photo_url",
            "cover_letter",
            "resume_url",
            "portfolio_url",
            "linkedin_url",
            "education",
            "experience",
            "skills",
            "matched_skills",
            "missing_skills",
            "skill_match",
            "status",
            "created_at",
        )

    def _job_skills(self, obj) -> list:
        # Prefer the job passed in context (all applicants share one job in the
        # list view) so we don't re-query `obj.job` per row.
        job = self.context.get("job") or obj.job
        raw = job.skills if isinstance(job.skills, list) else []
        return [str(s).strip() for s in raw if str(s).strip()]

    def _applicant_skill_keys(self, obj) -> set:
        raw = obj.skills if isinstance(obj.skills, list) else []
        return {str(s).strip().lower() for s in raw if str(s).strip()}

    def get_matched_skills(self, obj) -> list:
        keys = self._applicant_skill_keys(obj)
        return [s for s in self._job_skills(obj) if s.lower() in keys]

    def get_missing_skills(self, obj) -> list:
        keys = self._applicant_skill_keys(obj)
        return [s for s in self._job_skills(obj) if s.lower() not in keys]

    def get_skill_match(self, obj):
        job_skills = self._job_skills(obj)
        if not job_skills:
            return None
        matched = len(self.get_matched_skills(obj))
        return round(matched / len(job_skills) * 100)

    def get_applicant(self, obj):
        user = obj.applicant
        data = {
            "id": user.id,
            "username": user.username,
            "avatar_url": getattr(user, "avatar_url", ""),
            "rank": getattr(user, "rank", ""),
        }
        if self.context.get("show_contact"):
            data["email"] = user.email
            data["github_username"] = getattr(user, "github_username", "")
            data["university"] = getattr(user, "university", "")
            data["major"] = getattr(user, "major", "")
        return data

    def to_representation(self, obj):
        data = super().to_representation(obj)
        # Contact channels are plan-gated; hide them unless the viewer's plan
        # (or admin) unlocked contact details.
        if not self.context.get("show_contact"):
            data.pop("email", None)
            data.pop("phone", None)
        return data


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
