from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("posts", "0007_comment_job_user_indexes"),
    ]

    operations = [
        migrations.AddField(
            model_name="jobapplication",
            name="full_name",
            field=models.CharField(blank=True, default="", max_length=120),
        ),
        migrations.AddField(
            model_name="jobapplication",
            name="headline",
            field=models.CharField(blank=True, default="", max_length=160),
        ),
        migrations.AddField(
            model_name="jobapplication",
            name="email",
            field=models.EmailField(blank=True, default="", max_length=254),
        ),
        migrations.AddField(
            model_name="jobapplication",
            name="phone",
            field=models.CharField(blank=True, default="", max_length=40),
        ),
        migrations.AddField(
            model_name="jobapplication",
            name="location",
            field=models.CharField(blank=True, default="", max_length=120),
        ),
        migrations.AddField(
            model_name="jobapplication",
            name="photo_url",
            field=models.URLField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="jobapplication",
            name="portfolio_url",
            field=models.URLField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="jobapplication",
            name="linkedin_url",
            field=models.URLField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="jobapplication",
            name="education",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name="jobapplication",
            name="experience",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name="jobapplication",
            name="skills",
            field=models.JSONField(blank=True, default=list),
        ),
    ]
