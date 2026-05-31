"""
Download a Kaggle dataset into the data/ folder.

Usage:
    python scripts/download_dataset.py <dataset> [--file <filename>]

Examples:
    python scripts/download_dataset.py jealousleopard/goodreadsbooks
    python scripts/download_dataset.py jealousleopard/goodreadsbooks --file books.csv

Requirements:
    KAGGLE_USERNAME and KAGGLE_KEY must be set in .env (or in environment).
"""
import argparse
import logging
import os
import sys
from pathlib import Path

logging.basicConfig(level=logging.INFO, format='%(levelname)s %(message)s')
logger = logging.getLogger(__name__)

# ── Bootstrap Django ──────────────────────────────────────────────────────────
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')

import django
django.setup()

from django.conf import settings


def download(dataset: str, specific_file: str = '') -> None:
    username = settings.KAGGLE_USERNAME
    key = settings.KAGGLE_KEY

    if not username or not key:
        logger.error('KAGGLE_USERNAME та KAGGLE_KEY не налаштовані в .env')
        sys.exit(1)

    os.environ['KAGGLE_USERNAME'] = username
    os.environ['KAGGLE_KEY'] = key

    dest = Path(settings.DATASET_DIR) / dataset.replace('/', '_')
    dest.mkdir(parents=True, exist_ok=True)

    logger.info('Завантаження датасету "%s" → %s', dataset, dest)

    import subprocess

    if specific_file:
        cmd = ['kaggle', 'datasets', 'download', '-d', dataset, '-p', str(dest), '--unzip', '-f', specific_file]
    else:
        cmd = ['kaggle', 'datasets', 'download', '-d', dataset, '-p', str(dest), '--unzip']

    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        logger.error('Помилка завантаження:\n%s', result.stderr or result.stdout)
        sys.exit(1)

    logger.info(result.stdout.strip())

    csv_files = sorted(f.name for f in dest.iterdir() if f.suffix.lower() in ('.csv', '.json'))
    if csv_files:
        logger.info('Доступні файли у %s:', dest.relative_to(Path(settings.DATASET_DIR).parent))
        for name in csv_files:
            logger.info('  %s/%s', dataset.replace('/', '_'), name)
        logger.info(
            'Наступний крок — перегляд колонок:\n'
            '  python scripts/import_dataset.py %s/%s --preview',
            dataset.replace('/', '_'), csv_files[0],
        )
    else:
        logger.warning('CSV/JSON файлів не знайдено у %s', dest)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Завантажити датасет з Kaggle у папку data/.')
    parser.add_argument('dataset', help='Kaggle dataset path, напр. "jealousleopard/goodreadsbooks"')
    parser.add_argument('--file', default='', help='Конкретний файл у датасеті (опціонально)')
    args = parser.parse_args()

    download(args.dataset, args.file)
