import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useCart } from '../context/CartContext';
import { getMenuItems } from '../services/api';
import { MenuItemWithIngredients } from '../types';

const ALLERGENS = [
  'egg', 'milk', 'peanut', 'tree nut', 'soy', 'wheat', 'fish', 'shellfish', 'sesame', 'mustard', 'celery', 'lupin', 'mollusc', 'sulphite'
];

// Currency formatting function - always shows euros as base currency
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
};

const MenuPage: React.FC = () => {
  const { user } = useContext(AuthContext);
  const { settings } = useSettings();
  const { addToCart } = useCart();
  const [menu, setMenu] = useState<MenuItemWithIngredients[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMenuItems()
      .then(res => setMenu(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError('Failed to load menu items.'))
      .finally(() => setLoading(false));
  }, []);
  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;
  if (error) return <div style={{ padding: 40, color: '#b91c1c' }}>{error}</div>;  const isChef = user?.role === 'CHEF';
  const canOrder = user && (user.role === 'CUSTOMER' || user.role === 'CASHIER');
  
  const handleAddToCart = (dish: MenuItemWithIngredients) => {
    if (!dish.isAvailable) {
      alert('This item is currently not available');
      return;
    }
    addToCart(dish, 1);
    alert(`${dish.name} added to cart!`);
  };
  return (
    <div style={{ maxWidth: 1200, margin: '40px auto', padding: 24 }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8, color: '#7c2323' }}>
        {isChef ? 'Chef Menu' : 'Our Menu'}
      </h1>
      <div style={{ display: 'grid', gap: 24, gridTemplateColumns: isChef ? '1fr' : 'repeat(auto-fit, minmax(350px, 1fr))' }}>
        {menu.length === 0 && (
          <div style={{ color: '#888', fontSize: 18, textAlign: 'center', marginTop: 40 }}>No dishes found.</div>
        )}
        {menu.map((dish) => {
          const allergens = dish.ingredients.filter(ing =>
            ALLERGENS.some(a => ing.name && ing.name.toLowerCase().includes(a))
          );
          return (
            <div
              key={dish.id}
              style={{
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 2px 8px #0001',
                padding: 24,
                position: 'relative',
                display: 'flex',
                flexDirection: isChef ? 'row' : 'column',
                gap: isChef ? 24 : 16,
                alignItems: isChef ? 'flex-start' : 'center',
                textAlign: isChef ? 'left' : 'center',
              }}
            >              {dish.image && (
                <img
                  src={dish.image.startsWith('http') ? dish.image : `/${dish.image}`}
                  alt={dish.name}
                  style={{ 
                    width: isChef ? 120 : '100%', 
                    height: isChef ? 120 : 200, 
                    objectFit: 'cover', 
                    borderRadius: 10, 
                    flexShrink: 0 
                  }}
                />
              )}
              <div style={{ flex: 1, width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: isChef ? 'row' : 'column', gap: isChef ? 0 : 12 }}>                  <div style={{ width: '100%' }}>
                    <h2 style={{ margin: 0, fontSize: isChef ? 20 : 24 }}>{dish.name}</h2>
                    <div style={{ color: '#888', fontSize: 15, marginBottom: isChef ? 0 : 8 }}>{dish.description}</div>
                    {!isChef && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                        <div style={{ fontSize: 20, fontWeight: 700, color: '#7c2323' }}>{formatPrice(dish.price)}</div>
                        {canOrder && (
                          <button
                            onClick={() => handleAddToCart(dish)}
                            disabled={!dish.isAvailable}
                            style={{
                              background: dish.isAvailable ? '#10b981' : '#9ca3af',
                              color: '#fff',
                              border: 0,
                              borderRadius: 8,
                              padding: '10px 20px',
                              fontWeight: 600,
                              cursor: dish.isAvailable ? 'pointer' : 'not-allowed',
                              fontSize: 14,
                              transition: 'background-color 0.2s'
                            }}
                          >
                            {dish.isAvailable ? 'Add to Cart' : 'Unavailable'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  {isChef && (
                    <button
                      style={{
                        background: '#2563eb',
                        color: '#fff',
                        border: 0,
                        borderRadius: 6,
                        padding: '8px 18px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                      onClick={() => setExpanded(expanded === dish.id ? null : dish.id)}
                    >
                      {expanded === dish.id ? 'Hide Ingredients' : 'View Ingredients'}
                    </button>
                  )}
                </div>
                {isChef && expanded === dish.id && (
                  <div style={{ marginTop: 18 }}>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>Ingredients:</div>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {dish.ingredients.map((ing, idx) => (
                        <li key={idx} style={{ color: ALLERGENS.some(a => ing.name && ing.name.toLowerCase().includes(a)) ? '#b91c1c' : undefined }}>
                          {ing.name}
                          {ALLERGENS.some(a => ing.name && ing.name.toLowerCase().includes(a)) && (
                            <span style={{ marginLeft: 8, color: '#b91c1c', fontWeight: 600 }}>
                              (Allergen)
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                    {allergens.length > 0 && (
                      <div style={{ color: '#b91c1c', marginTop: 10, fontWeight: 600 }}>
                        Allergen warning: This dish contains allergens.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MenuPage;
