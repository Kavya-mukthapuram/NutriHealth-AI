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

for file in files:
    path = data_path / file

    df = pd.read_sas(path, format="xport")

    print("\n" + "=" * 60)
    print(file)
    print("=" * 60)

    print("Rows:", len(df))
    print("Columns:", len(df.columns))

    print("\nColumn names:")
    print(df.columns.tolist())