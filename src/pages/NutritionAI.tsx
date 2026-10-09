import { useState } from "react";
import "./NutritionAI.css";

import {
  getFoodRecommendations,
  type RecommendedFood,
} from "../lib/recommendationEngine";

import { 
  getMealFoods,
  type MealFood,
} from "../lib/mealFoodService";

import MealReplacementModal from "../components/MealReplacementModal";
import RecipeModal from "../components/RecipeModal";

import {
  mealRecipes,
  type MealRecipe,
} from "../data/mealRecipes";

import {
  generateSevenDayMealPlan,
} from "../lib/mealPlanGenerator";

import type { DayMealPlan } from "../data/mealPlan";

import { supabase } from "../lib/supabase";

import {
  predictDeficiency,
  type PredictionResponse,
} from "../lib/mlApi";

export default function NutritionAI() {
  const [predictionResult, setPredictionResult] =
    useState<PredictionResponse | null>(null);

  const [predictionHistory, setPredictionHistory] =
  useState<any[]>([]);  

  const [predicting, setPredicting] =
    useState(false);

    const [recipeModalOpen, setRecipeModalOpen] =
  useState(false);

const [selectedRecipe, setSelectedRecipe] =
  useState<MealRecipe | null>(null);

  const [recommendations, setRecommendations] =
    useState<RecommendedFood[]>([]);

  const [message, setMessage] =
    useState("");

  const [mealPlan, setMealPlan] =
    useState<DayMealPlan[]>([]);

  const [mealFoods, setMealFoods] =
    useState<MealFood[]>([]);

  const [selectedDay, setSelectedDay] =
    useState(1);

  const [profile, setProfile] =
    useState<any>(null);

  const [replacementModalOpen, setReplacementModalOpen] =
  useState(false);

const [replacementMealType, setReplacementMealType] =
  useState("");

const [replacementFood, setReplacementFood] =
  useState("");

const [replacementMealIndex, setReplacementMealIndex] =
  useState<number | null>(null);
const [mealPlanHistory, setMealPlanHistory] = useState<any[]>([]);
const [selectedHistoryPlan, setSelectedHistoryPlan] =
  useState<any | null>(null);

  const loadPredictionHistory = async () => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    const { data, error } = await supabase
      .from("deficiency_predictions")
      .select("id, prediction_date, results, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(
        "Prediction history error:",
        error
      );
      return;
    }

    setPredictionHistory(data || []);
    console.log("Prediction history:", data);

  } catch (error) {
    console.error(
      "Load prediction history error:",
      error
    );
  }
};

const loadMealPlanHistory = async () => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    const { data, error } = await supabase
      .from("meal_plans")
      .select("id, plan_date, meal_plan, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Meal plan history error:", error);
      return;
    }

    setMealPlanHistory(data || []);
  } catch (error) {
    console.error("Load meal plan history error:", error);
  }
};


