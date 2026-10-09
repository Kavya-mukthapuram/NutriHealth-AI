import pandas as pd
from pathlib import Path

data_path = Path("data/raw")

files = [
    "DEMO_L.xpt",
    "DR1TOT_L.xpt",
    "DR2TOT_L.xpt",
    "CBC_L.xpt",
    "FERTIN_L.xpt",
    "TFR_L.xpt",
    "FOLATE_L.xpt",
    "VID_L.xpt",
    "BIOPRO_L.xpt",
]

keywords = [
    "IRON",
    "FERRITIN",
    "TRANSFERRIN",
    "HEMOGLOBIN",
    "B12",
    "VITAMIN",
    "FOLATE",
    "CALCIUM",
    "MAGNESIUM",
    "ZINC",
    "IODINE",
    "PROTEIN",
    "CARBOHYDRATE",
    "FAT",
    "FIBER",
    "SUGAR",
    "ENERGY",
]

for file in files:
    path = data_path / file
    df = pd.read_sas(path, format="xport")

    print("\n" + "=" * 70)
    print(file)
    print("=" * 70)

    matches = []

    for column in df.columns:
        column_upper = column.upper()

        if any(keyword in column_upper for keyword in keywords):
            matches.append(column)

    for column in matches:
        print(column)