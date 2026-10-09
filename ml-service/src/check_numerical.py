import pandas as pd

df = pd.read_csv("data/processed/nutrition_ml_dataset.csv")

print("=" * 80)
print("NUMERICAL VARIABLE ANALYSIS")
print("=" * 80)

numerical_columns = [
    "RIDAGEYR",
    "LBXHGB",
    "LBXFER",
    "LBXTFR",
    "LBDRFO",
    "LBXVIDMS",
    "LBXSIR",
    "LBXMAGN",
    "LBXSCA",
    "calories",
    "protein",
    "carbohydrates",
    "sugar",
    "fiber",
    "fat",
    "vitamin_b12",
    "folate",
    "vitamin_c",
    "vitamin_d",
    "calcium",
    "magnesium",
    "iron",
    "zinc",
    "vitamin_a",
    "vitamin_k"
]

for column in numerical_columns:

    print(f"\n{column}")
    print("-" * 50)

    if column in df.columns:
        print(f"Count   : {df[column].count()}")
        print(f"Missing : {df[column].isna().sum()}")
        print(f"Mean    : {df[column].mean():.2f}")
        print(f"Median  : {df[column].median():.2f}")
        print(f"Std     : {df[column].std():.2f}")
        print(f"Min     : {df[column].min():.2f}")
        print(f"Max     : {df[column].max():.2f}")
    else:
        print("Column not found.")

print("\n" + "=" * 80)
print("NUMERICAL ANALYSIS COMPLETED")
print("=" * 80)