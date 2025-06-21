import React, { useState, useEffect, useContext } from 'react';
import { createOrder, processPayment, getMenuItems, createReceipt } from '../../services/api';
import { MenuItem, PaymentMethod } from '../../types';
import { useSettings } from '../../context/SettingsContext';
import { useTheme } from '../../context/ThemeContext';
import { useShift } from '../../hooks/useShift';
import { AuthContext } from '../../context/AuthContext';

const CashierPOS: React.FC = () => {
  const { user } = useContext(AuthContext);
  const { settings, t } = useSettings();
  const { isDarkMode } = useTheme();
  const { isActive: shiftActive } = useShift();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<{ menuItemId: number; quantity: number }[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [customerName, setCustomerName] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [taxPercent, setTaxPercent] = useState(8.5); // Default tax rate
  const [orderComplete, setOrderComplete] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<number | null>(null);

  useEffect(() => {
    getMenuItems().then(res => setMenuItems(res.data)).finally(() => setLoading(false));
  }, []);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const found = prev.find(i => i.menuItemId === item.id);
      if (found) {
        return prev.map(i => i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { menuItemId: item.id, quantity: 1 }];
    });
  };

  const updateQuantity = (menuItemId: number, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(i => i.menuItemId !== menuItemId));
    } else {
      setCart(prev => prev.map(i => i.menuItemId === menuItemId ? { ...i, quantity } : i));
    }
  };

  const removeFromCart = (menuItemId: number) => {
    setCart(prev => prev.filter(i => i.menuItemId !== menuItemId));
  };

  const getSubtotal = () => {
    return cart.reduce((total, cartItem) => {
      const menuItem = menuItems.find(m => m.id === cartItem.menuItemId);
      return total + (menuItem ? menuItem.price * cartItem.quantity : 0);
    }, 0);
  };

  const getDiscountAmount = () => {
    return getSubtotal() * (discountPercent / 100);
  };

  const getTaxAmount = () => {
    const afterDiscount = getSubtotal() - getDiscountAmount();
    return afterDiscount * (taxPercent / 100);
  };

  const getFinalTotal = () => {
    return getSubtotal() - getDiscountAmount() + getTaxAmount();
  };

  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
    return matchesSearch && matchesCategory && item.isAvailable;
  });

  const categories = ['ALL', ...Array.from(new Set(menuItems.map(item => item.category)))];  const handlePlaceOrder = async () => {
    setMessage('');
    setOrderComplete(false);
    
    if (cart.length === 0) {
      setMessage('Please add items to cart before placing order.');
      return;
    }

    if (!user || !user.branchId) {
      setMessage('User not authenticated or branch not assigned.');
      return;
    }
    
    let orderId = null;
    
    try {
      console.log('Creating order...');
      const orderRes = await createOrder({ 
        branchId: user.branchId, // Use cashier's branch
        items: cart, 
        deliveryAddress: customerName ? `In-store order - Customer: ${customerName}` : 'Walk-in Customer'
      });
      console.log('Order created:', orderRes.data);
      orderId = orderRes.data.id;
      
      console.log('Processing payment...');
      const paymentData = { 
        amount: parseFloat(getFinalTotal().toFixed(2)), 
        method: paymentMethod 
      };
      console.log('Payment data:', paymentData);
        const paymentRes = await processPayment(orderId, paymentData);
      console.log('Payment processed:', paymentRes.data);
      
      // Create receipt after successful payment
      try {
        const receiptData = {
          orderId: orderId,
          subtotal: getSubtotal(),
          tax: getTaxAmount(),
          discount: getDiscountAmount(),
          total: getFinalTotal(),
          paymentMethod: paymentMethod,
          customerName: customerName || 'Walk-in Customer'
        };
        
        console.log('Creating receipt with data:', receiptData);
        const receiptRes = await createReceipt(receiptData);
        console.log('Receipt created:', receiptRes.data);
      } catch (receiptError) {
        console.error('Receipt creation failed:', receiptError);
        // Don't fail the whole order if receipt creation fails
      }
      
      setLastOrderId(orderId);
      setOrderComplete(true);
      setMessage('Order placed and payment processed successfully!');
      
      // Clear cart after successful order
      setCart([]);
      setCustomerName('');
      setDiscountPercent(0);
      
      // Trigger a window event to notify other components to refresh
      window.dispatchEvent(new CustomEvent('orderPlaced', { detail: { orderId: orderId } }));
      
    } catch (e: any) {
      console.error('Order/Payment error:', e);
      console.error('Error response:', e?.response?.data);
      
      if (orderId) {
        // Order was created, try payment again or create manual payment
        try {
          const paymentData = { 
            amount: parseFloat(getFinalTotal().toFixed(2)), 
            method: paymentMethod 
          };          await processPayment(orderId, paymentData);
          
          // Create receipt after successful payment retry
          try {
            const receiptData = {
              orderId: orderId,
              subtotal: getSubtotal(),
              tax: getTaxAmount(),
              discount: getDiscountAmount(),
              total: getFinalTotal(),
              paymentMethod: paymentMethod,
              customerName: customerName || 'Walk-in Customer'
            };
            
            console.log('Creating receipt with data:', receiptData);
            const receiptRes = await createReceipt(receiptData);
            console.log('Receipt created:', receiptRes.data);
          } catch (receiptError) {
            console.error('Receipt creation failed:', receiptError);
            // Don't fail the whole order if receipt creation fails
          }
          
          setLastOrderId(orderId);
          setOrderComplete(true);
          setMessage('Order placed and payment processed successfully!');
          
          // Clear cart
          setCart([]);
          setCustomerName('');
          setDiscountPercent(0);
          
          window.dispatchEvent(new CustomEvent('orderPlaced', { detail: { orderId: orderId } }));
          
        } catch (paymentError) {
          console.error('Payment retry failed:', paymentError);
          setMessage(`Order created (ID: ${orderId}) but payment failed. Please process payment manually.`);
          setLastOrderId(orderId);
          setOrderComplete(true);
          
          // Still clear cart
          setCart([]);
          setCustomerName('');
          setDiscountPercent(0);
        }
      } else {
        setMessage(`Failed to create order: ${e?.response?.data?.message || e.message}`);
      }
    }
  };

  const handlePrintReceipt = () => {
    const receiptWindow = window.open('', '_blank');
    if (receiptWindow) {
      const receiptContent = generateReceiptHTML();
      receiptWindow.document.write(receiptContent);
      receiptWindow.document.close();
      receiptWindow.print();
    }
  };

  const generateReceiptHTML = () => {
    const now = new Date();
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt #${lastOrderId}</title>
        <style>
          body { font-family: monospace; font-size: 12px; margin: 20px; max-width: 300px; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 10px; }
          .item { display: flex; justify-content: space-between; margin: 5px 0; }
          .total-section { border-top: 1px solid #000; padding-top: 10px; margin-top: 10px; }
          .total { font-weight: bold; border-top: 2px solid #000; padding-top: 5px; }
          .footer { text-align: center; margin-top: 20px; border-top: 1px solid #000; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>RESTAURANT POS</h2>
          <p>Receipt #${lastOrderId}</p>
          <p>${now.toLocaleDateString()} ${now.toLocaleTimeString()}</p>
          ${customerName ? `<p>Customer: ${customerName}</p>` : ''}
        </div>
        
        <div class="items">
          ${cart.map(cartItem => {
            const menuItem = menuItems.find(m => m.id === cartItem.menuItemId);
            if (!menuItem) return '';
            const itemTotal = menuItem.price * cartItem.quantity;
            return `
              <div class="item">
                <span>${menuItem.name} x${cartItem.quantity}</span>
                <span>$${itemTotal.toFixed(2)}</span>
              </div>
            `;
          }).join('')}
        </div>
        
        <div class="total-section">
          <div class="item">
            <span>Subtotal:</span>
            <span>$${getSubtotal().toFixed(2)}</span>
          </div>
          ${discountPercent > 0 ? `
            <div class="item">
              <span>Discount (${discountPercent}%):</span>
              <span>-$${getDiscountAmount().toFixed(2)}</span>
            </div>
          ` : ''}
          <div class="item">
            <span>Tax (${taxPercent}%):</span>
            <span>$${getTaxAmount().toFixed(2)}</span>
          </div>
          <div class="item total">
            <span>TOTAL:</span>
            <span>$${getFinalTotal().toFixed(2)}</span>
          </div>
        </div>
        
        <div class="footer">
          <p>Payment Method: ${paymentMethod.replace('_', ' ')}</p>
          <p>Thank you for your business!</p>
        </div>
      </body>
      </html>
    `;
  };

  const handleNewOrder = () => {
    setCart([]);
    setCustomerName('');
    setDiscountPercent(0);
    setMessage('');
    setOrderComplete(false);
    setLastOrderId(null);
  };

  return (    <div className={isDarkMode ? 'dark' : ''} style={{ minHeight: '100vh', backgroundColor: isDarkMode ? '#18181b' : '#f9fafb', padding: '24px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: isDarkMode ? '#fbbf24' : '#111827', marginBottom: '8px' }}>Point of Sale System</h1>
              <p style={{ color: isDarkMode ? '#f3f4f6' : '#6b7280' }}>Complete cart-based POS with menu selection, pricing calculations, and receipt printing.</p>
            </div>
            <div style={{ 
              padding: '8px 16px', 
              borderRadius: '20px', 
              backgroundColor: shiftActive ? '#d1fae5' : '#fee2e2',
              color: shiftActive ? '#065f46' : '#991b1b',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              Shift: {shiftActive ? 'Active' : 'Inactive'}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          {/* Menu Section */}
          <div>
            {/* Search and Filter */}
            <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', padding: '24px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>Menu Selection</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Search Menu Items
                  </label>
                  <input
                    type="text"
                    placeholder="Search by item name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Category Filter
                  </label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: 'white'
                    }}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Menu Items Grid */}
            <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
              <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                  Available Items ({filteredMenuItems.length})
                </h3>
              </div>
              
              <div style={{ padding: '24px' }}>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '48px' }}>
                    <div style={{ fontSize: '16px', color: '#6b7280' }}>Loading menu...</div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                    {filteredMenuItems.map(item => (
                      <div 
                        key={item.id}
                        style={{
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '16px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#2563eb';
                          e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#e5e7eb';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                        onClick={() => addToCart(item)}
                      >
                        <div style={{ marginBottom: '12px' }}>
                          <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                            {item.name}
                          </h4>
                          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                            {item.description}
                          </p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#059669' }}>
                              ${item.price.toFixed(2)}
                            </span>
                            <span style={{ 
                              fontSize: '12px', 
                              fontWeight: '500', 
                              color: '#6b7280',
                              backgroundColor: '#f3f4f6',
                              padding: '2px 8px',
                              borderRadius: '12px'
                            }}>
                              {item.category}
                            </span>
                          </div>
                        </div>
                        
                        <button
                          style={{
                            width: '100%',
                            padding: '8px',
                            backgroundColor: '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                        >
                          Add to Cart
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Cart Section */}
          <div>
            <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', position: 'sticky', top: '24px' }}>
              <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                  Shopping Cart ({cart.length} items)
                </h3>
              </div>
              
              <div style={{ padding: '24px' }}>
                {/* Customer Name */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Customer Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Enter customer name..."
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Cart Items */}
                {cart.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px' }}>
                    <svg style={{ width: '48px', height: '48px', color: '#9ca3af', margin: '0 auto 16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 5H3m4 8a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p style={{ color: '#6b7280' }}>Cart is empty</p>
                  </div>
                ) : (
                  <>
                    <div style={{ marginBottom: '16px' }}>
                      {cart.map(cartItem => {
                        const menuItem = menuItems.find(m => m.id === cartItem.menuItemId);
                        if (!menuItem) return null;
                        
                        return (
                          <div key={cartItem.menuItemId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                                {menuItem.name}
                              </div>
                              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                ${menuItem.price.toFixed(2)} each
                              </div>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <button
                                onClick={() => updateQuantity(cartItem.menuItemId, cartItem.quantity - 1)}
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  border: '1px solid #d1d5db',
                                  borderRadius: '4px',
                                  backgroundColor: 'white',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                -
                              </button>
                              
                              <span style={{ minWidth: '24px', textAlign: 'center', fontSize: '14px', fontWeight: '500' }}>
                                {cartItem.quantity}
                              </span>
                              
                              <button
                                onClick={() => updateQuantity(cartItem.menuItemId, cartItem.quantity + 1)}
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  border: '1px solid #d1d5db',
                                  borderRadius: '4px',
                                  backgroundColor: 'white',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                +
                              </button>
                              
                              <button
                                onClick={() => removeFromCart(cartItem.menuItemId)}
                                style={{
                                  marginLeft: '8px',
                                  padding: '4px',
                                  color: '#ef4444',
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer'
                                }}
                              >
                                <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Discount and Tax */}
                    <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                            Discount %
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={discountPercent}
                            onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                            style={{
                              width: '100%',
                              padding: '6px 8px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '12px'
                            }}
                          />
                        </div>
                        
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                            Tax %
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={taxPercent}
                            onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
                            style={{
                              width: '100%',
                              padding: '6px 8px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '12px'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Order Summary */}
                    <div style={{ padding: '16px 0', borderTop: '2px solid #e5e7eb' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>Subtotal:</span>
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>${getSubtotal().toFixed(2)}</span>
                      </div>
                      
                      {discountPercent > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontSize: '14px', color: '#6b7280' }}>Discount ({discountPercent}%):</span>
                          <span style={{ fontSize: '14px', fontWeight: '500', color: '#ef4444' }}>-${getDiscountAmount().toFixed(2)}</span>
                        </div>
                      )}
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>Tax ({taxPercent}%):</span>
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>${getTaxAmount().toFixed(2)}</span>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}>
                        <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>Total:</span>
                        <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#059669' }}>
                          ${getFinalTotal().toFixed(2)}
                        </span>
                      </div>
                      
                      {/* Payment Method */}
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                          Payment Method
                        </label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px',
                            backgroundColor: 'white'
                          }}
                        >
                          <option value="CASH">Cash</option>
                          <option value="CREDIT_CARD">Credit Card</option>
                          <option value="DEBIT_CARD">Debit Card</option>
                          <option value="MOBILE_PAYMENT">Mobile Payment</option>
                        </select>
                      </div>
                      
                      {/* Action Buttons */}
                      {!orderComplete ? (
                        <button
                          onClick={handlePlaceOrder}
                          disabled={cart.length === 0}
                          style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: cart.length === 0 ? '#9ca3af' : '#059669',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                            transition: 'background-color 0.2s',
                            marginBottom: '8px'
                          }}
                          onMouseEnter={(e) => {
                            if (cart.length > 0) {
                              e.currentTarget.style.backgroundColor = '#047857';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (cart.length > 0) {
                              e.currentTarget.style.backgroundColor = '#059669';
                            }
                          }}
                        >
                          Place Order
                        </button>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                          <button
                            onClick={handlePrintReceipt}
                            style={{
                              padding: '12px',
                              backgroundColor: '#2563eb',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '14px',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            Print Receipt
                          </button>
                          
                          <button
                            onClick={handleNewOrder}
                            style={{
                              padding: '12px',
                              backgroundColor: '#059669',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '14px',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            New Order
                          </button>
                        </div>
                      )}
                      
                      {message && (
                        <div style={{ 
                          marginTop: '16px', 
                          padding: '12px', 
                          borderRadius: '6px',
                          backgroundColor: message.includes('Error') ? '#fef2f2' : '#f0fdf4',
                          color: message.includes('Error') ? '#dc2626' : '#166534',
                          fontSize: '14px',
                          textAlign: 'center'
                        }}>
                          {message}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>      </div>
    </div>
  );
};

export default CashierPOS;