const getDeficiencyRisk = (
  entry: any,
  deficiency: string
) => {
  const results = entry?.results || {};

  const target = deficiency
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  const matchedEntry = Object.entries(results).find(
    ([key]) =>
      key
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .includes(target)
  );

  if (!matchedEntry) {
    return 0;
  }

  return Number(
    (matchedEntry[1] as any)?.risk_score || 0
  );
};


  /*
   * Calculate personalized daily nutrition targets
   * from the user's Health Profile.
   */
  const calculateNutritionTargets = () => {
    if (!profile) {
      return {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
      };
    }

    const age = Number(profile.age);
    const weight = Number(profile.weight);
    const height = Number(profile.height);

    if (!age || !weight || !height) {
      return {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
      };
    }

    /*
     * Mifflin-St Jeor BMR.
     * A moderate activity multiplier is used as a
     * general planning estimate.
     */
    let bmr = 10 * weight + 6.25 * height - 5 * age;

    if (profile.gender === "Male") {
      bmr += 5;
    } else {
      bmr -= 161;
    }

    let calories = bmr * 1.4;

    const goal =
      (profile.health_goals || "").toLowerCase();

    if (
      goal.includes("weight loss") ||
      goal.includes("lose weight") ||
      goal.includes("fat loss")
    ) {
      calories -= 300;
    }

    if (
      goal.includes("weight gain") ||
      goal.includes("gain weight")
    ) {
      calories += 300;
    }

    calories = Math.max(1200, Math.round(calories));

    const protein = Math.round(weight * 1.2);
    const fiber = Math.round(
      calories / 1000 * 14
    );

    const proteinCalories = protein * 4;
    const fiberCalories = fiber * 2;

    const remainingCalories =
      calories -
      proteinCalories -
      fiberCalories;

    const carbs = Math.round(
      (remainingCalories * 0.6) / 4
    );

    const fat = Math.round(
      (remainingCalories * 0.4) / 9
    );

    return {
      calories,
      protein,
      carbs,
      fat,
      fiber,
    };
  };

  const nutritionTargets =
    calculateNutritionTargets();
    const saveMealPlan = async () => {
    if (mealPlan.length === 0) {
      setMessage("Generate a meal plan first.");
      return;
    }

    try {
     
       const {
        data: { user },
      } = await supabase.auth.getUser();
    

      if (!user) {
        setMessage("Please login first.");
        return;
      }
      const { error } = await supabase
        .from("meal_plans")
        .insert({
          user_id: user.id,
          plan_date: new Date()
            .toISOString()
            .split("T")[0],
          meal_plan: mealPlan,
        });

      if (error) {
        console.error(
          "Meal plan save error:",
          error
        );

        setMessage(
          "Unable to save meal plan."
        );
        return;
      }

      await loadMealPlanHistory();

      setMessage(
        "Meal plan saved successfully."
      );
    } catch (error) {
      console.error(
        "Save meal plan error:",
        error
      );

      setMessage(
        "Unable to save meal plan."
      );
    }
  };

  /*
   * Run AI deficiency assessment.
   */
  const runDeficiencyPrediction = async () => {
    setPredicting(true);
    setMessage("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Please login first.");
        return;
      }

      const {
        data: profileData,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        throw profileError;
      }

      if (!profileData) {
        setMessage(
          "Please save your Health Profile first."
        );
        return;
      }

      setProfile(profileData);

      const result = await predictDeficiency({
        ridageyr: Number(profileData.age),

        riagendr:
          profileData.gender === "Female"
            ? 2
            : 1,

        ridreth3: null,
        dmdeduc2: null,
        indfmpir: null,

        lbxmagn: null,
        lbxsca: null,

        mcq053: null,
        mcq010: null,
        agq030: null,

        mcq160m: null,
        mcq160l: null,
        mcq160p: null,
        mcq160a: null,
        mcq160b: null,
        mcq160c: null,
        mcq160e: null,
        mcq160f: null,

        calories: null,
        protein: null,
        carbohydrates: null,
        sugar: null,
        fiber: null,
        fat: null,

        vitamin_b12: null,
        folate: null,
        vitamin_c: null,
        vitamin_d: null,
        calcium: null,
        magnesium: null,
        iron: null,
        zinc: null,
        vitamin_a: null,
        vitamin_k: null,
      });

      setPredictionResult(result);
      // Save AI prediction history
const { error: predictionSaveError } = await supabase
  .from("deficiency_predictions")
  .insert({
    user_id: user.id,
    prediction_date: new Date()
      .toISOString()
      .split("T")[0],
    results: result.results,
  });

  

if (predictionSaveError) {
  console.error(
    "Prediction history save error:",
    predictionSaveError
  );
}
await loadPredictionHistory();
await loadMealPlanHistory();
      /*
       * Generate personalized food recommendations.
       */
     const allergies = profileData.allergies
  ? profileData.allergies
      .split(",")
      .map((item: string) => item.trim())
      .filter(Boolean)
  : [];

const newRecommendations =
  getFoodRecommendations(
    result.results,
    profileData.dietary_restrictions || "",
    allergies
  );

      setRecommendations(
        newRecommendations
      );

      /*
       * Get meal foods based on detected
       * deficiency areas and dietary restrictions.
       */
      const deficiencyKeys =
        Object.entries(result.results)
          .filter(([, value]) => value)
          .map(([key]) => key);

     const foods = await getMealFoods(
  deficiencyKeys,
  profileData.dietary_restrictions || "",
  allergies
);

      setMealFoods(foods);

      /*
       * Generate seven-day plan.
       */
      const generatedPlan =
        generateSevenDayMealPlan(
          newRecommendations,
          foods
        );

     setMealPlan(generatedPlan);

