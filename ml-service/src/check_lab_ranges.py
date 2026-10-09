import pandas as pd

path = "data/processed/nutrition_ml_dataset.csv"

df = pd.read_csv(path)

lab_columns = [
    "LBXHGB",
    "LBXFER",
    "LBXTFR",
    "LBDRFO",
    "LBXVIDMS",
    "LBXSIR",
    "LBXMAGN",
    "LBXSCA"
]

print("=" * 70)
print("LAB VALUE ANALYSIS")
print("=" * 70)

for column in lab_columns:
    print("\n" + "-" * 60)
    print(column)

    print("Available values:", df[column].notna().sum())
    print("Missing values:", df[column].isna().sum())

    if df[column].notna().sum() > 0:
        print("Minimum:", df[column].min())
        print("Maximum:", df[column].max())
        print("Mean:", round(df[column].mean(), 2))
        print("Median:", round(df[column].median(), 2))