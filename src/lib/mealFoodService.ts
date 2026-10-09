export interface MealFood {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  nutrient: string;
}

const USDA_API_KEY = import.meta.env.VITE_USDA_API_KEY;

const nutrientQueries: Record<string, string[]> = {
  iron_deficiency: [
    "spinach",
    "lentils",
    "chickpeas",
    "beans",
    "tofu",
    "pumpkin seeds",
    "beef",
    "chicken",
    "turkey",
    "fortified cereal",
  ],

  vitamin_d_deficiency: [
    "salmon",
    "tuna",
    "sardines",
    "egg",
    "fortified milk",
    "fortified yogurt",
    "fortified plant milk",
    "fortified cereal",
  ],

  folate_deficiency: [
    "spinach",
    "broccoli",
    "avocado",
    "orange",
    "lentils",
    "chickpeas",
    "beans",
    "asparagus",
    "peas",
  ],
};

function getNutrient(
  nutrients: any[],
  nutrientId: number
): number {
  const nutrient = nutrients.find(
    (item) => item.nutrientId === nutrientId
  );

  return Number(nutrient?.value || 0);
}

function matchesDiet(
  foodName: string,
  dietaryRestriction: string
): boolean {
  const name = foodName.toLowerCase();
  const restriction = dietaryRestriction.toLowerCase();

  // Vegan
  if (restriction.includes("vegan")) {
    return ![
      "egg",
      "milk",
      "yogurt",
      "cheese",
      "butter",
      "cream",
      "whey",
      "fish",
      "salmon",
      "tuna",
      "sardine",
      "chicken",
      "beef",
      "pork",
      "turkey",
      "meat",
    ].some((item) => name.includes(item));
  }

  // Vegetarian
  if (restriction.includes("vegetarian")) {
    return ![
      "fish",
      "salmon",
      "tuna",
      "sardine",
      "chicken",
      "beef",
      "pork",
      "turkey",
      "pork",
      "meat",
    ].some((item) => name.includes(item));
  }

  // Dairy-free / No dairy
  if (
    restriction.includes("dairy-free") ||
    restriction.includes("dairy free") ||
    restriction.includes("no dairy")
  ) {
    return ![
      "milk",
      "yogurt",
      "cheese",
      "butter",
      "cream",
      "whey",
      "casein",
    ].some((item) => name.includes(item));
  }

  // Gluten-free / No gluten
  if (
    restriction.includes("gluten-free") ||
    restriction.includes("gluten free") ||
    restriction.includes("no gluten")
  ) {
    return ![
      "wheat",
      "barley",
      "rye",
      "gluten",
    ].some((item) => name.includes(item));
  }

  return true;
}

export async function getMealFoods(
  deficiencyKeys: string[],
  dietaryRestriction = "",
  allergies: string[] = []
): Promise<MealFood[]> {
  const queries = deficiencyKeys.flatMap(
    (key) => nutrientQueries[key] || []
  );

  const uniqueQueries = [...new Set(queries)];

  const results = await Promise.all(
    uniqueQueries.map(async (query) => {
      try {
        const response = await fetch(
          `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${USDA_API_KEY}&query=${encodeURIComponent(
            query
          )}&pageSize=10`
        );

        if (!response.ok) {
          return [];
        }

        const data = await response.json();

        return (data.foods || [])
          .filter((food: any) => {
            const name = food.description || "";

            if (
              !matchesDiet(
                name,
                dietaryRestriction.toLowerCase()
              )
            ) {
              return false;
            }

           const allergyMatch = allergies.some((allergy) => {
  const allergyName = allergy.trim().toLowerCase();

  if (!allergyName) {
    return false;
  }

  return name.includes(allergyName);
});

return !allergyMatch;
          })
          .map((food: any) => ({
            name: food.description || "",
            calories: getNutrient(
              food.foodNutrients,
              1008
            ),
            protein: getNutrient(
              food.foodNutrients,
              1003
            ),
            carbs: getNutrient(
              food.foodNutrients,
              1005
            ),
            fat: getNutrient(
              food.foodNutrients,
              1004
            ),
            fiber: getNutrient(
              food.foodNutrients,
              1079
            ),
            nutrient: query,
          }));
      } catch (error) {
        console.error(
          `USDA search failed for ${query}`,
          error
        );
        return [];
      }
    })
  );

  const foods = results.flat();

  const uniqueFoods = foods.filter(
    (food, index, self) =>
      index ===
      self.findIndex(
        (item) =>
          item.name.toLowerCase() ===
          food.name.toLowerCase()
      )
  );

  return uniqueFoods;
}