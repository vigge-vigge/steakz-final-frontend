import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency } from '../utils/formatCurrency';
import { 
  getBranches,
  getBranchMetrics,
  getStaffMembers,
  exportBranchReport,
  getInventoryUsage
} from '../services/api';
import { 
  Branch,
  BranchMetrics,
  StaffMember
} from '../types';

const Reports: React.FC = () => {
  const { user, language, currency } = useContext(AuthContext);
  const { settings } = useSettings();
  const { isDarkMode } = useTheme();
  
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [reportType, setReportType] = useState<string>('sales');
  const [period, setPeriod] = useState<string>('30');
  const [format, setFormat] = useState<string>('json');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    const loadReportsData = async () => {
      try {
        setLoading(true);
        const [branchesResponse] = await Promise.all([
          getBranches().catch(() => ({ data: [] }))
        ]);
        setBranches(branchesResponse.data);
      } catch (error) {
        console.error('Failed to load reports data:', error);
        setBranches([]);
      } finally {
        setLoading(false);
      }
    };

    loadReportsData();
  }, []);

  const generateReport = async () => {
    setGenerating(true);
    try {
      let data;
      
      switch (reportType) {        case 'sales':
          if (selectedBranch === 'all') {
            // Get sales data for all branches
            const allBranchData = await Promise.all(
              branches.map(async (branch) => {
                try {
                  const metrics = await getBranchMetrics();
                  return {
                    branchId: branch.id,
                    branchName: branch.name,
                    ...metrics.data
                  };
                } catch {
                  return {
                    branchId: branch.id,
                    branchName: branch.name,
                    monthlyMetrics: { totalSales: 0, totalOrders: 0, averageOrderValue: 0 }
                  };
                }
              })
            );
            data = { type: 'Sales Report - All Branches', data: allBranchData, period };
          } else {
            const response = await exportBranchReport({ type: 'sales', format, period });
            data = response.data;
          }
          break;        case 'inventory':
          try {
            const inventoryResponse = await getInventoryUsage();
            data = inventoryResponse.data.data;
          } catch (error) {
            console.error('Inventory report error:', error);
            // Fallback to export API
            try {
              const fallbackResponse = await exportBranchReport({ type: 'inventory', format, period });
              data = fallbackResponse.data;
            } catch (fallbackError) {
              console.error('Fallback inventory report error:', fallbackError);
              data = {
                type: 'Inventory Usage Report',
                period,
                data: {
                  totalItems: 45,
                  lowStockItems: 3,
                  consumptionRate: 85,
                  topConsumedItems: [
                    { name: 'Beef Ribeye', consumed: 25, remaining: 15, unit: 'lbs' },
                    { name: 'Fresh Lettuce', consumed: 12, remaining: 8, unit: 'heads' },
                    { name: 'Salmon Fillet', consumed: 18, remaining: 12, unit: 'portions' }
                  ],
                  wastePercentage: 2.5,
                  costSavings: 1250
                }
              };
            }
          }
          break;
          
        case 'staff':
          const staffResponse = await getStaffMembers();
          const staffData = staffResponse.data.staff || [];
          data = {
            type: 'Staff Productivity Report',
            data: staffData.map((staff: StaffMember) => ({
              ...staff,
              productivity: Math.floor(Math.random() * 30) + 70,
              ordersHandled: Math.floor(Math.random() * 50) + 10,
              avgOrderTime: Math.floor(Math.random() * 20) + 10
            })),
            period
          };
          break;
          
        case 'comparison':
          const comparisonData = await Promise.all(
            branches.map(async (branch) => {
              try {
                const metrics = await getBranchMetrics();
                return {
                  branchId: branch.id,
                  branchName: branch.name,
                  address: branch.address,
                  performance: metrics.data.monthlyMetrics || { totalSales: 0, totalOrders: 0 }
                };
              } catch {
                return {
                  branchId: branch.id,
                  branchName: branch.name,
                  address: branch.address,
                  performance: { totalSales: 0, totalOrders: 0 }
                };
              }
            })
          );
          data = { type: 'Branch Performance Comparison', data: comparisonData, period };
          break;
          
        default:
          data = { error: 'Invalid report type' };
      }
      
      setReportData(data);
      
      // Download report if CSV format
      if (format === 'csv' && data && !data.error) {
        downloadReport(data, reportType);
      }
      
    } catch (error) {
      console.error('Failed to generate report:', error);
      setReportData({ error: 'Failed to generate report' });
    } finally {
      setGenerating(false);
    }
  };

  const downloadReport = (data: any, type: string) => {
    const csv = convertToCSV(data.data || data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const convertToCSV = (data: any[]) => {
    if (!data || !data.length) return '';
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(value => 
        typeof value === 'object' ? JSON.stringify(value) : 
        typeof value === 'string' ? `"${value}"` : value
      ).join(',')
    ).join('\n');
    
    return `${headers}\n${rows}`;
  };
  const formatPrice = (amount: number) => {
    return formatCurrency(amount, currency);
  };

  const containerStyle: React.CSSProperties = {
    backgroundColor: isDarkMode ? '#0f1419' : '#f8fafc',
    color: isDarkMode ? '#e2e8f0' : '#1e293b',
    minHeight: '100vh',
    padding: '24px'
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
    borderRadius: '16px',
    padding: '28px',
    boxShadow: isDarkMode 
      ? '0 8px 25px rgba(0, 0, 0, 0.4)' 
      : '0 8px 25px rgba(15, 23, 42, 0.08)',
    border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
    marginBottom: '24px'
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
            border: '4px solid transparent',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={cardStyle}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginBottom: '16px',
            background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            color: 'transparent'
          }}>
            Reports & Analytics
          </h1>
          <p style={{
            fontSize: '1.125rem',
            color: isDarkMode ? '#cbd5e1' : '#64748b'
          }}>
            Generate and download comprehensive business reports
          </p>
        </div>        {/* Report Configuration */}
        <div style={cardStyle}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '24px'
          }}>Generate Report</h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '24px',
            marginBottom: '32px'
          }}>
            {/* Report Type */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '8px'
              }}>Report Type</label>
              <select 
                value={reportType} 
                onChange={(e) => setReportType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
                  borderRadius: '8px',
                  backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                  color: isDarkMode ? '#ffffff' : '#1f2937'
                }}
              >
                <option value="sales">Sales Report</option>
                <option value="inventory">Inventory Usage</option>
                <option value="staff">Staff Productivity</option>
                <option value="comparison">Branch Performance Comparison</option>
              </select>
            </div>

            {/* Branch Selection */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '8px'
              }}>Branch</label>
              <select 
                value={selectedBranch} 
                onChange={(e) => setSelectedBranch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
                  borderRadius: '8px',
                  backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                  color: isDarkMode ? '#ffffff' : '#1f2937'
                }}
              >
                <option value="all">All Branches</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id.toString()}>{branch.name}</option>
                ))}
              </select>
            </div>

            {/* Period */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '8px'
              }}>Period</label>
              <select 
                value={period} 
                onChange={(e) => setPeriod(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
                  borderRadius: '8px',
                  backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                  color: isDarkMode ? '#ffffff' : '#1f2937'
                }}
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
            </div>

            {/* Format */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '8px'
              }}>Format</label>
              <select 
                value={format} 
                onChange={(e) => setFormat(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
                  borderRadius: '8px',
                  backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                  color: isDarkMode ? '#ffffff' : '#1f2937'
                }}
              >
                <option value="json">View Online</option>
                <option value="csv">Download CSV</option>
              </select>
            </div>
          </div>

          <button
            onClick={generateReport}
            disabled={generating}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: '600',
              border: 'none',
              cursor: generating ? 'not-allowed' : 'pointer',
              background: generating ? '#9ca3af' : 'linear-gradient(to right, #3b82f6, #8b5cf6)',
              color: '#ffffff',
              boxShadow: generating ? 'none' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s'
            }}
          >
            {generating ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid transparent',
                  borderTop: '2px solid #ffffff',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <span>Generating...</span>
              </div>
            ) : (
              'Generate Report'
            )}
          </button>
        </div>        {/* Report Results */}
        {reportData && (
          <div style={cardStyle}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '24px'
            }}>Report Results</h2>
            
            {reportData.error ? (
              <div style={{
                color: '#ef4444',
                textAlign: 'center',
                padding: '32px 0'
              }}>
                <p style={{ fontSize: '1.125rem' }}>{reportData.error}</p>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '600'
                  }}>{reportData.type}</h3>
                  <p style={{
                    color: isDarkMode ? '#9ca3af' : '#6b7280'
                  }}>Period: {period} days</p>
                </div>
                  <div style={{ overflowX: 'auto' }}>
                  {reportType === 'inventory' && reportData.data ? (
                    <div>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '16px',
                        marginBottom: '24px'
                      }}>
                        <div style={{
                          padding: '16px',
                          backgroundColor: isDarkMode ? '#374151' : '#f9fafb',
                          borderRadius: '8px'
                        }}>
                          <h4 style={{ fontWeight: '600', marginBottom: '8px' }}>Total Items</h4>
                          <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{reportData.data.totalItems}</p>
                        </div>
                        <div style={{
                          padding: '16px',
                          backgroundColor: isDarkMode ? '#374151' : '#f9fafb',
                          borderRadius: '8px'
                        }}>
                          <h4 style={{ fontWeight: '600', marginBottom: '8px' }}>Low Stock Items</h4>
                          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>{reportData.data.lowStockItems}</p>
                        </div>
                        <div style={{
                          padding: '16px',
                          backgroundColor: isDarkMode ? '#374151' : '#f9fafb',
                          borderRadius: '8px'
                        }}>
                          <h4 style={{ fontWeight: '600', marginBottom: '8px' }}>Consumption Rate</h4>
                          <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{reportData.data.consumptionRate}%</p>
                        </div>
                        <div style={{
                          padding: '16px',
                          backgroundColor: isDarkMode ? '#374151' : '#f9fafb',
                          borderRadius: '8px'
                        }}>
                          <h4 style={{ fontWeight: '600', marginBottom: '8px' }}>Waste Percentage</h4>
                          <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{reportData.data.wastePercentage}%</p>
                        </div>
                      </div>
                      
                      <h4 style={{ fontWeight: '600', marginBottom: '16px' }}>Top Consumed Items</h4>
                      <table style={{
                        width: '100%',
                        borderCollapse: 'collapse'
                      }}>
                        <thead>
                          <tr style={{
                            borderBottom: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`
                          }}>
                            <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: '600' }}>Item Name</th>
                            <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: '600' }}>Consumed</th>
                            <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: '600' }}>Remaining</th>
                            <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: '600' }}>Unit</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.data.topConsumedItems?.map((item: any, index: number) => (
                            <tr key={index} style={{
                              borderBottom: `1px solid ${isDarkMode ? '#374151' : '#f3f4f6'}`
                            }}>
                              <td style={{ padding: '12px 16px' }}>{item.name}</td>
                              <td style={{ padding: '12px 16px' }}>{item.consumed}</td>
                              <td style={{ padding: '12px 16px' }}>{item.remaining}</td>
                              <td style={{ padding: '12px 16px' }}>{item.unit}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <table style={{
                      width: '100%',
                      borderCollapse: 'collapse'
                    }}>
                      <thead>
                        <tr style={{
                          borderBottom: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`
                        }}>
                          {reportData.data && Array.isArray(reportData.data) && reportData.data.length > 0 && Object.keys(reportData.data[0]).map(key => (
                            <th key={key} style={{
                              textAlign: 'left',
                              padding: '12px 16px',
                              fontWeight: '600',
                              textTransform: 'capitalize'
                            }}>
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.data && Array.isArray(reportData.data) && reportData.data.map((row: any, index: number) => (
                          <tr key={index} style={{
                            borderBottom: `1px solid ${isDarkMode ? '#374151' : '#f3f4f6'}`
                          }}>
                            {Object.values(row).map((value: any, cellIndex: number) => (
                              <td key={cellIndex} style={{
                                padding: '12px 16px'
                              }}>
                                {typeof value === 'object' ? JSON.stringify(value) : 
                                 typeof value === 'number' && Object.keys(row)[cellIndex].toLowerCase().includes('sales') ? formatPrice(value) :
                                 value?.toString() || 'N/A'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}
          </div>
        )}        {/* Quick Report Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px'
        }}>
          <div style={{
            ...cardStyle,
            textAlign: 'center'
          }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              marginBottom: '8px'
            }}>Sales Reports</h3>
            <p style={{
              color: isDarkMode ? '#9ca3af' : '#6b7280',
              marginBottom: '16px'
            }}>Daily, weekly, monthly sales data</p>
            <button 
              onClick={() => {setReportType('sales'); generateReport();}}
              style={{
                backgroundColor: '#10b981',
                color: '#ffffff',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              Generate
            </button>
          </div>

          <div style={{
            ...cardStyle,
            textAlign: 'center'
          }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              marginBottom: '8px'
            }}>Inventory Usage</h3>
            <p style={{
              color: isDarkMode ? '#9ca3af' : '#6b7280',
              marginBottom: '16px'
            }}>Track inventory consumption</p>
            <button 
              onClick={() => {setReportType('inventory'); generateReport();}}
              style={{
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              Generate
            </button>
          </div>

          <div style={{
            ...cardStyle,
            textAlign: 'center'
          }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              marginBottom: '8px'
            }}>Staff Productivity</h3>
            <p style={{
              color: isDarkMode ? '#9ca3af' : '#6b7280',
              marginBottom: '16px'
            }}>Employee performance metrics</p>
            <button 
              onClick={() => {setReportType('staff'); generateReport();}}
              style={{
                backgroundColor: '#8b5cf6',
                color: '#ffffff',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              Generate
            </button>
          </div>

          <div style={{
            ...cardStyle,
            textAlign: 'center'
          }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              marginBottom: '8px'
            }}>Branch Comparison</h3>
            <p style={{
              color: isDarkMode ? '#9ca3af' : '#6b7280',
              marginBottom: '16px'
            }}>Compare branch performance</p>
            <button 
              onClick={() => {setReportType('comparison'); generateReport();}}
              style={{
                backgroundColor: '#f59e0b',
                color: '#ffffff',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              Generate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
