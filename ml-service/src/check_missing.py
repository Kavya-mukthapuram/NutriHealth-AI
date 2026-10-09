import pandas as pd

path = "data/processed/nutrition_ml_dataset.csv"

df = pd.read_csv(path)

print("=" * 70)
print("MISSING VALUE ANALYSIS")
print("=" * 70)

print("Rows:", len(df))
print("Columns:", len(df.columns))

print("\nMissing values:")
missing = df.isnull().sum()

result = pd.DataFrame({
    "column": missing.index,
    "missing_count": missing.values,
    "missing_percent": (missing.values / len(df) * 100).round(2)
})

result = result.sort_values(
    by="missing_percent",
    ascending=False
)

print(result.to_string(index=False))