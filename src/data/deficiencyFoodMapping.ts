export interface FoodRecommendation {
  food: string;
  nutrient: string;
  category: string;
}

export interface DeficiencyMapping {
  deficiency: string;
  nutrients: string[];
  foods: FoodRecommendation[];
}

export const deficiencyFoodMapping: Record<string, DeficiencyMapping> = {
  iron_deficiency: {
    deficiency: "Iron Deficiency",
    nutrients: ["Iron"],
    foods: [
      {
        food: "Spinach",
        nutrient: "Iron",
        category: "Vegetables",
      },
      {
        food: "Lentils",
        nutrient: "Iron",
        category: "Legumes",
      },
      {
        food: "Chickpeas",
        nutrient: "Iron",
        category: "Legumes",
      },
      {
        food: "Kidney Beans",
        nutrient: "Iron",
        category: "Legumes",
      },
      {
        food: "Tofu",
        nutrient: "Iron",
        category: "Plant Protein",
      },
      {
        food: "Pumpkin Seeds",
        nutrient: "Iron",
        category: "Seeds",
      },
      {
        food: "Eggs",
        nutrient: "Iron",
        category: "Animal Protein",
      },
    ],
  },

  vitamin_d_deficiency: {
    deficiency: "Vitamin D Deficiency",
    nutrients: ["Vitamin D"],
    foods: [
      {
        food: "Fatty Fish",
        nutrient: "Vitamin D",
        category: "Seafood",
      },
      {
        food: "Eggs",
        nutrient: "Vitamin D",
        category: "Animal Protein",
      },
      {
        food: "Fortified Milk",
        nutrient: "Vitamin D",
        category: "Dairy",
      },
      {
        food: "Fortified Yogurt",
        nutrient: "Vitamin D",
        category: "Dairy",
      },
      {
        food: "Fortified Plant Milk",
        nutrient: "Vitamin D",
        category: "Plant-Based",
      },
      {
        food: "Fortified Cereals",
        nutrient: "Vitamin D",
        category: "Grains",
      },
    ],
  },

  folate_deficiency: {
    deficiency: "Folate Deficiency",
    nutrients: ["Folate", "Vitamin B9"],
    foods: [
      {
        food: "Spinach",
        nutrient: "Folate",
        category: "Vegetables",
      },
      {
        food: "Broccoli",
        nutrient: "Folate",
        category: "Vegetables",
      },
      {
        food: "Lentils",
        nutrient: "Folate",
        category: "Legumes",
      },
      {
        food: "Chickpeas",
        nutrient: "Folate",
        category: "Legumes",
      },
      {
        food: "Avocado",
        nutrient: "Folate",
        category: "Fruits",
      },
      {
        food: "Oranges",
        nutrient: "Folate",
        category: "Fruits",
      },
      {
        food: "Beans",
        nutrient: "Folate",
        category: "Legumes",
      },
    ],
  },
};