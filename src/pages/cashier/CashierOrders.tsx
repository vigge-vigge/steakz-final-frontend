import React, { useEffect, useState, useContext } from 'react';
import { getOrders, updateOrderStatus } from '../../services/api';
import { OrderWithDetails } from '../../types';
import OrderList from '../../components/common/OrderList';
import { useSettings } from '../../context/SettingsContext';
import { useTheme } from '../../context/ThemeContext';
import { useShift } from '../../hooks/useShift';
import { AuthContext } from '../../context/AuthContext';

const CashierOrders: React.FC = () => {
  const { user } = useContext(AuthContext);
  const { settings, t } = useSettings();
  const { isDarkMode } = useTheme();
  const { isActive: shiftActive } = useShift();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    getOrders()
      .then(res => setOrders(res.data))
      .finally(() => setLoading(false));
  }, []);
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toString().includes(searchTerm) || 
                         order.customer?.username?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const refreshOrders = () => {
    setLoading(true);
    getOrders()
      .then(res => setOrders(res.data))
      .finally(() => setLoading(false));
  };  const handleDeliver = async (order: OrderWithDetails) => {
    setUpdating(true);
    try {
      await updateOrderStatus(order.id, 'DELIVERED');
      refreshOrders();
      alert('Order marked as delivered successfully!');
      
      // Ask if they want to generate a receipt
      const generateReceiptNow = window.confirm('Order delivered! Would you like to generate a receipt?');
      if (generateReceiptNow) {
        generateReceipt(order);
      }
    } catch (e) {
      alert('Failed to mark as delivered.');
    } finally {
      setUpdating(false);
    }
  };

  const generateReceipt = (order: OrderWithDetails) => {
    const receiptWindow = window.open('', '_blank');
    if (receiptWindow) {
      receiptWindow.document.write(`
        <html>
          <head>
            <title>Receipt - Order #${order.id}</title>
            <style>
              body { 
                font-family: 'Courier New', monospace; 
                padding: 20px; 
                line-height: 1.4;
                max-width: 400px;
                margin: 0 auto;
              }
              .header { 
                text-align: center; 
                border-bottom: 2px solid #000; 
                padding-bottom: 10px; 
                margin-bottom: 20px;
              }
              .header h2 { margin: 0; font-size: 20px; }
              .order-info { margin: 20px 0; }
              .order-info p { margin: 5px 0; }
              .items { margin: 20px 0; }
              .item-row { 
                display: flex; 
                justify-content: space-between; 
                margin: 5px 0; 
                padding: 2px 0;
              }
              .total { 
                border-top: 2px solid #000; 
                padding-top: 10px; 
                font-weight: bold; 
                font-size: 16px;
                text-align: right;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                font-style: italic;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>STEAKZ RESTAURANT</h2>
              <p>Order Receipt</p>
            </div>
            <div class="order-info">
              <p><strong>Order #:</strong> ${order.id}</p>
              <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
              <p><strong>Customer:</strong> ${order.customer?.username || 'Guest'}</p>
              <p><strong>Status:</strong> DELIVERED</p>
              ${order.deliveryAddress ? `<p><strong>Delivery:</strong> ${order.deliveryAddress}</p>` : ''}
            </div>
            <div class="items">
              <h3 style="margin-bottom: 10px;">Items:</h3>
              ${order.items.map(item => `
                <div class="item-row">
                  <span>${item.quantity}x ${item.menuItem.name}</span>
                  <span>$${(item.unitPrice * item.quantity).toFixed(2)}</span>
                </div>
              `).join('')}
            </div>
            <div class="total">
              <p>Total: $${order.totalAmount.toFixed(2)}</p>
            </div>
            <div class="footer">
              <p>Thank you for dining with us!</p>
              <p>Visit us again soon!</p>
            </div>
          </body>
        </html>
      `);
      receiptWindow.document.close();
      receiptWindow.print();
    }
  };
  const handleCancel = async (order: OrderWithDetails) => {
    setUpdating(true);
    try {
      await updateOrderStatus(order.id, 'CANCELLED');
      refreshOrders();
      alert('Order cancelled successfully!');
    } catch (e) {
      alert('Failed to cancel order.');
    } finally {
      setUpdating(false);
    }
  };

  const handleStartPreparing = async (order: OrderWithDetails) => {
    setUpdating(true);
    try {
      await updateOrderStatus(order.id, 'PREPARING');
      refreshOrders();
      alert('Order marked as preparing!');
    } catch (e) {
      alert('Failed to mark as preparing.');
    } finally {
      setUpdating(false);
    }
  };

  const handleMarkReady = async (order: OrderWithDetails) => {
    setUpdating(true);
    try {
      await updateOrderStatus(order.id, 'READY');
      refreshOrders();
      alert('Order marked as ready!');
    } catch (e) {
      alert('Failed to mark as ready.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className={isDarkMode ? 'dark' : ''} style={{ minHeight: '100vh', backgroundColor: isDarkMode ? '#18181b' : '#f9fafb', padding: '24px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: '1152px', margin: '0 auto' }}>        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: isDarkMode ? '#fbbf24' : '#111827', marginBottom: '8px' }}>{t('orders')} {t('management')}</h1>
              <p style={{ color: isDarkMode ? '#f3f4f6' : '#6b7280' }}>View and manage all orders. Search by order ID or customer name.</p>
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

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>Total Orders</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{orders.length}</p>
              </div>
              <div style={{ width: '48px', height: '48px', backgroundColor: '#dbeafe', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg style={{ width: '24px', height: '24px', color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>Pending Orders</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
                  {orders.filter(o => o.status === 'PENDING').length}
                </p>
              </div>
              <div style={{ width: '48px', height: '48px', backgroundColor: '#fed7aa', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg style={{ width: '24px', height: '24px', color: '#ea580c' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>                <p style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>Delivered Today</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
                  {orders.filter(o => o.status === 'DELIVERED').length}
                </p>
              </div>
              <div style={{ width: '48px', height: '48px', backgroundColor: '#d1fae5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg style={{ width: '24px', height: '24px', color: '#059669' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Search Orders
              </label>
              <input
                type="text"
                placeholder="Search by order ID or customer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none',
                  backgroundColor: 'white'
                }}
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="PREPARING">Preparing</option>
                <option value="READY">Ready</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>
              Orders ({filteredOrders.length})
            </h3>
          </div>
          
          <div style={{ padding: '24px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '48px' }}>
                <div style={{ fontSize: '16px', color: '#6b7280' }}>Loading orders...</div>
              </div>            ) : filteredOrders.length > 0 ? (
              <OrderList 
                orders={filteredOrders} 
                onDeliver={handleDeliver} 
                onCancel={handleCancel} 
                onGenerateReceipt={generateReceipt}
                onStartPreparing={handleStartPreparing}
                onMarkReady={handleMarkReady}
                userRole={user?.role}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '48px' }}>
                <svg style={{ width: '48px', height: '48px', color: '#9ca3af', margin: '0 auto 16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '8px' }}>No orders found</p>
                <p style={{ fontSize: '14px', color: '#9ca3af' }}>Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashierOrders;
