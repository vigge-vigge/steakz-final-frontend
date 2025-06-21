import React from 'react';
import { PerformanceAnalytics } from '../../types';

interface PerformanceChartsProps {
  performanceData: PerformanceAnalytics | null;
}

// Utility to safely format numbers for charts and stats
function safeToFixed(val: any, digits = 1) {
  const num = typeof val === 'number' && !isNaN(val) ? val : 0;
  return num.toFixed(digits);
}

const PerformanceCharts: React.FC<PerformanceChartsProps> = ({ performanceData }) => {
  if (!performanceData) {
    return <div style={{ padding: '1.5rem' }}>Loading performance data...</div>;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(amount);
  };

  const maxRevenue = Math.max(...performanceData.branchPerformance.map(b => b.totalRevenue));

  return (
    <div style={{ padding: '1.5rem' }}>
      <h2>📈 Performance Analytics</h2>
      {/* Order Metrics Summary */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4299e1' }}>
            {safeToFixed(performanceData.orderMetrics.avgCompletionTime, 1)}min
          </div>
          <div style={{ color: '#64748b' }}>Avg Completion Time</div>
        </div>
        
        <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#38a169' }}>
            {performanceData.orderMetrics.completedOrders || 0}
          </div>
          <div style={{ color: '#64748b' }}>Completed Orders</div>
        </div>
        
        <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ed8936' }}>
            {performanceData.orderMetrics.totalOrders || 0}
          </div>
          <div style={{ color: '#64748b' }}>Total Orders</div>
        </div>
        
        <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#e53e3e' }}>
            {performanceData.orderMetrics.cancelledOrders || 0}
          </div>
          <div style={{ color: '#64748b' }}>Cancelled Orders</div>
        </div>
      </div>

      {/* Branch Performance Chart */}
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <h3>Branch Performance Comparison</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {performanceData.branchPerformance.map((branch, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ minWidth: '150px', fontWeight: 'bold' }}>
                {branch.branchName}
              </div>
              <div style={{ flex: 1, background: '#f1f5f9', borderRadius: '4px', height: '24px', position: 'relative' }}>
                <div 
                  style={{ 
                    background: '#4299e1', 
                    height: '100%', 
                    borderRadius: '4px',
                    width: `${maxRevenue > 0 ? (branch.totalRevenue / maxRevenue) * 100 : 0}%`,
                    transition: 'width 0.5s ease'
                  }}
                ></div>
              </div>
              <div style={{ minWidth: '100px', textAlign: 'right' }}>
                {formatCurrency(branch.totalRevenue)}
              </div>
              <div style={{ minWidth: '80px', textAlign: 'right', color: '#64748b' }}>
                {branch.totalOrders} orders
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Peak Hours Chart */}
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px' }}>
        <h3>Peak Hours Analysis</h3>
        <div style={{ display: 'flex', alignItems: 'end', gap: '4px', height: '200px', padding: '1rem 0' }}>
          {Array.from({ length: 24 }, (_, hour) => {
            const hourData = performanceData.peakHours.find(h => h.hour === hour);
            const orderCount = hourData?.orderCount || 0;
            const maxOrders = Math.max(...performanceData.peakHours.map(h => h.orderCount || 0));
            const height = maxOrders > 0 ? (orderCount / maxOrders) * 100 : 0;
            
            return (
              <div key={hour} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <div 
                  style={{ 
                    background: orderCount > maxOrders * 0.7 ? '#e53e3e' : orderCount > maxOrders * 0.4 ? '#ed8936' : '#4299e1',
                    width: '100%',
                    height: `${height}%`,
                    borderRadius: '2px 2px 0 0',
                    minHeight: orderCount > 0 ? '4px' : '0'
                  }}
                  title={`${hour}:00 - ${orderCount} orders`}
                ></div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                  {hour}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
          Hour of Day (0-23) • Peak hours shown in red
        </div>
      </div>
    </div>
  );
};

export default PerformanceCharts;
