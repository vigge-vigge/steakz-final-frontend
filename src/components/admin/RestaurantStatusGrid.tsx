import React, { useState } from 'react';
import { RestaurantStatus } from '../../types';
import './RestaurantStatusGrid.css';

interface RestaurantStatusGridProps {
  restaurants: RestaurantStatus[];
  onRefresh: () => void;
  managementMode?: boolean;
  onViewDetails?: (restaurant: RestaurantStatus) => void;
  onManage?: (restaurant: RestaurantStatus) => void;
  onStockAlert?: (restaurant: RestaurantStatus) => void;
  onEmergencyStop?: (restaurant: RestaurantStatus) => void;
  onRestartServices?: (restaurant: RestaurantStatus) => void;
  onClearCache?: (restaurant: RestaurantStatus) => void;
}

const RestaurantStatusGrid: React.FC<RestaurantStatusGridProps> = ({ 
  restaurants, 
  onRefresh, 
  managementMode = false,
  onViewDetails,
  onManage,
  onStockAlert,
  onEmergencyStop,
  onRestartServices,
  onClearCache
}) => {
  const [openDetailsId, setOpenDetailsId] = useState<number | null>(null);

  const getStatusColor = (restaurant: RestaurantStatus) => {
    const { metrics } = restaurant;
    
    // High priority issues
    if (metrics.lowStockItems > 0) return 'warning';
    if (metrics.activeOrders > 10) return 'busy';
    if (metrics.todayOrders === 0) return 'inactive';
    
    // Normal operations
    return 'healthy';
  };

  const getStatusText = (restaurant: RestaurantStatus) => {
    const { metrics } = restaurant;
    
    if (metrics.lowStockItems > 0) return 'Low Stock Issues';
    if (metrics.activeOrders > 10) return 'Very Busy';
    if (metrics.activeOrders > 5) return 'Busy';
    if (metrics.todayOrders === 0) return 'No Orders Today';
    
    return 'Operating Normally';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK'
    }).format(amount);
  };

  if (restaurants.length === 0) {
    return (
      <div className="restaurant-status-grid">
        <div className="section-header">
          <h2>
            <span className="header-icon">🏪</span>
            Restaurant Status Grid
          </h2>
        </div>
        <div className="empty-state">
          <div className="empty-icon">🏪</div>
          <h3>No Restaurant Data</h3>
          <p>Restaurant status information is currently unavailable.</p>
          <button onClick={onRefresh} className="btn btn-primary">
            Refresh Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="restaurant-status-grid">
      <div className="section-header">
        <h2>
          <span className="header-icon">🏪</span>
          {managementMode ? 'Restaurant Management' : 'Real-Time Restaurant Status'}
        </h2>
        <div className="header-actions">
          <button onClick={onRefresh} className="btn btn-secondary">
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="restaurants-grid">
        {restaurants.map((restaurant) => {
          const isOpen = openDetailsId === restaurant.id;
          return (
            <div 
              key={restaurant.id} 
              className={`restaurant-card ${getStatusColor(restaurant)}`}
            >
              {/* Status Indicator */}
              <div className="status-indicator">
                <div className={`status-dot ${getStatusColor(restaurant)}`}></div>
                <span className="status-text">{getStatusText(restaurant)}</span>
              </div>

              {/* Restaurant Info */}
              <div className="restaurant-header">
                <h3 className="restaurant-name">{restaurant.name}</h3>
                <p className="restaurant-address">{restaurant.address}</p>
                {restaurant.manager && (
                  <p className="restaurant-manager">
                    Manager: {restaurant.manager.username}
                  </p>
                )}
              </div>

              {/* Metrics Grid */}
              <div className="metrics-grid">
                <div className="metric">
                  <div className="metric-icon">📋</div>
                  <div className="metric-content">
                    <div className="metric-value">{restaurant.metrics.activeOrders}</div>
                    <div className="metric-label">Active Orders</div>
                  </div>
                </div>

                <div className="metric">
                  <div className="metric-icon">💰</div>
                  <div className="metric-content">
                    <div className="metric-value">{formatCurrency(restaurant.metrics.todayRevenue)}</div>
                    <div className="metric-label">Today's Revenue</div>
                  </div>
                </div>

                <div className="metric">
                  <div className="metric-icon">📈</div>
                  <div className="metric-content">
                    <div className="metric-value">{restaurant.metrics.todayOrders}</div>
                    <div className="metric-label">Orders Today</div>
                  </div>
                </div>

                <div className="metric">
                  <div className="metric-icon">👥</div>
                  <div className="metric-content">
                    <div className="metric-value">{restaurant.metrics.activeStaff}</div>
                    <div className="metric-label">Active Staff</div>
                  </div>
                </div>

                {restaurant.metrics.lowStockItems > 0 && (
                  <div className="metric alert">
                    <div className="metric-icon">📦</div>
                    <div className="metric-content">
                      <div className="metric-value">{restaurant.metrics.lowStockItems}</div>
                      <div className="metric-label">Low Stock Items</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              {managementMode && (
                <div className="quick-actions">
                  <button
                    className="action-btn view"
                    onClick={() => setOpenDetailsId(isOpen ? null : restaurant.id)}
                  >
                    {isOpen ? 'Hide Details' : 'View Details'}
                  </button>
                </div>
              )}

              {/* Dropdown Details Section */}
              {isOpen && (
                <div className="order-details-dropdown">
                  <div className="panel-content">
                    <div className="detail-section">
                      <h4>Restaurant Information</h4>
                      <p><strong>Name:</strong> {restaurant.name}</p>
                      <p><strong>Address:</strong> {restaurant.address}</p>
                      {restaurant.manager && (
                        <p><strong>Manager:</strong> {restaurant.manager.username} ({restaurant.manager.email})</p>
                      )}
                    </div>
                    <div className="detail-section">
                      <h4>Metrics</h4>
                      <p><strong>Active Orders:</strong> {restaurant.metrics.activeOrders}</p>
                      <p><strong>Active Staff:</strong> {restaurant.metrics.activeStaff}</p>
                      <p><strong>Low Stock Items:</strong> {restaurant.metrics.lowStockItems}</p>
                      <p><strong>Today's Orders:</strong> {restaurant.metrics.todayOrders}</p>
                      <p><strong>Today's Revenue:</strong> {formatCurrency(restaurant.metrics.todayRevenue)}</p>
                    </div>
                    <div className="detail-section">
                      <h4>Quick Actions</h4>
                      <button className="action-btn danger" onClick={() => onEmergencyStop && onEmergencyStop(restaurant)}>
                        🛑 Emergency Stop
                      </button>
                      <button className="action-btn" onClick={() => onRestartServices && onRestartServices(restaurant)}>
                        🔄 Restart Services
                      </button>
                      <button className="action-btn" onClick={() => onClearCache && onClearCache(restaurant)}>
                        🧹 Clear Cache
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Performance Indicator */}
              <div className="performance-bar">
                <div className="performance-label">Performance</div>
                <div className="performance-meter">
                  <div 
                    className={`performance-fill ${getStatusColor(restaurant)}`}
                    style={{ 
                      width: `${Math.min(100, (restaurant.metrics.todayOrders / 20) * 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Statistics */}
      <div className="grid-summary">
        <div className="summary-stat">
          <span className="summary-label">Total Restaurants:</span>
          <span className="summary-value">{restaurants.length}</span>
        </div>
        <div className="summary-stat">
          <span className="summary-label">Active Orders:</span>
          <span className="summary-value">
            {restaurants.reduce((total, r) => total + r.metrics.activeOrders, 0)}
          </span>
        </div>
        <div className="summary-stat">
          <span className="summary-label">Today's Revenue:</span>
          <span className="summary-value">
            {formatCurrency(restaurants.reduce((total, r) => total + r.metrics.todayRevenue, 0))}
          </span>
        </div>
        <div className="summary-stat">
          <span className="summary-label">Low Stock Alerts:</span>
          <span className="summary-value warning">
            {restaurants.reduce((total, r) => total + r.metrics.lowStockItems, 0)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RestaurantStatusGrid;
