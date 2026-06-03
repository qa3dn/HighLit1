from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("posts", "0006_jobreview_created_idx"),
    ]

    operations = [
        migrations.AddIndex(
            model_name="comment",
            index=models.Index(fields=["user"], name="comment_user_idx"),
        ),
        migrations.AddIndex(
            model_name="job",
            index=models.Index(fields=["created_by"], name="job_created_by_idx"),
        ),
    ]
