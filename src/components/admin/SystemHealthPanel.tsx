import React from 'react';
import { SystemHealth } from '../../types';

interface SystemHealthPanelProps {
  systemHealth: SystemHealth | null;
}

const SystemHealthPanel: React.FC<SystemHealthPanelProps> = ({ systemHealth }) => {
  if (!systemHealth) {
    return <div>Loading system health...</div>;
  }

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatMemory = (bytes: number) => {
    return `${Math.round(bytes / 1024 / 1024)}MB`;
  };

  return (
    <div className="system-health-panel" style={{ padding: '1.5rem' }}>
      <h2>🔍 System Health Monitoring</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
        <div style={{ background: 'white', padding: '1rem', borderRadius: '8px' }}>
          <h3>Database</h3>
          <p>Status: {systemHealth.database.status}</p>
          <p>Query Time: {systemHealth.database.queryTime.toFixed(2)}ms</p>
          <p>Connections: {systemHealth.database.connectionCount}</p>
        </div>

        <div style={{ background: 'white', padding: '1rem', borderRadius: '8px' }}>
          <h3>System</h3>
          <p>Uptime: {formatUptime(systemHealth.system.uptime)}</p>
          <p>Memory: {formatMemory(systemHealth.system.memoryUsage.heapUsed)}</p>
          <p>CPU User: {systemHealth.system.cpuUsage.user}</p>
        </div>

        <div style={{ background: 'white', padding: '1rem', borderRadius: '8px' }}>
          <h3>Application</h3>
          <p>Users: {systemHealth.application.totalUsers}</p>
          <p>Active Orders: {systemHealth.application.activeOrders}</p>
          <p>Failed Payments: {systemHealth.application.failedPaymentsToday}</p>
          <p>Avg Response: {systemHealth.application.averageResponseTime}ms</p>
        </div>
      </div>
    </div>
  );
};

export default SystemHealthPanel;
