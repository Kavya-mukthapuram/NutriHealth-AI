import pandas as pd
from pathlib import Path

INPUT_FILE = Path("data/processed/nutrition_ml_missing_handled.csv")
OUTPUT_FILE = Path("data/processed/nutrition_ml_final.csv")

print("=" * 80)
print("FINAL CLEANED DATASET CREATION")
print("=" * 80)

df = pd.read_csv(INPUT_FILE)

print(f"\nInput rows: {len(df)}")
print(f"Input columns: {len(df.columns)}")

# Remove any remaining complete duplicates
df = df.drop_duplicates()

# Ensure participant ID is unique
df = df.drop_duplicates(subset="seqn")

# Ensure columns are consistently named
df.columns = (
    df.columns
    .str.strip()
    .str.lower()
    .str.replace(" ", "_")
)

# Save final dataset
OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

df.to_csv(OUTPUT_FILE, index=False)

print("\n" + "=" * 80)
print("FINAL DATASET CREATED")
print("=" * 80)

print(f"Final rows: {len(df)}")
print(f"Final columns: {len(df.columns)}")

print("\nFinal dataset:")
print(OUTPUT_FILE)

print("\nRemaining missing values:")
print(df.isna().sum().sum())

print("\nDuplicate rows:")
print(df.duplicated().sum())

print("\nDuplicate SEQN values:")
print(df["seqn"].duplicated().sum())

print("=" * 80)