import type { RecommendedFood } from "./recommendationEngine";
import type { DayMealPlan } from "../data/mealPlan";
import { foodAlternatives } from "../data/foodAlternatives";
import type { MealFood } from "./mealFoodService";

export function generateSevenDayMealPlan(
  recommendations: RecommendedFood[],
  mealFoods: MealFood[] = []
): DayMealPlan[] {

  /*
   * Use only foods that have nutrition information.
   * This prevents meals from appearing without
   * calories, protein, carbs, fat and fiber.
   */

  const recommendedNames = new Set(
    recommendations.map((item) =>
      item.food.toLowerCase().trim()
    )
  );

  const completeMealFoods = mealFoods.filter((food) => {
    const hasNutrition =
      Number(food.calories) > 0 &&
      Number(food.protein) >= 0 &&
      Number(food.carbs) >= 0 &&
      Number(food.fat) >= 0 &&
      Number(food.fiber) >= 0;

    return hasNutrition;
  });

  /*
   * Prefer foods recommended by the AI,
   * but only when USDA nutrition data exists.
   */
  const recommendedMealFoods = completeMealFoods.filter((food) =>
    recommendedNames.has(food.name.toLowerCase().trim())
  );

  /*
   * If there are not enough recommended foods,
   * use other complete nutrition foods returned
   * by the USDA service.
   */
  const otherMealFoods = completeMealFoods.filter(
    (food) =>
      !recommendedNames.has(
        food.name.toLowerCase().trim()
      )
  );

  const combinedFoods = [
    ...recommendedMealFoods,
    ...otherMealFoods,
  ];

  /*
   * Remove duplicate food names.
   */
  const uniqueFoods = combinedFoods.filter(
    (food, index, self) =>
      index ===
      self.findIndex(
        (item) =>
          item.name.toLowerCase().trim() ===
          food.name.toLowerCase().trim()
      )
  );

  if (uniqueFoods.length === 0) {
    return [];
  }

  /*
   * Shuffle foods so regenerated plans
   * can have a different arrangement.
   */
  const shuffledFoods = [...uniqueFoods].sort(
    () => Math.random() - 0.5
  );

  return Array.from(
    { length: 7 },
    (_, dayIndex) => {

      const usedToday = new Set<string>();

      const getFood = (offset: number): string => {

        for (let i = 0; i < shuffledFoods.length; i++) {

          const food =
            shuffledFoods[
              (dayIndex * 4 + offset + i) %
                shuffledFoods.length
            ];

          if (!usedToday.has(food.name)) {
            usedToday.add(food.name);
            return food.name;
          }
        }

        /*
         * If fewer than 4 unique foods are available,
         * reuse a food rather than returning an empty meal.
         */
        return shuffledFoods[
          (dayIndex * 4 + offset) %
            shuffledFoods.length
        ].name;
      };

      return {
        day: dayIndex + 1,

        meals: [
          {
            mealType: "Breakfast",
            foods: [getFood(0)],
          },
          {
            mealType: "Lunch",
            foods: [getFood(1)],
          },
          {
            mealType: "Snack",
            foods: [getFood(2)],
          },
          {
            mealType: "Dinner",
            foods: [getFood(3)],
          },
        ],
      };
    }
  );
}


/* =========================================================
   REPLACE MEAL FOOD
   ========================================================= */

export function replaceMealFood(
  food: string,
  availableFoods: string[] = []
): string {

  const foodName = food.toLowerCase();

  /*
   * First try the predefined alternatives.
   */
  const matchingKey = Object.keys(foodAlternatives).find(
    (key) =>
      foodName.includes(key.toLowerCase())
  );

  if (matchingKey) {

    const alternatives =
      foodAlternatives[matchingKey];

    const validAlternatives =
      alternatives.filter(
        (item) =>
          item.toLowerCase() !== foodName
      );

    if (validAlternatives.length > 0) {
      return validAlternatives[
        Math.floor(
          Math.random() *
            validAlternatives.length
        )
      ];
    }
  }

  /*
   * Otherwise use another available food.
   */
  const otherFoods =
    availableFoods.filter(
      (item) =>
        item.toLowerCase() !== foodName
    );

  if (otherFoods.length > 0) {
    return otherFoods[
      Math.floor(
        Math.random() *
          otherFoods.length
      )
    ];
  }

  return food;
}