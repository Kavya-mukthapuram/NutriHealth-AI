import pandas as pd
import joblib

from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler


# ============================================================
# TASK 4 — FEATURE PREPROCESSING
# ============================================================

INPUT_FILE = "data/processed/nutrition_ml_labeled.csv"
OUTPUT_PIPELINE = "models/preprocessing_pipeline.pkl"


# ------------------------------------------------------------
# 1. Load dataset
# ------------------------------------------------------------

df = pd.read_csv(INPUT_FILE)

print("=" * 70)
print("TASK 4 — FEATURE PREPROCESSING")
print("=" * 70)

print("\nDataset shape:")
print("Rows:", df.shape[0])
print("Columns:", df.shape[1])


# ------------------------------------------------------------
# 2. Define target columns
# ------------------------------------------------------------

TARGET_COLUMNS = [
    "iron_deficiency",
    "vitamin_d_deficiency",
    "folate_deficiency"
]


# ------------------------------------------------------------
# 3. Remove ID and target columns from X
# ------------------------------------------------------------

X = df.drop(columns=["seqn"] + TARGET_COLUMNS)

print("\nFeatures used for preprocessing:", X.shape[1])


# ------------------------------------------------------------
# 4. Identify categorical and numerical features
# ------------------------------------------------------------

categorical_features = [
    "riagendr",
    "ridreth3",
    "dmdeduc2",
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

categorical_features = [
    col for col in categorical_features
    if col in X.columns
]

numerical_features = [
    col for col in X.columns
    if col not in categorical_features
]


print("\nCategorical features:")
print(categorical_features)

print("\nNumber of categorical features:", len(categorical_features))

print("\nNumerical features:")
print(numerical_features)

print("\nNumber of numerical features:", len(numerical_features))


# ------------------------------------------------------------
# 5. Numerical preprocessing
# ------------------------------------------------------------

numerical_pipeline = Pipeline(
    steps=[
        (
            "imputer",
            SimpleImputer(strategy="median")
        ),
        (
            "scaler",
            StandardScaler()
        )
    ]
)


# ------------------------------------------------------------
# 6. Categorical preprocessing
# ------------------------------------------------------------

categorical_pipeline = Pipeline(
    steps=[
        (
            "imputer",
            SimpleImputer(strategy="most_frequent")
        ),
        (
            "encoder",
            OneHotEncoder(
                handle_unknown="ignore",
                sparse_output=False
            )
        )
    ]
)


# ------------------------------------------------------------
# 7. Combine preprocessing
# ------------------------------------------------------------

preprocessor = ColumnTransformer(
    transformers=[
        (
            "numerical",
            numerical_pipeline,
            numerical_features
        ),
        (
            "categorical",
            categorical_pipeline,
            categorical_features
        )
    ]
)


# ------------------------------------------------------------
# 8. Fit preprocessing
# ------------------------------------------------------------

print("\nFitting preprocessing pipeline...")

X_processed = preprocessor.fit_transform(X)


# ------------------------------------------------------------
# 9. Display processed shape
# ------------------------------------------------------------

print("\nOriginal feature count:", X.shape[1])
print("Processed feature count:", X_processed.shape[1])


# ------------------------------------------------------------
# 10. Save preprocessing pipeline
# ------------------------------------------------------------

joblib.dump(
    preprocessor,
    OUTPUT_PIPELINE
)

print("\nPreprocessing pipeline saved:")
print(OUTPUT_PIPELINE)

print("\n" + "=" * 70)
print("TASK 4 — PREPROCESSING COMPLETED")
print("=" * 70)