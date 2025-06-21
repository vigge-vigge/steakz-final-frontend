import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from '../../context/AuthContext';
import { formatCurrency, getTranslation } from '../../utils/formatCurrency';
import "../../index.css";

interface Ingredient {
  name: string;
  isAllergen: boolean;
}

interface Dish {
  id: number;
  name: string;
  description: string;
  ingredients: Ingredient[];
}

const ChefMenu: React.FC = () => {
  const { language, currency } = useContext(AuthContext);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    // Replace with real API call
    setDishes([
      {
        id: 1,
        name: "BBQ Chicken Wings",
        description: "Crispy chicken wings with BBQ sauce.",
        ingredients: [
          { name: "Chicken", isAllergen: false },
          { name: "BBQ Sauce", isAllergen: false },
          { name: "Soy", isAllergen: true },
        ],
      },
      {
        id: 2,
        name: "Beef Tenderloin",
        description: "Tender center-cut beef tenderloin.",
        ingredients: [
          { name: "Beef", isAllergen: false },
          { name: "Butter", isAllergen: true },
        ],
      },
    ]);
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 24 }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Chef Menu</h1>
      <p style={{ color: "#666", marginBottom: 32 }}>
        View all dishes, ingredients, and allergen warnings
      </p>
      <div style={{ display: "grid", gap: 24 }}>
        {dishes.map((dish) => (
          <div
            key={dish.id}
            style={{
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 2px 8px #0001",
              padding: 24,
              position: "relative",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ margin: 0 }}>{dish.name}</h2>
                <div style={{ color: "#888", fontSize: 15 }}>{dish.description}</div>
              </div>
              <button
                style={{
                  background: "#2563eb",
                  color: "#fff",
                  border: 0,
                  borderRadius: 6,
                  padding: "8px 18px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
                onClick={() => setExpanded(expanded === dish.id ? null : dish.id)}
              >
                {expanded === dish.id ? "Hide Ingredients" : "View Ingredients"}
              </button>
            </div>
            {expanded === dish.id && (
              <div style={{ marginTop: 18 }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Ingredients:</div>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {dish.ingredients.map((ing, idx) => (
                    <li key={idx} style={{ color: ing.isAllergen ? "#b91c1c" : undefined }}>
                      {ing.name}
                      {ing.isAllergen && (
                        <span style={{ marginLeft: 8, color: "#b91c1c", fontWeight: 600 }}>
                          (Allergen)
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
                {dish.ingredients.some((i) => i.isAllergen) && (
                  <div style={{ color: "#b91c1c", marginTop: 10, fontWeight: 600 }}>
                    Allergen warning: This dish contains allergens.
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChefMenu;