import pandas as pd

df = pd.read_csv("data/processed/nutrition_ml_dataset.csv")

print("=" * 80)
print("CATEGORICAL VARIABLE ANALYSIS")
print("=" * 80)

categorical_columns = [
    "RIAGENDR",
    "RIDRETH3",
    "DMDEDUC2",
    "MCQ053",
    "MCQ010",
    "AGQ030",
    "MCQ160M",
    "MCQ160L",
    "MCQ160P",
    "MCQ160A",
    "MCQ160B",
    "MCQ160C",
    "MCQ160E",
    "MCQ160F"
]

for column in categorical_columns:

    print(f"\n{column}")
    print("-" * 40)

    if column in df.columns:
        print(df[column].value_counts(dropna=False))
    else:
        print("Column not found.")

print("\n" + "=" * 80)
print("CATEGORICAL ANALYSIS COMPLETED")
print("=" * 80)