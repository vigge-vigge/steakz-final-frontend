import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { formatCurrency, getTranslation } from '../utils/formatCurrency';
import { getMenuItems } from '../services/api';
import { MenuItemWithIngredients } from '../types';

const PublicMenu: React.FC = () => {
  const { language, currency } = useContext(AuthContext);
  const [menu, setMenu] = useState<MenuItemWithIngredients[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    getMenuItems()
      .then(res => setMenu(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError('Failed to load menu items.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading menu...</div>;
  if (error) return <div style={{ padding: 40, color: '#b91c1c', textAlign: 'center' }}>{error}</div>;

  const categories = ['all', ...Array.from(new Set(menu.map(item => item.category)))];
  const filteredMenu = selectedCategory === 'all' ? menu : menu.filter(item => item.category === selectedCategory);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{ fontSize: 48, fontWeight: 700, marginBottom: 16, color: '#7c2323' }}>Our Menu</h1>
        <p style={{ fontSize: 18, color: '#666', maxWidth: 600, margin: '0 auto' }}>
          Discover our delicious selection of carefully crafted dishes, made with the finest ingredients.
        </p>
      </div>

      {/* Category Filter */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40, flexWrap: 'wrap', gap: 12 }}>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            style={{
              background: selectedCategory === category ? '#7c2323' : '#f3f4f6',
              color: selectedCategory === category ? 'white' : '#374151',
              border: 'none',
              borderRadius: 20,
              padding: '8px 20px',
              fontWeight: 600,
              cursor: 'pointer',
              textTransform: 'capitalize',
              transition: 'all 0.2s ease',
            }}
          >
            {category === 'all' ? 'All Items' : category}
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 24 }}>
        {filteredMenu.length === 0 && (
          <div style={{ color: '#888', fontSize: 18, textAlign: 'center', gridColumn: '1 / -1', marginTop: 40 }}>
            No dishes found in this category.
          </div>
        )}
        {filteredMenu.map((dish) => (
          <div
            key={dish.id}
            style={{
              background: '#fff',
              borderRadius: 16,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
          >
            {dish.image && (
              <img
                src={dish.image.startsWith('http') ? dish.image : `/${dish.image}`}
                alt={dish.name}
                style={{ 
                  width: '100%', 
                  height: 200, 
                  objectFit: 'cover',
                  borderBottom: '1px solid #e5e7eb'
                }}
              />
            )}
            <div style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#1f2937' }}>{dish.name}</h3>
                <span style={{ 
                  fontSize: 18, 
                  fontWeight: 700, 
                  color: '#7c2323',
                  backgroundColor: '#fef2f2',
                  padding: '4px 12px',
                  borderRadius: 8,
                  minWidth: 'fit-content',
                  marginLeft: 12
                }}>
                  {formatCurrency(dish.price, currency)}
                </span>
              </div>
              <p style={{ 
                color: '#6b7280', 
                fontSize: 14, 
                lineHeight: 1.5, 
                margin: 0,
                marginBottom: 12
              }}>
                {dish.description}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ 
                  fontSize: 12, 
                  color: '#9ca3af',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  letterSpacing: '0.5px'
                }}>
                  {dish.category}
                </span>
                <span style={{ 
                  fontSize: 12, 
                  color: dish.isAvailable ? '#10b981' : '#ef4444',
                  fontWeight: 600
                }}>
                  {dish.isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PublicMenu;
