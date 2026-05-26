from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("posts", "0002_job_company_profile"),
    ]

    operations = [
        migrations.AddField(
            model_name="post",
            name="is_anonymous",
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name="post",
            name="title",
            field=models.CharField(blank=True, default="", max_length=180),
        ),
        migrations.AlterModelOptions(
            name="post",
            options={"ordering": ["-created_at"]},
        ),
        migrations.AddIndex(
            model_name="post",
            index=models.Index(fields=["type", "-created_at"], name="post_type_created_idx"),
        ),
        migrations.AddIndex(
            model_name="post",
            index=models.Index(fields=["-created_at"], name="post_created_idx"),
        ),
        migrations.AddIndex(
            model_name="post",
            index=models.Index(fields=["user"], name="post_user_idx"),
        ),
    ]
