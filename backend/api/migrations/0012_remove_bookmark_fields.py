# Generated migration

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0011_add_userflashcard_bookmark'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='userflashcard',
            name='bookmark',
        ),
        migrations.RemoveField(
            model_name='userlesson',
            name='bookmark',
        ),
    ]
