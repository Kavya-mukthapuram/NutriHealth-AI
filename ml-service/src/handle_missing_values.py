import pandas as pd
from pathlib import Path

INPUT_FILE = Path("data/processed/nutrition_ml_cleaned.csv")
OUTPUT_FILE = Path("data/processed/nutrition_ml_missing_handled.csv")

print("=" * 80)
print("MISSING VALUE HANDLING")
print("=" * 80)

# Load cleaned dataset
df = pd.read_csv(INPUT_FILE)

print(f"\nRows: {len(df)}")
print(f"Columns: {len(df.columns)}")


# ------------------------------------------------------------------
# Missing-value strategy
# ------------------------------------------------------------------
#
# 1. Do NOT replace laboratory missing values with zero.
#    Missing laboratory measurements may occur because the participant
#    was not part of the corresponding NHANES laboratory subsample.
#
# 2. Do NOT drop all rows containing missing values.
#    This would remove a large portion of the dataset.
#
# 3. Keep missing laboratory and dietary measurements as NaN.
#    Later, the ML preprocessing pipeline will handle numerical
#    missing values using training-data-based imputation.
#
# 4. Demographic variables required for modeling are checked separately.
# ------------------------------------------------------------------


# Required demographic columns
required_demographics = [
    "seqn",
    "ridageyr",
    "riagendr",
    "ridreth3"
]

print("\nMissing values in required demographic variables:")

for column in required_demographics:
    if column in df.columns:
        missing = df[column].isna().sum()
        print(f"{column}: {missing}")


# ------------------------------------------------------------------
# Missing-value summary
# ------------------------------------------------------------------

missing_summary = pd.DataFrame({
    "column": df.columns,
    "missing_count": df.isna().sum().values,
    "missing_percent": (
        df.isna().sum().values / len(df) * 100
    )
})

missing_summary = missing_summary[
    missing_summary["missing_count"] > 0
].sort_values(
    "missing_percent",
    ascending=False
)


print("\n" + "-" * 80)
print("MISSING VALUE SUMMARY")
print("-" * 80)

print(missing_summary.to_string(index=False))


# ------------------------------------------------------------------
# Save missing-value report
# ------------------------------------------------------------------

REPORT_FILE = Path("data/processed/missing_value_report.csv")

missing_summary.to_csv(
    REPORT_FILE,
    index=False
)


# ------------------------------------------------------------------
# Save dataset
# ------------------------------------------------------------------

OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

df.to_csv(
    OUTPUT_FILE,
    index=False
)


print("\n" + "=" * 80)
print("MISSING VALUE HANDLING COMPLETED")
print("=" * 80)

print(f"Dataset saved to:")
print(OUTPUT_FILE)

print(f"\nMissing-value report saved to:")
print(REPORT_FILE)

print("\nImportant:")
print("Laboratory and dietary missing values were retained as NaN.")
print("They will be handled later inside the ML preprocessing pipeline.")

print("=" * 80)