import type { MealRecipe } from "../data/mealRecipes";

interface RecipeModalProps {
  isOpen: boolean;
  recipe: MealRecipe | null;
  onClose: () => void;
}

export default function RecipeModal({
  isOpen,
  recipe,
  onClose,
}: RecipeModalProps) {
  if (!isOpen || !recipe) {
    return null;
  }

  return (
    <div
      className="recipe-modal-overlay"
      onClick={onClose}
    >
      <div
        className="recipe-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="recipe-modal-header">
          <div>
            <span className="recipe-modal-label">
              AI Meal Recipe
            </span>

            <h2>{recipe.title}</h2>

            <p>{recipe.description}</p>
          </div>

          <button
            type="button"
            className="recipe-close-btn"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="recipe-section">
          <h3>Ingredients</h3>

          <ul>
            {recipe.ingredients.map(
              (ingredient, index) => (
                <li key={index}>
                  {ingredient}
                </li>
              )
            )}
          </ul>
        </div>

        <div className="recipe-section">
          <h3>Preparation</h3>

          <ol>
            {recipe.instructions.map(
              (step, index) => (
                <li key={index}>
                  {step}
                </li>
              )
            )}
          </ol>
        </div>

        <div className="recipe-modal-footer">
          <button
            type="button"
            onClick={onClose}
          >
            Close Recipe
          </button>
        </div>
      </div>
    </div>
  );
}