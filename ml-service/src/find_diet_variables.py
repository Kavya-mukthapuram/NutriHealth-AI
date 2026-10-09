import pandas as pd

files = [
    "DR1TOT_L.xpt",
    "DR2TOT_L.xpt"
]

keywords = [
    "VITAMIN",
    "FOLATE",
    "CALCIUM",
    "MAGNESIUM",
    "IRON",
    "ZINC",
    "IODINE",
    "PROTEIN",
    "FAT",
    "FIBER",
    "SUGAR",
    "CARBOHYDRATE",
    "ENERGY",
    "B12",
    "VBC"
]

for file in files:
    df = pd.read_sas("data/raw/" + file, format="xport")

    print("\n" + "=" * 70)
    print(file)
    print("=" * 70)

    for column in df.columns:
        name = column.upper()

        if any(keyword in name for keyword in keywords):
            print(column)