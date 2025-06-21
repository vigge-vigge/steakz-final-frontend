import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { updateCurrentUser } from '../../services/api';

const ChefPreferences: React.FC = () => {
  const { user } = useContext(AuthContext);
  const { settings, setSettings } = useSettings();
  const [sound, setSound] = useState(() => localStorage.getItem('orderSound') !== 'false');
  const [autoRefresh, setAutoRefresh] = useState(() => {
    const val = localStorage.getItem('orderAutoRefresh');
    return val ? val === 'true' : true;
  });
  const [refreshInterval, setRefreshInterval] = useState(() => {
    return localStorage.getItem('orderRefreshInterval') || '10';
  });
  const [profile, setProfile] = useState({
    name: user?.username || '',
    email: user?.email || '',
    password: '',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSound = (v: boolean) => {
    setSound(v);
    localStorage.setItem('orderSound', v.toString());
  };

  const handleAutoRefresh = (v: boolean) => {
    setAutoRefresh(v);
    localStorage.setItem('orderAutoRefresh', v.toString());
  };

  const handleInterval = (v: string) => {
    setRefreshInterval(v);
    localStorage.setItem('orderRefreshInterval', v);
  };

  const handleTheme = (theme: 'light' | 'dark') => {
    setSettings(s => ({ ...s, theme }));
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = {
        username: profile.name,
        email: profile.email,
      };
      if (profile.password) payload.password = profile.password;
      await updateCurrentUser(payload);
      setMsg('Profile updated!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err: any) {
      setMsg(err?.response?.data?.message || err?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', color: '#ef4444', marginBottom: '1rem' }}>Access Denied</h1>
        <p style={{ color: '#6b7280' }}>You must be logged in to view preferences.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 500, margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#1f2937' }}>Chef Preferences</h1>
      
      <div style={{ background: '#f9fafb', borderRadius: 8, padding: 24, marginBottom: 32, border: '1px solid #e5e7eb' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 16 }}>Order Notifications</h2>
        <label style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <input type="checkbox" checked={sound} onChange={e => handleSound(e.target.checked)} />
          Play sound for new orders
        </label>
      </div>

      <div style={{ background: '#f9fafb', borderRadius: 8, padding: 24, marginBottom: 32, border: '1px solid #e5e7eb' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 16 }}>Order Queue Display</h2>
        <label style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <input type="checkbox" checked={autoRefresh} onChange={e => handleAutoRefresh(e.target.checked)} />
          Auto-refresh order queue
        </label>
        {autoRefresh && (
          <div style={{ marginLeft: 24, marginBottom: 12 }}>
            <label>
              Refresh interval (seconds):
              <input type="number" min={5} max={60} step={1} value={refreshInterval} onChange={e => handleInterval(e.target.value)} style={{ marginLeft: 8, width: 60 }} />
            </label>
          </div>
        )}
      </div>

      <div style={{ background: '#f9fafb', borderRadius: 8, padding: 24, marginBottom: 32, border: '1px solid #e5e7eb' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 16 }}>Display Mode</h2>
        <label style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <input type="radio" name="theme" checked={settings.theme === 'light'} onChange={() => handleTheme('light')} /> Light
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <input type="radio" name="theme" checked={settings.theme === 'dark'} onChange={() => handleTheme('dark')} /> Dark
        </label>
      </div>

      <div style={{ background: '#f9fafb', borderRadius: 8, padding: 24, border: '1px solid #e5e7eb' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 16 }}>Personal Info</h2>
        <form onSubmit={handleProfileSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, marginBottom: 16 }}>
            <input name="name" value={profile.name} onChange={handleProfileChange} placeholder="Name" required />
            <input name="email" type="email" value={profile.email} onChange={handleProfileChange} placeholder="Email" required />
            <input name="password" type="password" value={profile.password} onChange={handleProfileChange} placeholder="New Password (optional)" />
          </div>
          <button type="submit" disabled={saving} style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: 8, padding: '0.75rem 1.5rem', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          {msg && <span style={{ marginLeft: 16, color: msg.includes('updated') ? '#10b981' : '#ef4444', fontWeight: 500 }}>{msg}</span>}
        </form>
      </div>
    </div>
  );
};

export default ChefPreferences;