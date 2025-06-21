import React, { useEffect, useState } from 'react';
import { getBranchesPublic } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import { Branch } from '../types';

const BranchesPage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { t } = useSettings();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [selectedPhone, setSelectedPhone] = useState('');  const refreshBranches = () => {
    setLoading(true);
    getBranchesPublic()
      .then(res => setBranches(res.data))
      .catch(err => setError(err.response?.data?.message || 'Failed to load branches'))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    refreshBranches();
    
    // Auto-refresh every 30 seconds to show newly created branches
    const interval = setInterval(() => {
      getBranchesPublic()
        .then(res => setBranches(res.data))
        .catch(() => {}); // Silent fail for background refresh
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
  const openMap = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  const handleCall = (phone: string) => {
    setSelectedPhone(phone);
    setShowPhoneModal(true);
  };
  if (loading) return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: isDarkMode ? '#0f0f0f' : '#f9fafb', 
      color: isDarkMode ? '#ffffff' : '#000000',
      padding: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      Loading branches...
    </div>
  );
  
  if (error) return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: isDarkMode ? '#0f0f0f' : '#f9fafb', 
      color: isDarkMode ? '#ff6b6b' : '#dc2626',
      padding: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      Error: {error}
    </div>
  );
  return (    <div style={{ minHeight: '100vh', backgroundColor: isDarkMode ? '#0f0f0f' : '#f9fafb', padding: '24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: isDarkMode ? '#ffffff' : '#111827', marginBottom: '8px' }}>
              {t('ourBranches')}
            </h1>
            <p style={{ color: isDarkMode ? '#cccccc' : '#6b7280' }}>
              {t('branchesSubtext')}
            </p>
          </div>
          <button 
            onClick={refreshBranches} 
            disabled={loading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            {loading ? 'Refreshing...' : '🔄 Refresh'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {branches.map(branch => (
            <div 
              key={branch.id}
              style={{
                backgroundColor: isDarkMode ? '#1a1a1a' : 'white',
                borderRadius: '8px',
                boxShadow: isDarkMode ? '0 1px 3px rgba(255,255,255,0.1)' : '0 1px 3px rgba(0,0,0,0.1)',
                border: isDarkMode ? '1px solid #333' : '1px solid #e5e7eb',
                padding: '24px'
              }}
            >              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: isDarkMode ? '#ffffff' : '#111827', margin: 0 }}>
                  {branch.name}
                </h3>
                <button
                  onClick={() => openMap(branch.address)}
                  style={{
                    padding: '8px',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}                  title={t('viewOnMap')}
                >
                  <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '14px', color: isDarkMode ? '#cccccc' : '#6b7280', margin: '4px 0' }}>
                  <strong>{t('address')}:</strong> {branch.address}
                </p>
                <p style={{ fontSize: '14px', color: isDarkMode ? '#cccccc' : '#6b7280', margin: '4px 0' }}>
                  <strong>{t('phone')}:</strong> {branch.phone}
                </p>
                {branch.manager && (
                  <p style={{ fontSize: '14px', color: isDarkMode ? '#cccccc' : '#6b7280', margin: '4px 0' }}>
                    <strong>{t('manager')}:</strong> {branch.manager.username}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => openMap(branch.address)}
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    backgroundColor: '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}                >
                  {t('viewOnMap')}
                </button><button
                  onClick={() => handleCall(branch.phone)}
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    backgroundColor: '#7c3aed',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}                >
                  {t('call')}
                </button>
              </div>
            </div>          ))}
        </div>

        {/* Phone Modal */}
        {showPhoneModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '24px',
              maxWidth: '400px',
              width: '90%',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>Branch Phone Number</h3>
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#2563eb',
                textAlign: 'center',
                padding: '16px',
                backgroundColor: '#f3f4f6',
                borderRadius: '6px',
                marginBottom: '16px',
                border: '2px solid #e5e7eb'
              }}>
                {selectedPhone}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedPhone);
                    alert('Phone number copied to clipboard!');
                  }}
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    backgroundColor: '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Copy Number
                </button>
                <button
                  onClick={() => window.open(`tel:${selectedPhone}`, '_self')}
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Call Now
                </button>
                <button
                  onClick={() => setShowPhoneModal(false)}
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BranchesPage;
