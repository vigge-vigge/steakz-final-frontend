import React, { useEffect, useState } from 'react';
import { getSystemStatistics } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import { useTheme } from '../../context/ThemeContext';
import { useShift } from '../../hooks/useShift';

const CashierHome: React.FC = () => {
  const { settings, t } = useSettings();
  const { isDarkMode } = useTheme();
  const { isActive: shiftActive, startTime: shiftStartTime, duration, startShift, endShift, formatDuration } = useShift();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getSystemStatistics()
      .then(res => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleNewOrder = () => navigate('/cashier/pos');

  return (
    <div className={isDarkMode ? 'dark' : ''} style={{ minHeight: '100vh', backgroundColor: isDarkMode ? '#18181b' : '#f9fafb', padding: '24px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: '1152px', margin: '0 auto' }}>        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: isDarkMode ? '#fbbf24' : '#111827', marginBottom: '8px' }}>{t('cashier')} {t('dashboard')}</h1>
          <p style={{ color: isDarkMode ? '#f3f4f6' : '#6b7280' }}>Welcome back! Here's your today's overview</p>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>Total Sales Today</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
                  ${loading ? '...' : (stats?.revenue?.today?.toFixed(2) ?? '0.00')}
                </p>
              </div>
              <div style={{ width: '48px', height: '48px', backgroundColor: '#d1fae5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg style={{ width: '24px', height: '24px', color: '#059669' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>Completed Orders</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
                  {loading ? '...' : (stats?.orders?.total?.today ?? '0')}
                </p>
              </div>
              <div style={{ width: '48px', height: '48px', backgroundColor: '#dbeafe', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg style={{ width: '24px', height: '24px', color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>              <div>
                <p style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>Shift Status</p>                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
                  {shiftActive ? 'Active' : 'Inactive'}
                </p>
                {shiftActive && shiftStartTime && (
                  <>
                    <p style={{ fontSize: '12px', color: '#6b7280' }}>
                      Started: {new Date(shiftStartTime).toLocaleTimeString()}
                    </p>
                    <p style={{ fontSize: '12px', color: '#6b7280' }}>
                      Duration: {formatDuration(duration)}
                    </p>
                  </>
                )}
              </div>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                backgroundColor: shiftActive ? '#d1fae5' : '#fee2e2', 
                borderRadius: '8px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '50%', 
                  backgroundColor: shiftActive ? '#10b981' : '#ef4444' 
                }}></div>
              </div>
            </div>
          </div>
        </div>        {/* Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '32px' }}>          {!shiftActive ? (
            <button 
              onClick={startShift}
              style={{
                padding: '24px',
                borderRadius: '8px',
                border: '2px dashed #93c5fd',
                backgroundColor: '#eff6ff',
                color: '#1d4ed8',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#dbeafe';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#eff6ff';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span style={{ fontWeight: '600' }}>Start Shift</span>
              </div>
            </button>
          ) : (
            <button 
              onClick={endShift}
              style={{
                padding: '24px',
                borderRadius: '8px',
                border: '2px dashed #fca5a5',
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#fee2e2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#fef2f2';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span style={{ fontWeight: '600' }}>End Shift</span>
              </div>
            </button>
          )}

          <button 
            onClick={handleNewOrder}
            style={{
              padding: '24px',
              borderRadius: '8px',
              border: '2px dashed #fed7aa',
              backgroundColor: '#fff7ed',
              color: '#c2410c',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ffedd5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#fff7ed';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span style={{ fontWeight: '600' }}>New Order</span>
            </div>
          </button>
        </div>

        {/* Quick Actions */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>Quick Actions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px' }}>
            <button 
              onClick={() => navigate('/cashier/orders')}
              style={{
                padding: '16px',
                textAlign: 'center',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                backgroundColor: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f9fafb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              <div style={{ width: '32px', height: '32px', backgroundColor: '#dbeafe', borderRadius: '8px', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg style={{ width: '16px', height: '16px', color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>View Orders</span>
            </button>

            <button 
              onClick={() => navigate('/cashier/pos')}
              style={{
                padding: '16px',
                textAlign: 'center',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                backgroundColor: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f9fafb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              <div style={{ width: '32px', height: '32px', backgroundColor: '#d1fae5', borderRadius: '8px', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg style={{ width: '16px', height: '16px', color: '#059669' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>POS System</span>
            </button>

            <button 
              onClick={() => navigate('/cashier/receipts')}
              style={{
                padding: '16px',
                textAlign: 'center',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                backgroundColor: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f9fafb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              <div style={{ width: '32px', height: '32px', backgroundColor: '#e9d5ff', borderRadius: '8px', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg style={{ width: '16px', height: '16px', color: '#7c3aed' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Receipts</span>
            </button>

            <button 
              onClick={() => navigate('/cashier/settings')}
              style={{
                padding: '16px',
                textAlign: 'center',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                backgroundColor: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f9fafb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              <div style={{ width: '32px', height: '32px', backgroundColor: '#f3f4f6', borderRadius: '8px', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg style={{ width: '16px', height: '16px', color: '#4b5563' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashierHome;
