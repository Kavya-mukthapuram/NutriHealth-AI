import pandas as pd
import numpy as np
import joblib
import shap
from pathlib import Path


# ============================================================
# TASK 8 - RISK SCORE + SHAP EXPLAINABILITY
# ============================================================

print("=" * 70)
print("TASK 8 - RISK SCORE + SHAP EXPLAINABILITY")
print("=" * 70)


# ------------------------------------------------------------
# PATHS
# ------------------------------------------------------------

data_file = Path(
    "data/processed/multilabel_complete_cases.csv"
)

model_file = Path(
    "models/multilabel/multilabel_random_forest.pkl"
)

output_dir = Path(
    "data/processed/shap_results"
)

output_dir.mkdir(
    parents=True,
    exist_ok=True
)


# ------------------------------------------------------------
# LOAD DATA
# ------------------------------------------------------------

df = pd.read_csv(data_file)

print("\nDataset loaded")
print(f"Rows    : {len(df)}")
print(f"Columns : {len(df.columns)}")


# ------------------------------------------------------------
# TARGET COLUMNS
# ------------------------------------------------------------

target_columns = [
    "iron_deficiency",
    "vitamin_d_deficiency",
    "folate_deficiency"
]


# ------------------------------------------------------------
# TARGET-DEFINING BIOMARKERS
# These must NOT be used as prediction features.
# ------------------------------------------------------------

target_defining_features = [
    "lbxfer",
    "lbxtfr",
    "lbxhgb",
    "lbxvidms",
    "lbxsir",
    "lbdrfo"
]


# ------------------------------------------------------------
# CREATE INPUT FEATURES
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

print("\nModel input features:", len(X.columns))


# ------------------------------------------------------------
# LOAD TRAINED MODEL
# ------------------------------------------------------------

pipeline = joblib.load(model_file)

print("\nMulti-label model loaded successfully.")


# ------------------------------------------------------------
# PREPROCESS DATA
# ------------------------------------------------------------

preprocessor = pipeline.named_steps["preprocessor"]

model = pipeline.named_steps["model"]

X_processed = preprocessor.transform(X)

print(
    f"Processed feature shape: {X_processed.shape}"
)


# ------------------------------------------------------------
# GET FEATURE NAMES
# ------------------------------------------------------------

feature_names = preprocessor.get_feature_names_out()

print(
    f"Processed feature names: {len(feature_names)}"
)


# ------------------------------------------------------------
# RISK SCORE CALCULATION
# ------------------------------------------------------------

print("\n" + "=" * 70)
print("RISK SCORE CALCULATION")
print("=" * 70)


risk_scores = pd.DataFrame(index=df.index)


for i, target in enumerate(target_columns):

    estimator = model.estimators_[i]

    probabilities = estimator.predict_proba(
        X_processed
    )[:, 1]

    # Convert probability to percentage
    risk_scores[target + "_risk"] = (
        probabilities * 100
    )

    print(
        f"\n{target}"
    )

    print(
        f"  Minimum risk : {probabilities.min() * 100:.2f}%"
    )

    print(
        f"  Maximum risk : {probabilities.max() * 100:.2f}%"
    )

    print(
        f"  Average risk : {probabilities.mean() * 100:.2f}%"
    )


# ------------------------------------------------------------
# SAVE RISK SCORES
# ------------------------------------------------------------

risk_file = (
    output_dir / "deficiency_risk_scores.csv"
)

risk_scores.to_csv(
    risk_file,
    index=False
)

print(
    f"\nRisk scores saved to:"
)
print(risk_file)


# ============================================================
# SHAP EXPLANATION
# ============================================================

print("\n" + "=" * 70)
print("SHAP EXPLAINABILITY")
print("=" * 70)


# Use a smaller sample to make SHAP computation faster
sample_size = min(300, len(X_processed))

X_sample = X_processed[:sample_size]


# ------------------------------------------------------------
# SHAP FOR EACH DEFICIENCY
# ------------------------------------------------------------

for i, target in enumerate(target_columns):

    print(
        f"\nGenerating SHAP values for: {target}"
    )

    estimator = model.estimators_[i]

    explainer = shap.TreeExplainer(
        estimator
    )

    shap_values = explainer.shap_values(
        X_sample
    )

    # Handle different SHAP output formats
    if isinstance(shap_values, list):
        values = shap_values[1]
    else:
        values = shap_values

        if len(values.shape) == 3:
            values = values[:, :, 1]

    # Mean absolute SHAP importance
    importance = np.abs(values).mean(axis=0)

    shap_df = pd.DataFrame({
        "feature": feature_names,
        "mean_abs_shap": importance
    })

    shap_df = shap_df.sort_values(
        "mean_abs_shap",
        ascending=False
    )

    output_file = (
        output_dir
        / f"{target}_shap_importance.csv"
    )

    shap_df.to_csv(
        output_file,
        index=False
    )

    print("\nTop 10 important features:")

    print(
        shap_df.head(10).to_string(
            index=False
        )
    )

    print(
        f"\nSaved:"
    )
    print(output_file)


# ------------------------------------------------------------
# FINAL MESSAGE
# ------------------------------------------------------------

print("\n" + "=" * 70)
print("TASK 8 COMPLETED")
print("=" * 70)

print("\nOutput folder:")
print(output_dir)