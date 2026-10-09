import pandas as pd
import os

from sklearn.model_selection import train_test_split


# ============================================================
# TASK 4 — TRAIN / VALIDATION / TEST SPLIT
# ============================================================

INPUT_FILE = "data/processed/nutrition_ml_labeled.csv"
OUTPUT_DIR = "data/processed/splits"


# ------------------------------------------------------------
# 1. Load dataset
# ------------------------------------------------------------

df = pd.read_csv(INPUT_FILE)

print("=" * 70)
print("TASK 4 — TRAIN / VALIDATION / TEST SPLIT")
print("=" * 70)

print("\nOriginal dataset:")
print("Rows:", len(df))
print("Columns:", len(df.columns))


# ------------------------------------------------------------
# 2. Define target columns
# ------------------------------------------------------------

TARGET_COLUMNS = [
    "iron_deficiency",
    "vitamin_d_deficiency",
    "folate_deficiency"
]


# ------------------------------------------------------------
# 3. Remove participant ID
# ------------------------------------------------------------

df = df.drop(columns=["seqn"])


# ------------------------------------------------------------
# 4. Create output directory
# ------------------------------------------------------------

os.makedirs(OUTPUT_DIR, exist_ok=True)


# ------------------------------------------------------------
# 5. Split dataset
# ------------------------------------------------------------

# 70% training
# 30% temporary data

train_df, temp_df = train_test_split(
    df,
    test_size=0.30,
    random_state=42
)


# ------------------------------------------------------------
# 6. Split temporary data into validation and test
# ------------------------------------------------------------

# 15% validation
# 15% test

validation_df, test_df = train_test_split(
    temp_df,
    test_size=0.50,
    random_state=42
)


# ------------------------------------------------------------
# 7. Display split sizes
# ------------------------------------------------------------

print("\nDataset split:")
print("----------------------------------------")
print("Training   :", len(train_df))
print("Validation :", len(validation_df))
print("Testing    :", len(test_df))
print("----------------------------------------")

print(
    "\nPercentage:"
)
print(
    "Training   :",
    round(len(train_df) / len(df) * 100, 2),
    "%"
)

print(
    "Validation :",
    round(len(validation_df) / len(df) * 100, 2),
    "%"
)

print(
    "Testing    :",
    round(len(test_df) / len(df) * 100, 2),
    "%"
)


# ------------------------------------------------------------
# 8. Save datasets
# ------------------------------------------------------------

train_file = os.path.join(
    OUTPUT_DIR,
    "train.csv"
)

validation_file = os.path.join(
    OUTPUT_DIR,
    "validation.csv"
)

test_file = os.path.join(
    OUTPUT_DIR,
    "test.csv"
)


train_df.to_csv(
    train_file,
    index=False
)

validation_df.to_csv(
    validation_file,
    index=False
)

test_df.to_csv(
    test_file,
    index=False
)


# ------------------------------------------------------------
# 9. Target availability check
# ------------------------------------------------------------

print("\nTarget availability:")
print("=" * 70)

for target in TARGET_COLUMNS:

    print(f"\n{target}")

    print(
        "Training valid:",
        train_df[target].notna().sum()
    )

    print(
        "Validation valid:",
        validation_df[target].notna().sum()
    )

    print(
        "Testing valid:",
        test_df[target].notna().sum()
    )


# ------------------------------------------------------------
# 10. Final output
# ------------------------------------------------------------

print("\n" + "=" * 70)
print("SPLIT COMPLETED")
print("=" * 70)

print("\nFiles created:")

print(train_file)
print(validation_file)
print(test_file)