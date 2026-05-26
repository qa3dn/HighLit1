import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("posts", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="CodeProject",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=180)),
                ("slug", models.SlugField(max_length=200, unique=True)),
                ("description", models.TextField(blank=True, default="")),
                ("language", models.CharField(blank=True, default="", max_length=120)),
                ("tags", models.JSONField(blank=True, default=list)),
                ("readme", models.TextField(blank=True, default="")),
                ("visibility", models.CharField(choices=[("PUBLIC", "Public"), ("UNLISTED", "Unlisted"), ("PRIVATE", "Private")], default="PUBLIC", max_length=10)),
                ("github_url", models.URLField(blank=True, default="")),
                ("view_count", models.PositiveIntegerField(default=0)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("linked_post", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="code_projects", to="posts.post")),
                ("owner", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="code_projects", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["-updated_at"]},
        ),
        migrations.AddIndex(
            model_name="codeproject",
            index=models.Index(fields=["slug"], name="cproj_slug_idx"),
        ),
        migrations.AddIndex(
            model_name="codeproject",
            index=models.Index(fields=["owner"], name="cproj_owner_idx"),
        ),
        migrations.AddIndex(
            model_name="codeproject",
            index=models.Index(fields=["visibility"], name="cproj_visibility_idx"),
        ),
        migrations.AddIndex(
            model_name="codeproject",
            index=models.Index(fields=["-updated_at"], name="cproj_updated_idx"),
        ),
        migrations.CreateModel(
            name="CodeProjectFile",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("path", models.CharField(max_length=300)),
                ("content", models.TextField(blank=True, default="")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("project", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="files", to="code_projects.codeproject")),
            ],
            options={"ordering": ["path"]},
        ),
        migrations.AddIndex(
            model_name="codeprojectfile",
            index=models.Index(fields=["project"], name="cprojfile_project_idx"),
        ),
        migrations.AddConstraint(
            model_name="codeprojectfile",
            constraint=models.UniqueConstraint(fields=["project", "path"], name="uniq_project_file_path"),
        ),
        migrations.CreateModel(
            name="CodeProjectUpdate",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("message", models.CharField(max_length=200)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("project", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="updates", to="code_projects.codeproject")),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.AddIndex(
            model_name="codeprojectupdate",
            index=models.Index(fields=["project", "-created_at"], name="cprojupd_project_idx"),
        ),
    ]
