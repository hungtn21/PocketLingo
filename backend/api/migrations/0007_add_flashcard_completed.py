# Generated migration for flashcard completion tracking

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_remove_all_auth_user_fk'),
    ]

    operations = [
        migrations.AddField(
            model_name='userlesson',
            name='flashcard_completed',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='userlesson',
            name='flashcard_completed_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
