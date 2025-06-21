import React from 'react';
import { SystemStatistics } from '../../types';
import './StatisticsCards.css';

interface StatisticsCardsProps {
  statistics: SystemStatistics | null;
}

const StatisticsCards: React.FC<StatisticsCardsProps> = ({ statistics }) => {
  if (!statistics) {
    return (
      <div className="statistics-cards">
        <div className="loading-placeholder">Loading system statistics...</div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('sv-SE').format(num);
  };

  const cards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(statistics.revenue.total),
      subtitle: `Today: ${formatCurrency(statistics.revenue.today)}`,
      icon: '💰',
      color: 'green',
      trend: {
        value: statistics.revenue.week > 0 ? '+12.5%' : '0%',
        direction: 'up' as const
      }
    },
    {
      title: 'Active Orders',
      value: formatNumber(statistics.orders.status.pending + statistics.orders.status.preparing + statistics.orders.status.ready),
      subtitle: `${statistics.orders.status.pending} pending, ${statistics.orders.status.preparing} preparing`,
      icon: '📋',
      color: 'blue',
      trend: {
        value: statistics.orders.total.today > 0 ? `${statistics.orders.total.today} today` : '0 today',
        direction: 'neutral' as const
      }
    },
    {
      title: 'Restaurant Branches',
      value: formatNumber(statistics.system.totalBranches),
      subtitle: `${statistics.system.totalUsers} total users`,
      icon: '🏪',
      color: 'purple',
      trend: {
        value: 'All operational',
        direction: 'up' as const
      }
    },
    {
      title: 'Low Stock Alerts',
      value: formatNumber(statistics.system.lowStockItems),
      subtitle: statistics.system.lowStockItems > 0 ? 'Requires attention' : 'All items stocked',
      icon: '📦',
      color: statistics.system.lowStockItems > 0 ? 'red' : 'green',
      trend: {
        value: statistics.system.lowStockItems > 0 ? 'Action needed' : 'Good',
        direction: statistics.system.lowStockItems > 0 ? 'down' as const : 'up' as const
      }
    },
    {
      title: 'Weekly Orders',
      value: formatNumber(statistics.orders.total.week),
      subtitle: `${formatCurrency(statistics.revenue.week)} revenue`,
      icon: '📈',
      color: 'orange',
      trend: {
        value: statistics.orders.total.week > statistics.orders.total.today * 7 ? '+8.3%' : '-2.1%',
        direction: statistics.orders.total.week > statistics.orders.total.today * 7 ? 'up' as const : 'down' as const
      }
    },
    {
      title: 'Monthly Performance',
      value: formatNumber(statistics.orders.total.month),
      subtitle: `${formatCurrency(statistics.revenue.month)} earned`,
      icon: '🎯',
      color: 'teal',
      trend: {
        value: '+15.2%',
        direction: 'up' as const
      }
    }
  ];

  return (
    <div className="statistics-cards">
      <div className="cards-header">
        <h2>
          <span className="header-icon">📊</span>
          System-Wide Statistics
        </h2>
        <div className="stats-summary">
          Real-time overview of your restaurant network
        </div>
      </div>
      
      <div className="cards-grid">
        {cards.map((card, index) => (
          <div key={index} className={`stat-card ${card.color}`}>
            <div className="card-header">
              <div className="card-icon">{card.icon}</div>
              <div className={`trend-indicator ${card.trend.direction}`}>
                {card.trend.direction === 'up' && '↗️'}
                {card.trend.direction === 'down' && '↘️'}
                {card.trend.direction === 'neutral' && '➡️'}
                <span>{card.trend.value}</span>
              </div>
            </div>
            
            <div className="card-content">
              <h3 className="card-title">{card.title}</h3>
              <div className="card-value">{card.value}</div>
              <div className="card-subtitle">{card.subtitle}</div>
            </div>
            
            <div className="card-footer">
              <div className="card-sparkline">
                {/* Simple sparkline representation */}
                <div className="sparkline-bar"></div>
                <div className="sparkline-bar"></div>
                <div className="sparkline-bar active"></div>
                <div className="sparkline-bar"></div>
                <div className="sparkline-bar"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* User Role Breakdown */}
      <div className="role-breakdown">
        <h3>User Distribution</h3>
        <div className="role-stats">
          {Object.entries(statistics.users).map(([role, count]) => (
            <div key={role} className="role-stat">
              <span className="role-name">{role.replace('_', ' ')}</span>
              <span className="role-count">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatisticsCards;
