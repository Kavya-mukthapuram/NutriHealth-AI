import os
import pandas as pd
import joblib

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report
)

# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

PREPROCESSED_DIR = os.path.join(
    BASE_DIR, "data", "processed", "preprocessed"
)

MODEL_DIR = os.path.join(
    BASE_DIR, "models", "random_forest_leakage_safe"
)

RESULT_DIR = os.path.join(
    BASE_DIR, "data", "processed", "model_results_leakage_safe"
)

os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(RESULT_DIR, exist_ok=True)


# ============================================================
# TARGETS
# ============================================================

TARGETS = [
    "iron_deficiency",
    "vitamin_d_deficiency",
    "folate_deficiency"
]


# ============================================================
# LOAD DATA
# ============================================================

X_train = pd.read_csv(
    os.path.join(PREPROCESSED_DIR, "X_train.csv")
)

X_validation = pd.read_csv(
    os.path.join(PREPROCESSED_DIR, "X_validation.csv")
)

X_test = pd.read_csv(
    os.path.join(PREPROCESSED_DIR, "X_test.csv")
)

y_train = pd.read_csv(
    os.path.join(PREPROCESSED_DIR, "y_train.csv")
)

y_validation = pd.read_csv(
    os.path.join(PREPROCESSED_DIR, "y_validation.csv")
)

y_test = pd.read_csv(
    os.path.join(PREPROCESSED_DIR, "y_test.csv")
)


print("=" * 70)
print("TASK 5 — LEAKAGE-SAFE RANDOM FOREST BASELINE")
print("=" * 70)

print("\nFeature shapes:")
print("Training   :", X_train.shape)
print("Validation :", X_validation.shape)
print("Testing    :", X_test.shape)


# ============================================================
# IMPORTANT NOTE
# ============================================================

print("\nTarget-defining biomarkers:")
print("----------------------------------")
print("Iron       : ferritin / transferrin / hemoglobin / serum iron")
print("Vitamin D  : lbxvidms")
print("Folate     : lbdrfo")


# ============================================================
# TRAIN EACH TARGET
# ============================================================

