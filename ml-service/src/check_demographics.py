import pandas as pd

path = "data/processed/nutrition_ml_dataset.csv"

df = pd.read_csv(path)

print("=" * 70)
print("DEMOGRAPHIC ANALYSIS")
print("=" * 70)

print("\nAge:")
print(df["RIDAGEYR"].describe())

print("\nGender counts:")
print(df["RIAGENDR"].value_counts(dropna=False))

print("\nAge groups:")
print(
    pd.cut(
        df["RIDAGEYR"],
        bins=[0, 5, 12, 18, 30, 50, 65, 120],
        labels=[
            "0-5",
            "6-12",
            "13-18",
            "19-30",
            "31-50",
            "51-65",
            "66+"
        ]
    ).value_counts().sort_index()
)