import { useEffect, useState } from "react";
import type { MealFood } from "../lib/mealFoodService";

interface MealReplacementModalProps {
  isOpen: boolean;
  mealType: string;
  currentFood: string;
  foods: MealFood[];
  onClose: () => void;
  onReplace: (food: MealFood) => void;
}

export default function MealReplacementModal({
  isOpen,
  mealType,
  currentFood,
  foods,
  onClose,
  onReplace,
}: MealReplacementModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFood, setSelectedFood] =
    useState<MealFood | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
      setSelectedFood(null);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const filteredFoods = foods.filter((food) => {
    const name = food.name.toLowerCase();
    const search = searchTerm.toLowerCase().trim();

    return (
      name.includes(search) &&
      name !== currentFood.toLowerCase()
    );
  });

  const handleReplace = () => {
    if (!selectedFood) {
      return;
    }

    onReplace(selectedFood);
  };

  return (
    <div
      className="meal-replacement-overlay"
      onClick={onClose}
    >
      <div
        className="meal-replacement-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="replacement-modal-header">
          <div>
            <span className="replacement-modal-label">
              Replace Meal
            </span>

            <h3>{mealType}</h3>

            <p>
              Choose another food that fits your nutrition plan.
            </p>
          </div>

          <button
            type="button"
            className="replacement-close-btn"
            onClick={onClose}
            aria-label="Close replacement dialog"
          >
            ×
          </button>
        </div>

        <div className="current-meal-box">
          <span>Current meal</span>
          <strong>{currentFood}</strong>
        </div>

        <div className="replacement-search">
          <span>⌕</span>

          <input
            type="text"
            placeholder="Search replacement foods..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
          />
        </div>

        <div className="replacement-food-list">
          {filteredFoods.length === 0 ? (
            <div className="replacement-empty">
              <strong>No replacement foods found</strong>
              <p>
                Try another food name or clear your search.
              </p>
            </div>
          ) : (
            filteredFoods.map((food) => {
              const isSelected =
                selectedFood?.name === food.name;

              return (
                <button
                  type="button"
                  key={food.name}
                  className={
                    isSelected
                      ? "replacement-food-card selected"
                      : "replacement-food-card"
                  }
                  onClick={() => setSelectedFood(food)}
                >
                  <div className="replacement-food-main">
                    <strong>{food.name}</strong>

                    <span>
                      Supports {food.nutrient}
                    </span>
                  </div>

                  <div className="replacement-nutrition">
                    <span>
                      <b>{Math.round(food.calories)}</b>
                      kcal
                    </span>

                    <span>
                      <b>{food.protein.toFixed(1)}g</b>
                      protein
                    </span>

                    <span>
                      <b>{food.carbs.toFixed(1)}g</b>
                      carbs
                    </span>

                    <span>
                      <b>{food.fat.toFixed(1)}g</b>
                      fat
                    </span>

                    <span>
                      <b>{food.fiber.toFixed(1)}g</b>
                      fiber
                    </span>
                  </div>

                  {isSelected && (
                    <span className="replacement-selected">
                      ✓ Selected
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {selectedFood && (
          <div className="replacement-preview">
            <div>
              <span>New meal</span>
              <strong>{selectedFood.name}</strong>
            </div>

            <div className="replacement-preview-stats">
              <span>
                {Math.round(selectedFood.calories)} kcal
              </span>

              <span>
                {selectedFood.protein.toFixed(1)}g protein
              </span>

              <span>
                {selectedFood.fiber.toFixed(1)}g fiber
              </span>
            </div>
          </div>
        )}

        <div className="replacement-modal-actions">
          <button
            type="button"
            className="replacement-cancel-btn"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="button"
            className="replacement-confirm-btn"
            onClick={handleReplace}
            disabled={!selectedFood}
          >
            Replace Meal
          </button>
        </div>
      </div>
    </div>
  );
}