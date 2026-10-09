import pandas as pd
from pathlib import Path

INPUT_FILE = Path("data/processed/nutrition_ml_missing_handled.csv")
OUTPUT_FILE = Path("data/processed/outlier_investigation.csv")

df = pd.read_csv(INPUT_FILE)

columns = [
    "lbxhgb",
    "lbxfer",
    "lbxtfr",
    "lbdrfo",
    "lbxvidms",
    "lbxsir",
    "lbxmagn",
    "lbxsca",
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

results = []

print("=" * 80)
print("OUTLIER INVESTIGATION")
print("=" * 80)

for column in columns:

    if column not in df.columns:
        continue

    values = df[column].dropna()

    if len(values) == 0:
        continue

    q1 = values.quantile(0.25)
    q3 = values.quantile(0.75)

    iqr = q3 - q1

    lower_bound = q1 - 1.5 * iqr
    upper_bound = q3 + 1.5 * iqr

    outliers = values[
        (values < lower_bound) |
        (values > upper_bound)
    ]

    results.append({
        "column": column,
        "q1": q1,
        "q3": q3,
        "iqr": iqr,
        "lower_bound": lower_bound,
        "upper_bound": upper_bound,
        "outlier_count": len(outliers),
        "outlier_percent": len(outliers) / len(values) * 100,
        "min": values.min(),
        "max": values.max()
    })

    print(
        f"{column:15} | "
        f"Outliers: {len(outliers):5} | "
        f"{len(outliers) / len(values) * 100:6.2f}%"
    )

report = pd.DataFrame(results)

OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
report.to_csv(OUTPUT_FILE, index=False)

print("\n" + "=" * 80)
print("OUTLIER INVESTIGATION COMPLETED")
print("=" * 80)

print(f"Report saved to:")
print(OUTPUT_FILE)

print("\nDecision:")
print("Potential outliers will NOT be automatically removed.")
print("They will be retained unless they are confirmed invalid values.")

print("=" * 80)