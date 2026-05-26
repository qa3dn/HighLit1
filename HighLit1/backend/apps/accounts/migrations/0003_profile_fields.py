from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0002_user_major_user_university"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="banner_url",
            field=models.URLField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="user",
            name="github_username",
            field=models.CharField(blank=True, default="", max_length=39),
        ),
        migrations.AddField(
            model_name="user",
            name="profile_visibility",
            field=models.CharField(
                choices=[("PUBLIC", "Public"), ("PRIVATE", "Private")],
                default="PUBLIC",
                max_length=10,
            ),
        ),
        migrations.AddField(
            model_name="user",
            name="show_posts",
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name="user",
            name="show_code",
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name="user",
            name="show_ideas",
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name="user",
            name="show_activity",
            field=models.BooleanField(default=True),
        ),
    ]
