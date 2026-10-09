import pandas as pd
import joblib
import os

from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler


# ============================================================
# TASK 4 — LEAKAGE-SAFE PREPROCESSING
# ============================================================

SPLIT_DIR = "data/processed/splits"
OUTPUT_DIR = "data/processed/preprocessed"
MODEL_DIR = "models"

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(MODEL_DIR, exist_ok=True)


# ------------------------------------------------------------
# 1. Load train, validation and test datasets
# ------------------------------------------------------------

train_df = pd.read_csv(
    f"{SPLIT_DIR}/train.csv"
)

validation_df = pd.read_csv(
    f"{SPLIT_DIR}/validation.csv"
)

test_df = pd.read_csv(
    f"{SPLIT_DIR}/test.csv"
)


print("=" * 70)
print("TASK 4 — LEAKAGE-SAFE PREPROCESSING")
print("=" * 70)

print("\nDataset sizes:")
print("Training   :", len(train_df))
print("Validation :", len(validation_df))
print("Testing    :", len(test_df))


# ------------------------------------------------------------
# 2. Target columns
# ------------------------------------------------------------

TARGET_COLUMNS = [
    "iron_deficiency",
    "vitamin_d_deficiency",
    "folate_deficiency"
]


# ------------------------------------------------------------
# 3. Separate X and y
# ------------------------------------------------------------

X_train = train_df.drop(columns=TARGET_COLUMNS)
X_validation = validation_df.drop(columns=TARGET_COLUMNS)
X_test = test_df.drop(columns=TARGET_COLUMNS)

y_train = train_df[TARGET_COLUMNS]
y_validation = validation_df[TARGET_COLUMNS]
y_test = test_df[TARGET_COLUMNS]


# ------------------------------------------------------------
# 4. Define categorical features
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
    if col in X_train.columns
]


# ------------------------------------------------------------
# 5. Numerical features
# ------------------------------------------------------------

numerical_features = [
    col for col in X_train.columns
    if col not in categorical_features
]


print("\nCategorical features:", len(categorical_features))
print("Numerical features:", len(numerical_features))


# ------------------------------------------------------------
# 6. Numerical pipeline
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
# 7. Categorical pipeline
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
# 8. Combined preprocessing
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
# 9. FIT ONLY ON TRAINING DATA
# ------------------------------------------------------------

print("\nFitting preprocessing ONLY on training data...")

X_train_processed = preprocessor.fit_transform(
    X_train
)


# ------------------------------------------------------------
# 10. TRANSFORM validation and test
# ------------------------------------------------------------

print("Transforming validation data...")

X_validation_processed = preprocessor.transform(
    X_validation
)

print("Transforming test data...")

X_test_processed = preprocessor.transform(
    X_test
)


# ------------------------------------------------------------
# 11. Display processed shapes
# ------------------------------------------------------------

print("\nProcessed feature shapes:")
print("----------------------------------------")

print(
    "Training   :",
    X_train_processed.shape
)

print(
    "Validation :",
    X_validation_processed.shape
)

print(
    "Testing    :",
    X_test_processed.shape
)


# ------------------------------------------------------------
# 12. Save processed feature matrices
# ------------------------------------------------------------

pd.DataFrame(X_train_processed).to_csv(
    f"{OUTPUT_DIR}/X_train.csv",
    index=False
)

pd.DataFrame(X_validation_processed).to_csv(
    f"{OUTPUT_DIR}/X_validation.csv",
    index=False
)

pd.DataFrame(X_test_processed).to_csv(
    f"{OUTPUT_DIR}/X_test.csv",
    index=False
)


# ------------------------------------------------------------
# 13. Save target datasets
# ------------------------------------------------------------

y_train.to_csv(
    f"{OUTPUT_DIR}/y_train.csv",
    index=False
)

y_validation.to_csv(
    f"{OUTPUT_DIR}/y_validation.csv",
    index=False
)

y_test.to_csv(
    f"{OUTPUT_DIR}/y_test.csv",
    index=False
)


# ------------------------------------------------------------
# 14. Save preprocessing pipeline
# ------------------------------------------------------------

pipeline_path = (
    f"{MODEL_DIR}/leakage_safe_preprocessing_pipeline.pkl"
)

joblib.dump(
    preprocessor,
    pipeline_path
)


# ------------------------------------------------------------
# 15. Final output
# ------------------------------------------------------------

print("\nFiles created:")
print(f"{OUTPUT_DIR}/X_train.csv")
print(f"{OUTPUT_DIR}/X_validation.csv")
print(f"{OUTPUT_DIR}/X_test.csv")
print(f"{OUTPUT_DIR}/y_train.csv")
print(f"{OUTPUT_DIR}/y_validation.csv")
print(f"{OUTPUT_DIR}/y_test.csv")
print(pipeline_path)

print("\n" + "=" * 70)
print("LEAKAGE-SAFE PREPROCESSING COMPLETED")
print("=" * 70)