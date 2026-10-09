import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function HealthProfile() {
  const [userId, setUserId] = useState("");

  const [form, setForm] = useState({
  age: "",
  gender: "",
  height: "",
  weight: "",
  medical_conditions: "",
  dietary_restrictions: "",
  allergies: "",
  health_goals: "",
});

  const [message, setMessage] = useState("");

  const calculateBMI = () => {
    const heightCm = Number(form.height);
    const weightKg = Number(form.weight);

    if (
      !heightCm ||
      !weightKg ||
      heightCm <= 0 ||
      weightKg <= 0
    ) {
      return null;
    }

    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);

    let category = "";

    if (bmi < 18.5) {
      category = "Underweight";
    } else if (bmi < 25) {
      category = "Normal weight";
    } else if (bmi < 30) {
      category = "Overweight";
    } else {
      category = "Obesity";
    }

    return {
      value: bmi,
      category,
    };
  };

  const bmiResult = calculateBMI();

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    setUserId(user.id);

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (data) {
      setForm({
        age: data.age?.toString() || "",
        gender: data.gender || "",
        height: data.height?.toString() || "",
        weight: data.weight?.toString() || "",
        medical_conditions:
          data.medical_conditions || "",
        dietary_restrictions:
          data.dietary_restrictions || "",
        allergies: data.allergies || "",
        health_goals:
          data.health_goals || "",
      });
    }
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        age: Number(form.age),
        gender: form.gender,
        height: Number(form.height),
        weight: Number(form.weight),
        medical_conditions:
          form.medical_conditions,
        dietary_restrictions:
          form.dietary_restrictions,
        allergies:
          form.allergies,
        health_goals:
          form.health_goals,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Health profile saved successfully.");
  }

  return (
    <div className="health-profile-page">

      {/* Header */}
      <div className="health-profile-header">
        <div>
          <span className="health-profile-label">
            PERSONAL HEALTH
          </span>

          <h1>Health Profile</h1>

          <p>
            Manage your health information and preferences
            to personalize your nutrition insights.
          </p>
        </div>

        <div className="profile-status">
          <span className="profile-status-dot"></span>
          Profile Information
        </div>
      </div>

      <div className="health-profile-layout">

        {/* LEFT SIDE */}
        <form
          className="health-profile-form"
          onSubmit={saveProfile}
        >

          {/* Personal Information */}
          <section className="profile-form-section">

            <div className="profile-section-title">
              <div className="profile-section-icon">
                P
              </div>

              <div>
                <h2>Personal Information</h2>
                <p>Basic information about you</p>
              </div>
            </div>

            <div className="profile-input-grid">

              <div className="profile-field">
                <label>Age</label>

                <input
                  type="number"
                  value={form.age}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      age: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="profile-field">
                <label>Gender</label>

                <select
                  value={form.gender}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      gender: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">
                    Select Gender
                  </option>

                  <option value="Male">
                    Male
                  </option>

                  <option value="Female">
                    Female
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>

              <div className="profile-field">
                <label>Height</label>

                <div className="profile-input-with-unit">
                  <input
                    type="number"
                    value={form.height}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        height: e.target.value,
                      })
                    }
                    required
                  />
                  <span>cm</span>
                </div>
              </div>

              <div className="profile-field">
                <label>Weight</label>

                <div className="profile-input-with-unit">
                  <input
                    type="number"
                    value={form.weight}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        weight: e.target.value,
                      })
                    }
                    required
                  />
                  <span>kg</span>
                </div>
              </div>

            </div>
          </section>

          {/* Health Information */}
          <section className="profile-form-section">

            <div className="profile-section-title">
              <div className="profile-section-icon">
                H
              </div>

              <div>
                <h2>Health Information</h2>
                <p>Tell us about your current health</p>
              </div>
            </div>

            <div className="profile-field">
              <label>
                Medical Conditions
                <span className="optional-label">
                  Optional
                </span>
              </label>

              <textarea
                placeholder="Example: None, high blood pressure, diabetes..."
                value={form.medical_conditions}
                onChange={(e) =>
                  setForm({
                    ...form,
                    medical_conditions:
                      e.target.value,
                  })
                }
              />

              <small>
                List any medical conditions you have
                been diagnosed with.
              </small>
            </div>

          </section>

          {/* Diet & Goals */}
          <section className="profile-form-section">

            <div className="profile-section-title">
              <div className="profile-section-icon">
                D
              </div>

              <div>
                <h2>Diet &amp; Goals</h2>
                <p>
                  Your dietary preferences and health
                  goals
                </p>
              </div>
            </div>
            
            <div className="preference-item">
  <span>Food Allergies</span>
  <strong>
    {form.allergies || "None specified"}
  </strong>
