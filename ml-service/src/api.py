from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import pandas as pd
import numpy as np
import joblib
from pathlib import Path


# ============================================================
# TASK 9 - FASTAPI PREDICTION SERVICE
# ============================================================

app = FastAPI(
    title="NutriHealth AI Prediction API",
    description="AI-based nutritional deficiency risk prediction",
    version="1.0"
)
# Allow React frontend to communicate with FastAPI

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://nutrihealthai.netlify.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)




# ------------------------------------------------------------
# LOAD MODEL
# ------------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = BASE_DIR / "models" / "multilabel" / "multilabel_random_forest.pkl"

try:
    pipeline = joblib.load(MODEL_PATH)
    print("ML model loaded successfully.")

except Exception as e:
    pipeline = None
    print("Error loading model:", e)

# ------------------------------------------------------------
# LOAD SHAP FEATURE IMPORTANCE
# ------------------------------------------------------------

SHAP_DIR = BASE_DIR / "data" / "processed" / "shap_results"

SHAP_FILES = {
    "iron_deficiency": SHAP_DIR / "iron_deficiency_shap_importance.csv",
    "vitamin_d_deficiency": SHAP_DIR / "vitamin_d_deficiency_shap_importance.csv",
    "folate_deficiency": SHAP_DIR / "folate_deficiency_shap_importance.csv"
}


def get_top_shap_features(target, top_n=5):

    try:
        shap_file = SHAP_FILES[target]

        shap_df = pd.read_csv(shap_file)

        top_features = (
            shap_df
            .sort_values("mean_abs_shap", ascending=False)
            .head(top_n)["feature"]
            .tolist()
        )

        return top_features

    except Exception as e:

        print(
            f"Could not load SHAP features for {target}:",
            e
        )

        return []
def make_feature_name(feature):

    feature = feature.replace("num__", "")
    feature = feature.replace("cat__", "")

    feature_names = {
        "ridageyr": "Age",
        "riagendr": "Gender",
        "ridreth3": "Race / Ethnicity",
        "dmdeduc2": "Education",
        "indfmpir": "Income-to-poverty ratio",

        "calories": "Calories",
        "protein": "Protein",
        "carbohydrates": "Carbohydrates",
        "sugar": "Sugar",
        "fiber": "Fiber",
        "fat": "Fat",

        "vitamin_b12": "Vitamin B12",
        "folate": "Folate",
        "vitamin_c": "Vitamin C",
        "vitamin_d": "Vitamin D",
        "calcium": "Calcium",
        "magnesium": "Magnesium",
        "iron": "Iron",
        "zinc": "Zinc",
        "vitamin_a": "Vitamin A",
        "vitamin_k": "Vitamin K",

        "lbxmagn": "Magnesium blood value",
        "lbxsca": "Calcium blood value",

        "mcq053": "Health condition",
        "mcq010": "Asthma",
        "agq030": "Alcohol use",

        "mcq160m": "Health condition",
        "mcq160l": "Health condition",
        "mcq160p": "Health condition",
        "mcq160a": "Health condition",
        "mcq160b": "Health condition",
        "mcq160c": "Health condition",
        "mcq160e": "Health condition",
        "mcq160f": "Health condition"
    }

    # Handle one-hot categorical features
    for key, value in feature_names.items():


        if feature.startswith(key + "_"):
            return value

    return feature_names.get(
        feature,
        feature
    )

# ------------------------------------------------------------
# REQUEST MODEL
# ------------------------------------------------------------

class PredictionRequest(BaseModel):

    ridageyr: float = Field(..., ge=0, le=120)
    riagendr: float
    ridreth3: float | None = None
    dmdeduc2: float | None = None
    indfmpir: float | None = None

    lbxmagn: float | None = None
    lbxsca: float | None = None

    mcq053: float | None = None
    mcq010: float | None = None
    agq030: float | None = None

    mcq160m: float | None = None
    mcq160l: float | None = None
    mcq160p: float | None = None
    mcq160a: float | None = None
    mcq160b: float | None = None
    mcq160c: float | None = None
    mcq160e: float | None = None
    mcq160f: float | None = None

    calories: float | None = None
    protein: float | None = None
    carbohydrates: float | None = None
    sugar: float | None = None
    fiber: float | None = None
    fat: float | None = None

    vitamin_b12: float | None = None
    folate: float | None = None
    vitamin_c: float | None = None
    vitamin_d: float | None = None
    calcium: float | None = None
    magnesium: float | None = None
    iron: float | None = None
    zinc: float | None = None
    vitamin_a: float | None = None
    vitamin_k: float | None = None


# ------------------------------------------------------------
# HEALTH CHECK
# ------------------------------------------------------------

@app.get("/")
def home():

    return {
        "message": "NutriHealth AI Prediction API is running",
        "endpoint": "/predict",
        "method": "POST"
    }


# ------------------------------------------------------------
# PREDICTION ENDPOINT
# ------------------------------------------------------------

@app.post("/predict")
def predict(request: PredictionRequest):

    if pipeline is None:

        raise HTTPException(
            status_code=500,
            detail="ML model could not be loaded."
        )

    try:

        # Convert request into dictionary
        data = request.model_dump()

        # Create DataFrame
        input_df = pd.DataFrame([data])

        # ----------------------------------------------------
        # PREDICTION
        # ----------------------------------------------------

        predictions = pipeline.predict(input_df)

        # ----------------------------------------------------
        # PROBABILITIES
        # ----------------------------------------------------

        preprocessor = pipeline.named_steps["preprocessor"]
        model = pipeline.named_steps["model"]

        processed_input = preprocessor.transform(
            input_df
        )

        target_names = [
            "iron_deficiency",
            "vitamin_d_deficiency",
            "folate_deficiency"
        ]

        response = {}

        # ----------------------------------------------------
        # CREATE RESULT FOR EACH DEFICIENCY
        # ----------------------------------------------------

        for i, target in enumerate(target_names):

            estimator = model.estimators_[i]

            probability = estimator.predict_proba(
                processed_input
            )[0][1]

            prediction = int(
                predictions[0][i]
            )

            # Get top 5 SHAP important features
            shap_features = get_top_shap_features(
             target,
              top_n=5
             )

# Convert technical names to readable names
            important_factors = [
             make_feature_name(feature)
             for feature in shap_features
           ]

            response[target] = {
            "prediction": prediction,
             "status": (
              "Deficiency risk detected"
              if prediction == 1
           else "No deficiency risk detected"
    ),
    "risk_score": round(
    probability * 100,
    2
),
"important_factors": important_factors
}

        return {
            "success": True,
            "message": "Prediction generated successfully",
            "results": response,
            "note": (
                "Risk scores are model-estimated probabilities "
                "and are not medical diagnoses."
            )
        }

    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )