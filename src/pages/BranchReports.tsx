import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  getBranchMetrics,
  getBranchSalesReport,
  getBranchStaffPerformance,
  getBranchOrderAnalytics,
  exportBranchReport
} from '../services/api';

interface ReportData {
  totalSales?: number;
  dailySales?: number;
  weeklySales?: number;
  monthlySales?: number;
  totalOrders?: number;
  pendingOrders?: number;
  completedOrders?: number;
  averageOrderValue?: number;
  topItems: Array<{ name: string; count: number; revenue: number }>;
  hourlyData: Array<{ hour: string; orders: number; revenue: number }>;
  totalStaff?: number;
  staffOnShift?: number;
  staffByRole?: { CHEF: number; CASHIER: number };
  lowStockItems?: number;
  averagePreparationTime?: number;
}

interface BranchMetrics {
  ordersToday: number;
  avgRating: number;
  staffOnShift: number;
  lowStockItems: number;
}

const BranchReports: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [reportData, setReportData] = useState<ReportData>({
    topItems: [],
    hourlyData: []
  });
  const [metrics, setMetrics] = useState<BranchMetrics | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [reportType, setReportType] = useState('sales');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const metricsResponse = await getBranchMetrics();
      setMetrics(metricsResponse.data);
      
      let salesData = null;
      let staffData = null;
      let analyticsData = null;
      
      if (reportType === 'sales' || reportType === 'orders') {
        const salesResponse = await getBranchSalesReport({ period: selectedPeriod });
        salesData = salesResponse.data;
      }
      
      if (reportType === 'staff') {
        const staffResponse = await getBranchStaffPerformance({ period: selectedPeriod });
        staffData = staffResponse.data;
      }
      
      if (reportType === 'orders') {
        const analyticsResponse = await getBranchOrderAnalytics({ period: selectedPeriod });
        analyticsData = analyticsResponse.data;
      }
      
      setReportData({
        totalSales: salesData?.totalSales || 0,
        totalOrders: salesData?.totalOrders || metricsResponse.data?.ordersToday || 0,
        averageOrderValue: salesData?.averageOrderValue || 0,
        pendingOrders: analyticsData?.pendingOrders || 0,
        completedOrders: analyticsData?.completedOrders || 0,
        topItems: salesData?.topItems || [],
        hourlyData: salesData?.hourlyData || [],
        totalStaff: staffData?.totalStaff || 0,
        staffOnShift: staffData?.staffOnShift || metricsResponse.data?.staffOnShift || 0,
        staffByRole: staffData?.staffByRole || { CHEF: 0, CASHIER: 0 },
        lowStockItems: metricsResponse.data?.lowStockItems || 0,
        averagePreparationTime: analyticsData?.averagePreparationTime || 0
      });
      
    } catch (error) {
      console.error('Failed to fetch report data:', error);
      setError('Failed to load report data. Please try again.');
      setReportData({
        topItems: [],
        hourlyData: []
      });
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod, reportType]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleGenerateReport = () => {
    fetchData();
  };

  const handleExportReport = async (format: string) => {
    try {
      await exportBranchReport({ 
        type: reportType, 
        format, 
        period: selectedPeriod 
      });
      alert('Report export initiated');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '24px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Header Section */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              backgroundColor: '#6366f1', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              📊
            </div>
            <h1 style={{ 
              fontSize: '28px', 
              fontWeight: '700', 
              color: '#1e293b',
              margin: 0
            }}>
              Branch Reports
            </h1>
          </div>
          <p style={{ 
            color: '#64748b', 
            fontSize: '16px',
            margin: 0
          }}>
            Manage your branch performance and analytics across all restaurant operations
          </p>
          {error && (
            <div style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              color: '#dc2626'
            }}>
              {error}
            </div>
          )}
        </div>        {/* Branch Overview Section */}
        <div style={{
          backgroundColor: '#e0f2fe',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          border: '1px solid #b3e5fc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ 
              fontSize: '18px'
            }}>
              📊
            </div>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: '#1e293b',
              margin: 0
            }}>
              Branch Overview
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ 
                fontSize: '32px', 
                fontWeight: '700', 
                color: '#0ea5e9',
                marginBottom: '4px'
              }}>
                {reportType === 'sales' 
                  ? formatCurrency(reportData.totalSales || 0)
                  : (reportData.totalOrders || metrics?.ordersToday || 0)
                }
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: '#64748b',
                marginBottom: '4px'
              }}>
                {reportType === 'sales' ? 'Total Sales' : 'Total Orders'}
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: '#0ea5e9'
              }}>
                {selectedPeriod === 'today' ? 'today' : `this ${selectedPeriod}`}
              </div>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ 
                fontSize: '32px', 
                fontWeight: '700', 
                color: '#0ea5e9',
                marginBottom: '4px'
              }}>
                {reportData.pendingOrders || 0}
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: '#64748b',
                marginBottom: '4px'
              }}>
                Active Orders
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: '#64748b'
              }}>
                currently active
              </div>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ 
                fontSize: '32px', 
                fontWeight: '700', 
                color: '#0ea5e9',
                marginBottom: '4px'
              }}>
                {reportData.staffOnShift || metrics?.staffOnShift || 0}
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: '#64748b',
                marginBottom: '4px'
              }}>
                Staff On Shift
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: '#64748b'
              }}>
                active members
              </div>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ 
                fontSize: '32px', 
                fontWeight: '700', 
                color: '#f59e0b',
                marginBottom: '4px'
              }}>
                {reportData.lowStockItems || metrics?.lowStockItems || 0}
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: '#64748b',
                marginBottom: '4px'
              }}>
                Inventory Alerts
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: '#f59e0b'
              }}>
                items low in stock
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div style={{
          backgroundColor: '#e6fffa',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          border: '1px solid #a7f3d0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ 
              fontSize: '18px'
            }}>
              ⚡
            </div>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: '#1e293b',
              margin: 0
            }}>
              Quick Actions
            </h2>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'end' }}>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#374151',
                marginBottom: '8px'
              }}>
                Time Period
              </label>
              <select 
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                disabled={loading}
                style={{
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  color: '#374151',
                  outline: 'none',
                  minWidth: '140px'
                }}
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
            </div>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#374151',
                marginBottom: '8px'
              }}>
                Report Type
              </label>
              <select 
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                disabled={loading}
                style={{
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  color: '#374151',
                  outline: 'none',
                  minWidth: '140px'
                }}
              >
                <option value="sales">Sales Report</option>
                <option value="orders">Order Report</option>
                <option value="inventory">Inventory Report</option>
                <option value="staff">Staff Report</option>
              </select>
            </div>
            <div>
              <button 
                onClick={handleGenerateReport}
                disabled={loading}
                style={{
                  backgroundColor: loading ? '#93c5fd' : '#3b82f6',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = '#2563eb';
                  }
                }}
                onMouseOut={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = '#3b82f6';
                  }
                }}
              >
                {loading ? 'Loading...' : 'Refresh Data'}
              </button>
            </div>
          </div>
        </div>        {/* Report Details Section */}
        <div style={{
          backgroundColor: '#e0f2fe',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          border: '1px solid #b3e5fc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                fontSize: '18px'
              }}>
                📊
              </div>
              <h2 style={{ 
                fontSize: '20px', 
                fontWeight: '600', 
                color: '#1e293b',
                margin: 0
              }}>
                Report Details
              </h2>
            </div>
            <button 
              style={{
                backgroundColor: 'transparent',
                color: '#0ea5e9',
                border: '1px solid #0ea5e9',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
              onClick={handleGenerateReport}
            >
              🔄 Refresh
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
            {/* Top Selling Items */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ 
                fontSize: '18px',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '16px'
              }}>
                Top Selling Items
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {reportData.topItems.length > 0 ? (
                  reportData.topItems.map((item, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          backgroundColor: '#dbeafe',
                          color: '#1e40af',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          #{index + 1}
                        </div>
                        <div>
                          <p style={{ 
                            fontWeight: '500', 
                            color: '#1e293b',
                            margin: 0,
                            marginBottom: '2px'
                          }}>
                            {item.name}
                          </p>
                          <p style={{ 
                            fontSize: '12px', 
                            color: '#64748b',
                            margin: 0
                          }}>
                            {item.count} orders
                          </p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ 
                          fontWeight: '600', 
                          color: '#059669',
                          margin: 0
                        }}>
                          {formatCurrency(item.revenue)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ 
                    color: '#64748b', 
                    textAlign: 'center',
                    margin: '20px 0'
                  }}>
                    No data available
                  </p>
                )}
              </div>
            </div>

            {/* Hourly Performance */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ 
                fontSize: '18px',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '16px'
              }}>
                Hourly Performance
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {reportData.hourlyData.length > 0 ? (
                  reportData.hourlyData.map((hour, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          backgroundColor: '#ede9fe',
                          color: '#7c3aed',
                          padding: '4px 8px',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}>
                          {hour.hour}
                        </div>
                        <div>
                          <p style={{ 
                            fontSize: '12px', 
                            color: '#64748b',
                            margin: 0
                          }}>
                            {hour.orders} orders
                          </p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ 
                          fontWeight: '600', 
                          color: '#059669',
                          margin: 0
                        }}>
                          {formatCurrency(hour.revenue)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ 
                    color: '#64748b', 
                    textAlign: 'center',
                    margin: '20px 0'
                  }}>
                    No data available
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>        {/* Export Section */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ 
            fontSize: '18px',
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '16px'
          }}>
            Export Reports
          </h3>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            alignItems: 'center', 
            justifyContent: 'space-between', 
            gap: '16px' 
          }}>
            <div>
              <p style={{ 
                color: '#64748b',
                margin: 0
              }}>
                Download detailed reports in various formats
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => handleExportReport('pdf')}
                style={{
                  backgroundColor: '#059669',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#047857';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#059669';
                }}
              >
                Export PDF
              </button>
              <button 
                onClick={() => handleExportReport('csv')}
                style={{
                  backgroundColor: '#2563eb',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#1d4ed8';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                }}
              >
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchReports;
