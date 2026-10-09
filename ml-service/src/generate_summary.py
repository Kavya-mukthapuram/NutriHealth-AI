import pandas as pd

df = pd.read_csv("data/processed/nutrition_ml_dataset.csv")

print("=" * 80)
print("SUMMARY STATISTICS")
print("=" * 80)

summary = df.describe(include="all").T

summary["missing"] = df.isna().sum()
summary["missing_percent"] = (df.isna().mean() * 100).round(2)

print(summary)

summary.to_csv("data/processed/summary_statistics.csv")

print("\n" + "=" * 80)
print("SUMMARY STATISTICS SAVED")
print("=" * 80)

print("\nFile:")
print("data/processed/summary_statistics.csv")