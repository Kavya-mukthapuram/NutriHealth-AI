export interface MealRecipe {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
}

export const mealRecipes: Record<string, MealRecipe> = {
  spinach: {
    title: "Spinach Bowl",
    description:
      "A simple nutrient-rich spinach meal that supports iron and folate intake.",
    ingredients: [
      "Fresh spinach",
      "Onion",
      "Tomato",
      "Garlic",
      "1 teaspoon cooking oil",
      "Salt and spices",
    ],
    instructions: [
      "Wash the spinach thoroughly.",
      "Heat a small amount of oil in a pan.",
      "Add onion, garlic and tomato and cook for a few minutes.",
      "Add spinach and cook until it becomes soft.",
      "Add salt and preferred spices.",
      "Serve warm.",
    ],
  },

  lentils: {
    title: "Lentil Bowl",
    description:
      "A protein and iron-rich lentil meal suitable for a balanced diet.",
    ingredients: [
      "Lentils",
      "Onion",
      "Tomato",
      "Garlic",
      "Turmeric",
      "Salt",
      "Water",
    ],
    instructions: [
      "Wash the lentils and cook them until soft.",
      "Prepare onion, tomato and garlic in a pan.",
      "Add the cooked lentils.",
      "Add turmeric, salt and other preferred spices.",
      "Simmer for a few minutes.",
      "Serve warm with your preferred side.",
    ],
  },

  chickpeas: {
    title: "Chickpea Bowl",
    description:
      "A plant-based meal providing protein, fiber and important micronutrients.",
    ingredients: [
      "Cooked chickpeas",
      "Tomato",
      "Onion",
      "Cucumber",
      "Lemon juice",
      "Salt",
      "Black pepper",
    ],
    instructions: [
      "Drain and rinse the cooked chickpeas.",
      "Chop the tomato, onion and cucumber.",
      "Combine all ingredients in a bowl.",
      "Add lemon juice, salt and black pepper.",
      "Mix well and serve fresh.",
    ],
  },

  beans: {
    title: "Healthy Bean Bowl",
    description:
      "A fiber-rich bean meal that can be included in a balanced diet.",
    ingredients: [
      "Cooked beans",
      "Onion",
      "Tomato",
      "Garlic",
      "Salt",
      "Preferred spices",
    ],
    instructions: [
      "Wash and prepare the cooked beans.",
      "Cook onion, tomato and garlic in a pan.",
      "Add the beans.",
      "Season with salt and preferred spices.",
      "Cook for a few minutes.",
      "Serve warm.",
    ],
  },

  tofu: {
    title: "Tofu Vegetable Bowl",
    description:
      "A plant-based protein meal with tofu and vegetables.",
    ingredients: [
      "Tofu",
      "Mixed vegetables",
      "Onion",
      "Garlic",
      "1 teaspoon cooking oil",
      "Salt and spices",
    ],
    instructions: [
      "Cut tofu into small pieces.",
      "Heat oil in a pan.",
      "Add onion and garlic.",
      "Add tofu and vegetables.",
      "Cook until the vegetables are tender.",
      "Season and serve warm.",
    ],
  },

  broccoli: {
    title: "Broccoli Vegetable Bowl",
    description:
      "A simple vegetable meal containing fiber and folate.",
    ingredients: [
      "Broccoli",
      "Carrot",
      "Onion",
      "Garlic",
      "1 teaspoon cooking oil",
      "Salt and pepper",
    ],
    instructions: [
      "Wash and cut the broccoli.",
      "Heat oil and sauté onion and garlic.",
      "Add broccoli and carrot.",
      "Cook until the vegetables are tender.",
      "Add salt and pepper.",
      "Serve warm.",
    ],
  },

  avocado: {
    title: "Avocado Salad",
    description:
      "A fresh salad providing healthy fats and fiber.",
    ingredients: [
      "Avocado",
      "Tomato",
      "Cucumber",
      "Onion",
      "Lemon juice",
      "Salt and pepper",
    ],
    instructions: [
      "Cut the avocado, tomato and cucumber.",
      "Slice the onion.",
      "Add everything to a bowl.",
      "Add lemon juice, salt and pepper.",
      "Mix gently and serve fresh.",
    ],
  },

  orange: {
    title: "Fresh Orange Bowl",
    description:
      "A simple fruit serving that can complement a balanced meal.",
    ingredients: [
      "Fresh orange",
    ],
    instructions: [
      "Wash the orange.",
      "Peel and separate the segments.",
      "Serve fresh.",
    ],
  },

  salmon: {
    title: "Grilled Salmon",
    description:
      "A protein-rich meal that is also a dietary source of vitamin D.",
    ingredients: [
      "Salmon",
      "Lemon juice",
      "Garlic",
      "Black pepper",
      "Salt",
      "1 teaspoon cooking oil",
    ],
    instructions: [
      "Clean the salmon and pat it dry.",
      "Season with lemon juice, garlic, salt and pepper.",
      "Heat a pan or grill.",
      "Cook the salmon until fully cooked.",
      "Turn once during cooking.",
      "Serve warm with vegetables.",
    ],
  },

  tuna: {
    title: "Tuna Vegetable Bowl",
    description:
      "A protein-rich meal that can contribute to vitamin D intake.",
    ingredients: [
      "Tuna",
      "Cucumber",
      "Tomato",
      "Onion",
      "Lemon juice",
      "Salt and pepper",
    ],
    instructions: [
      "Prepare the tuna.",
      "Chop the vegetables.",
      "Combine tuna and vegetables.",
      "Add lemon juice, salt and pepper.",
      "Mix gently and serve.",
    ],
  },

  egg: {
    title: "Simple Egg Bowl",
    description:
      "A simple protein-rich meal that can provide vitamin D.",
    ingredients: [
      "Eggs",
      "Onion",
      "Tomato",
      "Salt",
      "Black pepper",
      "1 teaspoon cooking oil",
    ],
    instructions: [
      "Beat the eggs in a bowl.",
      "Heat a small amount of oil.",
      "Add onion and tomato.",
      "Add the eggs.",
      "Cook until fully set.",
      "Season and serve warm.",
    ],
  },

  peas: {
    title: "Green Pea Bowl",
    description:
      "A simple plant-based meal containing fiber and folate.",
    ingredients: [
      "Green peas",
      "Onion",
      "Tomato",
      "Garlic",
      "Salt",
      "Preferred spices",
    ],
    instructions: [
      "Wash the peas.",
      "Sauté onion, tomato and garlic.",
      "Add the peas.",
      "Add salt and spices.",
      "Cook until tender.",
      "Serve warm.",
    ],
  },

  asparagus: {
    title: "Asparagus Vegetable Bowl",
    description:
      "A vegetable-based meal containing fiber and folate.",
    ingredients: [
      "Asparagus",
      "Garlic",
      "Lemon juice",
      "Black pepper",
      "Salt",
      "1 teaspoon cooking oil",
    ],
    instructions: [
      "Wash and trim the asparagus.",
      "Heat oil in a pan.",
      "Add garlic and asparagus.",
      "Cook until tender.",
      "Add lemon juice, salt and pepper.",
      "Serve warm.",
    ],
  },
};