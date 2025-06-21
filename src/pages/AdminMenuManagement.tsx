import React, { useState, useEffect, useCallback } from 'react';
import {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../services/api';
import { MenuItemWithIngredients } from '../types';
import AdminCard from '../components/admin/AdminCard';
import '../components/admin/AdminCard.css';

interface MenuCategory {
  id: number;
  name: string;
  order: number;
}

const AdminMenuManagement: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItemWithIngredients[]>([]);
  const [search, setSearch] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItemWithIngredients | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Category management state
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [editCategoryIdx, setEditCategoryIdx] = useState<number | null>(null);
  const [editCategoryValue, setEditCategoryValue] = useState('');
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  // Menu item form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    isAvailable: true,    ingredients: [] as number[],
  });

  const fetchMenuItems = useCallback(async () => {
    const res = await getMenuItems();
    let filtered = res.data;
    if (search) {
      filtered = filtered.filter((item: MenuItemWithIngredients) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    setMenuItems(filtered);
  }, [search]);
  
  const fetchCategories = useCallback(async () => {
    const res = await getCategories();
    setCategories(res.data);
  }, []);

  const loadData = useCallback(async () => {
    try {      setLoading(true);
      setError('');
      await Promise.all([
        fetchMenuItems(),
        fetchCategories(),
      ]);
    } catch (err: any) {
      setError('Error loading data');
    } finally {
      setLoading(false);
    }
  }, [fetchMenuItems, fetchCategories]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      await createMenuItem({
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        ingredients: formData.ingredients,
      });
      setSuccess('Menu item created successfully');
      resetForm();
      fetchMenuItems();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error creating menu item');
    }
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    
    try {
      setError('');
      await updateMenuItem(editingItem.id, {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        isAvailable: formData.isAvailable,
        ingredients: formData.ingredients,
      });
      setSuccess('Menu item updated successfully');
      resetForm();
      fetchMenuItems();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error updating menu item');
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;
    
    try {
      setError('');
      await deleteMenuItem(id);
      setSuccess('Menu item deleted successfully');
      fetchMenuItems();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error deleting menu item');
    }
  };

  const startEdit = (item: MenuItemWithIngredients) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      isAvailable: item.isAvailable,
      ingredients: item.ingredients.map(ing => ing.id),
    });
    setShowCreateForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      isAvailable: true,
      ingredients: [],
    });
    setShowCreateForm(false);
    setEditingItem(null);
  };

  // Category management functions
  const handleCreateCategory = async () => {
    if (!newCategory.trim()) return;
    
    try {
      setError('');
      await createCategory(newCategory);
      setSuccess('Category created successfully');
      setNewCategory('');
      fetchCategories();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error creating category');
    }
  };

  const handleUpdateCategory = async (id: number, name: string) => {
    try {
      setError('');
      await updateCategory(id, { name });
      setSuccess('Category updated successfully');
      setEditCategoryIdx(null);
      setEditCategoryValue('');
      fetchCategories();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error updating category');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    try {
      setError('');
      await deleteCategory(id);
      setSuccess('Category deleted successfully');
      fetchCategories();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error deleting category');
    }
  };

  // Statistics calculations
  const statistics = {
    totalItems: menuItems.length,
    availableItems: menuItems.filter(item => item.isAvailable).length,
    totalCategories: categories.length,
    averagePrice: menuItems.length > 0 
      ? menuItems.reduce((sum, item) => sum + item.price, 0) / menuItems.length 
      : 0,
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div>Loading menu data...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1f2937' }}>
          Menu Management
        </h1>
        <p style={{ color: '#6b7280' }}>Manage menu items, categories, and pricing</p>
      </div>

      {/* Alert Messages */}
      {error && (
        <div style={{ 
          background: '#fef2f2', 
          color: '#dc2626', 
          padding: '1rem', 
          borderRadius: '8px', 
          marginBottom: '1rem',
          border: '1px solid #fecaca' 
        }}>
          {error}
        </div>
      )}
      
      {success && (
        <div style={{ 
          background: '#f0fdf4', 
          color: '#16a34a', 
          padding: '1rem', 
          borderRadius: '8px', 
          marginBottom: '1rem',
          border: '1px solid #bbf7d0' 
        }}>
          {success}
        </div>
      )}      {/* Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🍽️</span>
            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>Total Menu Items</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
            {statistics.totalItems}
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>✅</span>
            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>Available Items</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
            {statistics.availableItems}
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>📂</span>
            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>Categories</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
            {statistics.totalCategories}
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>💰</span>
            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>Average Price</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
            ${statistics.averagePrice.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setShowCreateForm(true)}
          style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 1.5rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#2563eb'}
          onMouseOut={(e) => e.currentTarget.style.background = '#3b82f6'}
        >
          ➕ Add Menu Item
        </button>
        <button
          onClick={() => setShowCategoryForm(!showCategoryForm)}
          style={{
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 1.5rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#059669'}
          onMouseOut={(e) => e.currentTarget.style.background = '#10b981'}
        >
          📂 Manage Categories
        </button>
      </div>

      {/* Search */}
      <AdminCard title="Search Menu Items">
        <input
          type="text"
          placeholder="Search by menu item name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
          onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
        />
      </AdminCard>

      {/* Category Management Form */}
      {showCategoryForm && (
        <AdminCard title="Category Management">
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
              Add New Category
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Category name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
              <button
                onClick={handleCreateCategory}
                style={{
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Add
              </button>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
              Existing Categories
            </h3>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {categories.map((category, idx) => (
                <div key={category.id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  padding: '0.75rem',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  {editCategoryIdx === idx ? (
                    <>
                      <input
                        type="text"
                        value={editCategoryValue}
                        onChange={(e) => setEditCategoryValue(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px'
                        }}
                      />
                      <button
                        onClick={() => handleUpdateCategory(category.id, editCategoryValue)}
                        style={{
                          background: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '0.5rem',
                          cursor: 'pointer'
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditCategoryIdx(null)}
                        style={{
                          background: '#6b7280',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '0.5rem',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <span style={{ flex: 1, fontWeight: '500' }}>{category.name}</span>
                      <button
                        onClick={() => {
                          setEditCategoryIdx(idx);
                          setEditCategoryValue(category.name);
                        }}
                        style={{
                          background: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '0.5rem',
                          cursor: 'pointer'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        style={{
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '0.5rem',
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </AdminCard>
      )}

      {/* Create/Edit Form */}
      {showCreateForm && (
        <AdminCard title={editingItem ? 'Edit Menu Item' : 'Create New Menu Item'}>
          <form onSubmit={editingItem ? handleUpdateItem : handleCreateItem}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Ingredients (Leave empty for now)</label>
                <input
                  type="text"
                  placeholder="Ingredient management coming soon..."
                  disabled
                />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  />
                  Available for ordering
                </label>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem 1.5rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {editingItem ? 'Update' : 'Create'} Menu Item
              </button>
              <button
                type="button"
                onClick={resetForm}
                style={{
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem 1.5rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </AdminCard>
      )}

      {/* Menu Items List */}
      <AdminCard title="Menu Items">
        {menuItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
            No menu items found. {search && 'Try adjusting your search or '}Create your first menu item to get started.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Item</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Category</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Price</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ 
                          width: '48px', 
                          height: '48px', 
                          borderRadius: '8px', 
                          background: '#f59e0b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '18px'
                        }}>
                          {item.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', color: '#1f2937' }}>{item.name}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            {item.description.substring(0, 50)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        background: '#ede9fe',
                        color: '#7c3aed',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}>
                        {item.category}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: '600', color: '#1f2937' }}>
                      ${item.price.toFixed(2)}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        background: item.isAvailable ? '#10b981' : '#ef4444',
                        color: 'white'
                      }}>
                        {item.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => startEdit(item)}
                          style={{
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.5rem 0.75rem',
                            fontSize: '0.875rem',
                            cursor: 'pointer'
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          style={{
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.5rem 0.75rem',
                            fontSize: '0.875rem',
                            cursor: 'pointer'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </div>
  );
};

export default AdminMenuManagement;
