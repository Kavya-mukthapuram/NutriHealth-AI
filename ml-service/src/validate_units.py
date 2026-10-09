import pandas as pd
from pathlib import Path

INPUT_FILE = Path("data/processed/nutrition_ml_missing_handled.csv")
OUTPUT_FILE = Path("data/processed/unit_validation_report.csv")

df = pd.read_csv(INPUT_FILE)

print("=" * 80)
print("UNIT VALIDATION")
print("=" * 80)

# Units based on the selected NHANES variables
unit_info = {
    "lbxhgb": {
        "description": "Hemoglobin",
        "unit": "g/dL"
    },
    "lbxfer": {
        "description": "Ferritin",
        "unit": "ng/mL"
    },
    "lbxtfr": {
        "description": "Transferrin receptor",
        "unit": "mg/L"
    },
    "lbdrfo": {
        "description": "RBC folate",
        "unit": "nmol/L"
    },
    "lbxvidms": {
        "description": "Serum vitamin D",
        "unit": "nmol/L"
    },
    "lbxsir": {
        "description": "Serum iron",
        "unit": "µg/dL"
    },
    "lbxmagn": {
        "description": "Serum magnesium",
        "unit": "mg/dL"
    },
    "lbxsca": {
        "description": "Serum calcium",
        "unit": "mg/dL"
    },
    "calories": {
        "description": "Energy intake",
        "unit": "kcal/day"
    },
    "protein": {
        "description": "Protein intake",
        "unit": "g/day"
    },
    "carbohydrates": {
        "description": "Carbohydrate intake",
        "unit": "g/day"
    },
    "sugar": {
        "description": "Sugar intake",
        "unit": "g/day"
    },
    "fiber": {
        "description": "Fiber intake",
        "unit": "g/day"
    },
    "fat": {
        "description": "Fat intake",
        "unit": "g/day"
    },
    "vitamin_b12": {
        "description": "Vitamin B12 intake",
        "unit": "µg/day"
    },
    "folate": {
        "description": "Folate intake",
        "unit": "µg/day"
    },
    "vitamin_c": {
        "description": "Vitamin C intake",
        "unit": "mg/day"
    },
    "vitamin_d": {
        "description": "Vitamin D intake",
        "unit": "µg/day"
    },
    "calcium": {
        "description": "Calcium intake",
        "unit": "mg/day"
    },
    "magnesium": {
        "description": "Magnesium intake",
        "unit": "mg/day"
    },
    "iron": {
        "description": "Iron intake",
        "unit": "mg/day"
    },
    "zinc": {
        "description": "Zinc intake",
        "unit": "mg/day"
    },
    "vitamin_a": {
        "description": "Vitamin A intake",
        "unit": "µg RAE/day"
    },
    "vitamin_k": {
        "description": "Vitamin K intake",
        "unit": "µg/day"
    }
}

rows = []

for column, info in unit_info.items():

    if column in df.columns:

        available = df[column].notna().sum()
        missing = df[column].isna().sum()

        rows.append({
            "column": column,
            "description": info["description"],
            "expected_unit": info["unit"],
            "available_values": available,
            "missing_values": missing
        })

        print(
            f"{column:15} | "
            f"{info['description']:25} | "
            f"{info['unit']:15}"
        )

report = pd.DataFrame(rows)

OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
report.to_csv(OUTPUT_FILE, index=False)

print("\n" + "=" * 80)
print("UNIT VALIDATION COMPLETED")
print("=" * 80)

print(f"Report saved to:")
print(OUTPUT_FILE)

print("\nNo numerical conversion was performed.")
print("The original NHANES measurement units are retained.")

print("=" * 80)