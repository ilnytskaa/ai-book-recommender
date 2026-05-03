from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='SearchQueryLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('query', models.TextField(verbose_name='Запит')),
                ('results_count', models.IntegerField(default=0, verbose_name='Кількість результатів')),
                ('used_rag', models.BooleanField(default=False, verbose_name='Використано RAG')),
                ('used_fallback', models.BooleanField(default=False, verbose_name='Використано fallback')),
                ('processing_time_ms', models.IntegerField(blank=True, null=True, verbose_name='Час обробки (мс)')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'verbose_name': 'Лог запиту',
                'verbose_name_plural': 'Логи запитів',
                'ordering': ['-created_at'],
            },
        ),
    ]
