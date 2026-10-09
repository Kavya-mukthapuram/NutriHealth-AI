import { deficiencyFoodMapping } from "../data/deficiencyFoodMapping";

export interface DeficiencyRisk {
  prediction: number;
  status: string;
  risk_score: number;
}

export interface RecommendedFood {
  food: string;
  nutrient: string;
  category: string;
  deficiency: string;
  risk_score: number;
}

export function getFoodRecommendations(
  results: Record<string, DeficiencyRisk>,
  dietaryRestriction?: string,
  allergies: string[] = [],
  preferredFoods: string[] = []
): RecommendedFood[] {
  const recommendations: RecommendedFood[] = [];

  const restrictions = (dietaryRestriction || "")
    .split(",")
    .map((item) => item.toLowerCase().trim())
    .filter(Boolean);

  const allergyList = allergies
    .map((allergy) => allergy.toLowerCase().trim())
    .filter(Boolean);

  const preferredFoodList = preferredFoods
    .map((food) => food.toLowerCase().trim())
    .filter(Boolean);

  const prohibitedFoods = [
    "alcohol",
    "pork",
    "beef",
  ];

  Object.entries(results).forEach(([deficiencyKey, result]) => {
    if (!result) {
      return;
    }

    const mapping = deficiencyFoodMapping[deficiencyKey];

    if (!mapping) {
      return;
    }

    // Only recommend foods when there is some deficiency risk.
    if (result.prediction !== 1 && result.risk_score <= 0) {
      return;
    }

    const filteredFoods = mapping.foods.filter((food) => {
      const foodName = food.food.toLowerCase();

      // --------------------------------
      // 1. General prohibited foods
      // --------------------------------
      if (
        prohibitedFoods.some((prohibited) =>
          foodName.includes(prohibited)
        )
      ) {
        return false;
      }

      // --------------------------------
      // 2. Food allergy filtering
      // --------------------------------
      if (
        allergyList.some((allergy) =>
          foodName.includes(allergy)
        )
      ) {
        return false;
      }

      // --------------------------------
      // 3. Dietary restriction filtering
      // --------------------------------

      // Vegan
      if (restrictions.includes("vegan")) {
        const veganExcludedFoods = [
          "fish",
          "salmon",
          "tuna",
          "sardine",
          "egg",
          "milk",
          "yogurt",
          "cheese",
          "butter",
          "cream",
          "whey",
          "chicken",
          "turkey",
          "beef",
          "pork",
          "meat",
        ];

        if (
          veganExcludedFoods.some((item) =>
            foodName.includes(item)
          )
        ) {
          return false;
        }
      }

      // Vegetarian
      if (restrictions.includes("vegetarian")) {
        const vegetarianExcludedFoods = [
          "fish",
          "salmon",
          "tuna",
          "sardine",
          "chicken",
          "turkey",
          "beef",
          "pork",
          "meat",
        ];

        if (
          vegetarianExcludedFoods.some((item) =>
            foodName.includes(item)
          )
        ) {
          return false;
        }
      }

      // Dairy-free / No dairy / Milk
      if (
        restrictions.includes("dairy-free") ||
        restrictions.includes("dairy free") ||
        restrictions.includes("no dairy") ||
        restrictions.includes("milk")
      ) {
        const dairyFoods = [
          "milk",
          "yogurt",
          "cheese",
          "butter",
          "cream",
          "whey",
          "casein",
        ];

        if (
          dairyFoods.some((item) =>
            foodName.includes(item)
          )
        ) {
          return false;
        }
      }

      // Gluten-free / No gluten
      if (
        restrictions.includes("gluten-free") ||
        restrictions.includes("gluten free") ||
        restrictions.includes("no gluten")
      ) {
        const glutenFoods = [
          "wheat",
          "barley",
          "rye",
          "gluten",
        ];

        if (
          glutenFoods.some((item) =>
            foodName.includes(item)
          )
        ) {
          return false;
        }
      }

      // --------------------------------
      // 4. Direct food restrictions
      // Example: "Milk, Peanuts"
      // --------------------------------
      const categoryRestrictions = [
        "vegan",
        "vegetarian",
        "dairy-free",
        "dairy free",
        "no dairy",
        "milk",
        "gluten-free",
        "gluten free",
        "no gluten",
      ];

      const directRestrictions = restrictions.filter(
        (restriction) =>
          !categoryRestrictions.includes(restriction)
      );

      if (
        directRestrictions.some((restriction) =>
          foodName.includes(restriction)
        )
      ) {
        return false;
      }

      return true;
    });

    filteredFoods.forEach((food) => {
      recommendations.push({
        food: food.food,
        nutrient: food.nutrient,
        category: food.category,
        deficiency: mapping.deficiency,
        risk_score: result.risk_score,
      });
    });
  });

  // Remove duplicate foods
  const uniqueRecommendations = recommendations.filter(
    (item, index, self) =>
      index ===
      self.findIndex(
        (food) =>
          food.food.toLowerCase() ===
          item.food.toLowerCase()
      )
  );

  // Preferred foods first, then higher risk score
  return uniqueRecommendations.sort((a, b) => {
    const aPreferred = preferredFoodList.some((food) =>
      a.food.toLowerCase().includes(food)
    );

    const bPreferred = preferredFoodList.some((food) =>
      b.food.toLowerCase().includes(food)
    );

    if (aPreferred && !bPreferred) return -1;
    if (!aPreferred && bPreferred) return 1;

    return b.risk_score - a.risk_score;
  });
}