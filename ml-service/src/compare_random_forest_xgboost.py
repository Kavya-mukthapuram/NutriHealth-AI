import os
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix
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

RESULT_DIR = os.path.join(
    BASE_DIR,
    "data",
    "processed",
    "model_comparison"
)

MODEL_DIR = os.path.join(
    BASE_DIR,
    "models",
    "model_comparison"
)

os.makedirs(RESULT_DIR, exist_ok=True)
os.makedirs(MODEL_DIR, exist_ok=True)


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
print("TASK 6 — RANDOM FOREST vs XGBOOST")
print("=" * 70)

print("\nDataset shape:")
print(df.shape)


# ============================================================
# FEATURES
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
    feature
    for feature in all_features
    if feature not in categorical_features
]


# ============================================================
# STORE ALL RESULTS
# ============================================================

all_results = []


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

    else:

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

    print("\nInput features:", len(features))

    # --------------------------------------------------------
    # VALID TARGET DATA
    # --------------------------------------------------------

    target_df = df[df[target].notna()].copy()

    X = target_df[features]
    y = target_df[target].astype(int)

    print("Valid samples:", len(target_df))

    print("\nClass distribution:")
    print(y.value_counts().sort_index())

    # --------------------------------------------------------
    # TRAIN / VALIDATION / TEST
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

    # ========================================================
    # PREPROCESSING
    # ========================================================

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

    # ========================================================
    # MODELS
    # ========================================================

    models = {

        "Random Forest": RandomForestClassifier(
            n_estimators=200,
            random_state=42,
            class_weight="balanced",
            n_jobs=-1
        ),

        "XGBoost": XGBClassifier(
            n_estimators=200,
            max_depth=4,
            learning_rate=0.05,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42,
            eval_metric="logloss",
            n_jobs=-1
        )
    }


    # ========================================================
    # TRAIN BOTH MODELS
    # ========================================================

    target_results = []

    for model_name, classifier in models.items():

        print("\n")
        print("-" * 60)
        print("MODEL:", model_name)
        print("-" * 60)

        pipeline = Pipeline([
            (
                "preprocessor",
                preprocessor
            ),
            (
                "classifier",
                classifier
            )
        ])

        print("Training...")

        pipeline.fit(
            X_train,
            y_train
        )

        print("Training completed.")

        # ----------------------------------------------------
        # VALIDATION
        # ----------------------------------------------------

        validation_predictions = pipeline.predict(
            X_validation
        )

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

        validation_auc = roc_auc_score(
            y_validation,
            validation_probabilities
        )

        print("\nVALIDATION RESULTS")
        print(f"Accuracy  : {validation_accuracy:.4f}")
        print(f"Precision : {validation_precision:.4f}")
        print(f"Recall    : {validation_recall:.4f}")
        print(f"F1-score  : {validation_f1:.4f}")
        print(f"ROC-AUC   : {validation_auc:.4f}")

        # ----------------------------------------------------
        # TEST
        # ----------------------------------------------------

        test_predictions = pipeline.predict(
            X_test
        )

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

        test_auc = roc_auc_score(
            y_test,
            test_probabilities
        )

        cm = confusion_matrix(
            y_test,
            test_predictions
        )

        print("\nTEST RESULTS")
        print(f"Accuracy  : {test_accuracy:.4f}")
        print(f"Precision : {test_precision:.4f}")
        print(f"Recall    : {test_recall:.4f}")
        print(f"F1-score  : {test_f1:.4f}")
        print(f"ROC-AUC   : {test_auc:.4f}")

        print("\nCONFUSION MATRIX")
        print(cm)

        # ----------------------------------------------------
        # SAVE MODEL
        # ----------------------------------------------------

        safe_name = model_name.lower().replace(" ", "_")

        model_path = os.path.join(
            MODEL_DIR,
            f"{target}_{safe_name}.pkl"
        )

        import joblib

        joblib.dump(
            pipeline,
            model_path
        )

        print("\nModel saved:")
        print(model_path)

        # ----------------------------------------------------
        # STORE RESULTS
        # ----------------------------------------------------

        result = {
            "target": target,
            "model": model_name,

            "validation_accuracy": validation_accuracy,
            "validation_precision": validation_precision,
            "validation_recall": validation_recall,
            "validation_f1": validation_f1,
            "validation_roc_auc": validation_auc,

            "test_accuracy": test_accuracy,
            "test_precision": test_precision,
            "test_recall": test_recall,
            "test_f1": test_f1,
            "test_roc_auc": test_auc,

            "true_negative": cm[0, 0],
            "false_positive": cm[0, 1],
            "false_negative": cm[1, 0],
            "true_positive": cm[1, 1]
        }

        target_results.append(result)
        all_results.append(result)


    # ========================================================
    # TARGET COMPARISON
    # ========================================================

    comparison_df = pd.DataFrame(target_results)

    print("\n")
    print("=" * 70)
    print("MODEL COMPARISON:", target)
    print("=" * 70)

    print(
        comparison_df[
            [
                "model",
                "test_accuracy",
                "test_precision",
                "test_recall",
                "test_f1",
                "test_roc_auc"
            ]
        ].to_string(index=False)
    )

    comparison_path = os.path.join(
        RESULT_DIR,
        f"{target}_comparison.csv"
    )

    comparison_df.to_csv(
        comparison_path,
        index=False
    )

    print("\nComparison saved:")
    print(comparison_path)


# ============================================================
# OVERALL COMPARISON
# ============================================================

all_results_df = pd.DataFrame(all_results)

overall_path = os.path.join(
    RESULT_DIR,
    "random_forest_vs_xgboost_all_targets.csv"
)

all_results_df.to_csv(
    overall_path,
    index=False
)

print("\n")
print("=" * 70)
print("FINAL MODEL COMPARISON")
print("=" * 70)

print(
    all_results_df[
        [
            "target",
            "model",
            "test_accuracy",
            "test_precision",
            "test_recall",
            "test_f1",
            "test_roc_auc"
        ]
    ].to_string(index=False)
)

print("\nOverall comparison saved:")
print(overall_path)

print("\n")
print("=" * 70)
print("TASK 6 — RANDOM FOREST vs XGBOOST COMPLETED")
print("=" * 70)