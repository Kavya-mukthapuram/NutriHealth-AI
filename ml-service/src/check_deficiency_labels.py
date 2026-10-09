import pandas as pd

df = pd.read_csv("data/processed/nutrition_ml_dataset.csv")

print("=" * 80)
print("CHECKING FOR EXISTING DEFICIENCY LABELS")
print("=" * 80)

print("\nDataset columns:")
for col in df.columns:
    print(col)

print("\n" + "=" * 80)
print("POSSIBLE LABEL COLUMNS")
print("=" * 80)

keywords = [
    "deficiency",
    "deficient",
    "anemia",
    "anaemia",
    "iron_deficiency",
    "vitamin_d_deficiency",
    "folate_deficiency",
    "b12_deficiency",
    "calcium_deficiency",
    "magnesium_deficiency"
]

found = []

for col in df.columns:
    col_lower = col.lower()

    for keyword in keywords:
        if keyword in col_lower:
            found.append(col)
            break

if found:
    print("\nPossible deficiency-related columns found:")
    for col in found:
        print(f"\n{col}")
        print(df[col].value_counts(dropna=False))
else:
    print("\nNO EXPLICIT DEFICIENCY LABEL COLUMNS FOUND.")

print("\n" + "=" * 80)
print("CONCLUSION")
print("=" * 80)

if found:
    print("Potential deficiency-related variables exist.")
    print("These variables must be validated against official NHANES documentation.")
else:
    print("The processed dataset does not contain explicit deficiency labels.")
    print("Deficiency labels will need to be derived from appropriate biomarkers")
    print("using documented clinical/research thresholds.")