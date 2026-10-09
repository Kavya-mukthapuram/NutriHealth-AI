import pandas as pd
import matplotlib.pyplot as plt
from pathlib import Path

df = pd.read_csv("data/processed/nutrition_ml_dataset.csv")

output_dir = Path("data/processed/eda_charts")
output_dir.mkdir(parents=True, exist_ok=True)

print("=" * 80)
print("CREATING EDA VISUALIZATIONS")
print("=" * 80)


# 1. Age distribution
plt.figure(figsize=(8, 5))
df["RIDAGEYR"].hist(bins=20)
plt.title("Age Distribution")
plt.xlabel("Age (years)")
plt.ylabel("Number of Participants")
plt.tight_layout()
plt.savefig(output_dir / "age_distribution.png")
plt.close()


# 2. Gender distribution
plt.figure(figsize=(7, 5))
df["RIAGENDR"].value_counts().sort_index().plot(kind="bar")
plt.title("Gender Distribution")
plt.xlabel("Gender Code")
plt.ylabel("Number of Participants")
plt.tight_layout()
plt.savefig(output_dir / "gender_distribution.png")
plt.close()


# 3. Hemoglobin distribution
plt.figure(figsize=(8, 5))
df["LBXHGB"].dropna().hist(bins=30)
plt.title("Hemoglobin Distribution")
plt.xlabel("Hemoglobin")
plt.ylabel("Number of Participants")
plt.tight_layout()
plt.savefig(output_dir / "hemoglobin_distribution.png")
plt.close()


# 4. Vitamin D distribution
plt.figure(figsize=(8, 5))
df["LBXVIDMS"].dropna().hist(bins=30)
plt.title("Serum Vitamin D Distribution")
plt.xlabel("Vitamin D")
plt.ylabel("Number of Participants")
plt.tight_layout()
plt.savefig(output_dir / "vitamin_d_distribution.png")
plt.close()


# 5. Ferritin distribution
plt.figure(figsize=(8, 5))
df["LBXFER"].dropna().hist(bins=30)
plt.title("Ferritin Distribution")
plt.xlabel("Ferritin")
plt.ylabel("Number of Participants")
plt.tight_layout()
plt.savefig(output_dir / "ferritin_distribution.png")
plt.close()


# 6. RBC Folate distribution
plt.figure(figsize=(8, 5))
df["LBDRFO"].dropna().hist(bins=30)
plt.title("RBC Folate Distribution")
plt.xlabel("RBC Folate")
plt.ylabel("Number of Participants")
plt.tight_layout()
plt.savefig(output_dir / "rbc_folate_distribution.png")
plt.close()


# 7. Dietary nutrient distributions
dietary_columns = [
    "iron",
    "vitamin_d",
    "vitamin_b12",
    "folate",
    "calcium",
    "magnesium",
    "zinc",
    "vitamin_a",
    "vitamin_c",
    "vitamin_k"
]

for column in dietary_columns:

    plt.figure(figsize=(8, 5))
    df[column].dropna().hist(bins=30)
    plt.title(f"{column.replace('_', ' ').title()} Intake Distribution")
    plt.xlabel(column.replace("_", " ").title())
    plt.ylabel("Number of Participants")
    plt.tight_layout()
    plt.savefig(output_dir / f"{column}_distribution.png")
    plt.close()


print("\nCharts saved to:")
print(output_dir)

print("\nNumber of chart files created:")
print(len(list(output_dir.glob("*.png"))))

print("\n" + "=" * 80)
print("EDA VISUALIZATION COMPLETED")
print("=" * 80)