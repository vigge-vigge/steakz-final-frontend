import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency, getTranslation } from '../utils/formatCurrency';
import { 
  getMenuItems, 
  getBranches, 
  createReview, 
  getReviews,
  getBranchDailySales,
  getBranchActiveOrders,
  getBranchStaffOnShift,
  getBranchInventoryAlerts,
  getBranchCustomerFeedback,
  getBranchWeeklyTrend,
  getBranchMetrics,
  getSystemStatistics,
  getRestaurantStatus,
  getFinancialData,
  getActivityFeed,
  getStaffMembers,
  getCustomerFeedback
} from '../services/api';
import { 
  MenuItemWithIngredients, 
  Branch, 
  Post,
  BranchDailySales,
  BranchActiveOrder,
  BranchStaffMember,
  BranchInventoryAlert,
  BranchCustomerFeedback,
  BranchWeeklyTrend,
  BranchMetrics,
  SystemStatistics,
  RestaurantStatus,
  FinancialData,
  ActivityFeedItem,
  StaffMember,
  CustomerFeedback
} from '../types';

const testimonials = [
  { name: 'Sarah Johnson', text: 'Amazing food and atmosphere! The best dining experience in the city.', rating: 5 },
  { name: 'Michael Chen', text: 'Incredible flavors and top-notch service. Highly recommended!', rating: 5 },
  { name: 'Emma Wilson', text: 'Perfect for special occasions. The steaks are absolutely divine.', rating: 5 }
];