</div>

            <div className="profile-field">
              <label>Dietary Restrictions</label>

              <textarea
                placeholder="Example: Vegetarian, Vegan, Gluten-free, No dairy..."
                value={form.dietary_restrictions}
                onChange={(e) =>
                  setForm({
                    ...form,
                    dietary_restrictions:
                      e.target.value,
                  })
                }
              />

              <small>
                Mention dietary restrictions or foods
                you avoid.
              </small>
            </div>
            <div className="profile-field">
  <label>
    Food Allergies
    <span className="optional-label">
      Important
    </span>
  </label>

  <textarea
    placeholder="Example: Peanuts, Milk, Eggs, Fish..."
    value={form.allergies}
    onChange={(e) =>
      setForm({
        ...form,
        allergies: e.target.value,
      })
    }
  />

  <small>
    List any foods or ingredients you are allergic to.
  </small>
</div>

            <div className="profile-field">
              <label>Health Goals</label>

              <textarea
                placeholder="Example: Weight management, improve nutrition, muscle gain..."
                value={form.health_goals}
                onChange={(e) =>
                  setForm({
                    ...form,
                    health_goals:
                      e.target.value,
                  })
                }
              />

              <small>
                Your goals help personalize your nutrition
                recommendations.
              </small>
            </div>

          </section>

          <button
            type="submit"
            className="health-save-button"
          >
            Save Health Profile
          </button>

          {message && (
            <p
              className={
                message.includes("successfully")
                  ? "health-success-message"
                  : "health-error-message"
              }
            >
              {message}
            </p>
          )}

        </form>

        {/* RIGHT SIDE */}
        <aside className="health-profile-sidebar">

          {/* Health Summary */}
          <div className="health-summary-card">

            <div className="sidebar-card-heading">
              <div className="sidebar-icon">
                +
              </div>

              <div>
                <h2>Health Summary</h2>
                <p>Your current profile overview</p>
              </div>
            </div>

            {bmiResult ? (
              <div className="bmi-summary">

                <div className="bmi-circle">
                  <strong>
                    {bmiResult.value.toFixed(1)}
                  </strong>
                  <span>BMI</span>
                </div>

                <div className="bmi-information">
                  <span className="bmi-label">
                    Current BMI
                  </span>

                  <strong>
                    {bmiResult.category}
                  </strong>

                  <p>
                    Your BMI is calculated from your
                    height and weight.
                  </p>
                </div>

              </div>
            ) : (
              <div className="bmi-empty">
                <strong>BMI unavailable</strong>
                <p>
                  Enter your height and weight to
                  calculate your BMI.
                </p>
              </div>
            )}

            <div className="health-basic-stats">

              <div>
                <span>Height</span>
                <strong>
                  {form.height
                    ? `${form.height} cm`
                    : "—"}
                </strong>
              </div>

              <div>
                <span>Weight</span>
                <strong>
                  {form.weight
                    ? `${form.weight} kg`
                    : "—"}
                </strong>
              </div>

              <div>
                <span>Age</span>
                <strong>
                  {form.age || "—"}
                </strong>
              </div>

              <div>
                <span>Gender</span>
                <strong>
                  {form.gender || "—"}
                </strong>
              </div>

            </div>

          </div>

          {/* BMI Guide */}
          <div className="health-sidebar-card">

            <div className="sidebar-card-heading">
              <div className="sidebar-icon small">
                B
              </div>

              <div>
                <h2>BMI Categories</h2>
                <p>General BMI reference</p>
              </div>
            </div>

            <div className="bmi-category-list">

              <div>
                <span>
                  <i className="bmi-dot blue"></i>
                  Underweight
                </span>
                <strong>&lt; 18.5</strong>
              </div>

              <div className="bmi-category-active">
                <span>
                  <i className="bmi-dot green"></i>
                  Normal weight
                </span>
                <strong>18.5 – 24.9</strong>
              </div>

              <div>
                <span>
                  <i className="bmi-dot yellow"></i>
                  Overweight
                </span>
                <strong>25 – 29.9</strong>
              </div>

              <div>
                <span>
                  <i className="bmi-dot orange"></i>
                  Obesity
                </span>
                <strong>≥ 30</strong>
              </div>

            </div>

          </div>

          {/* AI Personalization */}
          <div className="ai-personalization-card">

            <div className="sidebar-icon">
              AI
            </div>

            <div>
              <h2>AI Personalization</h2>

              <p>
                Your health profile helps personalize
                deficiency-risk assessment, food
                recommendations and your 7-day meal plan.
              </p>
            </div>

          </div>

          {/* Current Preferences */}
          <div className="health-sidebar-card">

            <div className="sidebar-card-heading">
              <div className="sidebar-icon small">
                ✓
              </div>

              <div>
                <h2>Your Preferences</h2>
                <p>Information used by Nutrition AI</p>
              </div>
            </div>

            <div className="preference-item">
              <span>Diet</span>
              <strong>
                {form.dietary_restrictions || "Not specified"}
              </strong>
            </div>

            <div className="preference-item">
              <span>Health Goal</span>
              <strong>
                {form.health_goals || "Not specified"}
              </strong>
            </div>

            <div className="preference-item">
              <span>Medical Information</span>
              <strong>
                {form.medical_conditions || "None specified"}
              </strong>
            </div>

          </div>

        </aside>

      </div>
    </div>
  );
}