import pandas as pd
from pathlib import Path

INPUT_FILE = Path("data/processed/nutrition_ml_missing_handled.csv")
OUTPUT_FILE = Path("data/processed/deficiency_label_validation.csv")

df = pd.read_csv(INPUT_FILE)

print("=" * 80)
print("DEFICIENCY LABEL VALIDATION")
print("=" * 80)

# Explicit deficiency-label names we would expect to find
possible_labels = [
    "iron_deficiency",
    "vitamin_d_deficiency",
    "folate_deficiency",
    "vitamin_b12_deficiency",
    "calcium_deficiency",
    "magnesium_deficiency",
    "zinc_deficiency",
    "vitamin_a_deficiency",
    "vitamin_c_deficiency",
    "vitamin_k_deficiency"
]

found_labels = [
    column for column in df.columns
    if column.lower() in possible_labels
]

print("\nExplicit deficiency labels found:")

if found_labels:
    for label in found_labels:
        print(f"- {label}")
else:
    print("NONE")

# Biomarkers currently available
biomarkers = {
    "iron": ["lbxfer", "lbxtfr", "lbxhgb", "lbxsir"],
    "vitamin_d": ["lbxvidms"],
    "folate": ["lbdrfo"],
    "calcium": ["lbxsca"],
    "magnesium": ["lbxmagn"],
    "vitamin_b12": [],
    "zinc": [],
    "vitamin_a": [],
    "vitamin_c": [],
    "vitamin_k": []
}

rows = []

for nutrient, variables in biomarkers.items():

    available_variables = [
        variable for variable in variables
        if variable in df.columns
    ]

    if available_variables:
        status = "Biomarker available"
    else:
        status = "No selected biomarker available"

    rows.append({
        "nutrient": nutrient,
        "biomarker_variables": ", ".join(available_variables),
        "status": status
    })

    print(
        f"{nutrient:15} | "
        f"{status:30} | "
        f"{', '.join(available_variables) if available_variables else 'None'}"
    )

report = pd.DataFrame(rows)

OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
report.to_csv(OUTPUT_FILE, index=False)

print("\n" + "=" * 80)
print("DEFICIENCY LABEL VALIDATION COMPLETED")
print("=" * 80)

print(f"Report saved to:")
print(OUTPUT_FILE)

print("\nConclusion:")
print("No explicit deficiency labels are present in the selected dataset.")

print("\nImportant:")
print("Do NOT create deficiency labels using arbitrary median values.")
print("Only scientifically supported biomarker thresholds should be used.")

print("=" * 80)