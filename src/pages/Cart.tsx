import React, { useState, useContext } from 'react';
import { useCart } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

// Currency formatting function
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
};

const Cart: React.FC = () => {
  const { user } = useContext(AuthContext);
  const { 
    items, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getTotalPrice, 
    getTotalItems, 
    placeOrder, 
    isPlacingOrder 
  } = useCart();
  
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);  const handlePlaceOrder = async () => {
    if (!deliveryAddress.trim()) {
      alert('Please enter a delivery address');
      return;
    }

    try {
      // For customers, use their default branch or branch 7
      // For cashiers, use their assigned branch
      const branchId = user?.role === 'CASHIER' ? user?.branchId : (user?.branchId || 7);
      
      await placeOrder(deliveryAddress, branchId);
      setOrderSuccess(true);
      setDeliveryAddress('');
      setShowOrderForm(false);
      setTimeout(() => setOrderSuccess(false), 3000);
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to place order. Please try again.';
      alert(errorMessage);
      console.error('Order error:', error);
    }
  };
  // Allow any logged in user to see the cart
  if (!user) {
    return (
      <div style={{ maxWidth: 800, margin: '40px auto', padding: 24, textAlign: 'center' }}>
        <h2>Please log in to access your cart</h2>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div style={{ maxWidth: 800, margin: '40px auto', padding: 24, textAlign: 'center' }}>
        <div style={{ 
          background: '#d1fae5', 
          border: '1px solid #10b981', 
          borderRadius: 8, 
          padding: 24,
          marginBottom: 24
        }}>
          <h2 style={{ color: '#047857', margin: 0 }}>🎉 Order Placed Successfully!</h2>
          <p style={{ color: '#047857', margin: '8px 0 0 0' }}>
            Your order has been submitted and is being processed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: 24 }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 24, color: '#7c2323' }}>
        Shopping Cart ({getTotalItems()} items)
      </h1>

      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <p style={{ fontSize: 18, color: '#888', marginBottom: 16 }}>Your cart is empty</p>
          <a 
            href="/menu" 
            style={{ 
              color: '#7c2323', 
              textDecoration: 'none', 
              fontWeight: 600 
            }}
          >
            Browse our menu →
          </a>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 24 }}>
            {items.map((item) => (
              <div 
                key={item.id}
                style={{
                  background: '#fff',
                  borderRadius: 8,
                  padding: 16,
                  marginBottom: 12,
                  boxShadow: '0 2px 4px #0001',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16
                }}
              >
                {item.menuItem.image && (
                  <img
                    src={item.menuItem.image.startsWith('http') ? item.menuItem.image : `/${item.menuItem.image}`}
                    alt={item.menuItem.name}
                    style={{ 
                      width: 80, 
                      height: 80, 
                      objectFit: 'cover', 
                      borderRadius: 6 
                    }}
                  />
                )}
                
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: 18 }}>{item.menuItem.name}</h3>
                  <p style={{ margin: '4px 0', color: '#666', fontSize: 14 }}>
                    {item.menuItem.description}
                  </p>
                  <p style={{ margin: 0, fontWeight: 600, color: '#7c2323' }}>
                    {formatPrice(item.menuItem.price)}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    style={{
                      background: '#f3f4f6',
                      border: '1px solid #d1d5db',
                      borderRadius: 4,
                      width: 32,
                      height: 32,
                      cursor: 'pointer',
                      fontSize: 16
                    }}
                  >
                    -
                  </button>
                  
                  <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 600 }}>
                    {item.quantity}
                  </span>
                  
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    style={{
                      background: '#f3f4f6',
                      border: '1px solid #d1d5db',
                      borderRadius: 4,
                      width: 32,
                      height: 32,
                      cursor: 'pointer',
                      fontSize: 16
                    }}
                  >
                    +
                  </button>
                  
                  <button
                    onClick={() => removeFromCart(item.id)}
                    style={{
                      background: '#ef4444',
                      color: '#fff',
                      border: 0,
                      borderRadius: 4,
                      padding: '6px 12px',
                      cursor: 'pointer',
                      fontSize: 14
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ 
            background: '#f9fafb', 
            padding: 20, 
            borderRadius: 8, 
            marginBottom: 24 
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              fontSize: 20,
              fontWeight: 700,
              color: '#7c2323'
            }}>
              <span>Total:</span>
              <span>{formatPrice(getTotalPrice())}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            <button
              onClick={clearCart}
              style={{
                background: '#6b7280',
                color: '#fff',
                border: 0,
                borderRadius: 6,
                padding: '12px 24px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Clear Cart
            </button>
            
            <button
              onClick={() => setShowOrderForm(true)}
              style={{
                background: '#7c2323',
                color: '#fff',
                border: 0,
                borderRadius: 6,
                padding: '12px 24px',
                cursor: 'pointer',
                fontWeight: 600,
                flex: 1
              }}
            >
              Place Order
            </button>
          </div>

          {showOrderForm && (
            <div style={{
              background: '#fff',
              border: '2px solid #7c2323',
              borderRadius: 8,
              padding: 24
            }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#7c2323' }}>Complete Your Order</h3>
                <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
                  {user?.role === 'CASHIER' ? 'Customer Info / Order Type' : 'Delivery Address'} *
                </label>
                <textarea
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder={
                    user?.role === 'CASHIER' 
                      ? "Enter customer name or 'Walk-in customer'..." 
                      : "Enter your complete delivery address..."
                  }
                  style={{
                    width: '100%',
                    padding: 12,
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    fontSize: 14,
                    resize: 'vertical',
                    minHeight: 80
                  }}
                />
                {user?.role === 'CASHIER' && (
                  <div style={{ marginTop: 8, fontSize: 12, color: '#6b7280' }}>
                    For in-store orders, enter customer name or "Walk-in customer"
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => setShowOrderForm(false)}
                  style={{
                    background: '#6b7280',
                    color: '#fff',
                    border: 0,
                    borderRadius: 6,
                    padding: '12px 24px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Cancel
                </button>
                  <button
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder}
                  style={{
                    background: isPlacingOrder ? '#9ca3af' : '#10b981',
                    color: '#fff',
                    border: 0,
                    borderRadius: 6,
                    padding: '12px 24px',
                    cursor: isPlacingOrder ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                    flex: 1
                  }}
                >
                  {isPlacingOrder ? 'Placing Order...' : 
                    user?.role === 'CASHIER' 
                      ? `Confirm Order (${formatPrice(getTotalPrice())})` 
                      : `Place Order (${formatPrice(getTotalPrice())})`
                  }
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Cart;
