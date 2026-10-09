import pandas as pd
from pathlib import Path

INPUT_FILE = Path("data/processed/nutrition_ml_with_targets.csv")
OUTPUT_FILE = Path("data/processed/nutrition_ml_labeled.csv")

df = pd.read_csv(INPUT_FILE)

print("=" * 80)
print("DEFICIENCY TARGET LABEL GENERATION")
print("=" * 80)


# ==============================================================
# 1. IRON DEFICIENCY
# ==============================================================
#
# WHO ferritin cutoffs:
#
# Age < 5 years  : ferritin < 12 ug/L
# Age >= 5 years : ferritin < 15 ug/L
#
# Important:
# Ferritin can increase during inflammation/infection.
# Our current selected dataset does not contain CRP/AGP,
# therefore this label is NOT inflammation-adjusted.
#
# This represents depleted iron stores, not a clinical diagnosis.
# ==============================================================

df["iron_deficiency"] = pd.NA

iron_available = df["lbxfer"].notna()

under_5 = (
    iron_available
    & (df["ridageyr"] < 5)
)

age_5_plus = (
    iron_available
    & (df["ridageyr"] >= 5)
)

df.loc[under_5, "iron_deficiency"] = (
    df.loc[under_5, "lbxfer"] < 12
).astype(int)

df.loc[age_5_plus, "iron_deficiency"] = (
    df.loc[age_5_plus, "lbxfer"] < 15
).astype(int)


# ==============================================================
# 2. VITAMIN D DEFICIENCY
# ==============================================================
#
# Biomarker:
# LBXVIDMS = serum 25-hydroxyvitamin D
#
# Threshold:
# < 27.5 nmol/L
#
# This threshold is based on WHO population-level guidance.
# ==============================================================

df["vitamin_d_deficiency"] = pd.NA

vitamin_d_available = df["lbxvidms"].notna()

df.loc[vitamin_d_available, "vitamin_d_deficiency"] = (
    df.loc[vitamin_d_available, "lbxvidms"] < 27.5
).astype(int)


# ==============================================================
# 3. FOLATE DEFICIENCY
# ==============================================================
#
# Biomarker:
# LBDrFO = RBC folate
#
# WHO hematological indicator:
# RBC folate < 226.5 nmol/L
#
# Important:
# This is different from the 906 nmol/L population-level
# folate insufficiency threshold used for women of reproductive
# age and neural-tube-defect prevention.
# ==============================================================

df["folate_deficiency"] = pd.NA

folate_available = df["lbdrfo"].notna()

df.loc[folate_available, "folate_deficiency"] = (
    df.loc[folate_available, "lbdrfo"] < 226.5
).astype(int)


# ==============================================================
# TARGET DISTRIBUTIONS
# ==============================================================

print("\n" + "=" * 80)
print("TARGET DISTRIBUTIONS")
print("=" * 80)

targets = [
    "iron_deficiency",
    "vitamin_d_deficiency",
    "folate_deficiency"
]

for target in targets:

    print(f"\n{target}")
    print("-" * 40)

    counts = df[target].value_counts(
        dropna=False
    ).sort_index()

    print(counts.to_string())


# ==============================================================
# TARGET SUMMARY
# ==============================================================

print("\n" + "=" * 80)
print("TARGET SUMMARY")
print("=" * 80)

for target in targets:

    valid = df[target].notna().sum()

    if valid > 0:

        positive = (
            df.loc[df[target].notna(), target] == 1
        ).sum()

        negative = (
            df.loc[df[target].notna(), target] == 0
        ).sum()

        percentage = positive / valid * 100

        print(f"\n{target}")
        print(f"Valid labels : {valid}")
        print(f"Positive     : {positive}")
        print(f"Negative     : {negative}")
        print(f"Positive %   : {percentage:.2f}%")
        print(f"Missing      : {len(df) - valid}")


# ==============================================================
# SAVE
# ==============================================================

OUTPUT_FILE.parent.mkdir(
    parents=True,
    exist_ok=True
)

df.to_csv(
    OUTPUT_FILE,
    index=False
)

print("\n" + "=" * 80)
print("DEFICIENCY LABEL DATASET CREATED")
print("=" * 80)

print(f"Input file:")
print(INPUT_FILE)

print(f"\nOutput file:")
print(OUTPUT_FILE)

print(f"\nRows   : {len(df)}")
print(f"Columns: {len(df.columns)}")

print("\nImportant limitations:")
print("1. Iron labels are based on ferritin.")
print("2. Iron labels are not inflammation-adjusted because CRP/AGP")
print("   are not currently included in the selected dataset.")
print("3. Vitamin D uses the WHO 27.5 nmol/L threshold.")
print("4. Folate uses the WHO RBC-folate deficiency threshold.")
print("5. These are ML biomarker-status labels, not medical diagnoses.")

print("\n" + "=" * 80)
print("TARGET LABEL GENERATION COMPLETED")
print("=" * 80)