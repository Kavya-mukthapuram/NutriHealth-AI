import pandas as pd
from pathlib import Path

INPUT_FILE = Path("data/processed/nutrition_ml_dataset.csv")
OUTPUT_FILE = Path("data/processed/nutrition_ml_cleaned.csv")


print("=" * 80)
print("NHANES DATA CLEANING")
print("=" * 80)

# Load dataset
df = pd.read_csv(INPUT_FILE)

print(f"\nOriginal rows: {len(df)}")
print(f"Original columns: {len(df.columns)}")


# ------------------------------------------------------------------
# 1. Remove complete duplicate rows
# ------------------------------------------------------------------

duplicate_rows = df.duplicated().sum()

print(f"\nComplete duplicate rows: {duplicate_rows}")

df = df.drop_duplicates()


# ------------------------------------------------------------------
# 2. Remove duplicate participant IDs
# ------------------------------------------------------------------

duplicate_seqn = df["SEQN"].duplicated().sum()

print(f"Duplicate SEQN values: {duplicate_seqn}")

df = df.drop_duplicates(subset="SEQN")


# ------------------------------------------------------------------
# 3. Standardize column names
# ------------------------------------------------------------------

df.columns = (
    df.columns
    .str.strip()
    .str.lower()
    .str.replace(" ", "_")
)

print("\nColumn names standardized.")


# ------------------------------------------------------------------
# 4. Handle special NHANES categorical codes
# ------------------------------------------------------------------

# NHANES commonly uses:
# 7 = Refused
# 9 = Don't know
#
# Convert these responses to missing values.

categorical_columns = [
    "dmduc2",
    "mcq053",
    "mcq010",
    "agq030",
    "mcq160m",
    "mcq160l",
    "mcq160p",
    "mcq160a",
    "mcq160b",
    "mcq160c",
    "mcq160e",
    "mcq160f"
]

for column in categorical_columns:
    if column in df.columns:
        df[column] = df[column].replace([7, 9], pd.NA)


# ------------------------------------------------------------------
# 5. Validate demographic values
# ------------------------------------------------------------------

if "ridageyr" in df.columns:
    invalid_age = (
        (df["ridageyr"] < 0) |
        (df["ridageyr"] > 80)
    )

    print(f"\nInvalid age values: {invalid_age.sum()}")

    df.loc[invalid_age, "ridageyr"] = pd.NA


if "riagendr" in df.columns:
    invalid_gender = ~df["riagendr"].isin([1, 2])

    print(f"Invalid gender values: {invalid_gender.sum()}")

    df.loc[invalid_gender, "riagendr"] = pd.NA


# ------------------------------------------------------------------
# 6. Validate laboratory measurements
# ------------------------------------------------------------------

lab_columns = [
    "lbxhgb",
    "lbxfer",
    "lbxtfr",
    "lbdrfo",
    "lbxvidms",
    "lbxsir",
    "lbxmagn",
    "lbxsca"
]

for column in lab_columns:
    if column in df.columns:
        negative_values = (df[column] < 0).sum()

        print(f"{column}: negative values = {negative_values}")

        df.loc[df[column] < 0, column] = pd.NA


# ------------------------------------------------------------------
# 7. Validate dietary nutrient values
# ------------------------------------------------------------------

dietary_columns = [
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

for column in dietary_columns:
    if column in df.columns:
        negative_values = (df[column] < 0).sum()

        print(f"{column}: negative values = {negative_values}")

        df.loc[df[column] < 0, column] = pd.NA


# ------------------------------------------------------------------
# 8. Save cleaned dataset
# ------------------------------------------------------------------

OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

df.to_csv(OUTPUT_FILE, index=False)

print("\n" + "=" * 80)
print("DATA CLEANING COMPLETED")
print("=" * 80)

print(f"Final rows: {len(df)}")
print(f"Final columns: {len(df.columns)}")
print(f"Cleaned dataset saved to:")
print(OUTPUT_FILE)

print("=" * 80)