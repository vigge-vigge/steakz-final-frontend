import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../context/ThemeContext';
import * as api from '../services/api';
import { OrderWithDetails } from '../types';

const Orders: React.FC = () => {
  const { user } = useContext(AuthContext);
  const { settings, t } = useSettings();
  const { isDarkMode } = useTheme();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');  const [search, setSearch] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);
  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await api.getOrders({});
      setOrders(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error loading orders');
    } finally {
      setLoading(false);
    }
  };

  const handleDelivery = async (orderId: number) => {
    try {
      await api.updateOrderStatus(orderId, 'DELIVERED');
      await loadOrders();
      alert('Order marked as delivered successfully!');
    } catch (err: any) {
      alert('Failed to mark order as delivered');
    }
  };

  const handleCancel = async (orderId: number) => {
    try {
      await api.updateOrderStatus(orderId, 'CANCELLED');
      await loadOrders();
      alert('Order cancelled successfully!');
    } catch (err: any) {
      alert('Failed to cancel order');
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
              body { font-family: monospace; padding: 20px; }
              .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; }
              .order-info { margin: 20px 0; }
              .items { margin: 20px 0; }
              .total { border-top: 2px solid #000; padding-top: 10px; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>STEAKZ RESTAURANT</h2>
              <p>Order Receipt</p>
            </div>
            <div class="order-info">
              <p><strong>Order #:</strong> ${order.id}</p>
              <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
              <p><strong>Customer:</strong> ${order.customer?.username || 'N/A'}</p>
              <p><strong>Status:</strong> ${order.status}</p>
              <p><strong>Delivery Address:</strong> ${order.deliveryAddress || 'N/A'}</p>
            </div>
            <div class="items">
              <h3>Items:</h3>
              ${order.items.map(item => `
                <p>${item.quantity}x ${item.menuItem.name} - €${(item.unitPrice * item.quantity).toFixed(2)}</p>
              `).join('')}
            </div>
            <div class="total">
              <p><strong>Total: €${order.totalAmount.toFixed(2)}</strong></p>
            </div>
            <div style="text-align: center; margin-top: 30px;">
              <p>Thank you for your order!</p>
            </div>
          </body>
        </html>
      `);
      receiptWindow.document.close();
      receiptWindow.print();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return '#ffc107';
      case 'PREPARING': return '#0d6efd';
      case 'READY': return '#28a745';
      case 'DELIVERED': return '#6c757d';
      case 'CANCELLED': return '#dc3545';
      default: return '#6c757d';
    }
  };
  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'PENDING': t('pending'),
      'PREPARING': t('preparing'),
      'READY': t('ready'),
      'DELIVERED': t('delivered'),
      'CANCELLED': t('cancelled')
    };
    return statusMap[status] || status;
  };
  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'ALL' || order.status === filter;
    const matchesSearch = search === '' || 
      order.id.toString().includes(search) ||
      order.customer?.username?.toLowerCase().includes(search.toLowerCase()) ||
      order.customer?.email?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });
  const containerStyle: React.CSSProperties = {
    backgroundColor: isDarkMode ? '#0f0f0f' : '#ffffff',
    color: isDarkMode ? '#ffffff' : '#1a1a1a',
    minHeight: '100vh',
    transition: 'background-color 0.3s ease, color 0.3s ease'
  };
  const heroStyle: React.CSSProperties = {
    background: isDarkMode 
      ? 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.8)), url("https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=2070&q=80") center/cover'
      : 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.6)), url("https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=2070&q=80") center/cover',
    padding: '100px 20px 60px',
    textAlign: 'center',
    color: '#ffffff'
  };

  const heroTitleStyle: React.CSSProperties = {
    fontSize: '3rem',
    fontWeight: '700',
    marginBottom: '1rem',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)'
  };

  const heroSubtitleStyle: React.CSSProperties = {
    fontSize: '1.2rem',
    fontWeight: '300',
    maxWidth: '600px',
    margin: '0 auto',
    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)'
  };

  const mainContentStyle: React.CSSProperties = {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '40px 20px'
  };

  const filterSectionStyle: React.CSSProperties = {
    display: 'flex',
    gap: '20px',
    marginBottom: '30px',
    flexWrap: 'wrap',
    alignItems: 'center'
  };
  const searchInputStyle: React.CSSProperties = {
    padding: '12px 20px',
    fontSize: '1rem',
    border: isDarkMode ? '2px solid #333' : '2px solid #e0e0e0',
    borderRadius: '50px',
    backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
    color: isDarkMode ? '#ffffff' : '#333333',
    minWidth: '300px',
    outline: 'none',
    transition: 'border-color 0.3s ease'
  };

  const filterButtonStyle = (active: boolean): React.CSSProperties => ({
    padding: '10px 20px',
    fontSize: '0.9rem',
    fontWeight: '600',
    border: 'none',
    borderRadius: '25px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',    backgroundColor: active ? '#e74c3c' : (isDarkMode ? '#333' : '#f8f9fa'),
    color: active ? '#ffffff' : (isDarkMode ? '#ffffff' : '#333333')
  });

  const ordersGridStyle: React.CSSProperties = {
    display: 'grid',
    gap: '20px'
  };
  const orderCardStyle: React.CSSProperties = {
    backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
    borderRadius: '15px',
    padding: '25px',
    boxShadow: isDarkMode 
      ? '0 10px 30px rgba(255, 255, 255, 0.1)' 
      : '0 10px 30px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    border: isDarkMode ? '1px solid #333' : '1px solid #e0e0e0'
  };

  const orderHeaderStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: isDarkMode ? '2px solid #333' : '2px solid #e0e0e0'
  };

  const orderNumberStyle: React.CSSProperties = {
    fontSize: '1.4rem',
    fontWeight: '700',
    color: '#e74c3c',
    margin: 0
  };

  const statusBadgeStyle = (status: string): React.CSSProperties => ({
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: getStatusColor(status)
  });

  const orderDetailStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '20px'
  };
  const detailItemStyle: React.CSSProperties = {
    padding: '15px',
    backgroundColor: isDarkMode ? '#333' : '#f8f9fa',
    borderRadius: '10px'
  };

  const detailLabelStyle: React.CSSProperties = {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: isDarkMode ? '#cccccc' : '#666666',
    marginBottom: '5px'
  };
  const detailValueStyle: React.CSSProperties = {
    fontSize: '1rem',
    fontWeight: '500',
    color: isDarkMode ? '#ffffff' : '#333333'
  };

  const itemsListStyle: React.CSSProperties = {
    backgroundColor: isDarkMode ? '#333' : '#f8f9fa',
    borderRadius: '10px',
    padding: '15px',
    marginTop: '15px'
  };

  const emptyStateStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '60px 20px',
    color: isDarkMode ? '#cccccc' : '#666666'
  };

  const loadingStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '300px',
    fontSize: '1.2rem'
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={loadingStyle}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #e74c3c',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <span style={{ marginLeft: '15px' }}>{t('loadingOrders')}</span>
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#e74c3c' }}>
          <h2>{t('errorLoading')}</h2>
          <p>{error}</p>
          <button 
            onClick={loadOrders}
            style={{
              backgroundColor: '#e74c3c',
              color: '#ffffff',
              padding: '12px 25px',
              border: 'none',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              marginTop: '20px'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Hero Section */}
      <section style={heroStyle}>        <h1 style={heroTitleStyle}>{t('restaurantOrders')}</h1>
        <p style={heroSubtitleStyle}>{t('ordersSubtitle')}</p>
      </section>

      {/* Main Content */}
      <div style={mainContentStyle}>
        {/* Filters */}
        <div style={filterSectionStyle}>
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={searchInputStyle}
            onFocus={(e) => e.target.style.borderColor = '#e74c3c'}
            onBlur={(e) => e.target.style.borderColor = isDarkMode ? '#333' : '#e0e0e0'}
          />
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {['ALL', 'PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                style={filterButtonStyle(filter === status)}                onMouseEnter={(e) => {
                  if (filter !== status) {
                    e.currentTarget.style.backgroundColor = isDarkMode ? '#444' : '#e9ecef';
                  }
                }}
                onMouseLeave={(e) => {
                  if (filter !== status) {
                    e.currentTarget.style.backgroundColor = isDarkMode ? '#333' : '#f8f9fa';
                  }
                }}
              >
                {status === 'ALL' ? t('allOrders') : getStatusText(status)}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div style={emptyStateStyle}>            <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>{t('noOrders')}</h3>
            <p>{t('noOrdersDesc')}</p>
          </div>
        ) : (
          <div style={ordersGridStyle}>
            {filteredOrders.map(order => (
              <div 
                key={order.id} 
                style={orderCardStyle}                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = isDarkMode 
                    ? '0 15px 40px rgba(255, 255, 255, 0.15)' 
                    : '0 15px 40px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = isDarkMode 
                    ? '0 10px 30px rgba(255, 255, 255, 0.1)' 
                    : '0 10px 30px rgba(0, 0, 0, 0.1)';
                }}
              >
                {/* Order Header */}
                <div style={orderHeaderStyle}>
                  <h3 style={orderNumberStyle}>
                    {t('orderNumber')} #{order.id}
                  </h3>
                  <span style={statusBadgeStyle(order.status)}>
                    {getStatusText(order.status)}
                  </span>
                </div>

                {/* Order Details */}
                <div style={orderDetailStyle}>
                  <div style={detailItemStyle}>
                    <div style={detailLabelStyle}>{t('customer')}</div>                    <div style={detailValueStyle}>
                      {order.customer?.username || 'Guest Customer'}
                    </div>
                    {order.customer?.email && (
                      <div style={{ fontSize: '0.85rem', color: isDarkMode ? '#aaa' : '#777', marginTop: '2px' }}>
                        {order.customer.email}
                      </div>
                    )}
                  </div>

                  <div style={detailItemStyle}>
                    <div style={detailLabelStyle}>{t('orderTime')}</div>
                    <div style={detailValueStyle}>
                      {new Date(order.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <div style={detailItemStyle}>
                    <div style={detailLabelStyle}>{t('total')}</div>
                    <div style={{ ...detailValueStyle, color: '#e74c3c', fontWeight: '700', fontSize: '1.2rem' }}>
                      {order.totalAmount.toFixed(2)} kr
                    </div>
                  </div>

                  {order.payment && (
                    <div style={detailItemStyle}>
                      <div style={detailLabelStyle}>{t('paymentMethod')}</div>
                      <div style={detailValueStyle}>
                        {order.payment.method} - {order.payment.status}
                      </div>
                    </div>
                  )}
                </div>

                {/* Delivery Address */}
                {order.deliveryAddress && (
                  <div style={detailItemStyle}>
                    <div style={detailLabelStyle}>{t('deliveryAddress')}</div>
                    <div style={detailValueStyle}>{order.deliveryAddress}</div>
                  </div>
                )}

                {/* Order Items */}
                <div style={itemsListStyle}>
                  <div style={detailLabelStyle}>{t('items')}</div>
                  {order.items.map(item => (
                    <div key={item.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: isDarkMode ? '1px solid #444' : '1px solid #ddd'
                    }}>
                      <div>
                        <span style={{ fontWeight: '600' }}>{item.quantity}x</span> {item.menuItem.name}
                      </div>
                      <div style={{ fontWeight: '600', color: '#e74c3c' }}>
                        {(item.unitPrice * item.quantity).toFixed(2)} kr
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
