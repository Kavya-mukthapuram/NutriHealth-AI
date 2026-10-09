import pandas as pd
from pathlib import Path

INPUT_FILE = Path("data/processed/nutrition_ml_final.csv")
OUTPUT_FILE = Path("data/processed/feature_dictionary.csv")

df = pd.read_csv(INPUT_FILE)

print("=" * 80)
print("FEATURE DICTIONARY")
print("=" * 80)

feature_groups = {

    # ---------------------------------------------------------------
    # Demographic / health-profile features
    # ---------------------------------------------------------------
    "demographic": [
        "ridageyr",
        "riagendr",
        "ridreth3",
        "dmdeduc2",
        "indfmpir"
    ],

    # ---------------------------------------------------------------
    # Dietary features
    # ---------------------------------------------------------------
    "dietary": [
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
    ],

    # ---------------------------------------------------------------
    # Laboratory features
    # ---------------------------------------------------------------
    "laboratory": [
        "lbxhgb",
        "lbxfer",
        "lbxtfr",
        "lbdrfo",
        "lbxvidms",
        "lbxsir",
        "lbxmagn",
        "lbxsca"
    ],

    # ---------------------------------------------------------------
    # Health / symptom-related questionnaire features
    # ---------------------------------------------------------------
    "health_questionnaire": [
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
}


# Descriptions for the selected features
descriptions = {

    "ridageyr": "Age in years",
    "riagendr": "Gender code",
    "ridreth3": "Race and Hispanic origin classification",
    "dmdeduc2": "Education level",
    "indfmpir": "Family income to poverty ratio",

    "calories": "Daily energy intake",
    "protein": "Daily protein intake",
    "carbohydrates": "Daily carbohydrate intake",
    "sugar": "Daily sugar intake",
    "fiber": "Daily fiber intake",
    "fat": "Daily fat intake",
    "vitamin_b12": "Daily vitamin B12 intake",
    "folate": "Daily folate intake",
    "vitamin_c": "Daily vitamin C intake",
    "vitamin_d": "Daily vitamin D intake",
    "calcium": "Daily calcium intake",
    "magnesium": "Daily magnesium intake",
    "iron": "Daily iron intake",
    "zinc": "Daily zinc intake",
    "vitamin_a": "Daily vitamin A intake",
    "vitamin_k": "Daily vitamin K intake",

    "lbxhgb": "Hemoglobin measurement",
    "lbxfer": "Ferritin measurement",
    "lbxtfr": "Transferrin receptor measurement",
    "lbdrfo": "Red blood cell folate measurement",
    "lbxvidms": "Serum vitamin D measurement",
    "lbxsir": "Serum iron measurement",
    "lbxmagn": "Serum magnesium measurement",
    "lbxsca": "Serum calcium measurement",

    "mcq053": "Anemia treatment in past 3 months",
    "mcq010": "Asthma history",
    "agq030": "Hay fever or seasonal allergy history",
    "mcq160m": "Thyroid condition",
    "mcq160l": "Liver condition",
    "mcq160p": "COPD/emphysema/chronic bronchitis",
    "mcq160a": "Arthritis",
    "mcq160b": "Congestive heart failure",
    "mcq160c": "Coronary heart disease",
    "mcq160e": "Heart attack history",
    "mcq160f": "Stroke history"
}


rows = []

for group, columns in feature_groups.items():

    for column in columns:

        if column in df.columns:

            rows.append({
                "feature": column,
                "feature_group": group,
                "description": descriptions.get(
                    column,
                    "Selected feature"
                ),
                "data_type": str(df[column].dtype),
                "available_count": int(df[column].notna().sum()),
                "missing_count": int(df[column].isna().sum()),
                "missing_percent": round(
                    df[column].isna().mean() * 100,
                    2
                )
            })

        else:
            print(f"WARNING: {column} not found in dataset")


feature_dictionary = pd.DataFrame(rows)

OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

feature_dictionary.to_csv(
    OUTPUT_FILE,
    index=False
)


print(f"\nTotal selected features: {len(feature_dictionary)}")

print("\nFeatures by group:")

print(
    feature_dictionary["feature_group"]
    .value_counts()
    .to_string()
)

print("\nFeature dictionary saved to:")
print(OUTPUT_FILE)

print("=" * 80)
print("FEATURE DICTIONARY CREATED")
print("=" * 80)