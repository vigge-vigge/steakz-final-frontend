import React from 'react';
import { FinancialData } from '../../types';
import './FinancialDashboard.css';

interface FinancialDashboardProps {
  financialData: FinancialData | null;
  expanded?: boolean;
}

const FinancialDashboard: React.FC<FinancialDashboardProps> = ({ 
  financialData, 
  expanded = false 
}) => {
  if (!financialData) {
    return (
      <div className="financial-dashboard">
        <div className="section-header">
          <h2>
            <span className="header-icon">💰</span>
            Financial Dashboard
          </h2>
        </div>
        <div className="loading-placeholder">Loading financial data...</div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK'
    }).format(amount);
  };

  const totalRevenue = financialData.dailyRevenue.reduce((sum, day) => sum + (day.revenue || 0), 0);
  const totalOrders = financialData.dailyRevenue.reduce((sum, day) => sum + (day.orders || 0), 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Get payment method totals
  const paymentMethodTotals = financialData.paymentMethods.reduce((acc, method) => {
    acc[method.method] = method._sum.amount || 0;
    return acc;
  }, {} as Record<string, number>);

  const maxDailyRevenue = Math.max(...financialData.dailyRevenue.map(d => d.revenue || 0));

  return (
    <div className="financial-dashboard">
      <div className="section-header">
        <h2>
          <span className="header-icon">💰</span>
          Financial Dashboard
        </h2>
        <div className="financial-summary">
          <span className="summary-item">
            📈 {formatCurrency(totalRevenue)} Total
          </span>
          <span className="summary-item">
            📋 {totalOrders} Orders
          </span>
          <span className="summary-item">
            💳 {formatCurrency(averageOrderValue)} Avg
          </span>
        </div>
      </div>

      <div className="financial-content">
        {/* Revenue Chart */}
        <div className="chart-section">
          <h3>Daily Revenue Trend (Last 7 Days)</h3>
          <div className="revenue-chart">
            {financialData.dailyRevenue.slice(0, 7).reverse().map((day, index) => (
              <div key={index} className="chart-bar">
                <div 
                  className="bar-fill"
                  style={{ 
                    height: `${maxDailyRevenue > 0 ? ((day.revenue || 0) / maxDailyRevenue) * 100 : 0}%` 
                  }}
                  title={`${formatCurrency(day.revenue || 0)} on ${new Date(day.date).toLocaleDateString()}`}
                ></div>
                <div className="bar-label">
                  {new Date(day.date).toLocaleDateString('sv-SE', { weekday: 'short' })}
                </div>
                <div className="bar-value">
                  {formatCurrency(day.revenue || 0)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="payment-methods-section">
          <h3>Payment Methods Distribution</h3>
          <div className="payment-methods">
            {financialData.paymentMethods.map((method, index) => {
              const percentage = totalRevenue > 0 ? ((method._sum.amount || 0) / totalRevenue) * 100 : 0;
              return (
                <div key={index} className="payment-method">
                  <div className="method-info">
                    <span className="method-name">
                      {method.method.replace('_', ' ')}
                    </span>
                    <span className="method-amount">
                      {formatCurrency(method._sum.amount || 0)}
                    </span>
                  </div>
                  <div className="method-bar">
                    <div 
                      className="method-fill"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="method-percentage">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {expanded && (
          <>
            {/* Branch Performance */}
            <div className="branch-performance-section">
              <h3>Branch Revenue Performance</h3>
              <div className="branch-performance">
                {financialData.branchRevenue.map((branch, index) => (
                  <div key={index} className="branch-item">
                    <div className="branch-name">{branch.branchName}</div>
                    <div className="branch-revenue">{formatCurrency(branch.revenue)}</div>
                    <div className="branch-bar">
                      <div 
                        className="branch-fill"
                        style={{ 
                          width: `${totalRevenue > 0 ? (branch.revenue / totalRevenue) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Selling Items */}
            <div className="top-items-section">
              <h3>Top Selling Items</h3>
              <div className="top-items">
                {financialData.topItems.slice(0, 5).map((item, index) => (
                  <div key={index} className="top-item">
                    <div className="item-rank">#{index + 1}</div>
                    <div className="item-info">
                      <div className="item-name">{item.name}</div>
                      <div className="item-stats">
                        {item.totalQuantity} sold • {formatCurrency(item.totalRevenue)}
                      </div>
                    </div>
                    <div className="item-revenue">
                      {formatCurrency(item.totalRevenue)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Financial Metrics Grid */}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon">📊</div>
            <div className="metric-content">
              <div className="metric-label">Total Revenue</div>
              <div className="metric-value">{formatCurrency(totalRevenue)}</div>
              <div className="metric-change positive">+12.5% vs last period</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">🛒</div>
            <div className="metric-content">
              <div className="metric-label">Average Order Value</div>
              <div className="metric-value">{formatCurrency(averageOrderValue)}</div>
              <div className="metric-change positive">+8.3% vs last period</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">📈</div>
            <div className="metric-content">
              <div className="metric-label">Total Orders</div>
              <div className="metric-value">{totalOrders}</div>
              <div className="metric-change neutral">+2.1% vs last period</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">💳</div>
            <div className="metric-content">
              <div className="metric-label">Payment Success Rate</div>
              <div className="metric-value">98.7%</div>
              <div className="metric-change positive">+0.3% vs last period</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboard;
