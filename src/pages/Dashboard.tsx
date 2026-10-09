import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./Dashboard.css";

type NutritionTotals = {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
};

function getNameFromEmail(email: string) {
  const username = email.split("@")[0];

  return username
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function Dashboard() {
  const [nutrition, setNutrition] = useState<NutritionTotals>({
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
  });

  const [foodCount, setFoodCount] = useState(0);
  const [symptomCount, setSymptomCount] = useState(0);
  const [displayName, setDisplayName] = useState("User");
  const [bloodTestCount, setBloodTestCount] = useState(0);

  const [bmi, setBmi] = useState<number | null>(null);
  const [bmiCategory, setBmiCategory] = useState("");

  const [calorieGoal, setCalorieGoal] = useState<number | null>(null);

  const [macroGoals, setMacroGoals] = useState({
    protein: 0,
    carbohydrates: 0,
    fat: 0,
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    setDisplayName(
      user?.email ? getNameFromEmail(user.email) : "User"
    );

    if (!user) {
      setMessage("Please login first.");
      setLoading(false);
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    /* =========================
       HEALTH PROFILE / BMI
    ========================= */

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("age, gender, height, weight, health_goals")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Dashboard profile error:", profileError);
    }

    if (profile?.height && profile?.weight) {
      const heightM = Number(profile.height) / 100;
      const weightKg = Number(profile.weight);

      const calculatedBmi =
        weightKg / (heightM * heightM);

      setBmi(calculatedBmi);

      if (calculatedBmi < 18.5) {
        setBmiCategory("Underweight");
      } else if (calculatedBmi < 25) {
        setBmiCategory("Normal weight");
      } else if (calculatedBmi < 30) {
        setBmiCategory("Overweight");
      } else {
        setBmiCategory("Obesity");
      }
    }

    /* =========================
       DAILY CALORIE GOAL
    ========================= */

    if (
      profile?.age &&
      profile?.gender &&
      profile?.height &&
      profile?.weight
    ) {
      const age = Number(profile.age);
      const height = Number(profile.height);
      const weight = Number(profile.weight);

      let bmr = 0;

      if (profile.gender === "Male") {
        bmr =
          10 * weight +
          6.25 * height -
          5 * age +
          5;
      } else {
        bmr =
          10 * weight +
          6.25 * height -
          5 * age -
          161;
      }

      const estimatedCalories = bmr * 1.4;
      const dailyCalories = Math.round(estimatedCalories);

      setCalorieGoal(dailyCalories);

      setMacroGoals({
        protein: Math.round((dailyCalories * 0.2) / 4),
        carbohydrates: Math.round(
          (dailyCalories * 0.5) / 4
        ),
        fat: Math.round(
          (dailyCalories * 0.3) / 9
        ),
      });
    }

    /* =========================
       FOOD DATA
    ========================= */

    const { data: foods, error: foodError } = await supabase
      .from("food_diary")
      .select(
        "calories, protein, carbohydrates, fat, fiber, sugar, sodium"
      )
      .eq("user_id", user.id)
      .eq("diary_date", today);

    if (foodError) {
      console.error("Dashboard food error:", foodError);
      setMessage(foodError.message);
    }

    const totals = (foods || []).reduce(
      (total, food) => ({
        calories:
          total.calories + Number(food.calories || 0),

        protein:
          total.protein + Number(food.protein || 0),

        carbohydrates:
          total.carbohydrates +
          Number(food.carbohydrates || 0),

        fat:
          total.fat + Number(food.fat || 0),

        fiber:
          total.fiber + Number(food.fiber || 0),

        sugar:
          total.sugar + Number(food.sugar || 0),

        sodium:
          total.sodium + Number(food.sodium || 0),
      }),
      {
        calories: 0,
        protein: 0,
        carbohydrates: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
      }
    );

    setNutrition(totals);
    setFoodCount(foods?.length || 0);

    /* =========================
       SYMPTOMS
    ========================= */

    const { data: symptoms, error: symptomError } =
      await supabase
        .from("symptoms")
        .select("id")
        .eq("user_id", user.id)
        .eq("symptom_date", today);

    if (symptomError) {
      console.error(
        "Dashboard symptoms error:",
        symptomError
      );
    }

    setSymptomCount(symptoms?.length || 0);

    /* =========================
       BLOOD TESTS
    ========================= */

    const { data: bloodTests, error: bloodError } =
      await supabase
        .from("blood_tests")
        .select("id")
        .eq("user_id", user.id);

    if (bloodError) {
      console.error(
        "Dashboard blood test error:",
        bloodError
      );
    }

    setBloodTestCount(bloodTests?.length || 0);

    setLoading(false);
  };

  /* =========================
     PROGRESS CALCULATIONS
  ========================= */

  const calorieProgress =
    calorieGoal && calorieGoal > 0
      ? Math.min(
          (nutrition.calories / calorieGoal) * 100,
          100
        )
      : 0;

  const proteinProgress =
    macroGoals.protein > 0
      ? Math.min(
          (nutrition.protein / macroGoals.protein) * 100,
          100
        )
      : 0;

  const carbProgress =
    macroGoals.carbohydrates > 0
      ? Math.min(
          (nutrition.carbohydrates /
            macroGoals.carbohydrates) *
            100,
          100
        )
      : 0;

  const fatProgress =
    macroGoals.fat > 0
      ? Math.min(
          (nutrition.fat / macroGoals.fat) * 100,
          100
        )
      : 0;

  return (
    <div className="dashboard-page">

      {/* =========================
          HEADER
      ========================= */}

      <section className="dashboard-header">

        <div>
          <span className="dashboard-eyebrow">
            HEALTH & NUTRITION
          </span>

          <h1>
            Welcome, {displayName}!
          </h1>

          <p>
            Keep track of your nutrition and health
            information from one place.
          </p>
        </div>

        <div className="dashboard-date">
          <span>Today</span>

          <strong>
            {new Date().toLocaleDateString(
              "en-IN",
              {
                day: "numeric",
                month: "short",
                year: "numeric",
              }
            )}
          </strong>
        </div>

      </section>

      {message && (
        <div className="dashboard-message">
          {message}
        </div>
      )}

      {/* =========================
          MAIN NAVIGATION CARDS
      ========================= */}

      <section className="dashboard-grid dashboard-navigation">

        <Link
          to="/profile"
          className="dashboard-card profile-card"
        >
          <div className="dashboard-card-icon">
            +
          </div>

          <div>
            <h2>Health Profile</h2>

            <p>
              Manage your personal health information
              and goals.
            </p>
          </div>

          <span className="dashboard-arrow">
            →
          </span>
        </Link>

        <Link
          to="/food-diary"
          className="dashboard-card food-card"
        >
          <div className="dashboard-card-icon">
            ◆
          </div>

          <div>
            <h2>Food Diary</h2>

            <p>
              Track meals, calories and daily nutrition
              intake.
            </p>
          </div>

          <span className="dashboard-arrow">
            →
          </span>
        </Link>

        <Link
          to="/symptoms"
          className="dashboard-card symptoms-card"
        >
          <div className="dashboard-card-icon">
            ●
          </div>

          <div>
            <h2>Symptoms</h2>

            <p>
              Record and monitor your symptoms and
              severity.
            </p>
          </div>

          <span className="dashboard-arrow">
            →
          </span>
        </Link>

        <Link
          to="/blood-tests"
          className="dashboard-card blood-card"
        >
          <div className="dashboard-card-icon">
            ▣
          </div>

          <div>
            <h2>Blood Tests</h2>

            <p>
              Record and track your laboratory results.
            </p>
          </div>

          <span className="dashboard-arrow">
            →
          </span>
        </Link>

      </section>

      {/* =========================
          TODAY'S NUTRITION
      ========================= */}

      <section className="card dashboard-nutrition-card">

        <div className="dashboard-section-heading">

          <div>
            <span className="dashboard-section-label">
              TODAY
            </span>

            <h2>Nutrition Overview</h2>
          </div>

          <Link
            to="/food-diary"
            className="dashboard-view-link"
          >
            View Diary →
          </Link>

        </div>

        {loading ? (
          <div className="dashboard-loading">
            Loading nutrition...
          </div>
        ) : (
          <>

            {/* CALORIE SUMMARY */}

            <div className="dashboard-calorie-box">

              <div className="calorie-information">

                <span>
                  Calories consumed
                </span>

                <strong>
                  {nutrition.calories.toFixed(0)}
                  <small>
                    {" "}
                    / {calorieGoal || "--"} kcal
                  </small>
                </strong>

              </div>

              <div className="calorie-percentage">
                {Math.round(calorieProgress)}%
              </div>

            </div>

            <div className="dashboard-progress">
              <div
                style={{
                  width: `${calorieProgress}%`,
                }}
              />
            </div>

            <p className="dashboard-progress-text">
              {calorieGoal
                ? `${Math.max(
                    calorieGoal -
                      nutrition.calories,
                    0
                  ).toFixed(0)} kcal remaining`
                : "Complete your Health Profile to calculate your daily goal."}
            </p>

            {/* MACROS */}

            <div className="macro-grid">

              <div className="macro-item protein">
                <div>
                  <span>Protein</span>

                  <strong>
                    {nutrition.protein.toFixed(1)} g
                  </strong>
                </div>

                <div className="macro-bar">
                  <div
                    style={{
                      width: `${proteinProgress}%`,
                    }}
                  />
                </div>

                <small>
                  Goal: {macroGoals.protein || "--"} g
                </small>
              </div>

              <div className="macro-item carbohydrates">
                <div>
                  <span>Carbohydrates</span>

                  <strong>
                    {nutrition.carbohydrates.toFixed(1)} g
                  </strong>
                </div>

                <div className="macro-bar">
                  <div
                    style={{
                      width: `${carbProgress}%`,
                    }}
                  />
                </div>

                <small>
                  Goal:{" "}
                  {macroGoals.carbohydrates || "--"} g
                </small>
              </div>

              <div className="macro-item fat">
                <div>
                  <span>Fat</span>

                  <strong>
                    {nutrition.fat.toFixed(1)} g
                  </strong>
                </div>

                <div className="macro-bar">
                  <div
                    style={{
                      width: `${fatProgress}%`,
                    }}
                  />
                </div>

                <small>
                  Goal: {macroGoals.fat || "--"} g
                </small>
              </div>

              <div className="macro-item fiber">
                <div>
                  <span>Fiber</span>

                  <strong>
                    {nutrition.fiber.toFixed(1)} g
                  </strong>
                </div>

                <div className="macro-extra">
                  Daily intake
                </div>

                <small>
                  Sugar:{" "}
                  {nutrition.sugar.toFixed(1)} g
                </small>
              </div>

            </div>
          </>
        )}

      </section>

      {/* =========================
          BMI + DAILY ACTIVITY
      ========================= */}

      <section className="dashboard-bottom-grid">

        {/* BMI */}

        <div className="card bmi-card">

          <div className="dashboard-section-heading">

            <div>
              <span className="dashboard-section-label">
                HEALTH PROFILE
              </span>

              <h2>Body Status</h2>
            </div>

            <Link
              to="/profile"
              className="dashboard-view-link"
            >
              Profile →
            </Link>

          </div>

          {bmi !== null ? (
            <div className="bmi-content">

              <div className="bmi-circle">
                <strong>
                  {bmi.toFixed(1)}
                </strong>

                <span>
                  BMI
                </span>
              </div>

              <div className="bmi-information">

                <span>
                  Current category
                </span>

                <strong>
                  {bmiCategory}
                </strong>

                <p>
                  Your BMI is calculated using
                  your height and weight from
                  your Health Profile.
                </p>

              </div>

            </div>
          ) : (
            <div className="bmi-empty">

              <div className="empty-icon">
                +
              </div>

              <h3>
                Complete your Health Profile
              </h3>

              <p>
                Add your height and weight to
                calculate your BMI.
              </p>

              <Link
                to="/profile"
                className="dashboard-primary-btn"
              >
                Complete Profile
              </Link>

            </div>
          )}

        </div>

        {/* DAILY ACTIVITY */}

        <div className="card activity-card">

          <div className="dashboard-section-heading">

            <div>
              <span className="dashboard-section-label">
                DAILY ACTIVITY
              </span>

              <h2>Today's Records</h2>
            </div>

          </div>

          <div className="activity-list">

            <Link
              to="/food-diary"
              className="activity-row food-row"
            >
              <div className="activity-icon">
                ◆
              </div>

              <div>
                <strong>
                  Food Entries
                </strong>

                <span>
                  Meals recorded today
                </span>
              </div>

              <b>
                {foodCount}
              </b>
            </Link>

            <Link
              to="/symptoms"
              className="activity-row symptom-row"
            >
              <div className="activity-icon">
                ●
              </div>

              <div>
                <strong>
                  Symptoms
                </strong>

                <span>
                  Symptoms recorded today
                </span>
              </div>

              <b>
                {symptomCount}
              </b>
            </Link>

            <Link
              to="/blood-tests"
              className="activity-row blood-row"
            >
              <div className="activity-icon">
                ▣
              </div>

              <div>
                <strong>
                  Blood Tests
                </strong>

                <span>
                  Total laboratory records
                </span>
              </div>

              <b>
                {bloodTestCount}
              </b>
            </Link>

          </div>

        </div>

      </section>

      

    </div>
  );
}