setSelectedDay(1);
setMessage("");

    } catch (error) {
      console.error(
        "Deficiency prediction error:",
        error
      );

      setMessage(
        "Unable to generate deficiency prediction."
      );
    } finally {
      setPredicting(false);
    }
  };

  /*
   * Regenerate the complete seven-day plan.
   */
  const regeneratePlan = () => {
    if (
      recommendations.length === 0 &&
      mealFoods.length === 0
    ) {
      return;
    }

    const newPlan =
      generateSevenDayMealPlan(
        recommendations,
        mealFoods
      );

    setMealPlan(newPlan);
    setSelectedDay(1);
    setMessage("");
  };

  /*
   * Find nutrition information for
   * a meal food.
   */
  const getFoodDetails = (
    foodName: string
  ): MealFood | null => {
    const found = mealFoods.find(
      (food) =>
        food.name.toLowerCase() ===
        foodName.toLowerCase()
    );

    return found || null;
  };
  
  const getRecipeForFood = (
  foodName: string
): MealRecipe | null => {
  const foodLower = foodName.toLowerCase();

  const recipeKey = Object.keys(mealRecipes).find(
    (key) =>
      foodLower.includes(key.toLowerCase())
  );

  if (!recipeKey) {
    return null;
  }

  return mealRecipes[recipeKey];
};
const openRecipe = (foodName: string) => {
  const recipe = getRecipeForFood(foodName);

  if (recipe) {
    setSelectedRecipe(recipe);
    setRecipeModalOpen(true);
    return;
  }

  // const nutrition = getMealNutrition(foodName);

  setSelectedRecipe({
    title: foodName,
    description:
      "A nutrition-focused serving guide for this recommended food.",
    ingredients: [
      `1 suitable serving of ${foodName}`,
      "Optional herbs or natural seasonings",
      "Water as needed",
    ],
    instructions: [
      `Prepare ${foodName} according to your preferred cooking method.`,
      "Avoid adding excessive oil, sugar, or salt.",
      "Serve as part of your personalized meal plan.",
    ],
  });

  setRecipeModalOpen(true);
};

  /*
   * Get selected day's plan.
   */
  const selectedDayPlan =
    mealPlan.find(
      (day) => day.day === selectedDay
    );
    const openReplacementModal = (
  mealType: string,
  foodName: string,
  mealIndex: number
) => {
  setReplacementMealType(mealType);
  setReplacementFood(foodName);
  setReplacementMealIndex(mealIndex);
  setReplacementModalOpen(true);
};

