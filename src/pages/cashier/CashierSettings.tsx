import React, { useState, useEffect, useRef } from 'react';
import { getCurrentUser } from '../../services/api';
import { User } from '../../types';
import { useSettings } from '../../context/SettingsContext';
import { useTheme } from '../../context/ThemeContext';
import { useShift } from '../../hooks/useShift';

// Simple language dictionary for demo
const LANGS: Record<string, Record<string, string>> = {
  en: {
    settings: 'Settings',
    manage: 'Manage your profile, preferences, and system settings.',
    profile: 'Profile Information',
    username: 'Username',
    email: 'Email',
    role: 'Role',
    branch: 'Branch',
    loading: 'Loading profile...',
    appSettings: 'Application Settings',
    theme: 'Theme',
    switchLight: 'Switch to Light',
    switchDark: 'Switch to Dark',
    language: 'Language',
    chooseLang: 'Choose your preferred language',
    notifications: 'Notifications',
    enableNotif: 'Enable or disable system notifications',
    enabled: 'Enabled',
    disabled: 'Disabled',
    autoLogout: 'Auto Logout',
    autoLogoutDesc: 'Automatically logout after inactivity (minutes)',
    printer: 'Printer Settings',
    defaultPrinter: 'Default Printer',
    receiptCopies: 'Receipt Copies',
    paperSize: 'Paper Size',
    save: 'Save All',
    saved: 'Settings saved!'
  }
};

