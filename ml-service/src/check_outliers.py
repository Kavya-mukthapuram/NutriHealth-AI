import pandas as pd

df = pd.read_csv("data/processed/nutrition_ml_dataset.csv")

print("=" * 80)
print("OUTLIER ANALYSIS USING IQR METHOD")
print("=" * 80)

columns = [
    "RIDAGEYR",
    "LBXHGB",
    "LBXFER",
    "LBXTFR",
    "LBDRFO",
    "LBXVIDMS",
    "LBXSIR",
    "LBXSCA",
    "LBXMAGN",
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

for column in columns:

    data = df[column].dropna()

    if len(data) == 0:
        continue

    q1 = data.quantile(0.25)
    q3 = data.quantile(0.75)

    iqr = q3 - q1

    lower = q1 - 1.5 * iqr
    upper = q3 + 1.5 * iqr

    outliers = data[(data < lower) | (data > upper)]

    print(f"\n{column}")
    print("-" * 50)
    print(f"Q1              : {q1:.2f}")
    print(f"Q3              : {q3:.2f}")
    print(f"IQR             : {iqr:.2f}")
    print(f"Lower bound     : {lower:.2f}")
    print(f"Upper bound     : {upper:.2f}")
    print(f"Potential outliers: {len(outliers)}")

print("\n" + "=" * 80)
print("OUTLIER ANALYSIS COMPLETED")
print("=" * 80)