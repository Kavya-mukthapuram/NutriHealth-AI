import pandas as pd
from pathlib import Path

# ============================================================
# TASK 7: MULTI-LABEL DEFICIENCY POPULATION CHECK
# ============================================================

print("=" * 70)
print("MULTI-LABEL DEFICIENCY POPULATION CHECK")
print("=" * 70)

# Input dataset
input_file = Path("data/processed/nutrition_ml_labeled.csv")

# Load dataset
df = pd.read_csv(input_file)

print(f"\nDataset: {input_file}")
print(f"Total rows: {len(df)}")
print(f"Total columns: {len(df.columns)}")

# Target columns
target_columns = [
    "iron_deficiency",
    "vitamin_d_deficiency",
    "folate_deficiency"
]

print("\n" + "=" * 70)
print("TARGET LABEL AVAILABILITY")
print("=" * 70)

# Check each target
for target in target_columns:
    valid = df[target].notna().sum()
    missing = df[target].isna().sum()

    print(f"\n{target}")
    print(f"  Valid labels : {valid}")
    print(f"  Missing      : {missing}")

    print("  Distribution:")
    print(df[target].value_counts(dropna=False).sort_index())


# ============================================================
# COMPLETE CASES
# ============================================================

print("\n" + "=" * 70)
print("MULTI-LABEL COMPLETE CASE CHECK")
print("=" * 70)

# Keep only rows where ALL three labels are available
complete_df = df.dropna(subset=target_columns)

print(f"\nRows with all 3 labels available: {len(complete_df)}")

print("\nRows removed because at least one label is missing:",
      len(df) - len(complete_df))


# ============================================================
# MULTI-LABEL TARGET DISTRIBUTION
# ============================================================

print("\n" + "=" * 70)
print("MULTI-LABEL TARGET DISTRIBUTION")
print("=" * 70)

for target in target_columns:
    print(f"\n{target}")

    counts = complete_df[target].value_counts().sort_index()

    for label, count in counts.items():
        percentage = (count / len(complete_df)) * 100
        print(f"  {int(label)} = {count} ({percentage:.2f}%)")


# ============================================================
# COMBINATION OF DEFICIENCIES
# ============================================================

print("\n" + "=" * 70)
print("DEFICIENCY COMBINATIONS")
print("=" * 70)

# Convert labels to integers for displaying combinations
combination_counts = (
    complete_df[target_columns]
    .astype(int)
    .value_counts()
)

for combination, count in combination_counts.items():
    print(
        f"\nIron={combination[0]}, "
        f"Vitamin_D={combination[1]}, "
        f"Folate={combination[2]}"
    )
    print(f"Count: {count}")


# ============================================================
# SAVE COMPLETE MULTI-LABEL DATASET
# ============================================================

output_file = Path("data/processed/multilabel_complete_cases.csv")

complete_df.to_csv(output_file, index=False)

print("\n" + "=" * 70)
print("COMPLETE CASE DATASET SAVED")
print("=" * 70)

print(f"\nOutput file: {output_file}")
print(f"Rows: {len(complete_df)}")
print(f"Columns: {len(complete_df.columns)}")

print("\nTask 7 population check completed.")
print("=" * 70)