import pandas as pd
import numpy as np
from pathlib import Path
import joblib

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.multioutput import MultiOutputClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    classification_report
)

# ============================================================
# TASK 7: MULTI-LABEL DEFICIENCY PREDICTION
# ============================================================

print("=" * 70)
print("TASK 7 - MULTI-LABEL DEFICIENCY PREDICTION")
print("=" * 70)

# ------------------------------------------------------------
# PATHS
# ------------------------------------------------------------

input_file = Path(
    "data/processed/multilabel_complete_cases.csv"
)

model_dir = Path("models/multilabel")
results_dir = Path("data/processed/model_results_multilabel")

model_dir.mkdir(parents=True, exist_ok=True)
results_dir.mkdir(parents=True, exist_ok=True)

# ------------------------------------------------------------
# LOAD DATA
# ------------------------------------------------------------

df = pd.read_csv(input_file)

print("\nDataset loaded")
print(f"Rows    : {len(df)}")
print(f"Columns : {len(df.columns)}")

# ------------------------------------------------------------
# TARGETS
# ------------------------------------------------------------

target_columns = [
    "iron_deficiency",
    "vitamin_d_deficiency",
    "folate_deficiency"
]

# ------------------------------------------------------------
# TARGET-DEFINING BIOMARKERS
# Remove these to prevent target leakage
# ------------------------------------------------------------

target_defining_features = [
    "lbxfer",
    "lbxtfr",
    "lbxhgb",
    "lbxsir",
    "lbxvidms",
    "lbdrfo"
]

# ------------------------------------------------------------
# REMOVE ID + TARGETS + TARGET-DEFINING BIOMARKERS
# ------------------------------------------------------------

remove_columns = (
    ["seqn"]
    + target_columns
    + target_defining_features
)

X = df.drop(
    columns=remove_columns,
    errors="ignore"
)

y = df[target_columns].astype(int)

print("\n" + "=" * 70)
print("FEATURE INFORMATION")
print("=" * 70)

print(f"\nOriginal columns : {len(df.columns)}")
print(f"Model features   : {len(X.columns)}")

print("\nRemoved target-defining biomarkers:")

for feature in target_defining_features:
    print(f"  - {feature}")

print("\nFinal feature columns:")

for feature in X.columns:
    print(f"  - {feature}")

# ------------------------------------------------------------
# CATEGORICAL FEATURES
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

# Keep only columns that actually exist
categorical_features = [
    col for col in categorical_features
    if col in X.columns
]

numerical_features = [
    col for col in X.columns
    if col not in categorical_features
]

print("\nCategorical features:", len(categorical_features))
print("Numerical features  :", len(numerical_features))

# ------------------------------------------------------------
# TRAIN / TEST SPLIT
# ------------------------------------------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42
)

print("\n" + "=" * 70)
print("DATA SPLIT")
print("=" * 70)

print(f"\nTraining samples : {len(X_train)}")
print(f"Testing samples  : {len(X_test)}")

# ------------------------------------------------------------
# PREPROCESSING
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
# RANDOM FOREST
# ------------------------------------------------------------

base_model = RandomForestClassifier(
    n_estimators=300,
    class_weight="balanced",
    random_state=42,
    n_jobs=-1
)

model = MultiOutputClassifier(
    base_model
)

# Complete pipeline
pipeline = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        ("model", model)
    ]
)

print("\n" + "=" * 70)
print("TRAINING MULTI-LABEL RANDOM FOREST")
print("=" * 70)

pipeline.fit(X_train, y_train)

print("\nTraining completed successfully.")

# ------------------------------------------------------------
# PREDICTION
# ------------------------------------------------------------

y_pred = pipeline.predict(X_test)

# ------------------------------------------------------------
# METRICS
# ------------------------------------------------------------

print("\n" + "=" * 70)
print("MULTI-LABEL MODEL RESULTS")
print("=" * 70)

results = []

for i, target in enumerate(target_columns):

    true_values = y_test.iloc[:, i]
    predicted_values = y_pred[:, i]

    accuracy = accuracy_score(
        true_values,
        predicted_values
    )

    precision = precision_score(
        true_values,
        predicted_values,
        zero_division=0
    )

    recall = recall_score(
        true_values,
        predicted_values,
        zero_division=0
    )

    f1 = f1_score(
        true_values,
        predicted_values,
        zero_division=0
    )

    # Get probability for positive class
    probabilities = pipeline.named_steps[
        "model"
    ].estimators_[i].predict_proba(
        pipeline.named_steps[
            "preprocessor"
        ].transform(X_test)
    )[:, 1]

    try:
        roc_auc = roc_auc_score(
            true_values,
            probabilities
        )
    except ValueError:
        roc_auc = np.nan

    print(f"\n{target}")
    print("-" * 40)

    print(f"Accuracy : {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall   : {recall:.4f}")
    print(f"F1-score : {f1:.4f}")
    print(f"ROC-AUC  : {roc_auc:.4f}")

    print("\nClassification Report:")
    print(
        classification_report(
            true_values,
            predicted_values,
            zero_division=0
        )
    )

    results.append({
        "target": target,
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1_score": f1,
        "roc_auc": roc_auc
    })

# ------------------------------------------------------------
# SAVE RESULTS
# ------------------------------------------------------------

results_df = pd.DataFrame(results)

results_file = (
    results_dir / "multilabel_random_forest_results.csv"
)

results_df.to_csv(
    results_file,
    index=False
)

# ------------------------------------------------------------
# SAVE MODEL
# ------------------------------------------------------------

model_file = (
    model_dir / "multilabel_random_forest.pkl"
)

joblib.dump(
    pipeline,
    model_file
)

print("\n" + "=" * 70)
print("FILES SAVED")
print("=" * 70)

print(f"\nModel:")
print(model_file)

print("\nResults:")
print(results_file)

print("\n" + "=" * 70)
print("TASK 7 COMPLETED")
print("=" * 70)