for target in TARGETS:

    print("\n")
    print("=" * 70)
    print("TARGET:", target)
    print("=" * 70)

    # --------------------------------------------------------
    # Identify target-specific biomarker columns
    # --------------------------------------------------------

    if target == "iron_deficiency":
        excluded_terms = [
            "lbxfer",
            "lbxtfr",
            "lbxhgb",
            "lbxsir"
        ]

    elif target == "vitamin_d_deficiency":
        excluded_terms = [
            "lbxvidms"
        ]

    elif target == "folate_deficiency":
        excluded_terms = [
            "lbdrfo"
        ]

    # --------------------------------------------------------
    # Find transformed columns corresponding to biomarkers
    # --------------------------------------------------------

    excluded_columns = []

    for column in X_train.columns:
        column_lower = column.lower()

        for term in excluded_terms:

            if column_lower == term:
                excluded_columns.append(column)

            elif column_lower.startswith(term + "_"):
                excluded_columns.append(column)

    excluded_columns = sorted(set(excluded_columns))

    print("\nExcluded target-defining features:")
    if excluded_columns:
        for col in excluded_columns:
            print(" -", col)
    else:
        print(" - None found in transformed feature names")

    # --------------------------------------------------------
    # Remove leakage features
    # --------------------------------------------------------

    Xtr = X_train.drop(
        columns=excluded_columns,
        errors="ignore"
    )

    Xv = X_validation.drop(
        columns=excluded_columns,
        errors="ignore"
    )

    Xt = X_test.drop(
        columns=excluded_columns,
        errors="ignore"
    )

    print("\nLeakage-safe feature shapes:")
    print("Training   :", Xtr.shape)
    print("Validation :", Xv.shape)
    print("Testing    :", Xt.shape)

    # --------------------------------------------------------
    # Target-specific valid rows
    # --------------------------------------------------------

    train_mask = y_train[target].notna()
    val_mask = y_validation[target].notna()
    test_mask = y_test[target].notna()

    Xtr_valid = Xtr.loc[train_mask]
    ytr_valid = y_train.loc[train_mask, target].astype(int)

    Xv_valid = Xv.loc[val_mask]
    yv_valid = y_validation.loc[val_mask, target].astype(int)

    Xt_valid = Xt.loc[test_mask]
    yt_valid = y_test.loc[test_mask, target].astype(int)

    print("\nValid target samples:")
    print("Training   :", len(ytr_valid))
    print("Validation :", len(yv_valid))
    print("Testing    :", len(yt_valid))

    print("\nClass distribution - Training:")
    print(ytr_valid.value_counts().sort_index())

    # --------------------------------------------------------
    # Random Forest
    # --------------------------------------------------------

    print("\nTraining leakage-safe Random Forest...")

    model = RandomForestClassifier(
        n_estimators=200,
        random_state=42,
        class_weight="balanced",
        n_jobs=-1
    )

    model.fit(
        Xtr_valid,
        ytr_valid
    )

    print("Training completed.")

    # --------------------------------------------------------
    # VALIDATION
    # --------------------------------------------------------

    val_predictions = model.predict(Xv_valid)
    val_probabilities = model.predict_proba(Xv_valid)[:, 1]

    val_accuracy = accuracy_score(
        yv_valid,
        val_predictions
    )

    val_precision = precision_score(
        yv_valid,
        val_predictions,
        zero_division=0
    )

    val_recall = recall_score(
        yv_valid,
        val_predictions,
        zero_division=0
    )

    val_f1 = f1_score(
        yv_valid,
        val_predictions,
        zero_division=0
    )

    val_roc_auc = roc_auc_score(
        yv_valid,
        val_probabilities
    )

    print("\nVALIDATION RESULTS")
    print("-" * 50)
    print(f"Accuracy  : {val_accuracy:.4f}")
    print(f"Precision : {val_precision:.4f}")
    print(f"Recall    : {val_recall:.4f}")
    print(f"F1-score  : {val_f1:.4f}")
    print(f"ROC-AUC   : {val_roc_auc:.4f}")

    # --------------------------------------------------------
    # TEST
    # --------------------------------------------------------

    test_predictions = model.predict(Xt_valid)
    test_probabilities = model.predict_proba(Xt_valid)[:, 1]

    test_accuracy = accuracy_score(
        yt_valid,
        test_predictions
    )

    test_precision = precision_score(
        yt_valid,
        test_predictions,
        zero_division=0
    )

    test_recall = recall_score(
        yt_valid,
        test_predictions,
        zero_division=0
    )

    test_f1 = f1_score(
        yt_valid,
        test_predictions,
        zero_division=0
    )

    test_roc_auc = roc_auc_score(
        yt_valid,
        test_probabilities
    )

    print("\nTEST RESULTS")
    print("-" * 50)
    print(f"Accuracy  : {test_accuracy:.4f}")
    print(f"Precision : {test_precision:.4f}")
    print(f"Recall    : {test_recall:.4f}")
    print(f"F1-score  : {test_f1:.4f}")
    print(f"ROC-AUC   : {test_roc_auc:.4f}")

    # --------------------------------------------------------
    # CONFUSION MATRIX
    # --------------------------------------------------------

    cm = confusion_matrix(
        yt_valid,
        test_predictions
    )

    print("\nTEST CONFUSION MATRIX")
    print("-" * 50)
    print(cm)

    print("\nClassification Report")
    print("-" * 50)
    print(
        classification_report(
            yt_valid,
            test_predictions,
            zero_division=0
        )
    )

    # --------------------------------------------------------
    # SAVE MODEL
    # --------------------------------------------------------

    model_path = os.path.join(
        MODEL_DIR,
        f"{target}_random_forest_leakage_safe.pkl"
    )

    joblib.dump(
        model,
        model_path
    )

    print("Model saved:")
    print(model_path)

    # --------------------------------------------------------
    # SAVE METRICS
    # --------------------------------------------------------

    metrics = pd.DataFrame({
        "target": [target],
        "accuracy": [test_accuracy],
        "precision": [test_precision],
        "recall": [test_recall],
        "f1_score": [test_f1],
        "roc_auc": [test_roc_auc],
        "true_negative": [cm[0, 0]],
        "false_positive": [cm[0, 1]],
        "false_negative": [cm[1, 0]],
        "true_positive": [cm[1, 1]]
    })

    metrics_path = os.path.join(
        RESULT_DIR,
        f"{target}_random_forest_leakage_safe_metrics.csv"
    )

    metrics.to_csv(
        metrics_path,
        index=False
    )

    print("Metrics saved:")
    print(metrics_path)


print("\n")
print("=" * 70)
print("TASK 5 — LEAKAGE-SAFE RANDOM FOREST COMPLETED")
print("=" * 70)