import { useEffect, useState } from "react";
import "./FoodDiary.css";
import { supabase } from "../lib/supabase";

type FoodEntry = {
  id: string;
  user_id: string;
  meal_type: string;
  food_name: string;
  quantity: number;
  diary_date: string;
  created_at: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
};

type USDAFood = {
  fdcId: number;
  description: string;
  brandOwner?: string;
};

type OFFProduct = {
  code: string;
  product_name?: string;
  brands?: string;
  nutriments?: {
    "energy-kcal_100g"?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
    fiber_100g?: number;
    sugars_100g?: number;
    sodium_100g?: number;
  };
};

type NutrientInfo = {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
};

export default function FoodDiary() {
  const [mealType, setMealType] = useState("Breakfast");
  const [foodName, setFoodName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [message, setMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<USDAFood[]>([]);
  const [searching, setSearching] = useState(false);

  const [offResults, setOffResults] = useState<OFFProduct[]>([]);
  const [offSearching, setOffSearching] = useState(false);

  const [selectedNutrition, setSelectedNutrition] =
    useState<NutrientInfo | null>(null);

  const [selectedFoodName, setSelectedFoodName] = useState("");

  useEffect(() => {
    loadFoodEntries();
  }, []);

  const getToday = () => {
    return new Date().toISOString().split("T")[0];
  };

  const loadFoodEntries = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please login first.");
      return;
    }

   const { data, error } = await supabase
  .from("food_diary")
  .select("*")
  .eq("user_id", user.id)
  .eq("diary_date", getToday())
  .order("created_at", { ascending: false });

    if (error) {
      console.error("Load food error:", error);
      setMessage(error.message);
      return;
    }

    setFoodEntries(data || []);
  };

  const searchUSDAFood = async () => {
    if (!searchTerm.trim()) {
      setMessage("Enter a food name to search.");
      return;
    }

    setSearching(true);
    setMessage("");
    setSearchResults([]);
    setOffResults([]);

    try {
      const apiKey = import.meta.env.VITE_USDA_API_KEY;

      const response = await fetch(
        `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}&query=${encodeURIComponent(
          searchTerm
        )}&pageSize=10`
      );

      if (!response.ok) {
        throw new Error("USDA food search failed.");
      }

      const data = await response.json();

      setSearchResults(data.foods || []);
    } catch (error) {
      console.error("USDA search error:", error);
      setMessage("Unable to search USDA foods.");
    } finally {
      setSearching(false);
    }
  };

  const searchOpenFoodFacts = async () => {
    if (!searchTerm.trim()) {
      setMessage("Enter a food name to search.");
      return;
    }

    setOffSearching(true);
    setMessage("");
    setSearchResults([]);

    try {
      const { data, error } =
        await supabase.functions.invoke("hyper-worker", {
          body: {
            searchTerm: searchTerm.trim(),
          },
        });

      if (error) {
        throw error;
      }

      setOffResults(data?.products || []);
    } catch (error) {
      console.error("OpenFoodFacts error:", error);
      setMessage("Unable to search OpenFoodFacts.");
    } finally {
      setOffSearching(false);
    }
  };

  const selectOpenFoodFacts = (
    product: OFFProduct
  ) => {
    const nutriments = product.nutriments;

    const nutrition = {
      calories:
        nutriments?.["energy-kcal_100g"] ?? 0,
      protein:
        nutriments?.["proteins_100g"] ?? 0,
      carbohydrates:
        nutriments?.["carbohydrates_100g"] ?? 0,
      fat:
        nutriments?.["fat_100g"] ?? 0,
      fiber:
        nutriments?.["fiber_100g"] ?? 0,
      sugar:
        nutriments?.["sugars_100g"] ?? 0,
      sodium:
        (nutriments?.["sodium_100g"] ?? 0) * 1000,
    };

    setSelectedFoodName(
      product.product_name || "Unknown Food"
    );

    setSelectedNutrition(nutrition);

    setFoodName(product.product_name || "");

    setSearchResults([]);
    setOffResults([]);
  };

  const getFoodNutrition = async (
    food: USDAFood
  ) => {
    try {
      const apiKey = import.meta.env.VITE_USDA_API_KEY;

      const response = await fetch(
        `https://api.nal.usda.gov/fdc/v1/food/${food.fdcId}?api_key=${apiKey}`
      );

      if (!response.ok) {
        throw new Error(
          "Unable to get nutrition information."
        );
      }

      const data = await response.json();

      const getNutrient = (names: string[]) => {
        const nutrient =
          data.foodNutrients?.find((item: any) =>
            names.includes(item.nutrient?.name)
          );

        return nutrient?.amount || 0;
      };

      const nutrition = {
        calories: getNutrient(["Energy"]),
        protein: getNutrient(["Protein"]),
        carbohydrates: getNutrient([
          "Carbohydrate, by difference",
        ]),
        fat: getNutrient([
          "Total lipid (fat)",
        ]),
        fiber: getNutrient([
          "Fiber, total dietary",
        ]),
        sugar: getNutrient([
          "Sugars, Total Including NLEA",
        ]),
        sodium: getNutrient([
          "Sodium, Na",
        ]),
      };

      setSelectedFoodName(food.description);
      setSelectedNutrition(nutrition);
      setFoodName(food.description);

      setSearchResults([]);
      setOffResults([]);
    } catch (error) {
      console.error("Nutrition error:", error);
      setMessage(
        "Unable to get nutrition information."
      );
    }
  };

  const calculateNutrition = (
    grams: number
  ) => {
    if (!selectedNutrition) {
      return null;
    }

    const factor = grams / 100;

    return {
      calories:
        selectedNutrition.calories * factor,
      protein:
        selectedNutrition.protein * factor,
      carbohydrates:
        selectedNutrition.carbohydrates * factor,
      fat:
        selectedNutrition.fat * factor,
      fiber:
        selectedNutrition.fiber * factor,
      sugar:
        selectedNutrition.sugar * factor,
      sodium:
        selectedNutrition.sodium * factor,
    };
  };

  const saveFood = async () => {
    if (!foodName.trim() || !quantity) {
      setMessage(
        "Please enter food name and quantity."
      );
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please login first.");
      return;
    }

    const grams = Number(quantity);

    if (grams <= 0) {
      setMessage(
        "Quantity must be greater than 0 grams."
      );
      return;
    }

    const calculatedNutrition =
      calculateNutrition(grams);

    const foodData = {
      meal_type: mealType,
      food_name: foodName.trim(),
      quantity: grams,
      diary_date: getToday(),
      calories:
        calculatedNutrition?.calories || 0,
      protein:
        calculatedNutrition?.protein || 0,
      carbohydrates:
        calculatedNutrition?.carbohydrates || 0,
      fat:
        calculatedNutrition?.fat || 0,
      fiber:
        calculatedNutrition?.fiber || 0,
      sugar:
        calculatedNutrition?.sugar || 0,
      sodium:
        calculatedNutrition?.sodium || 0,
    };

    if (editingId) {
      const { error } = await supabase
        .from("food_diary")
        .update(foodData)
        .eq("id", editingId)
        .eq("user_id", user.id);

      if (error) {
        console.error(
          "Update food error:",
          error
        );
        setMessage(error.message);
        return;
      }

      setMessage(
        "Food entry updated successfully."
      );
    } else {
      const { error } = await supabase
        .from("food_diary")
        .insert({
          user_id: user.id,
          ...foodData,
        });

      if (error) {
        console.error(
          "Add food error:",
          error
        );
        setMessage(error.message);
        return;
      }

      setMessage(
        "Food added successfully."
      );
    }

    clearForm();
    loadFoodEntries();
  };

  const editFood = (food: FoodEntry) => {
    setEditingId(food.id);
    setMealType(food.meal_type);
    setFoodName(food.food_name);
    setQuantity(String(food.quantity));
    setMessage("");
  };

  const deleteFood = async (id: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please login first.");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this food entry?"
    );

    if (!confirmDelete) {
      return;
    }

    const { error } = await supabase
      .from("food_diary")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error(
        "Delete food error:",
        error
      );
      setMessage(error.message);
      return;
    }

    setMessage(
      "Food entry deleted successfully."
    );

    loadFoodEntries();
  };

  const clearForm = () => {
    setEditingId(null);
    setMealType("Breakfast");
    setFoodName("");
    setQuantity("");
    setSelectedNutrition(null);
    setSelectedFoodName("");
  };

  const cancelEdit = () => {
    clearForm();
    setMessage("");
  };


  return (
    <div className="food-diary-page">

      {/* Header */}
      <div className="food-diary-header">
        <div>
          <span className="food-diary-eyebrow">
            DAILY NUTRITION
          </span>

          <h1>Food Diary</h1>

          <p>
            Record your meals and monitor your
            daily nutrition intake.
          </p>
        </div>

        <div className="food-diary-date">
          <span>Today</span>
          <strong>{getToday()}</strong>
        </div>
      </div>

      {/* Search */}
      <section className="diary-section">
        <div className="section-heading">
          <div>
            <span className="section-label">
              FOOD DATABASE
            </span>

            <h2>Find a Food</h2>

            <p>
              Search for a food to automatically
              load its nutrition information.
            </p>
          </div>
        </div>

        <div className="food-search-box">
          <input
            type="text"
            placeholder="Search food, e.g. rice, apple, chicken..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                searchUSDAFood();
              }
            }}
          />

          <button
            type="button"
            onClick={searchUSDAFood}
            disabled={searching}
          >
            {searching
              ? "Searching..."
              : "Search USDA"}
          </button>

          <button
            type="button"
            className="secondary-search-btn"
            onClick={searchOpenFoodFacts}
            disabled={offSearching}
          >
            {offSearching
              ? "Searching..."
              : "Search OpenFoodFacts"}
          </button>
        </div>

        {/* USDA results */}
        {searchResults.length > 0 && (
          <div className="food-search-results">
            <div className="results-heading">
              <h3>USDA Results</h3>
              <span>
                {searchResults.length} results
              </span>
            </div>

            {searchResults.map((food) => (
              <button
                type="button"
                key={food.fdcId}
                className="food-result-card"
                onClick={() =>
                  getFoodNutrition(food)
                }
              >
                <div>
                  <strong>
                    {food.description}
                  </strong>

                  {food.brandOwner && (
                    <span>
                      {food.brandOwner}
                    </span>
                  )}
                </div>

                <span className="select-food">
                  Select →
                </span>
              </button>
            ))}
          </div>
        )}

        {/* OpenFoodFacts results */}
        {offResults.length > 0 && (
          <div className="food-search-results">
            <div className="results-heading">
              <h3>OpenFoodFacts Results</h3>
              <span>
                {offResults.length} results
              </span>
            </div>

            {offResults.map((product) => (
              <button
                type="button"
                className="food-result-card"
                key={product.code}
                onClick={() =>
                  selectOpenFoodFacts(product)
                }
              >
                <div>
                  <strong>
                    {product.product_name ||
                      "Unknown product"}
                  </strong>

                  {product.brands && (
                    <span>
                      {product.brands}
                    </span>
                  )}
                </div>

                <span className="select-food">
                  Select →
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Selected nutrition */}
      {selectedNutrition && (
        <section className="nutrition-preview-card">
          <div className="nutrition-preview-header">
            <div>
              <span>
                SELECTED FOOD
              </span>

              <h2>{selectedFoodName}</h2>

              <p>
                Nutrition values shown per 100 g.
              </p>
            </div>
          </div>

          <div className="nutrition-value-grid">
            <div className="nutrition-value calories">
              <strong>
                {selectedNutrition.calories.toFixed(0)}
              </strong>
              <span>Calories</span>
              <small>kcal / 100g</small>
            </div>

            <div className="nutrition-value protein">
              <strong>
                {selectedNutrition.protein.toFixed(1)}g
              </strong>
              <span>Protein</span>
            </div>

            <div className="nutrition-value carbs">
              <strong>
                {selectedNutrition.carbohydrates.toFixed(1)}g
              </strong>
              <span>Carbohydrates</span>
            </div>

            <div className="nutrition-value fat">
              <strong>
                {selectedNutrition.fat.toFixed(1)}g
              </strong>
              <span>Fat</span>
            </div>

            <div className="nutrition-value fiber">
              <strong>
                {selectedNutrition.fiber.toFixed(1)}g
              </strong>
              <span>Fiber</span>
            </div>

            <div className="nutrition-value sugar">
              <strong>
                {selectedNutrition.sugar.toFixed(1)}g
              </strong>
              <span>Sugar</span>
            </div>

            <div className="nutrition-value sodium">
              <strong>
                {selectedNutrition.sodium.toFixed(0)}
              </strong>
              <span>Sodium</span>
              <small>mg</small>
            </div>
          </div>
        </section>
      )}

      {/* Add food */}
      <section className="diary-section add-food-section">
        <div className="section-heading">
          <div>
            <span className="section-label">
              FOOD ENTRY
            </span>

            <h2>
              {editingId
                ? "Edit Food Entry"
                : "Add Food to Diary"}
            </h2>

            <p>
              Enter the meal details and quantity
              you consumed.
            </p>
          </div>
        </div>

        <div className="food-entry-form">

          <div className="form-field">
            <label htmlFor="mealType">
              Meal Type
            </label>

            <select
              id="mealType"
              value={mealType}
              onChange={(e) =>
                setMealType(e.target.value)
              }
            >
              <option>Breakfast</option>
              <option>Lunch</option>
              <option>Snack</option>
              <option>Dinner</option>
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="foodName">
              Food Name
            </label>

            <input
              id="foodName"
              type="text"
              placeholder="Enter food name"
              value={foodName}
              onChange={(e) =>
                setFoodName(e.target.value)
              }
            />
          </div>

          <div className="form-field">
            <label htmlFor="quantity">
              Quantity
            </label>

            <div className="quantity-input">
              <input
                id="quantity"
                type="number"
                min="1"
                placeholder="Enter quantity"
                value={quantity}
                onChange={(e) =>
                  setQuantity(e.target.value)
                }
              />

              <span>grams</span>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={saveFood}
            >
              {editingId
                ? "Update Food"
                : "Add to Diary"}
            </button>

            {editingId && (
              <button
                type="button"
                className="cancel-btn"
                onClick={cancelEdit}
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {selectedNutrition &&
          quantity &&
          Number(quantity) > 0 && (
            <div className="quantity-preview">
              <div>
                <span>
                  Estimated nutrition for
                </span>

                <strong>
                  {quantity} g of{" "}
                  {selectedFoodName}
                </strong>
              </div>

              <div className="quantity-preview-values">
                <span>
                  {calculateNutrition(
                    Number(quantity)
                  )
                    ?.calories.toFixed(0)}{" "}
                  kcal
                </span>

                <span>
                  {calculateNutrition(
                    Number(quantity)
                  )
                    ?.protein.toFixed(1)}
                  g protein
                </span>

                <span>
                  {calculateNutrition(
                    Number(quantity)
                  )
                    ?.carbohydrates.toFixed(1)}
                  g carbs
                </span>

                <span>
                  {calculateNutrition(
                    Number(quantity)
                  )
                    ?.fiber.toFixed(1)}
                  g fiber
                </span>
              </div>
            </div>
          )}

        {message && (
          <div className="diary-message">
            {message}
          </div>
        )}
      </section>
     

      {/* Food entries */}
<section className="diary-section food-history-section">
  <div className="section-heading food-history-heading">
    <div>
      <span className="section-label">
        FOOD LOG
      </span>

      <h2>Today's Food</h2>

      <p>
        Foods you have recorded today.
      </p>
    </div>

    <span className="entry-count">
      {foodEntries.length}{" "}
      {foodEntries.length === 1
        ? "entry"
        : "entries"}
    </span>
  </div>

  {foodEntries.length === 0 ? (
    <div className="food-empty-state">
      <div className="empty-icon">+</div>

      <h3>No food entries yet</h3>

      <p>
        Search for a food above and add your
        first meal to start tracking your
        nutrition.
      </p>
    </div>
  ) : (
    <div className="food-log-list">
      {foodEntries.map((food) => (
        <div
          className="food-log-item"
          key={food.id}
        >
          {/* Food information */}
          <div className="food-log-main">
            <span className="meal-label">
              {food.meal_type}
            </span>

            <h3>{food.food_name}</h3>

            <p className="food-quantity">
              Quantity: {food.quantity} g
            </p>
          </div>

          {/* Nutrition */}
          <div className="food-log-nutrition">
            <div className="food-nutrition calories">
              <span>Calories</span>
              <strong>
                {food.calories.toFixed(0)}
              </strong>
              <small>kcal</small>
            </div>

            <div className="food-nutrition protein">
              <span>Protein</span>
              <strong>
                {food.protein.toFixed(1)}g
              </strong>
            </div>

            <div className="food-nutrition carbs">
              <span>Carbs</span>
              <strong>
                {food.carbohydrates.toFixed(1)}g
              </strong>
            </div>

            <div className="food-nutrition fat">
              <span>Fat</span>
              <strong>
                {food.fat.toFixed(1)}g
              </strong>
            </div>

            <div className="food-nutrition fiber">
              <span>Fiber</span>
              <strong>
                {food.fiber.toFixed(1)}g
              </strong>
            </div>
          </div>

          {/* Actions */}
          <div className="food-log-actions">
            <button
              type="button"
              className="edit-food-btn"
              onClick={() =>
                editFood(food)
              }
            >
              Edit
            </button>

            <button
              type="button"
              className="delete-food-btn"
              onClick={() =>
                deleteFood(food.id)
              }
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )}
</section>

    </div>
  );
}