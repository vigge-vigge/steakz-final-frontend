import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import {
  SystemStatistics,
  RestaurantStatus,
  ActivityFeedItem,
  SystemAlert,
  FinancialData,
  SystemHealth,
  PerformanceAnalytics,
  OrderWithDetails
} from '../types';
import './styles/AdminDashboard.css';

// Component imports
import StatisticsCards from '../components/admin/StatisticsCards';
import RestaurantStatusGrid from '../components/admin/RestaurantStatusGrid';
import LiveOrderMonitor from '../components/admin/LiveOrderMonitor';
import FinancialDashboard from '../components/admin/FinancialDashboard';
import SystemHealthPanel from '../components/admin/SystemHealthPanel';
import ActivityFeed from '../components/admin/ActivityFeed';
import QuickActions from '../components/admin/QuickActions';
import PerformanceCharts from '../components/admin/PerformanceCharts';
import AlertsPanel from '../components/admin/AlertsPanel';
import DataExportTools from '../components/admin/DataExportTools';

// Utility to safely format numbers for charts and stats
function safeToFixed(val: any, digits = 2) {
  const num = typeof val === 'number' && !isNaN(val) ? val : 0;
  return num.toFixed(digits);
}

const AdminDashboard: React.FC = () => {
  const { user, hasPermission } = useContext(AuthContext);
  const navigate = useNavigate();

  // State for all dashboard data
  const [statistics, setStatistics] = useState<SystemStatistics | null>(null);
  const [restaurantStatus, setRestaurantStatus] = useState<RestaurantStatus[]>([]);
  const [liveOrders, setLiveOrders] = useState<OrderWithDetails[]>([]);
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [activityFeed, setActivityFeed] = useState<ActivityFeedItem[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceAnalytics | null>(null);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Active tab state for dashboard sections
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'monitoring' | 'management'>('overview');

  // Check admin permissions
  useEffect(() => {
    if (!user || !hasPermission(['ADMIN'])) {
      navigate('/');
      return;
    }
  }, [user, hasPermission, navigate]);

  // Initial data load
  useEffect(() => {
    loadAllDashboardData();
    
    // Set up auto-refresh intervals
    const overviewInterval = setInterval(() => {
      refreshOverviewData();
    }, 30000); // Refresh overview every 30 seconds

    const alertsInterval = setInterval(() => {
      refreshAlerts();
    }, 15000); // Refresh alerts every 15 seconds

    return () => {
      clearInterval(overviewInterval);
      clearInterval(alertsInterval);
    };
  }, []);

  const loadAllDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [
        statsResponse,
        statusResponse,
        ordersResponse,
        financialResponse,
        healthResponse,
        activityResponse,
        analyticsResponse,
        alertsResponse
      ] = await Promise.all([
        api.getSystemStatistics(),
        api.getRestaurantStatus(),
        api.getLiveOrderActivity(20),
        api.getFinancialData(7),
        api.getSystemHealth(),
        api.getActivityFeed(15),
        api.getPerformanceAnalytics(30),
        api.getSystemAlerts()
      ]);

      setStatistics(statsResponse.data);
      setRestaurantStatus(statusResponse.data);
      setLiveOrders(ordersResponse.data);
      setFinancialData(financialResponse.data);
      setSystemHealth(healthResponse.data);
      setActivityFeed(activityResponse.data);
      setPerformanceData(analyticsResponse.data);
      setAlerts(alertsResponse.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
      console.error('Dashboard data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshOverviewData = async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    try {
      const [
        statsResponse,
        statusResponse,
        ordersResponse,
        activityResponse
      ] = await Promise.all([
        api.getSystemStatistics(),
        api.getRestaurantStatus(),
        api.getLiveOrderActivity(20),
        api.getActivityFeed(15)
      ]);

      setStatistics(statsResponse.data);
      setRestaurantStatus(statusResponse.data);
      setLiveOrders(ordersResponse.data);
      setActivityFeed(activityResponse.data);
    } catch (err) {
      console.error('Error refreshing overview data:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const refreshAlerts = async () => {
    try {
      const response = await api.getSystemAlerts();
      setAlerts(response.data);
    } catch (err) {
      console.error('Error refreshing alerts:', err);
    }
  };

  const handleQuickAction = async (action: string, data: any) => {
    try {
      await api.performQuickAction(action, data);
      // Refresh relevant data based on action
      switch (action) {
        case 'toggle_menu_item':
          // Refresh restaurant status to see updated menu availability
          const statusResponse = await api.getRestaurantStatus();
          setRestaurantStatus(statusResponse.data);
          break;
        case 'cancel_order':
          // Refresh live orders
          const ordersResponse = await api.getLiveOrderActivity(20);
          setLiveOrders(ordersResponse.data);
          break;
        case 'update_inventory':
          // Refresh alerts to see if low stock alert is cleared
          refreshAlerts();
          break;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to perform action');
    }
  };

  // Management quick action handlers
  const handleViewDetails = (restaurant: RestaurantStatus) => {
    // Show a modal with detailed info (for now, alert with more details)
    alert(`Details for ${restaurant.name}\n\nAddress: ${restaurant.address}\nManager: ${restaurant.manager?.username}\nActive Orders: ${restaurant.metrics.activeOrders}\nActive Staff: ${restaurant.metrics.activeStaff}\nLow Stock Items: ${restaurant.metrics.lowStockItems}`);
  };
  const handleManage = (restaurant: RestaurantStatus) => {
    // Show a modal with management controls (for now, alert with more controls)
    alert(`Manage ${restaurant.name}\n\n- Restart Services\n- Emergency Stop\n- Clear Cache\n- Update Info (coming soon)`);
  };
  const handleStockAlert = (restaurant: RestaurantStatus) => {
    alert(`Stock alert for ${restaurant.name}: ${restaurant.metrics.lowStockItems} items below threshold.`);
  };
  const handleEmergencyStop = async (restaurant: RestaurantStatus) => {
    await api.performQuickAction('emergency_stop', { branchId: restaurant.id });
    alert(`Emergency stop executed for ${restaurant.name}`);
  };
  const handleRestartServices = async (restaurant: RestaurantStatus) => {
    await api.performQuickAction('restart_services', { branchId: restaurant.id });
    alert(`Services restarted for ${restaurant.name}`);
  };
  const handleClearCache = async (restaurant: RestaurantStatus) => {
    await api.performQuickAction('clear_cache', { branchId: restaurant.id });
    alert(`Cache cleared for ${restaurant.name}`);
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <h2>Loading Admin Dashboard...</h2>
          <p>Gathering system data and metrics</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="dashboard-error">
          <h2>Dashboard Error</h2>
          <p>{error}</p>
          <button onClick={loadAllDashboardData} className="btn btn-primary">
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>
            <span className="dashboard-icon">🎛️</span>
            Admin Control Center
          </h1>
          <div className="header-actions">
            <span className={`refresh-indicator ${refreshing ? 'refreshing' : ''}`}>
              {refreshing ? '🔄 Refreshing...' : '✅ Live Data'}
            </span>
            <button 
              onClick={loadAllDashboardData} 
              className="btn btn-secondary"
              disabled={refreshing}
            >
              🔄 Refresh All
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="dashboard-tabs">
          <button 
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button 
            className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            📈 Analytics
          </button>
          <button 
            className={`tab ${activeTab === 'monitoring' ? 'active' : ''}`}
            onClick={() => setActiveTab('monitoring')}
          >
            🔍 Monitoring
          </button>
          <button 
            className={`tab ${activeTab === 'management' ? 'active' : ''}`}
            onClick={() => setActiveTab('management')}
          >
            ⚙️ Management
          </button>
        </div>
      </div>

      {/* Alerts Bar */}
      {alerts.length > 0 && (
        <AlertsPanel alerts={alerts} onDismiss={refreshAlerts} />
      )}

      {/* Dashboard Content */}
      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            {/* Top Row - Statistics */}
            <div className="dashboard-row">
              <StatisticsCards statistics={statistics} />
            </div>

            {/* Second Row - Restaurant Status & Live Orders */}
            <div className="dashboard-row">
              <div className="dashboard-section">
                <RestaurantStatusGrid 
                  restaurants={restaurantStatus} 
                  onRefresh={refreshOverviewData}
                />
              </div>
              <div className="dashboard-section">
                <LiveOrderMonitor 
                  orders={liveOrders} 
                  onOrderAction={handleQuickAction}
                />
              </div>
            </div>

            {/* Third Row - Financial & Activity */}
            <div className="dashboard-row">
              <div className="dashboard-section">
                <FinancialDashboard financialData={financialData} />
              </div>
              <div className="dashboard-section">
                <ActivityFeed activities={activityFeed} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-tab">
            <div className="dashboard-row">
              <PerformanceCharts performanceData={performanceData} />
            </div>
            <div className="dashboard-row">
              <FinancialDashboard financialData={financialData} expanded={true} />
            </div>
          </div>
        )}

        {activeTab === 'monitoring' && (
          <div className="monitoring-tab">
            <div className="dashboard-row">
              <SystemHealthPanel systemHealth={systemHealth} />
            </div>
            <div className="dashboard-row">
              <div className="dashboard-section">
                <LiveOrderMonitor 
                  orders={liveOrders} 
                  onOrderAction={handleQuickAction}
                  expanded={true}
                />
              </div>
              <div className="dashboard-section">
                <ActivityFeed activities={activityFeed} expanded={true} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'management' && (
          <div className="management-tab">
            <div className="dashboard-row">
              <QuickActions onAction={handleQuickAction} restaurantStatus={restaurantStatus} />
            </div>
            <div className="dashboard-row">
              <DataExportTools />
            </div>
            <div className="dashboard-row">
              <RestaurantStatusGrid 
                restaurants={restaurantStatus} 
                onRefresh={refreshOverviewData}
                managementMode={true}
                onViewDetails={handleViewDetails}
                onManage={handleManage}
                onStockAlert={handleStockAlert}
                onEmergencyStop={handleEmergencyStop}
                onRestartServices={handleRestartServices}
                onClearCache={handleClearCache}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
