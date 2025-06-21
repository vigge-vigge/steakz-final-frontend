import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../context/ThemeContext';
import * as api from '../services/api';
import { OrderWithDetails } from '../types';
import { Link } from 'react-router-dom';

const MyOrders: React.FC = () => {
  const { user } = useContext(AuthContext);
  const { settings, t } = useSettings();
  const { isDarkMode } = useTheme();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    loadOrders();
  }, [user?.id]);

  const loadOrders = async () => {
    if (!user || user.role !== 'CUSTOMER') {
      setError('Only customers can view their orders');
      setLoading(false);
      return;
    }

    try {
      const response = await api.getOrders({ customerId: user.id });
      setOrders(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error loading orders');
    } finally {
      setLoading(false);
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

  const filteredOrders = orders.filter(order => 
    filter === 'ALL' || order.status === filter
  );

  const containerStyle: React.CSSProperties = {
    backgroundColor: isDarkMode ? '#0f0f0f' : '#ffffff',
    color: isDarkMode ? '#ffffff' : '#1a1a1a',
    minHeight: '100vh',
    transition: 'background-color 0.3s ease, color 0.3s ease'
  };

  const heroStyle: React.CSSProperties = {
    background: isDarkMode 
      ? 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.8)), url("https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=2070&q=80") center/cover'
      : 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.6)), url("https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=2070&q=80") center/cover',
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
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px'
  };

  const filterSectionStyle: React.CSSProperties = {
    display: 'flex',
    gap: '10px',
    marginBottom: '30px',
    flexWrap: 'wrap',
    justifyContent: 'center'
  };

  const filterButtonStyle = (active: boolean): React.CSSProperties => ({
    padding: '10px 20px',
    fontSize: '0.9rem',
    fontWeight: '600',
    border: 'none',
    borderRadius: '25px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backgroundColor: active ? '#e74c3c' : (isDarkMode ? '#333' : '#f8f9fa'),
    color: active ? '#ffffff' : (isDarkMode ? '#ffffff' : '#333333')
  });

  const ordersGridStyle: React.CSSProperties = {
    display: 'grid',
    gap: '25px'
  };

  const orderCardStyle: React.CSSProperties = {
    backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
    borderRadius: '20px',
    padding: '30px',
    boxShadow: isDarkMode 
      ? '0 15px 35px rgba(255, 255, 255, 0.1)' 
      : '0 15px 35px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    border: isDarkMode ? '1px solid #333' : '1px solid #e0e0e0'
  };

  const orderHeaderStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px',
    paddingBottom: '20px',
    borderBottom: isDarkMode ? '2px solid #333' : '2px solid #e0e0e0'
  };

  const orderNumberStyle: React.CSSProperties = {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#e74c3c',
    margin: 0
  };

  const statusBadgeStyle = (status: string): React.CSSProperties => ({
    padding: '10px 20px',
    borderRadius: '25px',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: getStatusColor(status)
  });

  const orderInfoStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '25px'
  };

  const infoItemStyle: React.CSSProperties = {
    padding: '15px',
    backgroundColor: isDarkMode ? '#333' : '#f8f9fa',
    borderRadius: '12px'
  };

  const infoLabelStyle: React.CSSProperties = {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: isDarkMode ? '#cccccc' : '#666666',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  };

  const infoValueStyle: React.CSSProperties = {
    fontSize: '1rem',
    fontWeight: '500',
    color: isDarkMode ? '#ffffff' : '#333333'
  };

  const itemsContainerStyle: React.CSSProperties = {
    backgroundColor: isDarkMode ? '#333' : '#f8f9fa',
    borderRadius: '15px',
    padding: '20px',
    marginBottom: '20px'
  };

  const itemRowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: isDarkMode ? '1px solid #444' : '1px solid #ddd'
  };

  const totalStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '1.3rem',
    fontWeight: '700',
    color: '#e74c3c',
    marginTop: '15px',
    paddingTop: '15px',
    borderTop: isDarkMode ? '2px solid #444' : '2px solid #ddd'
  };

  const emptyStateStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '80px 20px',
    backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
    borderRadius: '20px',
    boxShadow: isDarkMode 
      ? '0 15px 35px rgba(255, 255, 255, 0.1)' 
      : '0 15px 35px rgba(0, 0, 0, 0.1)'
  };

  const linkButtonStyle: React.CSSProperties = {
    backgroundColor: '#e74c3c',
    color: '#ffffff',
    padding: '15px 30px',
    fontSize: '1.1rem',
    fontWeight: '600',
    border: 'none',
    borderRadius: '50px',
    textDecoration: 'none',
    display: 'inline-block',
    transition: 'all 0.3s ease',
    marginTop: '25px'
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
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'CUSTOMER') {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h2>{t('loginRequired')}</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Hero Section */}
      <section style={heroStyle}>        <h1 style={heroTitleStyle}>{t('myOrdersTitle')}</h1>
        <p style={heroSubtitleStyle}>{t('myOrdersSubtitle')}</p>
      </section>

      {/* Main Content */}
      <div style={mainContentStyle}>
        {/* Filters */}
        <div style={filterSectionStyle}>
          {['ALL', 'PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={filterButtonStyle(filter === status)}
              onMouseEnter={(e) => {
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

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div style={emptyStateStyle}>
            <h3 style={{ fontSize: '2rem', marginBottom: '15px', color: isDarkMode ? '#ffffff' : '#2c3e50' }}>
              {t('noOrdersYet')}
            </h3>
            <p style={{ fontSize: '1.1rem', marginBottom: '20px', color: isDarkMode ? '#cccccc' : '#666666' }}>
              {t('noOrdersYetDesc')}
            </p>
            <Link 
              to="/menu" 
              style={linkButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#c0392b';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#e74c3c';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {t('browseMenu')}
            </Link>
          </div>
        ) : (
          <div style={ordersGridStyle}>
            {filteredOrders.map(order => (
              <div 
                key={order.id} 
                style={orderCardStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = isDarkMode 
                    ? '0 25px 50px rgba(255, 255, 255, 0.15)' 
                    : '0 25px 50px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = isDarkMode 
                    ? '0 15px 35px rgba(255, 255, 255, 0.1)' 
                    : '0 15px 35px rgba(0, 0, 0, 0.1)';
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

                {/* Order Info */}
                <div style={orderInfoStyle}>
                  <div style={infoItemStyle}>
                    <div style={infoLabelStyle}>{t('orderedAt')}</div>
                    <div style={infoValueStyle}>
                      {new Date(order.createdAt).toLocaleString()}
                    </div>
                  </div>

                  {order.deliveryAddress && (
                    <div style={infoItemStyle}>
                      <div style={infoLabelStyle}>{t('deliveryAddress')}</div>
                      <div style={infoValueStyle}>{order.deliveryAddress}</div>
                    </div>
                  )}

                  {order.payment && (
                    <div style={infoItemStyle}>
                      <div style={infoLabelStyle}>{t('paymentMethod')}</div>
                      <div style={infoValueStyle}>
                        {order.payment.method} - {order.payment.status}
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Items */}
                <div style={itemsContainerStyle}>
                  <div style={infoLabelStyle}>{t('items')}</div>
                  {order.items.map(item => (
                    <div key={item.id} style={itemRowStyle}>
                      <div>
                        <span style={{ 
                          fontWeight: '700', 
                          color: '#e74c3c',
                          marginRight: '8px',
                          fontSize: '1.1rem'
                        }}>
                          {item.quantity}x
                        </span>
                        <span style={{ fontWeight: '600' }}>{item.menuItem.name}</span>
                      </div>
                      <div style={{ fontWeight: '700', color: '#e74c3c', fontSize: '1.1rem' }}>
                        {(item.unitPrice * item.quantity).toFixed(2)} kr
                      </div>
                    </div>
                  ))}
                  
                  <div style={totalStyle}>
                    <span>{t('total')}:</span>
                    <span>{order.totalAmount.toFixed(2)} kr</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
