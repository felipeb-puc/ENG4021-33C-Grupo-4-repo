from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('nexoapp', '0002_favorito'),
    ]

    operations = [
        migrations.AddField(
            model_name='oportunidade',
            name='periodo_minimo',
            field=models.IntegerField(default=1),
        ),
    ]
