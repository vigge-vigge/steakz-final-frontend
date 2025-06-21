import React, { useState } from 'react';
import * as api from '../../services/api';

const DataExportTools: React.FC = () => {
  const [exportStatus, setExportStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const exportOptions = [
    {
      id: 'daily_sales',
      name: 'Daily Sales Report',
      description: 'Orders, revenue, and payment data for today',
      icon: '📊'
    },
    {
      id: 'inventory_report',
      name: 'Inventory Status',
      description: 'Current stock levels across all branches',
      icon: '📦'
    },
    {
      id: 'customer_data',
      name: 'Customer Analytics',
      description: 'Customer orders and preferences',
      icon: '👥'
    },
    {
      id: 'financial_summary',
      name: 'Financial Summary',
      description: 'Revenue breakdown by branch and payment method',
      icon: '💰'
    }
  ];

  const handleExport = async (exportType: string) => {
    setLoading(true);
    setExportStatus('Preparing export...');
    
    try {
      const response = await api.startDataExport({
        type: exportType,
        format: 'excel',
        dateRange: 'today'
      });
      
      setExportStatus('Export completed successfully!');
      
      // In a real implementation, you would handle the file download here
      setTimeout(() => {
        setExportStatus('');
      }, 3000);
      
    } catch (error) {
      setExportStatus('Export failed. Please try again.');
      setTimeout(() => {
        setExportStatus('');
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '1.5rem' }}>
      <h2>📋 Data Export Tools</h2>
      
      {exportStatus && (
        <div style={{ 
          background: exportStatus.includes('failed') ? '#fed7d7' : '#c6f6d5',
          color: exportStatus.includes('failed') ? '#e53e3e' : '#38a169',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          {exportStatus}
        </div>
      )}
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {exportOptions.map((option) => (
          <div 
            key={option.id}
            style={{ 
              background: 'white', 
              padding: '1.5rem', 
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '2rem' }}>{option.icon}</div>
              <div>
                <h3 style={{ margin: 0, color: '#2d3748' }}>{option.name}</h3>
                <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                  {option.description}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => handleExport(option.id)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: loading ? '#a0aec0' : '#4299e1',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Exporting...' : 'Export Data'}
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.9)', borderRadius: '8px' }}>
        <h3>Scheduled Exports</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: '#f7fafc', borderRadius: '6px' }}>
            <div style={{ fontWeight: 'bold' }}>Daily Reports</div>
            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Automated at 6:00 AM</div>
            <div style={{ fontSize: '0.8rem', color: '#38a169' }}>✅ Active</div>
          </div>
          
          <div style={{ padding: '1rem', background: '#f7fafc', borderRadius: '6px' }}>
            <div style={{ fontWeight: 'bold' }}>Weekly Summary</div>
            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Every Monday 8:00 AM</div>
            <div style={{ fontSize: '0.8rem', color: '#38a169' }}>✅ Active</div>
          </div>
          
          <div style={{ padding: '1rem', background: '#f7fafc', borderRadius: '6px' }}>
            <div style={{ fontWeight: 'bold' }}>Monthly Analysis</div>
            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>1st of each month</div>
            <div style={{ fontSize: '0.8rem', color: '#38a169' }}>✅ Active</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataExportTools;
