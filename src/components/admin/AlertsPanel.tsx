import React from 'react';
import { SystemAlert } from '../../types';

interface AlertsPanelProps {
  alerts: SystemAlert[];
  onDismiss: () => void;
}

const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts, onDismiss }) => {
  const getAlertColor = (type: string, priority: string) => {
    if (priority === 'high') return '#e53e3e';
    if (type === 'error') return '#e53e3e';
    if (type === 'warning') return '#ed8936';
    return '#4299e1';
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  if (alerts.length === 0) return null;

  return (
    <div style={{ 
      background: 'rgba(255, 255, 255, 0.95)', 
      padding: '1rem 2rem', 
      borderBottom: '1px solid rgba(0,0,0,0.1)',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, color: '#2d3748', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🔔 System Alerts ({alerts.length})
        </h3>
        <button 
          onClick={onDismiss}
          style={{ 
            background: 'none', 
            border: '1px solid #cbd5e0', 
            padding: '0.5rem 1rem', 
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Refresh
        </button>
      </div>
      
      <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {alerts.slice(0, 5).map((alert) => (
          <div 
            key={alert.id}
            style={{ 
              background: 'white',
              padding: '1rem',
              borderRadius: '8px',
              minWidth: '300px',
              borderLeft: `4px solid ${getAlertColor(alert.type, alert.priority)}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.2rem' }}>{getAlertIcon(alert.type)}</span>
              <div style={{ fontWeight: 'bold', color: getAlertColor(alert.type, alert.priority) }}>
                {alert.title}
              </div>
              <span style={{ 
                background: getAlertColor(alert.type, alert.priority),
                color: 'white',
                padding: '0.2rem 0.5rem',
                borderRadius: '12px',
                fontSize: '0.7rem',
                fontWeight: 'bold'
              }}>
                {alert.priority.toUpperCase()}
              </span>
            </div>
            <div style={{ fontSize: '0.9rem', color: '#4a5568', marginBottom: '0.5rem' }}>
              {alert.message}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              {new Date(alert.timestamp).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
      
      {alerts.length > 5 && (
        <div style={{ textAlign: 'center', marginTop: '1rem', color: '#64748b' }}>
          Showing 5 of {alerts.length} alerts
        </div>
      )}
    </div>
  );
};

export default AlertsPanel;
