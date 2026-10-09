import pandas as pd
from pathlib import Path

data_path = Path("data/raw")

files = [
    "CBC_L.xpt",
    "FERTIN_L.xpt",
    "TFR_L.xpt",
    "FOLATE_L.xpt",
    "VID_L.xpt",
    "BIOPRO_L.xpt",
]

for file in files:
    path = data_path / file
    df = pd.read_sas(path, format="xport")

    print("\n" + "=" * 70)
    print(file)
    print("=" * 70)

    print("Number of columns:", len(df.columns))
    print("\nColumn names:")

    for column in df.columns:
        print(column)