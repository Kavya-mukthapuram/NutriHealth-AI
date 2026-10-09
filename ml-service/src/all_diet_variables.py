import pandas as pd

files = [
    "DR1TOT_L.xpt",
    "DR2TOT_L.xpt"
]

for file in files:
    df = pd.read_sas("data/raw/" + file, format="xport")

    print("\n" + "=" * 70)
    print(file)
    print("Number of columns:", len(df.columns))
    print("=" * 70)

    for column in df.columns:
        print(column)