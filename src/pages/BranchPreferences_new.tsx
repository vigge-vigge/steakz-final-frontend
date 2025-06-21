import React, { useState } from 'react';

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

const BranchPreferences: React.FC = () => {
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

  const quickSettings = [
    { key: 'theme', label: 'Theme', value: preferences.theme, icon: '🎨' },
    { key: 'language', label: 'Language', value: preferences.language, icon: '🌐' },
    { key: 'notifications', label: 'Notifications', value: `${[preferences.emailNotifications, preferences.smsNotifications, preferences.soundAlerts].filter(Boolean).length}/3`, icon: '🔔' },
    { key: 'autoRefresh', label: 'Auto Refresh', value: preferences.autoRefresh ? 'On' : 'Off', icon: '🔄' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Branch Preferences</h1>
          <p className="text-gray-600 text-sm">Customize your branch management settings and preferences</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">
            {success}
          </div>
        )}

        {/* Quick Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {quickSettings.map((setting) => (
            <div key={setting.key} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{setting.label}</p>
                  <p className="text-lg font-semibold text-gray-900 capitalize">{setting.value}</p>
                </div>
                <span className="text-2xl">{setting.icon}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">Settings</h2>
              </div>
              <nav className="p-2">
                {[
                  { id: 'general', label: 'General', icon: '⚙️' },
                  { id: 'display', label: 'Display', icon: '🎨' },
                  { id: 'notifications', label: 'Notifications', icon: '🔔' },
                  { id: 'security', label: 'Security', icon: '🔒' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSection(tab.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm mb-1 flex items-center gap-3 transition-colors ${
                      activeSection === tab.id
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            {activeSection === 'general' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <span>🌐</span>
                      Language & Region
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                        <select 
                          value={preferences.language} 
                          onChange={(e) => setPreferences({...preferences, language: e.target.value})}
                          className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                        <select 
                          value={preferences.timezone} 
                          onChange={(e) => setPreferences({...preferences, timezone: e.target.value})}
                          className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="UTC">UTC</option>
                          <option value="EST">Eastern Time</option>
                          <option value="PST">Pacific Time</option>
                          <option value="CST">Central Time</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                        <select 
                          value={preferences.currency} 
                          onChange={(e) => setPreferences({...preferences, currency: e.target.value})}
                          className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                          <option value="JPY">JPY (¥)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                        <select 
                          value={preferences.dateFormat} 
                          onChange={(e) => setPreferences({...preferences, dateFormat: e.target.value})}
                          className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'display' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <span>🎨</span>
                      Display Preferences
                    </h3>
                  </div>
                  <div className="p-4 space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
                      <div className="grid grid-cols-3 gap-3">
                        {['light', 'dark', 'auto'].map((theme) => (
                          <button
                            key={theme}
                            onClick={() => setPreferences({...preferences, theme})}
                            className={`p-3 rounded-lg border text-sm capitalize flex items-center justify-center gap-2 transition-colors ${
                              preferences.theme === theme
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {theme === 'light' && '☀️'}
                            {theme === 'dark' && '🌙'}
                            {theme === 'auto' && '🔄'}
                            {theme}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <div className="text-sm font-medium text-gray-900">Compact View</div>
                          <div className="text-xs text-gray-500">Use smaller spacing and condensed layout</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={preferences.compactView}
                            onChange={(e) => setPreferences({...preferences, compactView: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <div className="text-sm font-medium text-gray-900">Auto Refresh</div>
                          <div className="text-xs text-gray-500">Automatically refresh data every {preferences.refreshInterval} seconds</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={preferences.autoRefresh}
                            onChange={(e) => setPreferences({...preferences, autoRefresh: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      {preferences.autoRefresh && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <label className="block text-sm font-medium text-gray-700 mb-3">Refresh Interval: {preferences.refreshInterval}s</label>
                          <input
                            type="range"
                            min="10"
                            max="300"
                            step="10"
                            value={preferences.refreshInterval}
                            onChange={(e) => setPreferences({...preferences, refreshInterval: parseInt(e.target.value)})}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-2">
                            <span>10s</span>
                            <span>300s</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <span>🔔</span>
                      Notification Settings
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-4">
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
                        <div key={notif.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{notif.icon}</span>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{notif.title}</div>
                              <div className="text-xs text-gray-500">{notif.description}</div>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={preferences[notif.key as keyof PreferenceData] as boolean}
                              onChange={(e) => setPreferences({...preferences, [notif.key]: e.target.checked})}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'security' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <span>🔒</span>
                      Security Settings
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 text-yellow-800 text-sm font-medium mb-1">
                        <span>⚠️</span>
                        Security settings are managed by system administrators
                      </div>
                      <p className="text-sm text-yellow-700">
                        Contact your system administrator to modify password policies, session timeouts, and access controls.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <div className="text-2xl mb-2">🔐</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Password Strength</div>
                        <div className="text-sm font-semibold text-green-600">Strong</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <div className="text-2xl mb-2">🕐</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Session Status</div>
                        <div className="text-sm font-semibold text-blue-600">Active</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <span>💾</span>
              Save Changes
            </h3>
          </div>
          <div className="p-4">
            <div className="flex flex-col sm:flex-row gap-3 max-w-md">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50 flex-1 text-sm font-medium transition-colors"
              >
                {isSaving ? 'Saving...' : 'Save Preferences'}
              </button>
              <button 
                onClick={handleReset}
                className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md flex-1 text-sm font-medium transition-colors"
              >
                Reset to Default
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchPreferences;
