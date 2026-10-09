import pandas as pd
from pathlib import Path

INPUT_FILE = Path("data/processed/nutrition_ml_final.csv")

df = pd.read_csv(INPUT_FILE)

print("=" * 80)
print("TARGET POPULATION CHECK")
print("=" * 80)

print("\nAge distribution:")
print(df["ridageyr"].describe())

print("\nGender distribution:")
print(df["riagendr"].value_counts(dropna=False).sort_index())

print("\nAge groups:")
bins = [0, 5, 12, 18, 30, 50, 65, 200]
labels = [
    "0-5",
    "6-12",
    "13-18",
    "19-30",
    "31-50",
    "51-65",
    "66+"
]

age_groups = pd.cut(
    df["ridageyr"],
    bins=bins,
    labels=labels,
    right=True
)

print(age_groups.value_counts().sort_index())

print("\nBiomarker availability by age group:")

for target, column in {
    "Iron/Ferritin": "lbxfer",
    "Vitamin D": "lbxvidms",
    "Folate": "lbdrfo",
    "Hemoglobin": "lbxhgb"
}.items():

    temp = df.assign(age_group=age_groups)

    available = (
        temp[temp[column].notna()]
        .groupby("age_group", observed=False)
        .size()
    )

    print(f"\n{target} ({column})")
    print(available)

print("\n" + "=" * 80)
print("TARGET POPULATION CHECK COMPLETED")
print("=" * 80)