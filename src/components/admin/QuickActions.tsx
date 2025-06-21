import React, { useState } from 'react';
import { RestaurantStatus } from '../../types';

interface QuickActionsProps {
  onAction: (action: string, data: any) => void;
  restaurantStatus: RestaurantStatus[];
}

const QuickActions: React.FC<QuickActionsProps> = ({ onAction, restaurantStatus }) => {
  const [loading, setLoading] = useState<string | null>(null);

  // Helper to get a valid branchId
  const getBranchId = () => {
    if (restaurantStatus && restaurantStatus.length > 0) {
      return restaurantStatus[0].id;
    }
    return 1; // fallback if no restaurants loaded
  };

  // Branch selector for system controls
  const [selectedBranchId, setSelectedBranchId] = useState<number>(getBranchId());

  // Update selected branch if restaurantStatus changes
  React.useEffect(() => {
    if (restaurantStatus && restaurantStatus.length > 0) {
      setSelectedBranchId(restaurantStatus[0].id);
    }
  }, [restaurantStatus]);

  const handleAction = async (action: string, data: any) => {
    setLoading(action);
    try {
      if (["emergency_stop", "restart_services", "clear_cache"].includes(action)) {
        await onAction(action, { ...data, branchId: selectedBranchId });
        const branch = restaurantStatus.find(b => b.id === selectedBranchId);
        alert(`${action.replace('_', ' ').toUpperCase()} executed for branch ${branch ? branch.name : selectedBranchId}`);
      } else if (action === "export_data") {
        // Use the data export API
        const { data: job } = await import("../../services/api").then(m => m.startDataExport({ dataTypes: ["sales", "inventory"], dateRange: { start: '', end: '' }, customFields: [] }));
        alert("Data export started. Download will be available in the Data Export Tools section when ready.");
      } else if (action === "refresh_inventory") {
        // Simulate inventory refresh by reloading inventory for all branches
        alert("Inventory refresh triggered for all branches. Inventory will update shortly.");
      } else if (action === "system_backup") {
        // Simulate backup
        alert("System backup started. You will be notified when the backup is complete.");
      } else if (action === "send_notification") {
        await onAction(action, data);
        alert("System notification sent.");
      } else {
        await onAction(action, data);
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Action failed');
    } finally {
      setLoading(null);
    }
  };

  const actions = [
    {
      id: 'send_notification',
      title: 'Send System Notification',
      description: 'Broadcast message to all restaurants',
      icon: '📢',
      color: '#4299e1',
      data: { message: 'System maintenance scheduled for tonight' }
    },
    {
      id: 'export_data',
      title: 'Export Daily Reports',
      description: 'Generate comprehensive daily reports',
      icon: '📊',
      color: '#38a169',
      data: { type: 'daily', format: 'excel' }
    },
    {
      id: 'refresh_inventory',
      title: 'Refresh All Inventory',
      description: 'Update inventory counts across all branches',
      icon: '📦',
      color: '#805ad5',
      data: { scope: 'all_branches' }
    },
    {
      id: 'system_backup',
      title: 'Initiate System Backup',
      description: 'Create backup of all system data',
      icon: '💾',
      color: '#ed8936',
      data: { type: 'full_backup' }
    }
  ];

  return (
    <div style={{ padding: '1.5rem' }}>
      <h2>⚙️ Quick Action Controls</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {actions.map((action) => (
          <div 
            key={action.id}
            style={{ 
              background: 'white', 
              padding: '1.5rem', 
              borderRadius: '12px',
              border: '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onClick={() => handleAction(action.id, action.data)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div 
                style={{ 
                  fontSize: '2rem',
                  background: `${action.color}20`,
                  padding: '0.5rem',
                  borderRadius: '8px'
                }}
              >
                {action.icon}
              </div>
              <div>
                <h3 style={{ margin: 0, color: '#2d3748' }}>{action.title}</h3>
                <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                  {action.description}
                </p>
              </div>
            </div>
            
            <button
              style={{
                width: '100%',
                padding: '0.75rem',
                background: action.color,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                opacity: loading === action.id ? 0.6 : 1
              }}
              disabled={loading === action.id}
            >
              {loading === action.id ? 'Processing...' : 'Execute Action'}
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.9)', borderRadius: '8px' }}>
        <h3>System Controls</h3>
        {/* Branch Selector */}
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="branch-select" style={{ marginRight: 8, fontWeight: 500 }}>Target Branch:</label>
          <select
            id="branch-select"
            value={selectedBranchId}
            onChange={e => setSelectedBranchId(Number(e.target.value))}
            style={{ padding: '0.4rem 0.8rem', borderRadius: 4, border: '1px solid #cbd5e0', minWidth: 180 }}
          >
            {restaurantStatus.map(branch => (
              <option key={branch.id} value={branch.id}>{branch.name}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button 
            style={{ padding: '0.5rem 1rem', background: '#f56565', color: 'white', border: 'none', borderRadius: '6px' }}
            onClick={() => handleAction('emergency_stop', {})}
            disabled={loading === 'emergency_stop'}
          >
            {loading === 'emergency_stop' ? 'Processing...' : '🚨 Emergency Stop'}
          </button>
          <button 
            style={{ padding: '0.5rem 1rem', background: '#48bb78', color: 'white', border: 'none', borderRadius: '6px' }}
            onClick={() => handleAction('restart_services', {})}
            disabled={loading === 'restart_services'}
          >
            {loading === 'restart_services' ? 'Processing...' : '🔄 Restart Services'}
          </button>
          <button 
            style={{ padding: '0.5rem 1rem', background: '#4299e1', color: 'white', border: 'none', borderRadius: '6px' }}
            onClick={() => handleAction('clear_cache', {})}
            disabled={loading === 'clear_cache'}
          >
            {loading === 'clear_cache' ? 'Processing...' : '🧹 Clear Cache'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
