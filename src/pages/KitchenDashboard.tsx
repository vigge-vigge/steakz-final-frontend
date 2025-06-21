import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import * as api from '../services/api';
import { Order, OrderStatus, OrderWithDetails, InventoryItem, MenuItemWithIngredients } from '../types';
import './styles/KitchenDashboard.css';

const KitchenDashboard: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemWithIngredients[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'menu'>('orders');

  useEffect(() => {
    loadOrders();
    loadInventory();
    loadMenuItems();
    // Set up polling for new orders
    const interval = setInterval(() => {
      loadOrders();
      loadInventory();
    }, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      // Load both PENDING and PREPARING orders separately and combine them
      const [pendingOrders, preparingOrders] = await Promise.all([
        api.getOrders({
          branchId: user?.branchId,
          status: 'PENDING'
        }),
        api.getOrders({
          branchId: user?.branchId,
          status: 'PREPARING'
        })
      ]);
      setOrders([...pendingOrders.data, ...preparingOrders.data]);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error loading orders');
    }
  };

  const loadInventory = async () => {
    if (!user?.branchId) return;
    try {
      const response = await api.getInventory(user.branchId);
      setInventory(response.data);
    } catch (err: any) {
      console.error('Error loading inventory:', err);
    }
  };

  const loadMenuItems = async () => {
    try {
      const response = await api.getMenuItems(user?.branchId);
      setMenuItems(response.data);
    } catch (err: any) {
      console.error('Error loading menu items:', err);
    }
  };

  const updateOrderStatus = async (orderId: number, status: OrderStatus) => {
    try {
      await api.updateOrderStatus(orderId, status);
      loadOrders();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error updating order status');
    }
  };

  const toggleMenuItemAvailability = async (itemId: number, isAvailable: boolean) => {
    try {
      await api.updateMenuItem(itemId, { isAvailable });
      loadMenuItems();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error updating menu item');
    }
  };

  if (loading) return <div>Loading...</div>;

  const pendingOrders = orders.filter(order => order.status === 'PENDING');
  const preparingOrders = orders.filter(order => order.status === 'PREPARING');
  const lowStockItems = inventory.filter(item => item.quantity <= item.minThreshold);

  const renderOrdersTab = () => (
    <div className="orders-grid">
      <div className="orders-column">
        <h2>Pending Orders ({pendingOrders.length})</h2>
        {pendingOrders.map(order => (
          <div key={order.id} className="order-card pending">
            <div className="order-header">
              <span className="order-number">Order #{order.id}</span>
              <span className="order-time">
                {new Date(order.createdAt).toLocaleTimeString()}
              </span>
            </div>
            <div className="customer-info">
              <small>Kund: {order.customer.username}</small>
            </div>
            <div className="order-items">
              {order.items.map(item => (
                <div key={item.id} className="order-item">
                  <span className="quantity">{item.quantity}x</span>
                  <span className="item-name">{item.menuItem.name}</span>
                  <p className="item-description">{item.menuItem.description}</p>
                </div>
              ))}
            </div>
            <div className="order-actions">
              <button
                className="btn-primary"
                onClick={() => updateOrderStatus(order.id, 'PREPARING')}
              >
                Start Cooking
              </button>
            </div>
          </div>
        ))}
        {pendingOrders.length === 0 && (
          <div className="no-orders">No pending orders</div>
        )}
      </div>

      <div className="orders-column">
        <h2>Preparing ({preparingOrders.length})</h2>
        {preparingOrders.map(order => (
          <div key={order.id} className="order-card preparing">
            <div className="order-header">
              <span className="order-number">Order #{order.id}</span>
              <span className="order-time">
                {new Date(order.createdAt).toLocaleTimeString()}
              </span>
            </div>
            <div className="customer-info">
              <small>Kund: {order.customer.username}</small>
            </div>
            <div className="order-items">
              {order.items.map(item => (
                <div key={item.id} className="order-item">
                  <span className="quantity">{item.quantity}x</span>
                  <span className="item-name">{item.menuItem.name}</span>
                  <p className="item-description">{item.menuItem.description}</p>
                </div>
              ))}
            </div>
            <div className="order-actions">
              <button
                className="btn-success"
                onClick={() => updateOrderStatus(order.id, 'READY')}
              >
                Mark as Ready
              </button>
            </div>
          </div>
        ))}
        {preparingOrders.length === 0 && (
          <div className="no-orders">No orders being prepared</div>
        )}
      </div>
    </div>
  );

  const renderInventoryTab = () => (
    <div className="inventory-section">
      <div className="inventory-alerts">
        {lowStockItems.length > 0 && (
          <div className="alert alert-warning">
            <h3>⚠️ Low Stock Alert ({lowStockItems.length} items)</h3>
            <ul>
              {lowStockItems.map(item => (
                <li key={item.id}>
                  {item.name}: {item.quantity} {item.unit} (minimum: {item.minThreshold})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <div className="inventory-grid">
        <h2>Inventory Status</h2>
        <div className="inventory-list">
          {inventory.map(item => (
            <div key={item.id} className={`inventory-item ${item.quantity <= item.minThreshold ? 'low-stock' : ''}`}>
              <div className="item-info">
                <h4>{item.name}</h4>
                <div className="item-details">
                  <span className="quantity">
                    {item.quantity} {item.unit}
                  </span>
                  <span className="threshold">
                    Min: {item.minThreshold} {item.unit}
                  </span>
                </div>
              </div>
              <div className="item-status">
                {item.quantity <= item.minThreshold ? (
                  <span className="status-low">Low Stock</span>
                ) : (
                  <span className="status-ok">OK</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMenuTab = () => (
    <div className="menu-section">
      <h2>Menu Management</h2>
      <div className="menu-grid">
        {menuItems.map(item => (
          <div key={item.id} className={`menu-item-card ${!item.isAvailable ? 'unavailable' : ''}`}>
            <div className="menu-item-header">
              <h4>{item.name}</h4>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={item.isAvailable}
                  onChange={(e) => toggleMenuItemAvailability(item.id, e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
            <p className="menu-item-description">{item.description}</p>
            <div className="menu-item-details">
              <span className="price">{item.price} kr</span>
              <span className="category">{item.category}</span>
            </div>            <div className="ingredients">
              <small>Ingredienser: {item.ingredients ? item.ingredients.map(ing => ing.name).join(', ') : 'Inga ingredienser'}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="kitchen-dashboard">
      <div className="kitchen-header">
        <h1>Kitchen Dashboard</h1>
        <div className="kitchen-stats">
          <div className="stat-card">
            <span className="stat-number">{pendingOrders.length}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{preparingOrders.length}</span>
            <span className="stat-label">Preparing</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{lowStockItems.length}</span>
            <span className="stat-label">Low Stock</span>
          </div>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="kitchen-tabs">
        <button 
          className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          📋 Orders
        </button>
        <button 
          className={`tab-button ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          📦 Inventory
        </button>
        <button 
          className={`tab-button ${activeTab === 'menu' ? 'active' : ''}`}
          onClick={() => setActiveTab('menu')}
        >
          🍽️ Menu
        </button>
      </div>

      <div className="kitchen-content">
        {activeTab === 'orders' && renderOrdersTab()}
        {activeTab === 'inventory' && renderInventoryTab()}
        {activeTab === 'menu' && renderMenuTab()}
      </div>
    </div>
  );
};

export default KitchenDashboard;
