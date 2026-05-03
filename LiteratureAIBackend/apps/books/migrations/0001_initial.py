from django.db import migrations, models
import pgvector.django


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        # Enable pgvector extension
        migrations.RunSQL(
            sql='CREATE EXTENSION IF NOT EXISTS vector;',
            reverse_sql='DROP EXTENSION IF EXISTS vector;',
        ),
        migrations.CreateModel(
            name='Book',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=512, verbose_name='Назва')),
                ('author', models.CharField(max_length=255, verbose_name='Автор')),
                ('description', models.TextField(verbose_name='Опис')),
                ('genre', models.CharField(max_length=128, verbose_name='Жанр')),
                ('year', models.IntegerField(blank=True, null=True, verbose_name='Рік видання')),
                ('rating', models.FloatField(blank=True, null=True, verbose_name='Рейтинг')),
                ('embedding', pgvector.django.VectorField(blank=True, dimensions=1536, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Книга',
                'verbose_name_plural': 'Книги',
                'ordering': ['title'],
            },
        ),
        migrations.AddIndex(
            model_name='book',
            index=models.Index(fields=['genre'], name='books_book_genre_idx'),
        ),
        migrations.AddIndex(
            model_name='book',
            index=models.Index(fields=['author'], name='books_book_author_idx'),
        ),
        migrations.AddIndex(
            model_name='book',
            index=models.Index(fields=['year'], name='books_book_year_idx'),
        ),
    ]
