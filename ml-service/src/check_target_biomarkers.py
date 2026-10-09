import pandas as pd
from pathlib import Path

INPUT_FILE = Path("data/processed/nutrition_ml_final.csv")

df = pd.read_csv(INPUT_FILE)

print("=" * 80)
print("DEFICIENCY TARGET BIOMARKER CHECK")
print("=" * 80)

targets = {
    "Iron": [
        "lbxhgb",
        "lbxfer",
        "lbxtfr",
        "lbxsir"
    ],
    "Vitamin D": [
        "lbxvidms"
    ],
    "Folate": [
        "lbdrfo"
    ],
    "Calcium": [
        "lbxsca"
    ],
    "Magnesium": [
        "lbxmagn"
    ],
    "Vitamin B12": [
        "vitamin_b12"
    ],
    "Zinc": [
        "zinc"
    ],
    "Vitamin A": [
        "vitamin_a"
    ],
    "Vitamin C": [
        "vitamin_c"
    ],
    "Vitamin K": [
        "vitamin_k"
    ]
}

for target, biomarkers in targets.items():

    print(f"\n{target}")
    print("-" * 40)

    for biomarker in biomarkers:

        if biomarker in df.columns:

            available = df[biomarker].notna().sum()
            missing = df[biomarker].isna().sum()

            print(
                f"{biomarker:<12} "
                f"Available: {available:>5} "
                f"Missing: {missing:>5}"
            )

        else:
            print(
                f"{biomarker:<12} "
                f"NOT FOUND"
            )

print("\n" + "=" * 80)
print("TARGET BIOMARKER CHECK COMPLETED")
print("=" * 80)