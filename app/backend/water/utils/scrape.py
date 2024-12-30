# type: ignore

import pandas as pd
import water.utils.parse as p
import os
import numpy as np
import boto3
import importlib
import requests

folder_download = p.folder_raw


def get_files():
    files = os.listdir(folder_download)
    return sorted([f for f in files if f.endswith(".pdf")])


def get_most_recent_date():
    file = get_files()[-1]

    date = file.split(".")[0]
    return date.replace("_", "-")


def url(date):
    return f"https://portalrediam.cica.es/descargas/index.php/s/mxHMWXyHfrCxyNK/download?path=%2F04_RECURSOS_NATURALES%2F04_AGUAS%2F01_SUPERFICIALES%2F00_SUPERFICIALES%2FEmbalses_al_dia%2FDocumentos%2Fpdf%2Freserva&files={date}.pdf"


def download_pdfs_to_latest(start_date=None, overwrite=False):
    if not start_date:
        start_date = get_most_recent_date()
    end_date = pd.Timestamp.today().strftime("%Y-%m-%d")
    dates_in_range = pd.date_range(start_date, end_date, freq="D")

    for date in dates_in_range:
        date_str = date.strftime("%Y_%m_%d")
        file = f"{date_str}.pdf"
        filename_full = os.path.join(folder_download, file)
        if not os.path.exists(filename_full) or overwrite:
            response = requests.get(url(date_str))
            if len(response.content) > 10240:  # 10 KB
                with open(filename_full, "wb") as f:
                    f.write(response.content)
                print("Downloaded", file)
            else:
                print(f"{file} not downloaded, content too small")
            print("Downloaded", file)
        else:
            print(f"{file} skipped")


def move_pdfs_to_clean_folder():
    for root, dirs, files in os.walk(p.folder_raw):
        for file in files:
            if file.endswith(".pdf"):
                # Copy the file to the folder_new
                filename_new = p.folder_new + "/" + file
                # Get the old file, expanding the sub-path
                filename_old = os.path.join(root, file)
                # Copy from old to new if new does not exist
                if not os.path.exists(filename_new):
                    os.system("cp " + filename_old + " " + filename_new)
