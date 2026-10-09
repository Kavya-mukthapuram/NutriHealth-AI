import pandas as pd
from pathlib import Path

RAW = Path("data/raw")
PROCESSED = Path("data/processed")

PROCESSED.mkdir(parents=True, exist_ok=True)


# --------------------------------------------------
# 1. Load datasets
# --------------------------------------------------

demo = pd.read_sas(RAW / "DEMO_L.xpt", format="xport")
dr1 = pd.read_sas(RAW / "DR1TOT_L.xpt", format="xport")
dr2 = pd.read_sas(RAW / "DR2TOT_L.xpt", format="xport")

cbc = pd.read_sas(RAW / "CBC_L.xpt", format="xport")
fertin = pd.read_sas(RAW / "FERTIN_L.xpt", format="xport")
tfr = pd.read_sas(RAW / "TFR_L.xpt", format="xport")
folate = pd.read_sas(RAW / "FOLATE_L.xpt", format="xport")
vid = pd.read_sas(RAW / "VID_L.xpt", format="xport")
biopro = pd.read_sas(RAW / "BIOPRO_L.xpt", format="xport")

mcq = pd.read_sas(RAW / "MCQ_L.xpt", format="xport")


# --------------------------------------------------
# 2. Select demographic variables
# --------------------------------------------------

demo = demo[
    [
        "SEQN",
        "RIDAGEYR",
        "RIAGENDR",
        "RIDRETH3",
        "DMDEDUC2",
        "INDFMPIR"
    ]
]


# --------------------------------------------------
# 3. Select Day 1 dietary variables
# --------------------------------------------------

dr1 = dr1[
    [
        "SEQN",
        "DR1TKCAL",
        "DR1TPROT",
        "DR1TCARB",
        "DR1TSUGR",
        "DR1TFIBE",
        "DR1TTFAT",
        "DR1TVB12",
        "DR1TFOLA",
        "DR1TVC",
        "DR1TVD",
        "DR1TCALC",
        "DR1TMAGN",
        "DR1TIRON",
        "DR1TZINC",
        "DR1TVARA",
        "DR1TVK"
    ]
]


# --------------------------------------------------
# 4. Select Day 2 dietary variables
# --------------------------------------------------

dr2 = dr2[
    [
        "SEQN",
        "DR2TKCAL",
        "DR2TPROT",
        "DR2TCARB",
        "DR2TSUGR",
        "DR2TFIBE",
        "DR2TTFAT",
        "DR2TVB12",
        "DR2TFOLA",
        "DR2TVC",
        "DR2TVD",
        "DR2TCALC",
        "DR2TMAGN",
        "DR2TIRON",
        "DR2TZINC",
        "DR2TVARA",
        "DR2TVK"
    ]
]


# --------------------------------------------------
# 5. Select blood/laboratory variables
# --------------------------------------------------

cbc = cbc[
    [
        "SEQN",
        "LBXHGB"
    ]
]

fertin = fertin[
    [
        "SEQN",
        "LBXFER"
    ]
]

tfr = tfr[
    [
        "SEQN",
        "LBXTFR"
    ]
]

folate = folate[
    [
        "SEQN",
        "LBDRFO"
    ]
]

vid = vid[
    [
        "SEQN",
        "LBXVIDMS"
    ]
]

biopro = biopro[
    [
        "SEQN",
        "LBXSIR",
        "LBXMAGN",
        "LBXSCA"
    ]
]


# --------------------------------------------------
# 6. Select health-condition variables
# --------------------------------------------------

mcq = mcq[
    [
        "SEQN",
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
]


# --------------------------------------------------
# 7. Merge everything using SEQN
# --------------------------------------------------

df = demo

datasets = [
    dr1,
    dr2,
    cbc,
    fertin,
    tfr,
    folate,
    vid,
    biopro,
    mcq
]

for dataset in datasets:
    df = df.merge(
        dataset,
        on="SEQN",
        how="left"
    )


# --------------------------------------------------
# 8. Create average dietary values
# --------------------------------------------------

diet_pairs = {
    "calories": ("DR1TKCAL", "DR2TKCAL"),
    "protein": ("DR1TPROT", "DR2TPROT"),
    "carbohydrates": ("DR1TCARB", "DR2TCARB"),
    "sugar": ("DR1TSUGR", "DR2TSUGR"),
    "fiber": ("DR1TFIBE", "DR2TFIBE"),
    "fat": ("DR1TTFAT", "DR2TTFAT"),
    "vitamin_b12": ("DR1TVB12", "DR2TVB12"),
    "folate": ("DR1TFOLA", "DR2TFOLA"),
    "vitamin_c": ("DR1TVC", "DR2TVC"),
    "vitamin_d": ("DR1TVD", "DR2TVD"),
    "calcium": ("DR1TCALC", "DR2TCALC"),
    "magnesium": ("DR1TMAGN", "DR2TMAGN"),
    "iron": ("DR1TIRON", "DR2TIRON"),
    "zinc": ("DR1TZINC", "DR2TZINC"),
    "vitamin_a": ("DR1TVARA", "DR2TVARA"),
    "vitamin_k": ("DR1TVK", "DR2TVK")
}

for new_name, (day1, day2) in diet_pairs.items():
    df[new_name] = df[[day1, day2]].mean(axis=1, skipna=True)


# --------------------------------------------------
# 9. Remove original Day 1 / Day 2 columns
# --------------------------------------------------

columns_to_drop = []

for day1, day2 in diet_pairs.values():
    columns_to_drop.extend([day1, day2])

df = df.drop(columns=columns_to_drop)


# --------------------------------------------------
# 10. Save processed dataset
# --------------------------------------------------

output = PROCESSED / "nutrition_ml_dataset.csv"

df.to_csv(output, index=False)

print("=" * 70)
print("NHANES PREPROCESSING COMPLETED")
print("=" * 70)

print("Rows:", len(df))
print("Columns:", len(df.columns))

print("\nOutput file:")
print(output)

print("\nFirst 5 rows:")
print(df.head())