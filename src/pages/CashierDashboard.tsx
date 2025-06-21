import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import * as api from '../services/api';
import { Order, MenuItem, OrderStatus, PaymentMethod, OrderWithDetails, MenuItemWithIngredients } from '../types';
import './styles/CashierDashboard.css';

const CashierDashboard: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [activeOrders, setActiveOrders] = useState<OrderWithDetails[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cart, setCart] = useState<{
    items: { menuItemId: number; quantity: number; name: string; price: number }[];
    total: number;
  }>({
    items: [],
    total: 0
  });

  useEffect(() => {
    loadOrders();
    loadMenu();
    // Poll for updates
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, []);
  const loadOrders = async () => {
    try {
      // Load both READY and PENDING orders separately and combine them
      const [readyOrders, pendingOrders] = await Promise.all([
        api.getOrders({
          branchId: user?.branchId,
          status: 'READY'
        }),
        api.getOrders({
          branchId: user?.branchId,
          status: 'PENDING'
        })
      ]);
      setActiveOrders([...readyOrders.data, ...pendingOrders.data]);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error loading orders');
    }
  };

  const loadMenu = async () => {
    try {
      const response = await api.getMenuItems(user?.branchId);
      setMenuItems(response.data.filter(item => item.isAvailable));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error loading menu');
    }
  };

  const addToCart = (menuItem: MenuItem) => {
    setCart(currentCart => {
      const existingItem = currentCart.items.find(item => item.menuItemId === menuItem.id);
      
      if (existingItem) {
        const updatedItems = currentCart.items.map(item =>
          item.menuItemId === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        return {
          items: updatedItems,
          total: currentCart.total + menuItem.price
        };
      }

      return {
        items: [...currentCart.items, {
          menuItemId: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: 1
        }],
        total: currentCart.total + menuItem.price
      };
    });
  };

  const removeFromCart = (menuItemId: number, price: number) => {
    setCart(currentCart => {
      const updatedItems = currentCart.items
        .map(item => {
          if (item.menuItemId === menuItemId) {
            return {
              ...item,
              quantity: item.quantity - 1
            };
          }
          return item;
        })
        .filter(item => item.quantity > 0);

      return {
        items: updatedItems,
        total: currentCart.total - price
      };
    });
  };

  const createOrder = async () => {
    if (!cart.items.length) return;

    try {
      await api.createOrder({
        branchId: user?.branchId!,
        items: cart.items.map(item => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity
        })),
        deliveryAddress: '' // Cashier orders: no delivery address required, use empty string
      });

      setCart({ items: [], total: 0 });
      loadOrders();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error creating order');
    }
  };

  const processPayment = async (orderId: number, amount: number) => {
    try {
      await api.processPayment(orderId, {
        amount,
        method: 'CASH' // You could add a payment method selector here
      });
      await api.updateOrderStatus(orderId, 'DELIVERED');
      loadOrders();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error processing payment');
    }
  };

  const cancelOrder = async (orderId: number) => {
    if (!window.confirm('Är du säker på att du vill avbryta denna beställning?')) {
      return;
    }
    try {
      await api.updateOrderStatus(orderId, 'CANCELLED');
      loadOrders();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error cancelling order');
    }
  };

  if (loading) return <div>Laddar...</div>;

  return (
    <div className="cashier-dashboard">
      <div className="orders-section">
        <h2>Aktiva Beställningar</h2>
        {error && <div className="error">{error}</div>}
        <div className="orders-grid">
          {activeOrders.map(order => (
            <div key={order.id} className={`order-card ${order.status.toLowerCase()}`}>
              <div className="order-header">
                <span className="order-number">Beställning #{order.id}</span>
                <span className={`status ${order.status.toLowerCase()}`}>
                  {order.status}
                </span>
              </div>
              <div className="customer-info">
                <span>Kund: {order.customer.username}</span>
              </div>
              <div className="order-items">
                {order.items.map(item => (
                  <div key={item.id} className="order-item">
                    <span className="quantity">{item.quantity}x</span>
                    <span className="item-name">{item.menuItem.name}</span>
                    <span className="price">${(item.unitPrice * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="order-total">
                Totalt: ${order.totalAmount.toFixed(2)}
              </div>
              <div className="order-actions">
                {order.status === 'READY' && (
                  <button
                    className="btn-primary"
                    onClick={() => processPayment(order.id, order.totalAmount)}
                  >
                    Behandla Betalning
                  </button>
                )}
                <button
                  className="btn-danger"
                  onClick={() => cancelOrder(order.id)}
                >
                  Avbryt Beställning
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="new-order-section">
        <h2>Ny Beställning</h2>
        <div className="menu-grid">
          {menuItems.map(item => (
            <div key={item.id} className="menu-item">
              <h3>{item.name}</h3>
              <p className="description">{item.description}</p>
              <p className="price">${item.price.toFixed(2)}</p>
              <button
                className="btn-primary"
                onClick={() => addToCart(item)}
              >
                Lägg till i Beställning
              </button>
            </div>
          ))}
        </div>

        {cart.items.length > 0 && (
          <div className="cart">
            <h3>Nuvarande Beställning</h3>
            {cart.items.map(item => (
              <div key={item.menuItemId} className="cart-item">
                <span className="item-name">{item.name}</span>
                <span className="quantity">x{item.quantity}</span>
                <span className="price">${(item.price * item.quantity).toFixed(2)}</span>
                <button
                  className="btn-danger btn-small"
                  onClick={() => removeFromCart(item.menuItemId, item.price)}
                >
                  -
                </button>
              </div>
            ))}
            <div className="cart-total">
              Totalt: ${cart.total.toFixed(2)}
            </div>
            <button
              className="btn-primary btn-large"
              onClick={createOrder}
            >
              Lägg Beställning
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashierDashboard;
