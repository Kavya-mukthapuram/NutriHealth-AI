import os
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
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

DATA_PATH = os.path.join(
    BASE_DIR,
    "data",
    "processed",
    "nutrition_ml_labeled.csv"
)

MODEL_DIR = os.path.join(
    BASE_DIR,
    "models",
    "random_forest_final"
)

RESULT_DIR = os.path.join(
    BASE_DIR,
    "data",
    "processed",
    "model_results_final"
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

df = pd.read_csv(DATA_PATH)

print("=" * 70)
print("TASK 5 — FINAL LEAKAGE-SAFE RANDOM FOREST")
print("=" * 70)

print("\nDataset shape:")
print(df.shape)


# ============================================================
# BASE FEATURES
# ============================================================

all_features = [
    "ridageyr",
    "riagendr",
    "ridreth3",
    "dmdeduc2",
    "indfmpir",

    "calories",
    "protein",
    "carbohydrates",
    "sugar",
    "fiber",
    "fat",
    "vitamin_b12",
    "folate",
    "vitamin_c",
    "vitamin_d",
    "calcium",
    "magnesium",
    "iron",
    "zinc",
    "vitamin_a",
    "vitamin_k",

    "lbxhgb",
    "lbxfer",
    "lbxtfr",
    "lbdrfo",
    "lbxvidms",
    "lbxsir",
    "lbxmagn",
    "lbxsca",

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


# ============================================================
# CATEGORICAL / NUMERICAL
# ============================================================

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

numerical_features = [
    feature for feature in all_features
    if feature not in categorical_features
]


# ============================================================
# PROCESS EACH TARGET
# ============================================================

for target in TARGETS:

    print("\n")
    print("=" * 70)
    print("TARGET:", target)
    print("=" * 70)

    # --------------------------------------------------------
    # REMOVE TARGET-DEFINING BIOMARKERS
    # --------------------------------------------------------

    if target == "iron_deficiency":

        excluded_features = [
            "lbxfer",
            "lbxtfr",
            "lbxhgb",
            "lbxsir"
        ]

    elif target == "vitamin_d_deficiency":

        excluded_features = [
            "lbxvidms"
        ]

    elif target == "folate_deficiency":

        excluded_features = [
            "lbdrfo"
        ]

    print("\nExcluded target-defining biomarkers:")

    for feature in excluded_features:
        print(" -", feature)

    # --------------------------------------------------------
    # TARGET-SPECIFIC FEATURES
    # --------------------------------------------------------

    features = [
        feature
        for feature in all_features
        if feature not in excluded_features
    ]

    target_categorical = [
        feature
        for feature in categorical_features
        if feature in features
    ]

    target_numerical = [
        feature
        for feature in numerical_features
        if feature in features
    ]

    print("\nTotal input features:", len(features))
    print("Categorical features:", len(target_categorical))
    print("Numerical features:", len(target_numerical))

    # --------------------------------------------------------
    # KEEP ONLY VALID TARGET ROWS
    # --------------------------------------------------------

    target_df = df[df[target].notna()].copy()

    X = target_df[features]
    y = target_df[target].astype(int)

    print("\nValid samples:", len(target_df))

    print("\nClass distribution:")
    print(y.value_counts().sort_index())

    # --------------------------------------------------------
    # TRAIN / VALIDATION / TEST SPLIT
    # --------------------------------------------------------

    X_train, X_temp, y_train, y_temp = train_test_split(
        X,
        y,
        test_size=0.30,
        random_state=42,
        stratify=y
    )

    X_validation, X_test, y_validation, y_test = train_test_split(
        X_temp,
        y_temp,
        test_size=0.50,
        random_state=42,
        stratify=y_temp
    )

    print("\nSplit sizes:")
    print("Training   :", len(X_train))
    print("Validation :", len(X_validation))
    print("Testing    :", len(X_test))

    # --------------------------------------------------------
    # PREPROCESSING
    # --------------------------------------------------------

    numerical_pipeline = Pipeline([
        (
            "imputer",
            SimpleImputer(strategy="median")
        ),
        (
            "scaler",
            StandardScaler()
        )
    ])

    categorical_pipeline = Pipeline([
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
    ])

    preprocessor = ColumnTransformer([
        (
            "numerical",
            numerical_pipeline,
            target_numerical
        ),
        (
            "categorical",
            categorical_pipeline,
            target_categorical
        )
    ])

    # --------------------------------------------------------
    # RANDOM FOREST PIPELINE
    # --------------------------------------------------------

    model = RandomForestClassifier(
        n_estimators=200,
        random_state=42,
        class_weight="balanced",
        n_jobs=-1
    )

    pipeline = Pipeline([
        (
            "preprocessor",
            preprocessor
        ),
        (
            "classifier",
            model
        )
    ])

    # --------------------------------------------------------
    # TRAIN
    # --------------------------------------------------------

    print("\nTraining Random Forest...")

    pipeline.fit(
        X_train,
        y_train
    )

    print("Training completed.")

    # --------------------------------------------------------
    # VALIDATION
    # --------------------------------------------------------

    validation_predictions = pipeline.predict(X_validation)

    validation_probabilities = pipeline.predict_proba(
        X_validation
    )[:, 1]

    validation_accuracy = accuracy_score(
        y_validation,
        validation_predictions
    )

    validation_precision = precision_score(
        y_validation,
        validation_predictions,
        zero_division=0
    )

    validation_recall = recall_score(
        y_validation,
        validation_predictions,
        zero_division=0
    )

    validation_f1 = f1_score(
        y_validation,
        validation_predictions,
        zero_division=0
    )

    validation_roc_auc = roc_auc_score(
        y_validation,
        validation_probabilities
    )

    print("\nVALIDATION RESULTS")
    print("-" * 50)
    print(f"Accuracy  : {validation_accuracy:.4f}")
    print(f"Precision : {validation_precision:.4f}")
    print(f"Recall    : {validation_recall:.4f}")
    print(f"F1-score  : {validation_f1:.4f}")
    print(f"ROC-AUC   : {validation_roc_auc:.4f}")

    # --------------------------------------------------------
    # TEST
    # --------------------------------------------------------

    test_predictions = pipeline.predict(X_test)

    test_probabilities = pipeline.predict_proba(
        X_test
    )[:, 1]

    test_accuracy = accuracy_score(
        y_test,
        test_predictions
    )

    test_precision = precision_score(
        y_test,
        test_predictions,
        zero_division=0
    )

    test_recall = recall_score(
        y_test,
        test_predictions,
        zero_division=0
    )

    test_f1 = f1_score(
        y_test,
        test_predictions,
        zero_division=0
    )

    test_roc_auc = roc_auc_score(
        y_test,
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
        y_test,
        test_predictions
    )

    print("\nTEST CONFUSION MATRIX")
    print("-" * 50)
    print(cm)

    print("\nClassification Report")
    print("-" * 50)

    print(
        classification_report(
            y_test,
            test_predictions,
            zero_division=0
        )
    )

    # --------------------------------------------------------
    # SAVE PIPELINE
    # --------------------------------------------------------

    model_path = os.path.join(
        MODEL_DIR,
        f"{target}_random_forest_final.pkl"
    )

    joblib.dump(
        pipeline,
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
        f"{target}_random_forest_final_metrics.csv"
    )

    metrics.to_csv(
        metrics_path,
        index=False
    )

    print("Metrics saved:")
    print(metrics_path)


# ============================================================
# COMPLETE
# ============================================================

print("\n")
print("=" * 70)
print("TASK 5 — FINAL LEAKAGE-SAFE RANDOM FOREST COMPLETED")
print("=" * 70)