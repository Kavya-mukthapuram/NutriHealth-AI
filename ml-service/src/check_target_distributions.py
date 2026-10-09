import pandas as pd

df = pd.read_csv("data/processed/nutrition_ml_dataset.csv")

print("=" * 80)
print("POTENTIAL DEFICIENCY TARGET DISTRIBUTIONS")
print("=" * 80)

targets = [
    "LBXFER",
    "LBXTFR",
    "LBXHGB",
    "LBXVIDMS",
    "LBDRFO",
    "LBXSIR",
    "LBXSCA",
    "LBXMAGN"
]

for column in targets:

    print(f"\n{column}")
    print("-" * 50)

    data = df[column].dropna()

    if len(data) == 0:
        print("No available values.")
        continue

    print(f"Available values : {len(data)}")
    print(f"Mean             : {data.mean():.2f}")
    print(f"Median           : {data.median():.2f}")
    print(f"25th percentile  : {data.quantile(0.25):.2f}")
    print(f"75th percentile  : {data.quantile(0.75):.2f}")
    print(f"Minimum          : {data.min():.2f}")
    print(f"Maximum          : {data.max():.2f}")

print("\n" + "=" * 80)
print("TARGET DISTRIBUTION ANALYSIS COMPLETED")
print("=" * 80)