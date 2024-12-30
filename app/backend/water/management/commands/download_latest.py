# type: ignore

import pandas as pd
import water.utils.parse as p
import os
import numpy as np
import boto3
import importlib
from django.core.management.base import BaseCommand, CommandError
import water.utils.scrape as ws


class Command(BaseCommand):
    help = "Downloads and prepares the latest data"

    def handle(self, *args, **options):
        ws.download_pdfs_to_latest()
        ws.move_pdfs_to_clean_folder()
        p.parse_full()  # Takes about 1 min per 10 files
        p.cleaned_data_to_csv()
