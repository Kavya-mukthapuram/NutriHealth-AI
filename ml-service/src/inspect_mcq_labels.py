import pandas as pd

path = "data/raw/MCQ_L.xpt"

df = pd.read_sas(path, format="xport")

print("=" * 70)
print("MCQ_L VARIABLE DETAILS")
print("=" * 70)

for column in df.columns:
    print(column, "->", df[column].dtype)

print("\nSample data:")
print(df.head())