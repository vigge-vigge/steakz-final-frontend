import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import * as api from '../services/api';
import { MenuItem, InventoryItem, MenuItemWithIngredients } from '../types';
import './styles/MenuManagement.css';

const MenuManagement: React.FC = () => {
  const { user, hasPermission } = useContext(AuthContext);
  const [menuItems, setMenuItems] = useState<MenuItemWithIngredients[]>([]);
  const [ingredients, setIngredients] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');  interface MenuItemFormData {
    name: string;
    description: string;
    price: string;
    category: string;
    ingredients: number[];
  }

  const [formData, setFormData] = useState<MenuItemFormData>({
    name: '',
    description: '',
    price: '',
    category: '',
    ingredients: [],
  });

  const canManageMenu = hasPermission(['ADMIN', 'GENERAL_MANAGER', 'BRANCH_MANAGER']);
  const canDeleteItems = hasPermission(['ADMIN', 'GENERAL_MANAGER']);

  useEffect(() => {
    loadMenuItems();
    if (canManageMenu) {
      loadIngredients();
    }
  }, [canManageMenu]);

  const loadMenuItems = async () => {
    try {
      setLoading(true);
      const response = await api.getMenuItems(user?.branchId);
      setMenuItems(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error loading menu items');
    } finally {
      setLoading(false);
    }
  };

  const loadIngredients = async () => {
    try {
      const response = await api.getInventory(user?.branchId!);
      setIngredients(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error loading ingredients');
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        throw new Error('Price must be a positive number');
      }

      // Validate other fields
      if (!formData.name.trim()) {
        throw new Error('Name is required');
      }
      if (!formData.description.trim()) {
        throw new Error('Description is required');
      }
      if (!formData.category) {
        throw new Error('Category is required');
      }

      await api.createMenuItem({
        name: formData.name.trim(),
        description: formData.description.trim(),
        price,
        category: formData.category,
        ingredients: formData.ingredients,
      });

      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        ingredients: [],
      });
      loadMenuItems();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error creating menu item');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Är du säker på att du vill ta bort denna menyartikel?')) {
      return;
    }
    try {
      await api.deleteMenuItem(id);
      loadMenuItems();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error deleting menu item');
    }
  };

  const toggleAvailability = async (id: number, currentStatus: boolean) => {
    try {
      await api.updateMenuItem(id, { isAvailable: !currentStatus });
      loadMenuItems();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error updating menu item');
    }
  };

  if (loading) return <div>Laddar...</div>;

  return (
    <div className="menu-management">
      <h1>Menyhantering</h1>
      {error && <div className="error">{error}</div>}

      {canManageMenu && (
        <form onSubmit={handleSubmit} className="menu-form">
          <h2> Lägg till ny menyartikel</h2>
          <div className="form-group">
            <label>Namn:</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Beskrivning:</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Pris:</label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Kategori:</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              <option value="">Välj kategori</option>
              <option value="appetizer">Förrätt</option>
              <option value="main">Huvudrätt</option>
              <option value="dessert">Efterrätt</option>
              <option value="beverage">Dryck</option>
            </select>
          </div>
          <div className="form-group">
            <label>Ingredienser:</label>
            <div className="ingredients-list">
              {ingredients.map((ingredient) => (
                <label key={ingredient.id} className="ingredient-item">
                  <input
                    type="checkbox"
                    checked={formData.ingredients.includes(ingredient.id)}
                    onChange={(e) => {
                      const newIngredients = e.target.checked
                        ? [...formData.ingredients, ingredient.id]
                        : formData.ingredients.filter(id => id !== ingredient.id);
                      setFormData({ ...formData, ingredients: newIngredients });
                    }}
                  />
                  {ingredient.name} ({ingredient.quantity} {ingredient.unit})
                </label>
              ))}
            </div>
          </div>
          <button type="submit" className="btn-primary">Lägg till menyartikel</button>
        </form>
      )}

      <div className="menu-list">
        <h2>Menyartiklar</h2>
        <div className="menu-grid">
          {menuItems.map((item) => (
            <div key={item.id} className={`menu-item ${!item.isAvailable ? 'unavailable' : ''}`}>
              <h3>{item.name}</h3>
              <p className="description">{item.description}</p>
              <p className="price">${item.price.toFixed(2)}</p>
              <p className="category">{item.category}</p>
              <div className="ingredients">
                <strong>Ingredienser:</strong>
                <ul>
                  {item.ingredients.map((ing) => (
                    <li key={ing.id}>{ing.name}</li>
                  ))}
                </ul>
              </div>
              {canManageMenu && (
                <div className="actions">
                  <button
                    onClick={() => toggleAvailability(item.id, item.isAvailable)}
                    className={`btn-toggle ${item.isAvailable ? 'available' : 'unavailable'}`}
                  >
                    {item.isAvailable ? 'Markera som otillgänglig' : 'Markera som tillgänglig'}
                  </button>
                  {canDeleteItems && (
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="btn-danger"
                    >
                      Ta bort
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MenuManagement;
