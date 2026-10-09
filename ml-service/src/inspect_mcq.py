import pandas as pd

path = "data/raw/MCQ_L.xpt"

df = pd.read_sas(path, format="xport")

print("=" * 70)
print("MCQ_L.xpt")
print("=" * 70)

print("Rows:", len(df))
print("Columns:", len(df.columns))

print("\nColumn names:")
for column in df.columns:
    print(column)