const handleMealReplacement = (
  newFood: MealFood
) => {
  if (replacementMealIndex === null) {
    return;
  }

  setMealPlan((currentPlan) =>
    currentPlan.map((day) => {
      if (day.day !== selectedDay) {
        return day;
      }

      return {
        ...day,
        meals: day.meals.map(
          (meal, index) => {
            if (
              index !== replacementMealIndex
            ) {
              return meal;
            }

            return {
              ...meal,
              foods: [newFood.name],
            };
          }
        ),
      };
    })
  );

  setReplacementModalOpen(false);
  setReplacementMealIndex(null);
};

  /*
   * Calculate meal totals.
   */
  const getMealNutrition = (
    foodName: string
  ) => {
    const food =
      getFoodDetails(foodName);

    if (!food) {
      return {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        nutrient: "",
      };
    }

    return {
      calories: Math.round(food.calories),
      protein: Number(
        food.protein.toFixed(1)
      ),
      carbs: Number(
        food.carbs.toFixed(1)
      ),
      fat: Number(
        food.fat.toFixed(1)
      ),
      fiber: Number(
        food.fiber.toFixed(1)
      ),
      nutrient: food.nutrient,
    };
  };

  return (
    <div className="nutrition-ai-page">

      {/* =========================
          HEADER
      ========================== */}

      <div className="nutrition-ai-header">

        <div>
          <span className="nutrition-ai-label">
            AI NUTRITION INTELLIGENCE
          </span>

          <h1>
            Nutrition AI
          </h1>

          <p>
            Understand your nutrition risks and
            receive personalized food and meal
            recommendations.
          </p>
        </div>

        <div className="nutrition-ai-status">
          <span className="status-dot"></span>
          AI Assessment Ready
        </div>

      </div>


      {/* =========================
          PROFILE SUMMARY
      ========================== */}

      {profile && (
        <div className="nutrition-profile-strip">

          <div className="profile-summary-item">
            <span>Age</span>
            <strong>
              {profile.age} years
            </strong>
          </div>

          <div className="profile-summary-item">
            <span>BMI</span>
            <strong>
              {profile.height &&
              profile.weight
                ? (
                    Number(profile.weight) /
                    Math.pow(
                      Number(profile.height) / 100,
                      2
                    )
                  ).toFixed(1)
                : "—"}
            </strong>
          </div>

          <div className="profile-summary-item">
            <span>Diet</span>
            <strong>
              {profile.dietary_restrictions ||
                "Not specified"}
            </strong>
          </div>

          <div className="profile-summary-item">
            <span>Health Goal</span>
            <strong>
              {profile.health_goals ||
                "Personalized"}
            </strong>
          </div>

          <div className="profile-summary-item">
            <span>Health Consideration</span>
            <strong>
              {profile.medical_conditions ||
                "None reported"}
            </strong>
          </div>

        </div>
      )}


      {/* =========================
          SUMMARY CARDS
      ========================== */}

      <div className="nutrition-ai-summary">

        <div className="nutrition-summary-card">
          <span className="summary-icon">
            ◉
          </span>

          <div>
            <small>
              Overall Risk
            </small>

            <strong>
              {predictionResult
                ? `${Math.round(
                    (
                      predictionResult.results
                        .iron_deficiency
                        .risk_score +
                      predictionResult.results
                        .vitamin_d_deficiency
                        .risk_score +
                      predictionResult.results
                        .folate_deficiency
                        .risk_score
                    ) / 3
                  )}%`
                : "—"}
            </strong>

            <p>
              AI deficiency risk
            </p>
          </div>
        </div>


        <div className="nutrition-summary-card">
          <span className="summary-icon">
            kcal
          </span>

          <div>
            <small>
              Daily Calories
            </small>

            <strong>
              {nutritionTargets.calories
                ? `${nutritionTargets.calories} kcal`
                : "—"}
            </strong>

            <p>
              Personalized target
            </p>
          </div>
        </div>


        <div className="nutrition-summary-card">
          <span className="summary-icon">
            P
          </span>

          <div>
            <small>
              Protein Target
            </small>

            <strong>
              {nutritionTargets.protein
                ? `${nutritionTargets.protein}g`
                : "—"}
            </strong>

            <p>
              Daily target
            </p>
          </div>
        </div>


        <div className="nutrition-summary-card">
          <span className="summary-icon">
            ✦
          </span>

          <div>
            <small>
              AI Goal
            </small>

            <strong>
              {profile?.health_goals ||
                "Personalized"}
            </strong>

            <p>
              Based on health profile
            </p>
          </div>
        </div>

      </div>


      {/* =========================
          DAILY NUTRITION TARGET
      ========================== */}

      <section className="nutrition-ai-section">

        <div className="nutrition-section-heading">

          <div>
            <span>
              PERSONALIZED TARGET
            </span>

            <h2>
              Daily Nutrition Target
            </h2>
          </div>

          <p>
            Your estimated daily nutrition
            targets are calculated from your
            Health Profile.
          </p>

        </div>


        <div className="nutrition-target-grid">

          <div className="nutrition-target-card calories">
            <span>Calories</span>
            <strong>
              {nutritionTargets.calories || "—"}
            </strong>
            <small>kcal / day</small>
          </div>

          <div className="nutrition-target-card protein">
            <span>Protein</span>
            <strong>
              {nutritionTargets.protein || "—"}
            </strong>
            <small>g / day</small>
          </div>

          <div className="nutrition-target-card carbs">
            <span>Carbohydrates</span>
            <strong>
              {nutritionTargets.carbs || "—"}
            </strong>
            <small>g / day</small>
          </div>

          <div className="nutrition-target-card fat">
            <span>Fat</span>
            <strong>
              {nutritionTargets.fat || "—"}
            </strong>
            <small>g / day</small>
          </div>

          <div className="nutrition-target-card fiber">
            <span>Fiber</span>
            <strong>
              {nutritionTargets.fiber || "—"}
            </strong>
            <small>g / day</small>
          </div>

        </div>

      </section>
      

          {/* =========================
          AI RISK HISTORY
      ========================== */}

      <section className="nutrition-ai-section">

        <div className="nutrition-section-heading">

          <div>
            <span>
              AI ASSESSMENT HISTORY
            </span>

            <h2>
              Deficiency Risk History
            </h2>
          </div>

          <p>
            Your previous AI assessment results
            and overall deficiency-risk trend.
          </p>

        </div>

        {predictionHistory.length === 0 ? (
          <div className="prediction-history-empty">
            <strong>
              No assessment history yet
            </strong>

            <p>
              Run an AI assessment to start
              tracking your deficiency risk.
            </p>
          </div>
        ) : (
        
          
         <>
  <div className="risk-history-chart">
  <div className="risk-history-chart-header">
    <div>
      <strong>Deficiency Risk Comparison</strong>
      <span>
        Compare Iron, Vitamin D and Folate risk across your AI assessments
      </span>
    </div>
  </div>

  <div className="risk-bar-chart">

    <div className="risk-bar-y-axis">
      <span>100%</span>
      <span>75%</span>
      <span>50%</span>
      <span>25%</span>
      <span>0%</span>
    </div>

    <div className="risk-bar-chart-area">

      <div className="risk-bar-grid">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>

      <div className="risk-bars">

        {predictionHistory.map((entry, index) => {

          const ironRisk = getDeficiencyRisk(
            entry,
            "iron"
          );

          const vitaminDRisk = getDeficiencyRisk(
            entry,
            "vitamin d"
          );

          const folateRisk = getDeficiencyRisk(
            entry,
            "folate"
          );

          return (
            <div
              className="risk-bar-group"
              key={entry.id || index}
            >

              <div className="risk-bar-values">

                <div
                  className="risk-bar iron-bar"
                  style={{
                    height: `${Math.min(
                      ironRisk,
                      100
                    )}%`,
                  }}
                  title={`Iron: ${ironRisk}%`}
                >
                  <span>
                    {ironRisk.toFixed(0)}%
                  </span>
                </div>

                <div
                  className="risk-bar vitamin-d-bar"
                  style={{
                    height: `${Math.min(
                      vitaminDRisk,
                      100
                    )}%`,
                  }}
                  title={`Vitamin D: ${vitaminDRisk}%`}
                >
                  <span>
                    {vitaminDRisk.toFixed(0)}%
                  </span>
                </div>

                <div
                  className="risk-bar folate-bar"
                  style={{
                    height: `${Math.min(
                      folateRisk,
                      100
                    )}%`,
                  }}
                  title={`Folate: ${folateRisk}%`}
                >
                  <span>
                    {folateRisk.toFixed(0)}%
                  </span>
                </div>

              </div>

              <small>
                {index + 1}
              </small>

            </div>
          );
        })}

      </div>

    </div>

  </div>

  <div className="risk-chart-legend">

    <span>
      <i className="legend-iron" />
      Iron
    </span>

    <span>
      <i className="legend-vitamin-d" />
      Vitamin D
    </span>

    <span>
      <i className="legend-folate" />
      Folate
    </span>

  </div>

  <div className="risk-chart-footer">
    <span>Older assessments</span>
    <span>Assessment number</span>
    <span>Latest</span>
  </div>

</div>

  <div className="prediction-history-list">
      </div>
</>
        )}
      </section>  


      {/* =========================
          AI DEFICIENCY ASSESSMENT
      ========================== */}

      <section className="nutrition-ai-section">

        <div className="nutrition-section-heading">

          <div>
            <span>
              AI ANALYSIS
            </span>

            <h2>
              Deficiency Risk Assessment
            </h2>
          </div>

          <p>
            AI-generated risk estimates for
            selected nutritional deficiencies.
          </p>

        </div>


        <button
          type="button"
          className="run-ai-assessment-btn"
          onClick={runDeficiencyPrediction}
          disabled={predicting}
        >
          {predicting
            ? "Analyzing..."
            : "Run AI Assessment"}
        </button>


      


        <div className="deficiency-risk-grid">

          {/* IRON */}

          <div className="deficiency-risk-card">

            <div className="risk-card-top">

              <span className="risk-nutrient-icon">
                Fe
              </span>

              <div>
                <strong>
                  Iron
                </strong>

                <small>
                  Iron deficiency
                </small>
              </div>

              <span className="risk-status">
                {predictionResult
                  ? predictionResult.results
                      .iron_deficiency
                      .status
                  : "Not assessed"}
              </span>

            </div>


            <div className="risk-score">

              <strong>
                {predictionResult
                  ? `${predictionResult.results
                      .iron_deficiency
                      .risk_score.toFixed(1)}%`
                  : "—"}
              </strong>

              <span>
                risk score
              </span>

            </div>


            <div className="risk-progress">

              <div
                style={{
                  width:
                    predictionResult
                      ? `${predictionResult.results
                          .iron_deficiency
                          .risk_score}%`
                      : "0%",
                }}
              />

            </div>

          </div>


          {/* VITAMIN D */}

          <div className="deficiency-risk-card">

            <div className="risk-card-top">

              <span className="risk-nutrient-icon">
                D
              </span>

              <div>
                <strong>
                  Vitamin D
                </strong>

                <small>
                  Vitamin D deficiency
                </small>
              </div>

              <span className="risk-status">
                {predictionResult
                  ? predictionResult.results
                      .vitamin_d_deficiency
                      .status
                  : "Not assessed"}
              </span>

            </div>


            <div className="risk-score">

              <strong>
                {predictionResult
                  ? `${predictionResult.results
                      .vitamin_d_deficiency
                      .risk_score.toFixed(1)}%`
                  : "—"}
              </strong>

              <span>
                risk score
              </span>

            </div>


            <div className="risk-progress">

              <div
                style={{
                  width:
                    predictionResult
                      ? `${predictionResult.results
                          .vitamin_d_deficiency
                          .risk_score}%`
                      : "0%",
                }}
              />

            </div>

          </div>


          {/* FOLATE */}

          <div className="deficiency-risk-card">

            <div className="risk-card-top">

              <span className="risk-nutrient-icon">
                B9
              </span>

              <div>
                <strong>
                  Folate
                </strong>

                <small>
                  Folate deficiency
                </small>
              </div>

              <span className="risk-status">
                {predictionResult
                  ? predictionResult.results
                      .folate_deficiency
                      .status
                  : "Not assessed"}
              </span>

            </div>


            <div className="risk-score">

              <strong>
                {predictionResult
                  ? `${predictionResult.results
                      .folate_deficiency
                      .risk_score.toFixed(1)}%`
                  : "—"}
              </strong>

              <span>
                risk score
              </span>

            </div>


            <div className="risk-progress">

              <div
                style={{
                  width:
                    predictionResult
                      ? `${predictionResult.results
                          .folate_deficiency
                          .risk_score}%`
                      : "0%",
                }}
              />

            </div>

          </div>

        </div>

      </section>


      {/* =========================
          FOOD RECOMMENDATIONS
      ========================== */}

      <section className="nutrition-ai-section">

        <div className="nutrition-section-heading">

          <div>
            <span>
              PERSONALIZED NUTRITION
            </span>

            <h2>
              Recommended Food Sources
            </h2>
          </div>

          <p>
            Foods selected according to your
            deficiency risks and dietary
            preferences.
          </p>

        </div>


        {recommendations.length === 0 ? (

          <div className="nutrition-empty-state">

            <div>
              ✦
            </div>

            <strong>
              No recommendations yet
            </strong>

            <p>
              Run an AI assessment to receive
              personalized food recommendations.
            </p>

          </div>

        ) : (

          <div className="recommendation-food-grid">

            {recommendations.map((food) => (

              <div
                className="recommendation-food-card"
                key={food.food}
              >

                <div className="recommendation-food-icon">
                  {food.food.charAt(0)}
                </div>

                <div className="recommendation-food-content">

                  <strong>
                    {food.food}
                  </strong>

                  <span>
                    {food.nutrient}
                  </span>

                </div>

                <span className="recommendation-food-risk">
                  {food.risk_score.toFixed(1)}%
                </span>

              </div>

            ))}

          </div>

        )}

      </section>


      {/* =========================
          7 DAY MEAL PLANNER
      ========================== */}

      <section className="nutrition-ai-section">

        <div className="nutrition-section-heading">

          <div>
            <span>
              PERSONALIZED MEAL PLANNING
            </span>

            <h2>
              7-Day Personalized Meal Planner
            </h2>
          </div>

          <button
            type="button"
            className="regenerate-plan-btn"
            onClick={regeneratePlan}
            disabled={mealPlan.length === 0}
          >
            ↻ Regenerate 7-Day Plan
          </button>
          <button
  type="button"
  className="save-meal-plan-btn"
onClick={saveMealPlan}
  disabled={mealPlan.length === 0}
>
  Save Meal Plan
</button>
{message && (
  <p className="nutrition-ai-message meal-save-message">
    {message}
  </p>
)}

        </div>


        <p className="meal-planner-description">
          Meals are generated using your
          nutrition recommendations and dietary
          restrictions.
        </p>


        {mealPlan.length === 0 ? (

          <div className="nutrition-empty-state">

            <div>
              🍽
            </div>

            <strong>
              Your 7-day meal plan will appear here
            </strong>

            <p>
              Run an AI assessment to generate
              your personalized meal plan.
            </p>

          </div>

        ) : (

          <>

            {/* DAY SELECTOR */}

            <div className="meal-day-selector">

              {mealPlan.map((day) => (

                <button
                  type="button"
                  key={day.day}
                  className={
                    selectedDay === day.day
                      ? "meal-day-pill active"
                      : "meal-day-pill"
                  }
                  onClick={() =>
                    setSelectedDay(day.day)
                  }
                >
                  Day {day.day}
                </button>

              ))}

            </div>


            {/* SELECTED DAY */}

            {selectedDayPlan && (

              <div className="meal-plan-selected-day">

                <div className="meal-plan-day-title">

                  <div>
                    <span>
                      DAY {selectedDay}
                    </span>

                    <h3>
                      Your Personalized Meals
                    </h3>
                  </div>

                  <div className="meal-day-target">
                    <strong>
                      {nutritionTargets.calories}
                    </strong>
                    <span>
                      kcal target
                    </span>
                  </div>

                </div>


                <div className="meal-plan-meals">

                  {selectedDayPlan.meals.map(
                    (meal) => {

                      const foodName =
                        meal.foods[0];

                      const nutrition =
                        getMealNutrition(
                          foodName
                        );

                      return (

                        <div
                          className="meal-plan-card"
                          key={meal.mealType}
                        >

                          <div className="meal-card-header">

                            <div>
                              <span className="meal-type-label">
                                {meal.mealType}
                              </span>

                              <h4>
                                {foodName}
                              </h4>

                              <p>
                                A personalized
                                nutrition choice
                                selected to support
                                your meal plan.
                              </p>
                            </div>

                            <span className="meal-calorie-value">
                              {nutrition.calories}
                              <small>
                                kcal
                              </small>
                            </span>

                          </div>


                          <div className="meal-nutrition-chips">

                            <span className="nutrition-chip calories-chip">
                              <b>
                                {nutrition.calories}
                              </b>
                              kcal
                            </span>

                            <span className="nutrition-chip protein-chip">
                              <b>
                                {nutrition.protein}g
                              </b>
                              protein
                            </span>

                            <span className="nutrition-chip carbs-chip">
                              <b>
                                {nutrition.carbs}g
                              </b>
                              carbs
                            </span>

                            <span className="nutrition-chip fat-chip">
                              <b>
                                {nutrition.fat}g
                              </b>
                              fat
                            </span>

                            <span className="nutrition-chip fiber-chip">
                              <b>
                                {nutrition.fiber}g
                              </b>
                              fiber
                            </span>

                          </div>


                          <div className="meal-card-footer">

                            <span className="meal-booster">
                              Supports {nutrition.nutrient}
                            </span>

                            <div className="meal-card-actions">

                              <button
  type="button"
  className="view-recipe-btn"
  onClick={() => openRecipe(foodName)}
>
  View Recipe
</button>

                              <button
  type="button"
  className="replace-meal-btn"
  onClick={() =>
    openReplacementModal(
      meal.mealType,
      foodName,
      selectedDayPlan.meals.indexOf(meal)
    )
  }
>
  Replace Meal
</button>

                            </div>

                          </div>

                        </div>

                      );
                    }
                  )}

                </div>

              </div>

            )}

          </>

        )}
                

        {/* Meal Plan History */}
        {mealPlanHistory.length > 0 && (
          <div className="meal-plan-history">

            <div className="meal-plan-history-header">
              <div>
                <h3>Meal Plan History</h3>
                <p>
                  Your previously saved personalized meal plans
                </p>
              </div>

              <span className="history-count">
                {mealPlanHistory.length} saved
              </span>
            </div>

            <div className="meal-plan-history-list">
              {mealPlanHistory.map((plan) => (
                <div
                  className="meal-plan-history-card"
                  key={plan.id}
                >
                  <div className="meal-plan-history-icon">
                    🍽
                  </div>

                  <div className="meal-plan-history-info">
                    <strong>
                      7-Day Personalized Plan
                    </strong>

                    <span>
                      {new Date(
                        plan.created_at || plan.plan_date
                      ).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <button
  type="button"
  className="meal-history-view-btn"
  onClick={() => setSelectedHistoryPlan(plan)}
>
  View Plan
</button>
                </div>
              ))}
            </div>

          </div>
        )}
            </section>

      {/* Saved Meal Plan Modal */}
{selectedHistoryPlan && (
  <div
    className="meal-history-modal-overlay"
    onClick={() => setSelectedHistoryPlan(null)}
  >
    <div
      className="meal-history-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="meal-history-modal-header">
        <div>
          <span>MEAL PLAN HISTORY</span>

          <h2>7-Day Personalized Plan</h2>

          <p>
            {new Date(
              selectedHistoryPlan.created_at ||
                selectedHistoryPlan.plan_date
            ).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        <button
          type="button"
          className="meal-history-modal-close"
          onClick={() => setSelectedHistoryPlan(null)}
        >
          ×
        </button>
      </div>

      <div className="saved-plan-days">
        {selectedHistoryPlan.meal_plan?.map(
          (day: any) => (
            <div
              className="saved-plan-day"
              key={day.day}
            >
              <div className="saved-plan-day-header">
                <strong>
                  Day {day.day}
                </strong>

                <span>
                  Personalized Meals
                </span>
              </div>

              <div className="saved-plan-meals">
                {day.meals?.map(
                  (meal: any) => (
                    <div
                      className="saved-plan-meal"
                      key={meal.mealType}
                    >
                      <span className="saved-meal-type">
                        {meal.mealType}
                      </span>

                      <div>
                        {meal.foods?.map(
                          (food: string) => (
                            <span
                              key={food}
                              className="saved-meal-food"
                            >
                              {food}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  </div>
)}      

      <MealReplacementModal
        isOpen={replacementModalOpen}
        mealType={replacementMealType}
        currentFood={replacementFood}
        foods={mealFoods}
        onClose={() =>
          setReplacementModalOpen(false)
        }
        onReplace={handleMealReplacement}
      />

      <RecipeModal
  isOpen={recipeModalOpen}
  recipe={selectedRecipe}
  onClose={() => {
    setRecipeModalOpen(false);
    setSelectedRecipe(null);
  }}
/>
    </div>
  );
}