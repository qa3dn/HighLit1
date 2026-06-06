from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("student_projects", "0001_initial"),
    ]

    operations = [
        migrations.AddIndex(
            model_name="studentproject",
            index=models.Index(fields=["user"], name="sproj_user_idx"),
        ),
    ]
