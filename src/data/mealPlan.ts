export interface Meal {
  mealType: "Breakfast" | "Lunch" | "Snack" | "Dinner";
  foods: string[];
}

export interface DayMealPlan {
  day: number;
  meals: Meal[];
}

export const mealStructure: Meal["mealType"][] = [
  "Breakfast",
  "Lunch",
  "Snack",
  "Dinner",
];