// HQ Manager Dashboard Component
const HQManagerDashboard: React.FC = () => {
  const { user, language, currency } = useContext(AuthContext);
  const { settings, t } = useSettings();
  const { isDarkMode } = useTheme();
    const [systemStats, setSystemStats] = useState<SystemStatistics | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [restaurantStatus, setRestaurantStatus] = useState<RestaurantStatus[]>([]);
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [activityFeed, setActivityFeed] = useState<ActivityFeedItem[]>([]);
  const [allStaff, setAllStaff] = useState<StaffMember[]>([]);
  const [customerFeedbacks, setCustomerFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);  useEffect(() => {
    const loadHQDashboardData = async () => {
      try {
        setLoading(true);
        const [
          statsResponse,
          branchesResponse,
          statusResponse,
          financialResponse,
          activityResponse,
          staffResponse,
          feedbackResponse
        ] = await Promise.all([          getSystemStatistics().catch(() => ({ data: { 
            totalActiveOrders: 0,
            system: {
              totalBranches: 0,
              totalUsers: 0,
              totalMenuItems: 0,
              lowStockItems: 0
            },
            users: {},
            orders: {
              total: { today: 0, week: 0, month: 0 },
              status: { pending: 0, preparing: 0, ready: 0 }
            },
            revenue: {
              total: 0,
              today: 0,
              week: 0,
              month: 0
            }
          }})),
          getBranches().catch(() => ({ data: [] })),
          getRestaurantStatus().catch(() => ({ data: [] })),          getFinancialData(30).catch(() => ({ data: { 
            totalSalesToday: 0,
            dailyRevenue: [],
            branchRevenue: [],
            paymentMethods: [],
            topItems: []
          }})),
          getActivityFeed(10).catch(() => ({ data: [] })),
          getStaffMembers().catch(() => ({ data: { staff: [] }})),
          getCustomerFeedback().catch(() => [])
        ]);

        setSystemStats(statsResponse.data);
        setBranches(branchesResponse.data);
        setRestaurantStatus(statusResponse.data);
        setFinancialData(financialResponse.data);
        setActivityFeed(activityResponse.data);        setAllStaff(staffResponse.data.staff || []);
        setCustomerFeedbacks(Array.isArray(feedbackResponse) ? feedbackResponse : []);
      } catch (error) {
        console.error('Failed to load HQ dashboard data:', error);        // Set fallback data
        setSystemStats({ 
          totalActiveOrders: 0,
          system: {
            totalBranches: 0,
            totalUsers: 0,
            totalMenuItems: 0,
            lowStockItems: 0
          },
          users: {},
          orders: {
            total: { today: 0, week: 0, month: 0 },
            status: { pending: 0, preparing: 0, ready: 0 }
          },
          revenue: {
            total: 0,
            today: 0,
            week: 0,
            month: 0
          }
        });
        setBranches([]);
        setRestaurantStatus([]);        setFinancialData({ 
          totalSalesToday: 0,
          dailyRevenue: [],
          branchRevenue: [],
          paymentMethods: [],
          topItems: []
        });
        setActivityFeed([]);
        setAllStaff([]);
        setCustomerFeedbacks([]);
      } finally {
        setLoading(false);
      }
    };

    loadHQDashboardData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadHQDashboardData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const refreshData = async () => {
    setRefreshing(true);
    try {
      const [
        statsResponse,
        branchesResponse,
        statusResponse,
        financialResponse,
        activityResponse,
        staffResponse,
        feedbackResponse
      ] = await Promise.all([
        getSystemStatistics().catch(() => ({ data: systemStats })),
        getBranches().catch(() => ({ data: branches })),
        getRestaurantStatus().catch(() => ({ data: restaurantStatus })),
        getFinancialData(30).catch(() => ({ data: financialData })),
        getActivityFeed(10).catch(() => ({ data: activityFeed })),
        getStaffMembers().catch(() => ({ data: { staff: allStaff }})),
        getCustomerFeedback().catch(() => customerFeedbacks)
      ]);

      setSystemStats(statsResponse.data);
      setBranches(branchesResponse.data);
      setRestaurantStatus(statusResponse.data);
      setFinancialData(financialResponse.data);
      setActivityFeed(activityResponse.data);      setAllStaff(staffResponse.data.staff || []);
      setCustomerFeedbacks(Array.isArray(feedbackResponse) ? feedbackResponse : []);
    } catch (error) {
      console.error('Failed to refresh dashboard data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const containerStyle: React.CSSProperties = {
    backgroundColor: isDarkMode ? '#0f1419' : '#f8fafc',
    color: isDarkMode ? '#e2e8f0' : '#1e293b',
    minHeight: '100vh',
    padding: '24px',
    transition: 'background-color 0.3s ease, color 0.3s ease'
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
    borderRadius: '16px',
    padding: '28px',
    boxShadow: isDarkMode 
      ? '0 8px 25px rgba(0, 0, 0, 0.4), 0 4px 10px rgba(0, 0, 0, 0.3)' 
      : '0 8px 25px rgba(15, 23, 42, 0.08), 0 4px 10px rgba(15, 23, 42, 0.04)',
    border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    backdropFilter: 'blur(10px)'
  };

  const metricCardStyle: React.CSSProperties = {
    ...cardStyle,
    padding: '24px',
    textAlign: 'center' as const,
    position: 'relative' as const,
    overflow: 'hidden' as const,
    cursor: 'default' as const
  };

  const headerCardStyle: React.CSSProperties = {
    ...cardStyle,
    background: isDarkMode 
      ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
      : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    marginBottom: '32px',    padding: '32px'
  };
  const formatPrice = (amount: number) => {
    return formatCurrency(amount, currency);
  };

  // Helper function to get translated text
  const getText = (key: string): string => {
    return getTranslation(key, language);
  };
  // Get top performing branches
  const getTopPerformingBranches = () => {
    if (!restaurantStatus.length) return [];
    return restaurantStatus
      .sort((a, b) => (b.metrics?.todayRevenue || 0) - (a.metrics?.todayRevenue || 0))
      .slice(0, 5);
  };

  // Get active staff count across all branches
  const getActiveStaffCount = () => {
    return allStaff.filter(staff => 
      staff.role !== 'ADMIN' && staff.role !== 'GENERAL_MANAGER'
    ).length;
  };
  // Get total inventory alerts
  const getTotalInventoryAlerts = () => {
    return restaurantStatus.reduce((total, branch) => 
      total + (branch.metrics?.lowStockItems || 0), 0
    );
  };
  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '256px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid transparent',
            borderTop: '3px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>        {/* Header */}
        <div style={headerCardStyle}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <h1 style={{
                fontSize: '2.25rem',
                fontWeight: 'bold',
                marginBottom: '12px',
                background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                HQ Manager Dashboard
              </h1>
              <p style={{
                fontSize: '1.125rem',
                color: isDarkMode ? '#cbd5e1' : '#64748b'
              }}>
                {getText('welcome')} back, {user?.username}! Here's your company-wide overview.
              </p>            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>              <button
                onClick={refreshData}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'all 0.3s ease',
                  backgroundColor: isDarkMode ? '#475569' : '#f3f4f6',
                  color: isDarkMode ? '#ffffff' : '#374151',
                  border: 'none',
                  cursor: refreshing ? 'not-allowed' : 'pointer',
                  opacity: refreshing ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (!refreshing) {
                    e.currentTarget.style.backgroundColor = isDarkMode ? '#374151' : '#e5e7eb';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isDarkMode ? '#475569' : '#f3f4f6';
                }}
                disabled={refreshing}
              >
                {refreshing ? 'Refreshing...' : 'Refresh Data'}
              </button>
              <div style={{
                fontSize: '0.875rem',
                color: isDarkMode ? '#94a3b8' : '#64748b'
              }}>
                Auto-refresh: 30s
              </div>
            </div>
          </div>
        </div>        {/* Company-wide Metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '32px',
          marginBottom: '40px'
        }}>
          <div 
            style={{
              ...metricCardStyle,
              transform: 'translateY(0)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = isDarkMode 
                ? '0 12px 35px rgba(0, 0, 0, 0.5), 0 6px 15px rgba(0, 0, 0, 0.4)' 
                : '0 12px 35px rgba(15, 23, 42, 0.12), 0 6px 15px rgba(15, 23, 42, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = isDarkMode 
                ? '0 8px 25px rgba(0, 0, 0, 0.4), 0 4px 10px rgba(0, 0, 0, 0.3)' 
                : '0 8px 25px rgba(15, 23, 42, 0.08), 0 4px 10px rgba(15, 23, 42, 0.04)';
            }}
          >
            <div style={{
              position: 'absolute',
              inset: '0',
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
              borderRadius: '16px'
            }}></div>
            <div style={{ position: 'relative' }}>
              <h3 style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '12px',
                color: isDarkMode ? '#9ca3af' : '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>Total Sales Today</h3>
              <p style={{
                fontSize: '2.25rem',
                fontWeight: 'bold',
                color: '#10b981',
                marginBottom: '8px'
              }}>
                {financialData ? formatPrice(financialData.totalSalesToday || 0) : formatCurrency(0, currency)}
              </p>
              <p style={{
                fontSize: '0.875rem',
                color: isDarkMode ? '#cbd5e1' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span>Across {branches.length} branches</span>
              </p>
            </div>
          </div>

          <div 
            style={{
              ...metricCardStyle,
              transform: 'translateY(0)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = isDarkMode 
                ? '0 12px 35px rgba(0, 0, 0, 0.5), 0 6px 15px rgba(0, 0, 0, 0.4)' 
                : '0 12px 35px rgba(15, 23, 42, 0.12), 0 6px 15px rgba(15, 23, 42, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = isDarkMode 
                ? '0 8px 25px rgba(0, 0, 0, 0.4), 0 4px 10px rgba(0, 0, 0, 0.3)' 
                : '0 8px 25px rgba(15, 23, 42, 0.08), 0 4px 10px rgba(15, 23, 42, 0.04)';
            }}
          >
            <div style={{
              position: 'absolute',
              inset: '0',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)',
              borderRadius: '16px'
            }}></div>
            <div style={{ position: 'relative' }}>
              <h3 style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '12px',
                color: isDarkMode ? '#9ca3af' : '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>Active Orders</h3>
              <p style={{
                fontSize: '2.25rem',
                fontWeight: 'bold',
                color: '#3b82f6',
                marginBottom: '8px'
              }}>
                {systemStats?.totalActiveOrders || 0}
              </p>
              <p style={{
                fontSize: '0.875rem',
                color: isDarkMode ? '#cbd5e1' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span>Company-wide</span>
              </p>
            </div>
          </div>
          
          <div 
            style={{
              ...metricCardStyle,
              transform: 'translateY(0)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = isDarkMode 
                ? '0 12px 35px rgba(0, 0, 0, 0.5), 0 6px 15px rgba(0, 0, 0, 0.4)' 
                : '0 12px 35px rgba(15, 23, 42, 0.12), 0 6px 15px rgba(15, 23, 42, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = isDarkMode 
                ? '0 8px 25px rgba(0, 0, 0, 0.4), 0 4px 10px rgba(0, 0, 0, 0.3)' 
                : '0 8px 25px rgba(15, 23, 42, 0.08), 0 4px 10px rgba(15, 23, 42, 0.04)';
            }}
          >
            <div style={{
              position: 'absolute',
              inset: '0',
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
              borderRadius: '16px'
            }}></div>
            <div style={{ position: 'relative' }}>
              <h3 style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '12px',
                color: isDarkMode ? '#9ca3af' : '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>Active Staff</h3>
              <p style={{
                fontSize: '2.25rem',
                fontWeight: 'bold',
                color: '#a855f7',
                marginBottom: '8px'
              }}>{getActiveStaffCount()}</p>
              <p style={{
                fontSize: '0.875rem',
                color: isDarkMode ? '#cbd5e1' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span>Across all branches</span>
              </p>
            </div>
          </div>

          <div 
            style={{
              ...metricCardStyle,
              transform: 'translateY(0)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = isDarkMode 
                ? '0 12px 35px rgba(0, 0, 0, 0.5), 0 6px 15px rgba(0, 0, 0, 0.4)' 
                : '0 12px 35px rgba(15, 23, 42, 0.12), 0 6px 15px rgba(15, 23, 42, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = isDarkMode 
                ? '0 8px 25px rgba(0, 0, 0, 0.4), 0 4px 10px rgba(0, 0, 0, 0.3)' 
                : '0 8px 25px rgba(15, 23, 42, 0.08), 0 4px 10px rgba(15, 23, 42, 0.04)';
            }}
          >
            <div style={{
              position: 'absolute',
              inset: '0',
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)',
              borderRadius: '16px'
            }}></div>            <div style={{ position: 'relative' }}>
              <h3 style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '12px',
                color: isDarkMode ? '#9ca3af' : '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>Inventory Alerts</h3>
              <p style={{
                fontSize: '2.25rem',
                fontWeight: 'bold',
                color: '#ef4444',
                marginBottom: '8px'
              }}>{getTotalInventoryAlerts()}</p>
              <p style={{
                fontSize: '0.875rem',
                color: isDarkMode ? '#cbd5e1' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '4px 8px',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  backgroundColor: getTotalInventoryAlerts() > 5
                    ? (isDarkMode ? 'rgba(239, 68, 68, 0.3)' : '#fee2e2')
                    : (isDarkMode ? 'rgba(34, 197, 94, 0.3)' : '#dcfce7'),
                  color: getTotalInventoryAlerts() > 5
                    ? (isDarkMode ? '#f87171' : '#991b1b')
                    : (isDarkMode ? '#4ade80' : '#166534')
                }}>
                  {getTotalInventoryAlerts() > 5 ? 'Attention needed' : 'Under control'}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Top Performing Branches */}
          <div style={cardStyle} className="hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Top Performing Branches</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                getTopPerformingBranches().length > 0 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
              }`}>
                {getText('dailySales')}
              </span>
            </div>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {getTopPerformingBranches().length > 0 ? getTopPerformingBranches().map((branch, index) => (
                <div key={branch.id} className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
                  isDarkMode 
                    ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-800' 
                    : 'bg-slate-50 border-slate-200 hover:bg-white'
                }`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3 ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-orange-500 text-white' :
                        'bg-blue-500 text-white'
                      }`}>
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-semibold text-lg">{branch.name}</p>
                        <p className="text-sm text-gray-500">{branch.address}</p>
                      </div>
                    </div>                    <div className="text-right">
                      <p className="font-bold text-lg text-green-600">
                        {formatPrice(branch.metrics?.todayRevenue || 0)}
                      </p>
                      <p className="text-sm text-gray-500">{branch.metrics?.activeOrders || 0} orders</p>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🏪</span>
                  </div>
                  <p className="text-gray-500">No branch data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Branch Status Overview */}
          <div style={cardStyle} className="hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Branch Status Overview</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                branches.length > 0 
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
              }`}>
                {branches.length} branches
              </span>
            </div>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {restaurantStatus.length > 0 ? restaurantStatus.map(status => (
                <div key={status.id} className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
                  isDarkMode 
                    ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-800' 
                    : 'bg-slate-50 border-slate-200 hover:bg-white'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-lg">{status.name}</p>                      <div className="flex items-center mt-2 space-x-4">
                        <span className="text-sm text-gray-500">Staff: {status.metrics?.activeStaff || 0}</span>
                        <span className="text-sm text-gray-500">Orders: {status.metrics?.activeOrders || 0}</span>
                      </div>
                    </div>
                    <div className="text-right">                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        status.metrics?.isOpen ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {status.metrics?.isOpen ? 'Open' : 'Closed'}
                      </span>
                      {status.metrics?.lowStockItems && status.metrics.lowStockItems > 0 && (
                        <p className="text-sm text-red-500 mt-1">{status.metrics.lowStockItems} alerts</p>
                      )}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📊</span>
                  </div>
                  <p className="text-gray-500">No status data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="mt-10">
          <div style={cardStyle} className="hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Recent Company Activity</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                activityFeed.length > 0 
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
              }`}>
                Live Updates
              </span>
            </div>
            <div className="space-y-4 max-h-60 overflow-y-auto">
              {activityFeed.length > 0 ? activityFeed.map((activity, index) => (
                <div key={index} className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
                  isDarkMode 
                    ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-800' 
                    : 'bg-slate-50 border-slate-200 hover:bg-white'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{activity.title}</p>
                      <p className="text-sm text-gray-500 mt-1">{activity.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{new Date(activity.timestamp).toLocaleTimeString()}</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                        activity.type === 'order' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                        activity.type === 'payment' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        activity.type === 'alert' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                      }`}>
                        {activity.type}
                      </span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📝</span>
                  </div>
                  <p className="text-gray-500">No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-10">
          <div style={cardStyle} className="hover:shadow-xl transition-all duration-300">
            <h3 className="text-xl font-bold mb-6">HQ Management</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Link 
                to="/branches" 
                className="group p-6 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl text-center transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">🏪</div>
                <div className="font-semibold">Manage Branches</div>
              </Link>
              <Link 
                to="/staff" 
                className="group p-6 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl text-center transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">👥</div>
                <div className="font-semibold">Staff Overview</div>
              </Link>
              <Link 
                to="/admin" 
                className="group p-6 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl text-center transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">⚙️</div>
                <div className="font-semibold">System Admin</div>
              </Link>
              <Link 
                to="/orders" 
                className="group p-6 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl text-center transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">📋</div>
                <div className="font-semibold">All Orders</div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Branch Manager Dashboard Component
const BranchManagerDashboard: React.FC = () => {
  const { user, language, currency } = useContext(AuthContext);
  const { settings, t } = useSettings();
  const { isDarkMode } = useTheme();
  
  const [dailySales, setDailySales] = useState<BranchDailySales | null>(null);
  const [activeOrders, setActiveOrders] = useState<BranchActiveOrder[]>([]);
  const [staffOnShift, setStaffOnShift] = useState<BranchStaffMember[]>([]);
  const [inventoryAlerts, setInventoryAlerts] = useState<BranchInventoryAlert[]>([]);
  const [customerFeedback, setCustomerFeedback] = useState<BranchCustomerFeedback[]>([]);
  const [weeklyTrend, setWeeklyTrend] = useState<BranchWeeklyTrend[]>([]);
  const [metrics, setMetrics] = useState<BranchMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [
          salesResponse,
          ordersResponse,
          staffResponse,
          alertsResponse,
          feedbackResponse,
          trendResponse,
          metricsResponse
        ] = await Promise.all([
          getBranchDailySales(),
          getBranchActiveOrders(),
          getBranchStaffOnShift(),
          getBranchInventoryAlerts(),
          getBranchCustomerFeedback(),
          getBranchWeeklyTrend(),
          getBranchMetrics()
        ]);

        setDailySales(salesResponse.data);
        setActiveOrders(ordersResponse.data);
        setStaffOnShift(staffResponse.data);
        setInventoryAlerts(alertsResponse.data);
        setCustomerFeedback(feedbackResponse.data);
        setWeeklyTrend(trendResponse.data);
        setMetrics(metricsResponse.data);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Pure CSS Styles
  const containerStyle: React.CSSProperties = {
    backgroundColor: isDarkMode ? '#0f1419' : '#f8fafc',
    color: isDarkMode ? '#e2e8f0' : '#1e293b',
    minHeight: '100vh',
    padding: '24px',
    transition: 'background-color 0.3s ease, color 0.3s ease'
  };

  const maxWidthContainerStyle: React.CSSProperties = {
    maxWidth: '1280px',
    margin: '0 auto'
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
    borderRadius: '16px',
    padding: '28px',
    boxShadow: isDarkMode 
      ? '0 8px 25px rgba(0, 0, 0, 0.4), 0 4px 10px rgba(0, 0, 0, 0.3)' 
      : '0 8px 25px rgba(15, 23, 42, 0.08), 0 4px 10px rgba(15, 23, 42, 0.04)',
    border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    backdropFilter: 'blur(10px)'
  };

  const metricCardStyle: React.CSSProperties = {
    ...cardStyle,
    padding: '24px',
    textAlign: 'center' as const,
    position: 'relative' as const,
    overflow: 'hidden' as const,
    cursor: 'default' as const,
    transform: 'translateY(0)',
    transition: 'all 0.3s ease'
  };

  const metricCardHoverStyle: React.CSSProperties = {
    transform: 'translateY(-4px)',
    boxShadow: isDarkMode 
      ? '0 12px 35px rgba(0, 0, 0, 0.5), 0 6px 15px rgba(0, 0, 0, 0.4)' 
      : '0 12px 35px rgba(15, 23, 42, 0.12), 0 6px 15px rgba(15, 23, 42, 0.08)'
  };

  const headerCardStyle: React.CSSProperties = {
    ...cardStyle,
    background: isDarkMode 
      ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
      : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    marginBottom: '32px',
    padding: '32px'
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '32px',
    marginBottom: '40px'
  };

  const mainGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '32px'
  };

  const loadingStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '256px'
  };

  const spinnerStyle: React.CSSProperties = {
    width: '48px',
    height: '48px',
    border: '3px solid transparent',
    borderTop: '3px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'  };
  const formatPrice = (amount: number) => {
    return formatCurrency(amount, currency);
  };

  // Helper function to get translated text
  const getText = (key: string): string => {
    return getTranslation(key, language);
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={loadingStyle}>
          <div style={spinnerStyle}></div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }  return (
    <div style={containerStyle}>
      <div style={maxWidthContainerStyle}>
        {/* Header */}
        <div style={headerCardStyle}>
          <h1 style={{
            fontSize: '2.25rem',
            fontWeight: 'bold',
            marginBottom: '12px',
            background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Branch Manager Dashboard
          </h1>
          <p style={{
            fontSize: '1.125rem',
            color: isDarkMode ? '#cbd5e1' : '#64748b'
          }}>
            {getText('welcome')} back, {user?.username}! Here's your branch overview for today.
          </p>
        </div>

        {/* Metrics Overview */}
        <div style={gridStyle}>
          <div 
            style={metricCardStyle}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, metricCardHoverStyle)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, metricCardStyle)}
          >
            <div style={{
              position: 'absolute',
              inset: '0',
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
              borderRadius: '16px'
            }}></div>
            <div style={{ position: 'relative' }}>
              <h3 style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '12px',
                color: isDarkMode ? '#9ca3af' : '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>{getText('dailySales')}</h3>
              <p style={{
                fontSize: '2.25rem',
                fontWeight: 'bold',
                color: '#10b981',
                marginBottom: '8px'
              }}>
                {dailySales ? formatPrice(dailySales.totalSales) : formatCurrency(0, currency)}
              </p>
              <div style={{
                fontSize: '0.875rem',
                color: isDarkMode ? '#cbd5e1' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '4px 8px',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  backgroundColor: dailySales && dailySales.percentChange >= 0 
                    ? (isDarkMode ? 'rgba(34, 197, 94, 0.3)' : '#dcfce7') 
                    : (isDarkMode ? 'rgba(239, 68, 68, 0.3)' : '#fee2e2'),
                  color: dailySales && dailySales.percentChange >= 0 
                    ? (isDarkMode ? '#4ade80' : '#166534') 
                    : (isDarkMode ? '#f87171' : '#991b1b')
                }}>
                  {dailySales && dailySales.percentChange >= 0 ? '↗' : '↘'} 
                  {Math.abs(dailySales?.percentChange || 0)}%
                </span>
                <span style={{ marginLeft: '8px' }}>from yesterday</span>
              </div>
            </div>
          </div>

          <div 
            style={metricCardStyle}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, metricCardHoverStyle)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, metricCardStyle)}
          >
            <div style={{
              position: 'absolute',
              inset: '0',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)',
              borderRadius: '16px'
            }}></div>
            <div style={{ position: 'relative' }}>
              <h3 style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '12px',
                color: isDarkMode ? '#9ca3af' : '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>Active Orders</h3>
              <p style={{
                fontSize: '2.25rem',
                fontWeight: 'bold',
                color: '#3b82f6',
                marginBottom: '8px'
              }}>{metrics?.ordersToday || 0}</p>
              <p style={{
                fontSize: '0.875rem',
                color: isDarkMode ? '#cbd5e1' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span>{activeOrders.length} currently active</span>
              </p>
            </div>
          </div>

          <div 
            style={metricCardStyle}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, metricCardHoverStyle)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, metricCardStyle)}
          >
            <div style={{
              position: 'absolute',
              inset: '0',
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
              borderRadius: '16px'
            }}></div>
            <div style={{ position: 'relative' }}>
              <h3 style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '12px',
                color: isDarkMode ? '#9ca3af' : '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>Staff On Shift</h3>
              <p style={{
                fontSize: '2.25rem',
                fontWeight: 'bold',
                color: '#a855f7',
                marginBottom: '8px'
              }}>{metrics?.staffOnShift || 0}</p>
              <p style={{
                fontSize: '0.875rem',
                color: isDarkMode ? '#cbd5e1' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span>{staffOnShift.filter(s => s.status === 'on_shift').length} active</span>
              </p>
            </div>
          </div>

          <div 
            style={metricCardStyle}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, metricCardHoverStyle)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, metricCardStyle)}
          >
            <div style={{
              position: 'absolute',
              inset: '0',
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)',
              borderRadius: '16px'
            }}></div>
            <div style={{ position: 'relative' }}>
              <h3 style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '12px',
                color: isDarkMode ? '#9ca3af' : '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>Inventory Alerts</h3>
              <p style={{
                fontSize: '2.25rem',
                fontWeight: 'bold',
                color: '#ef4444',
                marginBottom: '8px'
              }}>{metrics?.lowStockItems || 0}</p>
              <p style={{
                fontSize: '0.875rem',
                color: isDarkMode ? '#cbd5e1' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '4px 8px',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  backgroundColor: inventoryAlerts.filter(a => a.severity === 'critical').length > 0
                    ? (isDarkMode ? 'rgba(239, 68, 68, 0.3)' : '#fee2e2')
                    : (isDarkMode ? 'rgba(34, 197, 94, 0.3)' : '#dcfce7'),
                  color: inventoryAlerts.filter(a => a.severity === 'critical').length > 0
                    ? (isDarkMode ? '#f87171' : '#991b1b')
                    : (isDarkMode ? '#4ade80' : '#166534')
                }}>
                  {inventoryAlerts.filter(a => a.severity === 'critical').length} critical
                </span>
              </p>
            </div>
          </div>
        </div>        {/* Main Content Grid */}
        <div style={mainGridStyle}>
          {/* Active Orders */}          <div style={{
            ...cardStyle,
            transition: 'all 0.3s ease'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 'bold'
              }}>Active Orders</h3>
              <span style={{
                padding: '6px 12px',
                borderRadius: '9999px',
                fontSize: '0.875rem',
                fontWeight: '500',
                backgroundColor: activeOrders.length > 0 
                  ? (isDarkMode ? 'rgba(59, 130, 246, 0.3)' : '#dbeafe')
                  : (isDarkMode ? 'rgba(156, 163, 175, 0.3)' : '#f3f4f6'),
                color: activeOrders.length > 0 
                  ? (isDarkMode ? '#60a5fa' : '#1e40af')
                  : (isDarkMode ? '#9ca3af' : '#374151')
              }}>
                {activeOrders.length}
              </span>
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              maxHeight: '320px',
              overflowY: 'auto'
            }}>
              {activeOrders.length > 0 ? activeOrders.map(order => (
                <div key={order.id} style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: isDarkMode ? '1px solid #475569' : '1px solid #e2e8f0',
                  backgroundColor: isDarkMode ? 'rgba(51, 65, 85, 0.5)' : '#f8fafc',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                  }}>
                    <div>
                      <p style={{
                        fontWeight: '600',
                        fontSize: '1.125rem'
                      }}>{order.customerName}</p>
                      <p style={{
                        fontSize: '0.875rem',
                        color: isDarkMode ? '#9ca3af' : '#6b7280',
                        marginTop: '4px'
                      }}>{order.items} items • {order.status}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{
                        fontWeight: 'bold',
                        fontSize: '1.125rem'
                      }}>{formatPrice(order.total)}</p>
                      <p style={{
                        fontSize: '0.875rem',
                        color: isDarkMode ? '#9ca3af' : '#6b7280',
                        marginTop: '4px'
                      }}>{order.timeRemaining}</p>
                    </div>
                  </div>
                </div>
              )) : (
                <div style={{
                  textAlign: 'center',
                  padding: '48px 0'
                }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    margin: '0 auto 16px',
                    backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem'
                  }}>
                    📋
                  </div>
                  <p style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>No active orders</p>
                </div>
              )}
            </div>
          </div>

          {/* Staff On Shift */}
          <div style={{
            ...cardStyle,
            transition: 'all 0.3s ease'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 'bold'
              }}>Staff On Shift</h3>
              <span style={{
                padding: '6px 12px',
                borderRadius: '9999px',
                fontSize: '0.875rem',
                fontWeight: '500',
                backgroundColor: staffOnShift.filter(s => s.status === 'on_shift').length > 0 
                  ? (isDarkMode ? 'rgba(34, 197, 94, 0.3)' : '#dcfce7')
                  : (isDarkMode ? 'rgba(156, 163, 175, 0.3)' : '#f3f4f6'),
                color: staffOnShift.filter(s => s.status === 'on_shift').length > 0 
                  ? (isDarkMode ? '#4ade80' : '#166534')
                  : (isDarkMode ? '#9ca3af' : '#374151')
              }}>
                {staffOnShift.filter(s => s.status === 'on_shift').length}
              </span>
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              maxHeight: '320px',
              overflowY: 'auto'
            }}>
              {staffOnShift.length > 0 ? staffOnShift.map(staff => (
                <div key={staff.id} style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: isDarkMode ? '1px solid #475569' : '1px solid #e2e8f0',
                  backgroundColor: isDarkMode ? 'rgba(51, 65, 85, 0.5)' : '#f8fafc',
                  transition: 'all 0.2s ease'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <p style={{
                        fontWeight: '600',
                        fontSize: '1.125rem'
                      }}>{staff.name}</p>
                      <p style={{
                        fontSize: '0.875rem',
                        color: isDarkMode ? '#9ca3af' : '#6b7280',
                        marginTop: '4px'
                      }}>{staff.role} • {staff.shift}</p>
                    </div>
                    <span style={{
                      padding: '6px 12px',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      backgroundColor: staff.status === 'on_shift' 
                        ? (isDarkMode ? 'rgba(34, 197, 94, 0.3)' : '#dcfce7')
                        : staff.status === 'break'
                        ? (isDarkMode ? 'rgba(245, 158, 11, 0.3)' : '#fef3c7')
                        : (isDarkMode ? 'rgba(156, 163, 175, 0.3)' : '#f3f4f6'),
                      color: staff.status === 'on_shift' 
                        ? (isDarkMode ? '#4ade80' : '#166534')
                        : staff.status === 'break'
                        ? (isDarkMode ? '#fbbf24' : '#92400e')
                        : (isDarkMode ? '#9ca3af' : '#374151')
                    }}>
                      {staff.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              )) : (
                <div style={{
                  textAlign: 'center',
                  padding: '48px 0'
                }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    margin: '0 auto 16px',
                    backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem'
                  }}>
                    👥
                  </div>
                  <p style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>No staff on shift</p>
                </div>
              )}
            </div>
          </div>

          {/* Inventory Alerts */}
          <div style={{
            ...cardStyle,
            transition: 'all 0.3s ease'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 'bold'
              }}>Inventory Alerts</h3>
              <span style={{
                padding: '6px 12px',
                borderRadius: '9999px',
                fontSize: '0.875rem',
                fontWeight: '500',
                backgroundColor: inventoryAlerts.filter(a => a.severity === 'critical').length > 0 
                  ? (isDarkMode ? 'rgba(239, 68, 68, 0.3)' : '#fee2e2')
                  : (isDarkMode ? 'rgba(34, 197, 94, 0.3)' : '#dcfce7'),
                color: inventoryAlerts.filter(a => a.severity === 'critical').length > 0 
                  ? (isDarkMode ? '#f87171' : '#991b1b')
                  : (isDarkMode ? '#4ade80' : '#166534')
              }}>
              {inventoryAlerts.filter(a => a.severity === 'critical').length > 0 ? 'Critical' : 'Good'}
              </span>
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              maxHeight: '320px',
              overflowY: 'auto'
            }}>
              {inventoryAlerts.length > 0 ? inventoryAlerts.map(alert => (
                <div key={alert.id} style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: alert.severity === 'critical'
                    ? (isDarkMode ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid #fecaca')
                    : (isDarkMode ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid #fed7aa'),
                  backgroundColor: alert.severity === 'critical'
                    ? (isDarkMode ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2')
                    : (isDarkMode ? 'rgba(245, 158, 11, 0.2)' : '#fef3c7'),
                  transition: 'all 0.2s ease'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <p style={{
                        fontWeight: '600',
                        fontSize: '1.125rem'
                      }}>{alert.itemName}</p>
                      <p style={{
                        fontSize: '0.875rem',
                        color: isDarkMode ? '#9ca3af' : '#6b7280',
                        marginTop: '4px'
                      }}>
                        Stock: {alert.currentStock} / Min: {alert.minStock}
                      </p>
                    </div>
                    <span style={{
                      padding: '6px 12px',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      backgroundColor: alert.severity === 'critical' 
                        ? (isDarkMode ? 'rgba(239, 68, 68, 0.5)' : '#fee2e2')
                        : (isDarkMode ? 'rgba(245, 158, 11, 0.5)' : '#fef3c7'),
                      color: alert.severity === 'critical' 
                        ? (isDarkMode ? '#f87171' : '#991b1b')
                        : (isDarkMode ? '#fbbf24' : '#92400e')
                    }}>
                      {alert.severity}
                    </span>
                  </div>
                </div>
              )) : (
                <div style={{
                  textAlign: 'center',
                  padding: '48px 0'
                }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    margin: '0 auto 16px',
                    backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem'
                  }}>
                    📦
                  </div>
                  <p style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>No inventory alerts</p>
                </div>
              )}
            </div>
          </div>
        </div>        {/* Customer Feedback */}
        <div style={{ marginTop: '40px' }}>
          <div style={{
            ...cardStyle,
            transition: 'all 0.3s ease'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 'bold'
              }}>Recent Customer Feedback</h3>
              <span style={{
                padding: '6px 12px',
                borderRadius: '9999px',
                fontSize: '0.875rem',
                fontWeight: '500',
                backgroundColor: customerFeedback.length > 0 
                  ? (isDarkMode ? 'rgba(59, 130, 246, 0.3)' : '#dbeafe')
                  : (isDarkMode ? 'rgba(156, 163, 175, 0.3)' : '#f3f4f6'),
                color: customerFeedback.length > 0 
                  ? (isDarkMode ? '#60a5fa' : '#1e40af')
                  : (isDarkMode ? '#9ca3af' : '#374151')
              }}>
                {customerFeedback.length} reviews
              </span>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px'
            }}>
              {customerFeedback.length > 0 ? customerFeedback.slice(0, 6).map(feedback => (
                <div key={feedback.id} style={{
                  padding: '20px',
                  borderRadius: '12px',
                  border: isDarkMode ? '1px solid #475569' : '1px solid #e2e8f0',
                  backgroundColor: isDarkMode ? 'rgba(51, 65, 85, 0.5)' : '#f8fafc',
                  transition: 'all 0.2s ease'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '12px'
                  }}>
                    <p style={{
                      fontWeight: '600',
                      fontSize: '1.125rem'
                    }}>{feedback.customerName}</p>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginLeft: '8px'
                    }}>
                      <span style={{ color: '#eab308' }}>{'★'.repeat(feedback.rating)}</span>
                      <span style={{ color: isDarkMode ? '#475569' : '#d1d5db' }}>{'★'.repeat(5 - feedback.rating)}</span>
                    </div>
                  </div>
                  <p style={{
                    fontSize: '0.875rem',
                    color: isDarkMode ? '#9ca3af' : '#6b7280',
                    marginBottom: '12px',
                    lineHeight: '1.6'
                  }}>{feedback.comment}</p>
                  <p style={{
                    fontSize: '0.75rem',
                    color: isDarkMode ? '#9ca3af' : '#6b7280'
                  }}>{new Date(feedback.date).toLocaleDateString()}</p>
                </div>
              )) : (
                <div style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '48px 0'
                }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    margin: '0 auto 16px',
                    backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem'
                  }}>
                    💬
                  </div>
                  <p style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>No recent feedback</p>
                </div>
              )}            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Home: React.FC = () => {
  const { user } = useContext(AuthContext);
  const { settings, t } = useSettings();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // All hooks must be called before any early returns
  const [featuredDishes, setFeaturedDishes] = useState<MenuItemWithIngredients[]>([]);
  const [mainBranch, setMainBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);
  const [branchLoading, setBranchLoading] = useState(true);
  
  // Reviews state
  const [reviews, setReviews] = useState<Post[]>([]);
  const [customerFeedback, setCustomerFeedback] = useState<CustomerFeedback[]>([]);
  const [newReview, setNewReview] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [pendingRating, setPendingRating] = useState<number | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');
  useEffect(() => {
    // Redirect admin users to the admin dashboard
    if (user && user.role === 'ADMIN') {
      navigate('/admin');
    }
  }, [user, navigate]);
  useEffect(() => {
    // Only load data for non-branch managers and non-general managers
    if (user && (user.role === 'BRANCH_MANAGER' || user.role === 'GENERAL_MANAGER')) {
      return;
    }

    const loadFeaturedDishes = async () => {
      try {
        const response = await getMenuItems();
        // Get first 3 available items as featured dishes
        const availableItems = response.data.filter(item => item.isAvailable);
        setFeaturedDishes(availableItems.slice(0, 3));
      } catch (error) {
        console.error('Failed to load featured dishes:', error);
        // Fallback to placeholder data if API fails
        setFeaturedDishes([]);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedDishes();
  }, [user]);
  useEffect(() => {
    // Only load data for non-branch managers and non-general managers
    if (user && (user.role === 'BRANCH_MANAGER' || user.role === 'GENERAL_MANAGER')) {
      return;
    }

    const loadMainBranch = async () => {
      try {
        const response = await getBranches();
        const branches = response.data;
        
        if (branches.length > 0) {
          // Try to find the main branch by name, otherwise use the first one
          let mainBranchFound = branches.find(branch => 
            branch.name.toLowerCase().includes('main') || 
            branch.name.toLowerCase().includes('headquarters') ||
            branch.name.toLowerCase().includes('central') ||
            branch.id === 1 // Often the first branch created has ID 1
          );
          
          // If no specific main branch found, use the first one
          if (!mainBranchFound) {
            mainBranchFound = branches[0];
          }
          
          setMainBranch(mainBranchFound);
        }
      } catch (error) {
        console.error('Failed to load branch information:', error);
        setMainBranch(null);
      } finally {
        setBranchLoading(false);
      }
    };

    loadMainBranch();
  }, [user]);
  useEffect(() => {
    // Only load data for non-branch managers and non-general managers
    if (user && (user.role === 'BRANCH_MANAGER' || user.role === 'GENERAL_MANAGER')) {
      return;
    }

    const loadReviews = async () => {
      try {
        const reviewsData = await getReviews();
        setReviews(reviewsData.slice(0, 5));
      } catch (error) {
        setReviews([]);
      }
    };
    const loadCustomerFeedback = async () => {
      try {
        const feedbackData = await getCustomerFeedback();
        setCustomerFeedback(feedbackData);
      } catch (error) {
        setCustomerFeedback([]);
      }
    };
    loadReviews();
    loadCustomerFeedback();
  }, [user]);
  // Show HQ manager dashboard for general managers
  if (user && user.role === 'GENERAL_MANAGER') {
    return <HQManagerDashboard />;
  }

  // Show branch manager dashboard for branch managers
  if (user && user.role === 'BRANCH_MANAGER') {
    return <BranchManagerDashboard />;  }

  // Function to get placeholder image based on dish category
  const getImageForDish = (category: string, name: string) => {
    const categoryImages: Record<string, string> = {
      'steaks': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
      'beef': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
      'chicken': 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=600&q=80',
      'seafood': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80',
      'fish': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80',
      'appetizers': 'https://images.unsplash.com/photo-1541014741259-de529411b96a?auto=format&fit=crop&w=600&q=80',
      'desserts': 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=600&q=80',
      'chocolate': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
      'fondant': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
      'beverages': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=600&q=80',
      'salads': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
      'caesar': 'https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=600&q=80',
      'pasta': 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80',
      'burgers': 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=600&q=80',
      'pizza': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=600&q=80',
      'soup': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80',
      'sandwich': 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=600&q=80'
    };

    const categoryLower = category.toLowerCase();
    const nameLower = name.toLowerCase();
    
    // Check if dish name contains specific keywords first (more specific matching)
    for (const [key, image] of Object.entries(categoryImages)) {
      if (nameLower.includes(key)) {
        return image;
      }
    }
    
    // Then check category
    for (const [key, image] of Object.entries(categoryImages)) {
      if (categoryLower.includes(key)) {
        return image;
      }
    }

    // Default image for unknown categories
    return 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=600&q=80';
  };
  // Function to get badge based on category or name
  const getBadgeForDish = (category: string, name: string) => {
    const categoryLower = category.toLowerCase();
    const nameLower = name.toLowerCase();
    
    if (nameLower.includes('signature') || nameLower.includes('special')) return "Chef's Special";
    if (nameLower.includes('spicy') || nameLower.includes('hot')) return 'Spicy';
    if (categoryLower.includes('seafood') || nameLower.includes('fresh')) return 'Fresh';
    if (categoryLower.includes('steak') || categoryLower.includes('beef')) return 'Premium';
    if (categoryLower.includes('dessert') || nameLower.includes('chocolate') || nameLower.includes('fondant')) return 'Sweet';
    if (categoryLower.includes('appetizer') || categoryLower.includes('starter')) return 'Starter';
    if (nameLower.includes('salad')) return 'Healthy';    if (nameLower.includes('caesar')) return 'Classic';
    return 'Popular';
  };

  // Handle review submission
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (user.role !== 'CUSTOMER' && user.role !== 'ADMIN' && user.role !== 'GENERAL_MANAGER' && user.role !== 'BRANCH_MANAGER')) {
      setReviewMessage(t('loginToReview'));
      return;
    }
    if (!newReview.trim()) {
      return;
    }
    setReviewLoading(true);
    setReviewMessage('');
    try {
      const ratingToSubmit = pendingRating ?? 5;
      const review = await createReview(newReview, ratingToSubmit, `Review by ${user.username}`);
      setReviews(prev => [review, ...prev.slice(0, 4)]); // Add new review and keep only 5
      setNewReview('');
      setReviewRating(5);
      setPendingRating(null);
      setReviewMessage(t('reviewSubmitted'));
      setTimeout(() => setReviewMessage(''), 3000);
    } catch (error) {
      setReviewMessage(t('reviewError'));
      setTimeout(() => setReviewMessage(''), 5000);
    } finally {
      setReviewLoading(false);
    }
  };

  const containerStyle: React.CSSProperties = {
    backgroundColor: isDarkMode ? '#0f0f0f' : '#ffffff',
    color: isDarkMode ? '#ffffff' : '#1a1a1a',
    minHeight: '100vh',
    transition: 'background-color 0.3s ease, color 0.3s ease'
  };

  const heroStyle: React.CSSProperties = {
    position: 'relative',
    height: '100vh',
    background: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.6)), url("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=2070&q=80") center/cover',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    textAlign: 'center'
  };

  const heroContentStyle: React.CSSProperties = {
    maxWidth: '800px',
    padding: '0 20px',
    animation: 'fadeInUp 1s ease-out'
  };

  const heroTitleStyle: React.CSSProperties = {
    fontSize: '4rem',
    fontWeight: '700',
    marginBottom: '1.5rem',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)',
    lineHeight: '1.1'
  };

  const heroSubtitleStyle: React.CSSProperties = {
    fontSize: '1.5rem',
    marginBottom: '3rem',
    fontWeight: '300',
    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)'
  };

  const buttonGroupStyle: React.CSSProperties = {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
    flexWrap: 'wrap'
  };

  const primaryButtonStyle: React.CSSProperties = {
    backgroundColor: '#e74c3c',
    color: '#ffffff',
    padding: '15px 35px',
    fontSize: '1.1rem',
    fontWeight: '600',
    border: 'none',
    borderRadius: '50px',
    textDecoration: 'none',
    display: 'inline-block',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(231, 76, 60, 0.3)',
    cursor: 'pointer'
  };

  const secondaryButtonStyle: React.CSSProperties = {
    backgroundColor: 'transparent',
    color: '#ffffff',
    padding: '15px 35px',
    fontSize: '1.1rem',
    fontWeight: '600',
    border: '2px solid #ffffff',
    borderRadius: '50px',
    textDecoration: 'none',
    display: 'inline-block',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  };

  const sectionStyle: React.CSSProperties = {
    padding: '80px 20px',
    maxWidth: '1200px',
    margin: '0 auto'
  };
  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '2.5rem',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: '3rem',
    color: isDarkMode ? '#ffffff' : '#2c3e50'
  };

  const aboutCardStyle: React.CSSProperties = {
    backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
    padding: '60px',
    borderRadius: '20px',
    boxShadow: isDarkMode 
      ? '0 20px 60px rgba(255, 255, 255, 0.1)' 
      : '0 20px 60px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    maxWidth: '800px',
    margin: '0 auto'
  };

  const featuredGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '30px',
    marginTop: '3rem'
  };
  const dishCardStyle: React.CSSProperties = {
    backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: isDarkMode 
      ? '0 15px 35px rgba(255, 255, 255, 0.1)' 
      : '0 15px 35px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    cursor: 'pointer',
    position: 'relative'
  };

  const dishImageStyle: React.CSSProperties = {
    width: '100%',
    height: '250px',
    objectFit: 'cover'
  };

  const dishContentStyle: React.CSSProperties = {
    padding: '25px'
  };

  const dishBadgeStyle: React.CSSProperties = {
    position: 'absolute',
    top: '15px',
    right: '15px',
    backgroundColor: '#e74c3c',
    color: '#ffffff',
    padding: '5px 12px',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '600'
  };
  const dishTitleStyle: React.CSSProperties = {
    fontSize: '1.3rem',
    fontWeight: '600',
    marginBottom: '10px',
    color: isDarkMode ? '#ffffff' : '#2c3e50'
  };

  const dishDescStyle: React.CSSProperties = {
    color: isDarkMode ? '#cccccc' : '#666666',
    marginBottom: '15px',
    lineHeight: '1.6'
  };

  const dishPriceStyle: React.CSSProperties = {
    fontSize: '1.4rem',
    fontWeight: '700',
    color: '#e74c3c'
  };

  const testimonialGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '30px',
    marginTop: '3rem'
  };

  const testimonialCardStyle: React.CSSProperties = {
    backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f9fa',
    padding: '30px',
    borderRadius: '15px',
    textAlign: 'center',
    boxShadow: isDarkMode 
      ? '0 10px 25px rgba(255, 255, 255, 0.05)' 
      : '0 10px 25px rgba(0, 0, 0, 0.05)'
  };

  const starsStyle: React.CSSProperties = {
    color: '#f39c12',
    fontSize: '1.2rem',
    marginBottom: '15px'
  };

  const testimonialTextStyle: React.CSSProperties = {
    fontStyle: 'italic',
    marginBottom: '15px',
    color: isDarkMode ? '#cccccc' : '#666666',
    lineHeight: '1.6'
  };
  const testimonialNameStyle: React.CSSProperties = {
    fontWeight: '600',
    color: isDarkMode ? '#ffffff' : '#2c3e50'
  };

  // Review section styles
  const reviewSectionStyle: React.CSSProperties = {
    backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f9fa',
    padding: '60px 20px',
    textAlign: 'center'
  };

  const reviewFormStyle: React.CSSProperties = {
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: isDarkMode ? '#333333' : '#ffffff',
    padding: '30px',
    borderRadius: '15px',
    boxShadow: isDarkMode 
      ? '0 10px 25px rgba(255, 255, 255, 0.1)' 
      : '0 10px 25px rgba(0, 0, 0, 0.1)'
  };

  const reviewTextareaStyle: React.CSSProperties = {
    width: '100%',
    minHeight: '100px',
    padding: '15px',
    border: isDarkMode ? '2px solid #555' : '2px solid #e0e0e0',
    borderRadius: '10px',
    backgroundColor: isDarkMode ? '#444' : '#ffffff',
    color: isDarkMode ? '#ffffff' : '#333333',
    fontSize: '1rem',
    fontFamily: 'inherit',
    resize: 'vertical',
    outline: 'none',
    marginBottom: '20px'
  };

  const reviewButtonStyle: React.CSSProperties = {
    backgroundColor: '#e74c3c',
    color: '#ffffff',
    padding: '12px 30px',
    border: 'none',
    borderRadius: '25px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  };

  const reviewMessageStyle: React.CSSProperties = {
    marginTop: '15px',
    padding: '10px',
    borderRadius: '5px',
    fontSize: '0.9rem'
  };

  const customerReviewStyle: React.CSSProperties = {
    backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
    padding: '20px',
    borderRadius: '10px',
    marginBottom: '15px',
    textAlign: 'left',
    boxShadow: isDarkMode 
      ? '0 5px 15px rgba(255, 255, 255, 0.05)' 
      : '0 5px 15px rgba(0, 0, 0, 0.05)'
  };

  const footerStyle: React.CSSProperties = {
    backgroundColor: isDarkMode ? '#111111' : '#2c3e50',
    color: '#ffffff',
    padding: '60px 20px 30px',
    textAlign: 'center'
  };

  const footerContentStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '40px',
    marginBottom: '40px'
  };

  const footerSectionStyle: React.CSSProperties = {
    textAlign: 'left'
  };

  const footerTitleStyle: React.CSSProperties = {
    fontSize: '1.2rem',
    fontWeight: '600',
    marginBottom: '20px',
    color: '#e74c3c'
  };

  const footerTextStyle: React.CSSProperties = {
    lineHeight: '1.6',
    marginBottom: '10px',
    color: '#ecf0f1'
  };

  return (
    <div style={containerStyle}>      {/* Hero Section */}
      <section style={heroStyle}>        <div style={heroContentStyle}>
          <h1 style={heroTitleStyle}>{t('welcomeToSteakz')} Restaurant</h1>
          <p style={heroSubtitleStyle}>{t('welcomeSubtext')}</p>
          <div style={buttonGroupStyle}>
            <Link 
              to="/menu" 
              style={primaryButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#c0392b';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#e74c3c';
                e.currentTarget.style.transform = 'translateY(0)';
              }}            >
              {t('viewMenu')}
            </Link>
            <Link 
              to="/branches" 
              style={secondaryButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.color = '#2c3e50';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#ffffff';
              }}            >
              {t('findLocation')}
            </Link>
          </div>
        </div>
      </section>      {/* About Section */}
      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>{t('aboutRestaurant')}</h2>
        <div style={aboutCardStyle}>
          <p style={{ fontSize: '1.2rem', lineHeight: '1.8', margin: 0, color: isDarkMode ? '#cccccc' : '#666666' }}>
            {t('aboutText')}
          </p>
        </div>
      </section>      {/* Featured Dishes */}
      <section style={{ ...sectionStyle, backgroundColor: isDarkMode ? '#111111' : '#f8f9fa' }}>
        <h2 style={sectionTitleStyle}>{t('featuredDishes')}</h2><div style={featuredGridStyle}>
          {loading ? (
            // Loading state
            Array.from({ length: 3 }, (_, index) => (
              <div 
                key={`loading-${index}`} 
                style={{
                  ...dishCardStyle,
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                  animation: 'pulse 2s ease-in-out infinite'
                }}
              >
                <div style={{ 
                  width: '100%', 
                  height: '250px', 
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  borderRadius: '15px 15px 0 0'
                }} />
                <div style={dishContentStyle}>
                  <div style={{ 
                    width: '80%', 
                    height: '20px', 
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    borderRadius: '4px',
                    marginBottom: '10px'
                  }} />
                  <div style={{ 
                    width: '100%', 
                    height: '15px', 
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    borderRadius: '4px',
                    marginBottom: '5px'
                  }} />
                  <div style={{ 
                    width: '60%', 
                    height: '15px', 
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    borderRadius: '4px'
                  }} />
                </div>
              </div>
            ))
          ) : featuredDishes.length > 0 ? (
            featuredDishes.map((dish, index) => (
              <div 
                key={dish.id} 
                style={dishCardStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-10px)';
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
              >                <div style={dishBadgeStyle}>{getBadgeForDish(dish.category, dish.name)}</div>
                <img 
                  src={getImageForDish(dish.category, dish.name)} 
                  alt={dish.name} 
                  style={dishImageStyle} 
                />
                <div style={dishContentStyle}>
                  <h3 style={dishTitleStyle}>{dish.name}</h3>
                  <p style={dishDescStyle}>{dish.description}</p>
                  <div style={dishPriceStyle}>{dish.price} kr</div>
                </div>
              </div>
            ))
          ) : (
            // Fallback when no dishes are available
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '60px 20px',
              color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)'
            }}>
              <p>No featured dishes available at the moment. Please check our full menu.</p>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>What Our Customers Say</h2>
        <div style={testimonialGridStyle}>
          {testimonials.map((testimonial, index) => (
            <div key={index} style={testimonialCardStyle}>
              <div style={starsStyle}>
                {'★'.repeat(testimonial.rating)}
              </div>
              <p style={testimonialTextStyle}>"{testimonial.text}"</p>
              <div style={testimonialNameStyle}>- {testimonial.name}</div>
            </div>
          ))}        </div>
      </section>

      {/* Customer Reviews Section */}
      <section style={reviewSectionStyle}>
        <h2 style={sectionTitleStyle}>{t('shareExperience')}</h2>
        
        {user && (user.role === 'CUSTOMER' || user.role === 'ADMIN' || user.role === 'GENERAL_MANAGER' || user.role === 'BRANCH_MANAGER') ? (
          <div style={reviewFormStyle}>
            <h3 style={{ marginBottom: '20px', color: isDarkMode ? '#ffffff' : '#2c3e50' }}>
              {t('writeReview')}
            </h3>
            <form onSubmit={handleReviewSubmit}>
              <textarea
                style={reviewTextareaStyle}
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
                placeholder={t('writeReviewPlaceholder')}
                onFocus={(e) => e.target.style.borderColor = '#e74c3c'}
                onBlur={(e) => e.target.style.borderColor = isDarkMode ? '#555' : '#e0e0e0'}
              />
              <div className="flex items-center mb-2">
                {[1,2,3,4,5].map(star => (
                  <button
                    type="button"
                    key={star}
                    className={star <= (pendingRating ?? reviewRating) ? 'text-yellow-500' : 'text-gray-300'}
                    onClick={() => setPendingRating(star)}
                  >
                    ★
                  </button>
                ))}
              </div>
              <button 
                type="submit" 
                disabled={reviewLoading || !newReview.trim()}
                style={{
                  ...reviewButtonStyle,
                  opacity: reviewLoading || !newReview.trim() ? 0.6 : 1,
                  cursor: reviewLoading || !newReview.trim() ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (!reviewLoading && newReview.trim()) {
                    e.currentTarget.style.backgroundColor = '#c0392b';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!reviewLoading && newReview.trim()) {
                    e.currentTarget.style.backgroundColor = '#e74c3c';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {reviewLoading ? t('submittingReview') : t('submitReview')}
              </button>
            </form>
            
            {reviewMessage && (
              <div style={{
                ...reviewMessageStyle,
                backgroundColor: reviewMessage.includes('Thank') || reviewMessage.includes('Tack') 
                  ? '#d4edda' : '#f8d7da',
                color: reviewMessage.includes('Thank') || reviewMessage.includes('Tack') 
                  ? '#155724' : '#721c24'
              }}>
                {reviewMessage}
              </div>
            )}
          </div>
        ) : (
          <div style={{
            padding: '20px',
            backgroundColor: isDarkMode ? '#333333' : '#f8f9fa',
            borderRadius: '10px',
            maxWidth: '400px',
            margin: '0 auto',
            color: isDarkMode ? '#cccccc' : '#666666'
          }}>
            {!user ? t('loginToReview') : 'Only customers and managers can write reviews'}
          </div>
        )}

        {/* Display Recent Reviews */}
        {(reviews.length > 0 || customerFeedback.length > 0) && (
          <div style={{ maxWidth: '800px', margin: '40px auto 0', textAlign: 'left' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '30px', color: isDarkMode ? '#ffffff' : '#2c3e50' }}>
              Recent Customer Reviews
            </h3>
            {/* Show feedback from API first, then local reviews */}
            {customerFeedback.slice(0, 3).map((review) => (
              <div key={review.id} style={customerReviewStyle}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginBottom: '10px' 
                }}>
                  <strong style={{ color: isDarkMode ? '#ffffff' : '#2c3e50' }}>
                    {review.customerName || 'Customer'}
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: isDarkMode ? '#cccccc' : '#666666' }}>
                    {new Date(review.date).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ marginBottom: '5px', color: '#f39c12', fontSize: '1.1rem' }}>
                  {'★'.repeat(review.rating || 0)}{'☆'.repeat(5 - (review.rating || 0))}
                </div>
                <p style={{ margin: 0, color: isDarkMode ? '#cccccc' : '#666666', lineHeight: '1.5' }}>
                  {review.comment}
                </p>
              </div>
            ))}
            {reviews.slice(0, 3).map((review) => (
              <div key={review.id} style={customerReviewStyle}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginBottom: '10px' 
                }}>
                  <strong style={{ color: isDarkMode ? '#ffffff' : '#2c3e50' }}>
                    {review.author?.username || 'Customer'}
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: isDarkMode ? '#cccccc' : '#666666' }}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ marginBottom: '5px', color: '#f39c12', fontSize: '1.1rem' }}>
                  {'★'.repeat(review.rating || 0)}{'☆'.repeat(5 - (review.rating || 0))}
                </div>
                <p style={{ margin: 0, color: isDarkMode ? '#cccccc' : '#666666', lineHeight: '1.5' }}>
                  {review.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Location CTA */}
      <section style={{ ...sectionStyle, backgroundColor: isDarkMode ? '#111111' : '#f8f9fa', textAlign: 'center' }}>
        <h2 style={sectionTitleStyle}>{t('visitOurLocations')}</h2>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: isDarkMode ? '#cccccc' : '#666666' }}>
          {t('findNearestRestaurant')}
        </p>
        <Link 
          to="/branches" 
          style={primaryButtonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#c0392b';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#e74c3c';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {t('findLocations')}
        </Link>
      </section>

      {/* Footer */}
      <footer style={footerStyle}>
        <div style={footerContentStyle}>          <div style={footerSectionStyle}>
            <h3 style={footerTitleStyle}>{t('openingHours')}</h3>
            <p style={footerTextStyle}>{t('mondayFriday')}</p>
            <p style={footerTextStyle}>{t('saturdaySunday')}</p>
          </div>          <div style={footerSectionStyle}>
            <h3 style={footerTitleStyle}>{t('contact')}</h3>
            {branchLoading ? (
              <>
                <div style={{ 
                  width: '150px', 
                  height: '16px', 
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  borderRadius: '4px',
                  marginBottom: '8px'
                }} />
                <div style={{ 
                  width: '180px', 
                  height: '16px', 
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  borderRadius: '4px'
                }} />
              </>
            ) : mainBranch ? (
              <>
                <p style={footerTextStyle}>{mainBranch.phone}</p>
                <p style={footerTextStyle}>info@steakz.com</p>
              </>
            ) : (
              <>
                <p style={footerTextStyle}>+46 8 123 456 78</p>
                <p style={footerTextStyle}>info@steakz.com</p>
              </>
            )}
          </div>          <div style={footerSectionStyle}>
            <h3 style={footerTitleStyle}>{t('location')}</h3>
            {branchLoading ? (
              <>
                <div style={{ 
                  width: '140px', 
                  height: '16px', 
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  borderRadius: '4px',
                  marginBottom: '8px'
                }} />
                <div style={{ 
                  width: '200px', 
                  height: '16px', 
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  borderRadius: '4px'
                }} />
              </>            ) : mainBranch ? (
              <>
                <p style={footerTextStyle}>{mainBranch.name}</p>
                <p style={footerTextStyle}>{mainBranch.address}</p>
              </>
            ) : (
              <>
                <p style={footerTextStyle}>{t('mainLocation')}</p>
                <p style={footerTextStyle}>Drottninggatan 123, 111 51 Stockholm, Sweden</p>
              </>
            )}
          </div>
        </div>
        <div style={{ borderTop: '1px solid #34495e', paddingTop: '20px', color: '#95a5a6' }}>
          <p>{t('allRightsReserved')}</p>
        </div>
      </footer>

      <style>
        {`          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </div>
  );
};

export default Home;
