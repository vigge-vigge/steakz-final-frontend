import React, { useState } from 'react';
import { OrderWithDetails } from '../../types';
import './LiveOrderMonitor.css';

interface LiveOrderMonitorProps {
  orders: OrderWithDetails[];
  onOrderAction: (action: string, data: any) => void;
  expanded?: boolean;
}

const LiveOrderMonitor: React.FC<LiveOrderMonitorProps> = ({ 
  orders, 
  onOrderAction, 
  expanded = false 
}) => {
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'pending';
      case 'PREPARING': return 'preparing';
      case 'READY': return 'ready';
      case 'DELIVERED': return 'delivered';
      case 'CANCELLED': return 'cancelled';
      default: return 'pending';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return '🕐';
      case 'PREPARING': return '👨‍🍳';
      case 'READY': return '✅';
      case 'DELIVERED': return '🚚';
      case 'CANCELLED': return '❌';
      default: return '🕐';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK'
    }).format(amount);
  };

  const handleCancelOrder = (orderId: number) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      onOrderAction('cancel_order', { orderId });
    }
  };

  const filteredOrders = expanded ? orders : orders.slice(0, 10);

  return (
    <div className="live-order-monitor">
      <div className="section-header">
        <h2>
          <span className="header-icon">📋</span>
          Live Order Activity Monitor
        </h2>
        <div className="header-stats">
          <span className="stat-badge pending">
            {orders.filter(o => o.status === 'PENDING').length} Pending
          </span>
          <span className="stat-badge preparing">
            {orders.filter(o => o.status === 'PREPARING').length} Preparing
          </span>
          <span className="stat-badge ready">
            {orders.filter(o => o.status === 'READY').length} Ready
          </span>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No Active Orders</h3>
          <p>All orders have been completed or no new orders have been placed.</p>
        </div>
      ) : (
        <div className="orders-container">
          <div className="orders-list">
            {filteredOrders.map((order) => {
              const isOpen = selectedOrder?.id === order.id;
              return (
                <div 
                  key={order.id} 
                  className={`order-item ${getStatusColor(order.status)} ${isOpen ? 'selected' : ''}`}
                >
                  <div className="order-header">
                    <div className="order-info">
                      <span className="order-number">#{order.id}</span>
                      <span className={`status-badge ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)} {order.status}
                      </span>
                    </div>
                    <div className="order-meta">
                      <span className="order-time">{formatTimeAgo(order.createdAt)}</span>
                      <span className="order-amount">{formatCurrency(order.totalAmount)}</span>
                    </div>
                  </div>

                  <div className="order-content">
                    <div className="customer-info">
                      <span className="customer-name">👤 {order.customer.username}</span>
                      <span className="branch-name">🏪 {order.branch?.name || 'Unknown Branch'}</span>
                    </div>

                    <div className="order-items">
                      {order.items.slice(0, 3).map((item, index) => (
                        <span key={index} className="item-tag">
                          {item.quantity}× {item.menuItem.name}
                        </span>
                      ))}
                      {order.items.length > 3 && (
                        <span className="more-items">+{order.items.length - 3} more</span>
                      )}
                    </div>

                    {order.deliveryAddress && (
                      <div className="delivery-info">
                        🚚 {order.deliveryAddress}
                      </div>
                    )}
                  </div>

                  <div className="order-actions">
                    {order.status === 'PENDING' && (
                      <>
                        <button 
                          className="action-btn cancel"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelOrder(order.id);
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    <button 
                      className="action-btn details"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrder(isOpen ? null : order);
                      }}
                    >
                      {isOpen ? 'Hide Details' : 'Details'}
                    </button>
                  </div>

                  {/* Dropdown details section */}
                  {isOpen && (
                    <div className="order-details-dropdown">
                      <div className="panel-content">
                        <div className="detail-section">
                          <h4>Customer Information</h4>
                          <p><strong>Name:</strong> {order.customer.username}</p>
                          <p><strong>Email:</strong> {order.customer.email}</p>
                          {order.deliveryAddress && (
                            <p><strong>Delivery Address:</strong> {order.deliveryAddress}</p>
                          )}
                        </div>

                        <div className="detail-section">
                          <h4>Order Status</h4>
                          <div className={`status-badge large ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)} {order.status}
                          </div>
                          <p><strong>Placed:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                          <p><strong>Last Updated:</strong> {new Date(order.updatedAt).toLocaleString()}</p>
                        </div>

                        <div className="detail-section">
                          <h4>Order Items</h4>
                          <div className="items-detail">
                            {order.items.map((item, index) => (
                              <div key={index} className="item-detail">
                                <span className="item-name">{item.menuItem.name}</span>
                                <span className="item-quantity">Qty: {item.quantity}</span>
                                <span className="item-price">{formatCurrency(item.subtotal)}</span>
                              </div>
                            ))}
                          </div>
                          <div className="order-total">
                            <strong>Total: {formatCurrency(order.totalAmount)}</strong>
                          </div>
                        </div>

                        {order.payment && (
                          <div className="detail-section">
                            <h4>Payment Information</h4>
                            <p><strong>Method:</strong> {order.payment.method.replace('_', ' ')}</p>
                            <p><strong>Status:</strong> 
                              <span className={`payment-status ${order.payment.status.toLowerCase()}`}>
                                {order.payment.status}
                              </span>
                            </p>
                            <p><strong>Amount:</strong> {formatCurrency(order.payment.amount)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Order Details Panel */}
          {selectedOrder && (
            <div className="order-details-panel">
              <div className="panel-header">
                <h3>Order #{selectedOrder.id} Details</h3>
                <button 
                  className="close-btn"
                  onClick={() => setSelectedOrder(null)}
                >
                  ✕
                </button>
              </div>

              <div className="panel-content">
                <div className="detail-section">
                  <h4>Customer Information</h4>
                  <p><strong>Name:</strong> {selectedOrder.customer.username}</p>
                  <p><strong>Email:</strong> {selectedOrder.customer.email}</p>
                  {selectedOrder.deliveryAddress && (
                    <p><strong>Delivery Address:</strong> {selectedOrder.deliveryAddress}</p>
                  )}
                </div>

                <div className="detail-section">
                  <h4>Order Status</h4>
                  <div className={`status-badge large ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusIcon(selectedOrder.status)} {selectedOrder.status}
                  </div>
                  <p><strong>Placed:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  <p><strong>Last Updated:</strong> {new Date(selectedOrder.updatedAt).toLocaleString()}</p>
                </div>

                <div className="detail-section">
                  <h4>Order Items</h4>
                  <div className="items-detail">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="item-detail">
                        <span className="item-name">{item.menuItem.name}</span>
                        <span className="item-quantity">Qty: {item.quantity}</span>
                        <span className="item-price">{formatCurrency(item.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="order-total">
                    <strong>Total: {formatCurrency(selectedOrder.totalAmount)}</strong>
                  </div>
                </div>

                {selectedOrder.payment && (
                  <div className="detail-section">
                    <h4>Payment Information</h4>
                    <p><strong>Method:</strong> {selectedOrder.payment.method.replace('_', ' ')}</p>
                    <p><strong>Status:</strong> 
                      <span className={`payment-status ${selectedOrder.payment.status.toLowerCase()}`}>
                        {selectedOrder.payment.status}
                      </span>
                    </p>
                    <p><strong>Amount:</strong> {formatCurrency(selectedOrder.payment.amount)}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {!expanded && orders.length > 10 && (
        <div className="show-more">
          <p>Showing 10 of {orders.length} active orders</p>
        </div>
      )}
    </div>
  );
};

export default LiveOrderMonitor;
