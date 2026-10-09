import pandas as pd

df = pd.read_csv("data/processed/nutrition_ml_dataset.csv")

targets = {
    "Iron": ["LBXFER", "LBXTFR", "LBXHGB", "LBXSIR", "iron"],
    "Vitamin D": ["LBXVIDMS", "vitamin_d"],
    "Folate": ["LBDRFO", "folate"],
    "Vitamin B12": ["vitamin_b12"],
    "Calcium": ["LBXSCA", "calcium"],
    "Magnesium": ["LBXMAGN", "magnesium"],
    "Zinc": ["zinc"],
    "Vitamin A": ["vitamin_a"],
    "Vitamin C": ["vitamin_c"],
    "Vitamin K": ["vitamin_k"]
}

print("=" * 80)
print("DEFICIENCY TARGET INVENTORY")
print("=" * 80)

for nutrient, columns in targets.items():

    print(f"\n{nutrient}")
    print("-" * 40)

    for column in columns:

        if column in df.columns:
            available = df[column].notna().sum()

            print(
                f"{column:15} "
                f"Available: {available:5} "
                f"Missing: {len(df) - available:5}"
            )
        else:
            print(f"{column:15} NOT FOUND")