const CashierSettings: React.FC = () => {
  const { settings, setSettings } = useSettings();
  const { isDarkMode, toggleTheme } = useTheme();
  const { isActive: shiftActive, startTime: shiftStartTime, duration, formatDuration } = useShift();
  const [user, setUser] = useState<User | null>(null);
  const [language, setLanguage] = useState(settings.language);
  const [notifications, setNotifications] = useState(settings.notifications);
  const [autoLogout, setAutoLogout] = useState(settings.autoLogout);
  const [printerSettings, setPrinterSettings] = useState(settings.printerSettings);
  const [error, setError] = useState<string | null>(null);
  const [saveMsg, setSaveMsg] = useState('');
  const logoutTimer = useRef<NodeJS.Timeout | null>(null);
  const lastActivity = useRef(Date.now());

  // Translation function that uses the selected language
  const t = (key: string) => LANGS[settings.language]?.[key] || LANGS.en[key] || key;

  // Load user profile
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData.data);
      } catch (err) {
        setError('Failed to load user profile');
      }
    };
    loadUser();
  }, []);

  // Save settings handler
  const handleSaveSettings = () => {
    setSettings({ 
      ...settings,
      language, 
      notifications, 
      autoLogout, 
      printerSettings 
    });
    setSaveMsg(t('saved'));
    setTimeout(() => setSaveMsg(''), 3000);
  };

  return (
    <div className={isDarkMode ? 'dark' : ''} style={{ minHeight: '100vh', padding: '24px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: isDarkMode ? '#fbbf24' : '#111827', marginBottom: '8px' }}>{t('settings')}</h1>
              <p style={{ color: isDarkMode ? '#f3f4f6' : '#6b7280' }}>{t('manage')}</p>
            </div>
          </div>
        </div>

        {error && (
          <div style={{
            padding: '16px',
            marginBottom: '24px',
            backgroundColor: isDarkMode ? '#3f1d1d' : '#fef2f2',
            border: '1px solid #f87171',
            borderRadius: '8px',
            color: '#dc2626'
          }}>
            {error}
          </div>
        )}

        {/* Profile Information */}
        <div style={{ marginBottom: '32px', backgroundColor: isDarkMode ? '#1f2937' : '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: isDarkMode ? '#fbbf24' : '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
            👤 {t('profile')}
          </h3>
          {user ? (
            <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '14px', fontWeight: '500', color: isDarkMode ? '#d1d5db' : '#374151' }}>{t('username')}</label>
                <div style={{ padding: '8px 12px', backgroundColor: isDarkMode ? '#374151' : '#f9fafb', borderRadius: '6px', color: isDarkMode ? '#f3f4f6' : '#111827' }}>{user.username}</div>
              </div>
              <div>
                <label style={{ fontSize: '14px', fontWeight: '500', color: isDarkMode ? '#d1d5db' : '#374151' }}>{t('email')}</label>
                <div style={{ padding: '8px 12px', backgroundColor: isDarkMode ? '#374151' : '#f9fafb', borderRadius: '6px', color: isDarkMode ? '#f3f4f6' : '#111827' }}>{user.email}</div>
              </div>
              <div>
                <label style={{ fontSize: '14px', fontWeight: '500', color: isDarkMode ? '#d1d5db' : '#374151' }}>{t('role')}</label>
                <div style={{ padding: '8px 12px', backgroundColor: isDarkMode ? '#374151' : '#f9fafb', borderRadius: '6px', color: isDarkMode ? '#f3f4f6' : '#111827' }}>{user.role}</div>
              </div>
            </div>
          ) : (
            <div style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>{t('loading')}</div>
          )}
        </div>

        {/* Application Settings */}
        <div style={{ marginBottom: '32px', backgroundColor: isDarkMode ? '#1f2937' : '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: isDarkMode ? '#fbbf24' : '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⚙️ {t('appSettings')}
          </h3>
          
          <div style={{ marginTop: '24px', display: 'grid', gap: '24px' }}>
            {/* Theme Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '500', color: isDarkMode ? '#f3f4f6' : '#111827' }}>{t('theme')}</div>
                <div style={{ fontSize: '14px', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                  {isDarkMode ? t('switchLight') : t('switchDark')}
                </div>
              </div>
              <button 
                onClick={toggleTheme}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: isDarkMode ? '#374151' : '#2563eb',
                  color: '#ffffff',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                {isDarkMode ? '☀️ Light' : '🌙 Dark'}
              </button>
            </div>

            {/* Language */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '500', color: isDarkMode ? '#f3f4f6' : '#111827' }}>{t('language')}</div>
                <div style={{ fontSize: '14px', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>{t('chooseLang')}</div>
              </div>
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: isDarkMode ? '1px solid #374151' : '1px solid #d1d5db',
                  backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                  color: isDarkMode ? '#f3f4f6' : '#111827'
                }}
              >
                <option value="en">English</option>
                <option value="sv">Svenska</option>
                <option value="de">Deutsch</option>
              </select>
            </div>

            {/* Notifications */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '500', color: isDarkMode ? '#f3f4f6' : '#111827' }}>{t('notifications')}</div>
                <div style={{ fontSize: '14px', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>{t('enableNotif')}</div>
              </div>
              <button 
                onClick={() => setNotifications(!notifications)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: notifications ? '#059669' : '#6b7280',
                  color: '#ffffff',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                {notifications ? t('enabled') : t('disabled')}
              </button>
            </div>

            {/* Auto Logout */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '500', color: isDarkMode ? '#f3f4f6' : '#111827' }}>{t('autoLogout')}</div>
                <div style={{ fontSize: '14px', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>{t('autoLogoutDesc')}</div>
              </div>
              <input 
                type="number" 
                value={autoLogout} 
                onChange={(e) => setAutoLogout(parseInt(e.target.value))}
                min="5"
                max="180"
                style={{
                  width: '80px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: isDarkMode ? '1px solid #374151' : '1px solid #d1d5db',
                  backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                  color: isDarkMode ? '#f3f4f6' : '#111827',
                  textAlign: 'center'
                }}
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div style={{ textAlign: 'center' }}>
          <button 
            onClick={handleSaveSettings}
            style={{
              padding: '12px 32px',
              backgroundColor: '#059669',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {t('save')}
          </button>
          {saveMsg && (
            <div style={{ marginTop: '12px', color: '#059669', fontWeight: '500' }}>
              {saveMsg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CashierSettings;
