# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0010_add_usercourse_completion_xp_awarded'),
    ]

    operations = [
        migrations.AddField(
            model_name='userflashcard',
            name='bookmark',
            field=models.BooleanField(default=False),
        ),
    ]
