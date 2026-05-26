import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Company",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=160)),
                ("slug", models.SlugField(max_length=180, unique=True)),
                ("tagline", models.CharField(blank=True, default="", max_length=200)),
                ("about", models.TextField(blank=True, default="")),
                ("industry", models.CharField(blank=True, default="", max_length=120)),
                ("size", models.CharField(choices=[("SOLO", "1"), ("SMALL", "2-10"), ("MEDIUM", "11-50"), ("LARGE", "51-200"), ("ENTERPRISE", "201+")], default="SMALL", max_length=12)),
                ("location", models.CharField(blank=True, default="", max_length=160)),
                ("website", models.URLField(blank=True, default="")),
                ("logo_url", models.URLField(blank=True, default="")),
                ("banner_url", models.URLField(blank=True, default="")),
                ("founded_year", models.PositiveIntegerField(blank=True, null=True)),
                ("is_verified", models.BooleanField(default=False)),
                ("follower_count", models.PositiveIntegerField(default=0)),
                ("owner", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="owned_companies", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.AddIndex(
            model_name="company",
            index=models.Index(fields=["slug"], name="comp_slug_idx"),
        ),
        migrations.AddIndex(
            model_name="company",
            index=models.Index(fields=["industry"], name="comp_indus_idx"),
        ),
        migrations.AddIndex(
            model_name="company",
            index=models.Index(fields=["is_verified"], name="comp_verif_idx"),
        ),
        migrations.AddIndex(
            model_name="company",
            index=models.Index(fields=["owner"], name="comp_owner_idx"),
        ),
        migrations.CreateModel(
            name="CompanyMember",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("role", models.CharField(choices=[("OWNER", "Owner"), ("ADMIN", "Admin"), ("EMPLOYEE", "Employee")], default="EMPLOYEE", max_length=10)),
                ("title", models.CharField(blank=True, default="", max_length=120)),
                ("joined_at", models.DateTimeField(auto_now_add=True)),
                ("company", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="members", to="companies.company")),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="company_memberships", to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddIndex(
            model_name="companymember",
            index=models.Index(fields=["company"], name="cmember_comp_idx"),
        ),
        migrations.AddIndex(
            model_name="companymember",
            index=models.Index(fields=["user"], name="cmember_user_idx"),
        ),
        migrations.AddConstraint(
            model_name="companymember",
            constraint=models.UniqueConstraint(fields=["company", "user"], name="uniq_company_member"),
        ),
        migrations.CreateModel(
            name="CompanyFollow",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("company", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="followers", to="companies.company")),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="company_follows", to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddIndex(
            model_name="companyfollow",
            index=models.Index(fields=["company"], name="cfollow_comp_idx"),
        ),
        migrations.AddIndex(
            model_name="companyfollow",
            index=models.Index(fields=["user"], name="cfollow_user_idx"),
        ),
        migrations.AddConstraint(
            model_name="companyfollow",
            constraint=models.UniqueConstraint(fields=["company", "user"], name="uniq_company_follow"),
        ),
        migrations.CreateModel(
            name="CompanyPost",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("content", models.TextField()),
                ("media_url", models.URLField(blank=True, default="")),
                ("comment_count", models.PositiveIntegerField(default=0)),
                ("author", models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="company_posts", to=settings.AUTH_USER_MODEL)),
                ("company", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="posts", to="companies.company")),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.AddIndex(
            model_name="companypost",
            index=models.Index(fields=["company", "-created_at"], name="cpost_comp_created_idx"),
        ),
        migrations.CreateModel(
            name="CompanyPostReaction",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("type", models.CharField(default="LIKE", max_length=30)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("post", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="reactions", to="companies.companypost")),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="company_post_reactions", to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddIndex(
            model_name="companypostreaction",
            index=models.Index(fields=["post"], name="creaction_post_idx"),
        ),
        migrations.AddConstraint(
            model_name="companypostreaction",
            constraint=models.UniqueConstraint(fields=["post", "user", "type"], name="uniq_company_post_reaction"),
        ),
        migrations.CreateModel(
            name="CompanyPostComment",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("content", models.TextField()),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("post", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="comments", to="companies.companypost")),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="company_post_comments", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.AddIndex(
            model_name="companypostcomment",
            index=models.Index(fields=["post", "-created_at"], name="ccomment_post_created_idx"),
        ),
        migrations.CreateModel(
            name="CompanyMedia",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("url", models.URLField()),
                ("caption", models.CharField(blank=True, default="", max_length=200)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("company", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="media", to="companies.company")),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.AddIndex(
            model_name="companymedia",
            index=models.Index(fields=["company"], name="cmedia_comp_idx"),
        ),
    ]
