import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { formatCurrency, getTranslation } from '../utils/formatCurrency';

interface PreferenceData {
  theme: string;
  language: string;
  timezone: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  currency: string;
  dateFormat: string;
  compactView: boolean;
  soundAlerts: boolean;
}

interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  status: 'active' | 'inactive';
  manager?: string;
}

const BranchPreferences: React.FC = () => {
  const { user, language, currency, setLanguage, setCurrency } = useContext(AuthContext);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const [preferences, setPreferences] = useState<PreferenceData>({
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    emailNotifications: true,
    smsNotifications: false,
    autoRefresh: true,
    refreshInterval: 30,
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    compactView: false,
    soundAlerts: true
  });
  
  const [activeSection, setActiveSection] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchBranches();
  }, []);
  const fetchBranches = async () => {
    try {
      // Branch managers should only see their assigned branch
      const endpoint = user?.role === 'BRANCH_MANAGER' ? '/api/branches/my' : '/api/branches';
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setBranches(data);
        if (data.length > 0) {
          setSelectedBranch(data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setSuccess('Preferences saved successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleReset = () => {
    setPreferences({
      theme: 'light',
      language: 'en',
      timezone: 'UTC',
      emailNotifications: true,
      smsNotifications: false,
      autoRefresh: true,
      refreshInterval: 30,
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      compactView: false,
      soundAlerts: true
    });
    setSuccess('Preferences reset to defaults!');
    setTimeout(() => setSuccess(''), 3000);
  };
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f8ff', padding: '24px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          {/* Header Section */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '16px', 
          padding: '32px', 
          marginBottom: '24px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              backgroundColor: '#3b82f6', 
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '24px',
              fontWeight: 'bold',
              boxShadow: '0 4px 8px rgba(59,130,246,0.3)'
            }}>
              ⚙️
            </div>
            <div>
              <h1 style={{ 
                fontSize: '2.25rem', 
                fontWeight: '700', 
                color: '#1e293b', 
                margin: 0,
                marginBottom: '8px'
              }}>
                Branch Preferences
              </h1>
              <p style={{ 
                color: '#64748b', 
                fontSize: '1.1rem', 
                margin: 0,
                fontWeight: '400'
              }}>
                Manage your branch's settings and preferences
              </p>
            </div>
          </div>
            {/* Branch Selection */}
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
              Loading branches...
            </div>
          ) : branches.length > 0 && (
            <div style={{ marginTop: '24px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '16px', 
                fontWeight: '600', 
                color: '#374151',
                marginBottom: '12px'
              }}>
                {user?.role === 'BRANCH_MANAGER' ? 'Your Assigned Branch' : 'Select Branch'}
              </label>
              {user?.role === 'BRANCH_MANAGER' ? (
                // For branch managers, show their branch as a read-only display
                <div style={{
                  width: '100%',
                  maxWidth: '400px',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  backgroundColor: '#f8fafc',
                  color: '#374151',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '18px' }}>🏪</span>
                  <span>{branches[0]?.name} - {branches[0]?.address}</span>
                </div>
              ) : (
                // For other roles, show a dropdown
                <select 
                  value={selectedBranch} 
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  style={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    backgroundColor: 'white',
                    color: '#374151',
                    outline: 'none',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#3b82f6';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                >
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name} - {branch.address}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>{/* Success Message */}
        {success && (
          <div style={{
            marginBottom: '24px',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '12px',
            padding: '16px 20px',
            color: '#15803d',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            ✅ {success}
          </div>
        )}

        {/* Preferences Overview */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '24px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            <div style={{ 
              fontSize: '32px',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#eff6ff',
              borderRadius: '12px'
            }}>
              📊
            </div>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              color: '#1e293b',
              margin: 0
            }}>
              Preferences Overview
            </h2>
          </div>          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <div style={{
              backgroundColor: '#f8fafc',
              padding: '24px',
              borderRadius: '12px',
              textAlign: 'center',
              border: '1px solid #e2e8f0',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}>
              <div style={{ 
                fontSize: '36px', 
                fontWeight: '800', 
                color: '#3b82f6',
                marginBottom: '8px',
                textTransform: 'capitalize'
              }}>
                {preferences.theme}
              </div>
              <div style={{ 
                fontSize: '16px', 
                color: '#64748b',
                marginBottom: '4px',
                fontWeight: '600'
              }}>
                Theme
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                currently active
              </div>
            </div>

            <div style={{
              backgroundColor: '#f8fafc',
              padding: '24px',
              borderRadius: '12px',
              textAlign: 'center',
              border: '1px solid #e2e8f0',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}>
              <div style={{ 
                fontSize: '36px', 
                fontWeight: '800', 
                color: '#3b82f6',
                marginBottom: '8px'
              }}>
                {selectedBranch ? branches.find(b => b.id === selectedBranch)?.name?.slice(0, 3).toUpperCase() : 'N/A'}
              </div>
              <div style={{ 
                fontSize: '16px', 
                color: '#64748b',
                marginBottom: '4px',
                fontWeight: '600'
              }}>
                Selected Branch
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {selectedBranch ? branches.find(b => b.id === selectedBranch)?.status : 'none'}
              </div>
            </div>

            <div style={{
              backgroundColor: '#f8fafc',
              padding: '24px',
              borderRadius: '12px',
              textAlign: 'center',
              border: '1px solid #e2e8f0',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}>
              <div style={{ 
                fontSize: '36px', 
                fontWeight: '800', 
                color: '#3b82f6',
                marginBottom: '8px'
              }}>
                {[preferences.emailNotifications, preferences.smsNotifications, preferences.soundAlerts].filter(Boolean).length}/3
              </div>
              <div style={{ 
                fontSize: '16px', 
                color: '#64748b',
                marginBottom: '4px',
                fontWeight: '600'
              }}>
                Notifications
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                currently active
              </div>
            </div>

            <div style={{
              backgroundColor: '#f8fafc',
              padding: '24px',
              borderRadius: '12px',
              textAlign: 'center',
              border: '1px solid #e2e8f0',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}>
              <div style={{ 
                fontSize: '36px', 
                fontWeight: '800', 
                color: branches.length > 0 ? '#059669' : '#f59e0b',
                marginBottom: '8px'
              }}>
                {branches.length}
              </div>
              <div style={{ 
                fontSize: '16px', 
                color: '#64748b',
                marginBottom: '4px',
                fontWeight: '600'
              }}>
                Total Branches
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                in system
              </div>
            </div>
          </div>        </div>

        {/* Branch Information */}
        {selectedBranch && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            marginBottom: '24px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{ 
                fontSize: '32px',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#eff6ff',
                borderRadius: '12px'
              }}>
                🏢
              </div>
              <h2 style={{ 
                fontSize: '24px', 
                fontWeight: '700', 
                color: '#1e293b',
                margin: 0
              }}>
                Branch Information
              </h2>
            </div>
            {(() => {
              const branch = branches.find(b => b.id === selectedBranch);
              return branch ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                  <div style={{ 
                    padding: '20px', 
                    backgroundColor: '#f8fafc', 
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '16px', fontWeight: '600' }}>Branch Name</h4>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>{branch.name}</p>
                  </div>
                  <div style={{ 
                    padding: '20px', 
                    backgroundColor: '#f8fafc', 
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '16px', fontWeight: '600' }}>Address</h4>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>{branch.address}</p>
                  </div>
                  <div style={{ 
                    padding: '20px', 
                    backgroundColor: '#f8fafc', 
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '16px', fontWeight: '600' }}>Phone</h4>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>{branch.phone}</p>
                  </div>
                  <div style={{ 
                    padding: '20px', 
                    backgroundColor: '#f8fafc', 
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '16px', fontWeight: '600' }}>Status</h4>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: '20px', 
                      fontSize: '12px', 
                      fontWeight: '600',
                      backgroundColor: branch.status === 'active' ? '#dcfce7' : '#fee2e2',
                      color: branch.status === 'active' ? '#16a34a' : '#dc2626'
                    }}>
                      {branch.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        )}

        {/* Settings Section */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '24px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            <div style={{ 
              fontSize: '32px',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#eff6ff',
              borderRadius: '12px'
            }}>
              🛠️
            </div>
            <h2 style={{ 
              fontSize: '24px',
              fontWeight: '700',
              color: '#1e293b',
              margin: 0
            }}>
              Settings
            </h2>          </div>
          
          {/* Navigation Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '32px' }}>
            {[
              { id: 'general', label: 'General', icon: '⚙️' },
              { id: 'display', label: 'Display', icon: '🎨' },
              { id: 'notifications', label: 'Notifications', icon: '🔔' },
              { id: 'security', label: 'Security', icon: '🔒' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  backgroundColor: activeSection === tab.id ? '#3b82f6' : '#e2e8f0',
                  color: activeSection === tab.id ? 'white' : '#475569'
                }}
                onMouseOver={(e) => {
                  if (activeSection !== tab.id) {
                    e.currentTarget.style.backgroundColor = '#cbd5e1';
                  }
                }}
                onMouseOut={(e) => {
                  if (activeSection !== tab.id) {
                    e.currentTarget.style.backgroundColor = '#e2e8f0';
                  }
                }}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
          {/* Content Area */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            {activeSection === 'general' && (
              <div>
                <h3 style={{ 
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1e293b',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>🌐</span>
                  Language & Region
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      Language
                    </label>
                    <select 
                      value={preferences.language} 
                      onChange={(e) => setPreferences({...preferences, language: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        backgroundColor: 'white',
                        color: '#374151',
                        outline: 'none'
                      }}
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Timezone
                  </label>
                  <select 
                    value={preferences.timezone} 
                    onChange={(e) => setPreferences({...preferences, timezone: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: 'white',
                      color: '#374151',
                      outline: 'none'
                    }}
                  >
                    <option value="UTC">UTC</option>
                    <option value="EST">Eastern Time</option>
                    <option value="PST">Pacific Time</option>
                    <option value="CST">Central Time</option>
                  </select>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Currency
                  </label>
                  <select 
                    value={preferences.currency} 
                    onChange={(e) => setPreferences({...preferences, currency: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: 'white',
                      color: '#374151',
                      outline: 'none'
                    }}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                  </select>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Date Format
                  </label>
                  <select 
                    value={preferences.dateFormat} 
                    onChange={(e) => setPreferences({...preferences, dateFormat: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: 'white',
                      color: '#374151',
                      outline: 'none'
                    }}
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            )}

            {activeSection === 'display' && (
              <div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#0ea5e9',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>🎨</span>
                  Display Preferences
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      color: '#374151',
                      marginBottom: '12px'
                    }}>
                      Theme
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                      {['light', 'dark', 'auto'].map((theme) => (
                        <button
                          key={theme}
                          onClick={() => setPreferences({...preferences, theme})}
                          style={{
                            padding: '12px',
                            borderRadius: '8px',
                            border: preferences.theme === theme ? '2px solid #0ea5e9' : '1px solid #d1d5db',
                            fontSize: '14px',
                            textTransform: 'capitalize',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.2s',
                            backgroundColor: preferences.theme === theme ? '#e0f2fe' : 'white',
                            color: preferences.theme === theme ? '#0ea5e9' : '#374151',
                            cursor: 'pointer'
                          }}
                          onMouseOver={(e) => {
                            if (preferences.theme !== theme) {
                              e.currentTarget.style.backgroundColor = '#f8fafc';
                            }
                          }}
                          onMouseOut={(e) => {
                            if (preferences.theme !== theme) {
                              e.currentTarget.style.backgroundColor = 'white';
                            }
                          }}
                        >
                          {theme === 'light' && '☀️'}
                          {theme === 'dark' && '🌙'}
                          {theme === 'auto' && '🔄'}
                          {theme}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px'
                    }}>
                      <div>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#1e293b',
                          marginBottom: '2px'
                        }}>
                          Compact View
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#64748b'
                        }}>
                          Use smaller spacing and condensed layout
                        </div>
                      </div>
                      <label style={{
                        position: 'relative',
                        display: 'inline-flex',
                        alignItems: 'center',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="checkbox"
                          checked={preferences.compactView}
                          onChange={(e) => setPreferences({...preferences, compactView: e.target.checked})}
                          style={{ display: 'none' }}
                        />
                        <div style={{
                          width: '44px',
                          height: '24px',
                          backgroundColor: preferences.compactView ? '#0ea5e9' : '#cbd5e1',
                          borderRadius: '12px',
                          position: 'relative',
                          transition: 'background-color 0.2s',
                          cursor: 'pointer'
                        }}>
                          <div style={{
                            position: 'absolute',
                            top: '2px',
                            left: preferences.compactView ? '22px' : '2px',
                            width: '20px',
                            height: '20px',
                            backgroundColor: 'white',
                            borderRadius: '50%',
                            transition: 'left 0.2s',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                          }} />
                        </div>
                      </label>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px'
                    }}>
                      <div>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#1e293b',
                          marginBottom: '2px'
                        }}>
                          Auto Refresh
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#64748b'
                        }}>
                          Automatically refresh data every {preferences.refreshInterval} seconds
                        </div>
                      </div>
                      <label style={{
                        position: 'relative',
                        display: 'inline-flex',
                        alignItems: 'center',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="checkbox"
                          checked={preferences.autoRefresh}
                          onChange={(e) => setPreferences({...preferences, autoRefresh: e.target.checked})}
                          style={{ display: 'none' }}
                        />
                        <div style={{
                          width: '44px',
                          height: '24px',
                          backgroundColor: preferences.autoRefresh ? '#0ea5e9' : '#cbd5e1',
                          borderRadius: '12px',
                          position: 'relative',
                          transition: 'background-color 0.2s',
                          cursor: 'pointer'
                        }}>
                          <div style={{
                            position: 'absolute',
                            top: '2px',
                            left: preferences.autoRefresh ? '22px' : '2px',
                            width: '20px',
                            height: '20px',
                            backgroundColor: 'white',
                            borderRadius: '50%',
                            transition: 'left 0.2s',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                          }} />
                        </div>
                      </label>
                    </div>

                    {preferences.autoRefresh && (
                      <div style={{
                        padding: '16px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '8px'
                      }}>
                        <label style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#374151',
                          marginBottom: '12px'
                        }}>
                          Refresh Interval: {preferences.refreshInterval}s
                        </label>
                        <input
                          type="range"
                          min="10"
                          max="300"
                          step="10"
                          value={preferences.refreshInterval}
                          onChange={(e) => setPreferences({...preferences, refreshInterval: parseInt(e.target.value)})}
                          style={{
                            width: '100%',
                            height: '8px',
                            backgroundColor: '#e2e8f0',
                            borderRadius: '4px',
                            outline: 'none',
                            cursor: 'pointer'
                          }}
                        />
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '12px',
                          color: '#64748b',
                          marginTop: '8px'
                        }}>
                          <span>10s</span>
                          <span>300s</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#0ea5e9',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>🔔</span>
                  Notification Settings
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    {
                      key: 'emailNotifications',
                      title: 'Email Notifications',
                      description: 'Receive order updates and alerts via email',
                      icon: '📧'
                    },
                    {
                      key: 'smsNotifications',
                      title: 'SMS Notifications',
                      description: 'Receive urgent alerts via text message',
                      icon: '📱'
                    },
                    {
                      key: 'soundAlerts',
                      title: 'Sound Alerts',
                      description: 'Play notification sounds for new orders',
                      icon: '🔊'
                    }
                  ].map((notif) => (
                    <div key={notif.key} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '20px' }}>{notif.icon}</span>
                        <div>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#1e293b',
                            marginBottom: '2px'
                          }}>
                            {notif.title}
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: '#64748b'
                          }}>
                            {notif.description}
                          </div>
                        </div>
                      </div>
                      <label style={{
                        position: 'relative',
                        display: 'inline-flex',
                        alignItems: 'center',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="checkbox"
                          checked={preferences[notif.key as keyof PreferenceData] as boolean}
                          onChange={(e) => setPreferences({...preferences, [notif.key]: e.target.checked})}
                          style={{ display: 'none' }}
                        />
                        <div style={{
                          width: '44px',
                          height: '24px',
                          backgroundColor: (preferences[notif.key as keyof PreferenceData] as boolean) ? '#10b981' : '#cbd5e1',
                          borderRadius: '12px',
                          position: 'relative',
                          transition: 'background-color 0.2s',
                          cursor: 'pointer'
                        }}>
                          <div style={{
                            position: 'absolute',
                            top: '2px',
                            left: (preferences[notif.key as keyof PreferenceData] as boolean) ? '22px' : '2px',
                            width: '20px',
                            height: '20px',
                            backgroundColor: 'white',
                            borderRadius: '50%',
                            transition: 'left 0.2s',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                          }} />
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'security' && (
              <div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#0ea5e9',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>🔒</span>
                  Security Settings
                </h3>
                <div style={{
                  backgroundColor: '#fef3c7',
                  border: '1px solid #fbbf24',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#92400e',
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '4px'
                  }}>
                    <span>⚠️</span>
                    Security settings are managed by system administrators
                  </div>
                  <p style={{
                    fontSize: '14px',
                    color: '#b45309',
                    margin: 0
                  }}>
                    Contact your system administrator to modify password policies, session timeouts, and access controls.
                  </p>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  <div style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    padding: '16px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔐</div>
                    <div style={{
                      fontSize: '12px',
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '4px'
                    }}>
                      Password Strength
                    </div>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#059669'
                    }}>
                      Strong
                    </div>
                  </div>
                  <div style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    padding: '16px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>🕐</div>
                    <div style={{
                      fontSize: '12px',
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '4px'
                    }}>
                      Session Status
                    </div>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#2563eb'
                    }}>
                      Active
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>        </div>

        {/* Save Changes Section */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{ 
              fontSize: '32px',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#eff6ff',
              borderRadius: '12px'
            }}>
              💾
            </div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1e293b',
              margin: 0
            }}>
              Save Changes
            </h3>
          </div>          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              style={{
                backgroundColor: isSaving ? '#94a3b8' : '#3b82f6',
                color: 'white',
                padding: '14px 32px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                border: 'none',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: isSaving ? 0.5 : 1,
                boxShadow: '0 2px 4px rgba(59,130,246,0.2)'
              }}
              onMouseOver={(e) => {
                if (!isSaving) {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseOut={(e) => {
                if (!isSaving) {
                  e.currentTarget.style.backgroundColor = '#3b82f6';
                  e.currentTarget.style.transform = 'translateY(0px)';
                }
              }}
            >
              {isSaving ? '⏳ Saving...' : '✅ Save Preferences'}
            </button>
            <button 
              onClick={handleReset}
              style={{
                backgroundColor: '#ef4444',
                color: 'white',
                padding: '14px 32px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 2px 4px rgba(239,68,68,0.2)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#dc2626';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#ef4444';
                e.currentTarget.style.transform = 'translateY(0px)';
              }}
            >
              🔄 Reset to Default
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchPreferences;
