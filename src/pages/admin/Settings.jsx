import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from '../../components/Sidebar';

const sidebarItems = [
  {
    links: [
      { icon: '▤', text: 'Hotel requests', href: '/admin' },
      { icon: '🏨', text: 'All hotels', href: '/admin/hotels' },
      { icon: '✦', text: 'Cleaning teams', href: '/admin/cleaning' },
      { icon: '📈', text: 'Platform analytics', href: '/admin/analytics' },
      { icon: '🔔', text: 'Notifications', href: '/admin/notifications' },
    ],
  },
  {
    label: 'Account',
    links: [
      { icon: '⚙', text: 'Settings', active: true },
      { icon: '⏻', text: 'Log out', href: '/' },
    ],
  },
];

export default function Settings() {
  const { user, logout } = useAuth();
  const [settings, setSettings] = useState({
    platform: {
      commission_rate: 10,
      auto_approval: false,
      maintenance_mode: false,
      registration_enabled: true,
      cleaning_service_enabled: true,
      min_hotel_rating: 3.0
    },
    notifications: {
      email_notifications: true,
      sms_notifications: false,
      push_notifications: true,
      weekly_reports: true,
      critical_alerts_only: false
    },
    security: {
      require_2fa: false,
      session_timeout: 60,
      max_login_attempts: 5,
      password_expiry_days: 90
    },
    features: {
      advanced_analytics: true,
      bulk_operations: true,
      api_access: false,
      custom_branding: false
    }
  });
  
  const [activeTab, setActiveTab] = useState('platform');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const tabs = [
    { id: 'platform', label: 'Platform', icon: '🏢' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'features', label: 'Features', icon: '⚡' }
  ];

  return (
    <div className="app-shell">
      <Sidebar
        items={sidebarItems.map(section => ({
          ...section,
          links: section.links.map(link => 
            link.text === 'Log out' ? { ...link, onClick: handleLogout } : link
          )
        }))}
        who={{ 
          initials: 'AD', 
          name: user?.email?.split('@')[0] || 'Admin', 
          subtitle: 'Platform Admin', 
          avatarStyle: { background: 'var(--emerald)', color: '#fff' } 
        }}
      />

      <main className="app-main">
        <div className="app-topbar">
          <h1>Settings</h1>
          <div className="topbar-actions">
            {saved && (
              <span style={{ 
                fontSize: '.85rem', 
                color: 'var(--emerald)', 
                fontWeight: '500' 
              }}>
                ✓ Settings saved
              </span>
            )}
            <button 
              className="btn btn-primary btn-sm"
              onClick={saveSettings}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button className="icon-btn">🔔<span className="ping"></span></button>
            <div className="avatar" style={{ width: 34, height: 34, fontSize: '.75rem', background: 'var(--emerald)', color: '#fff' }}>AD</div>
          </div>
        </div>

        <div className="app-body">
          <div className="panel">
            <div className="tab-row">
              {tabs.map((tab) => (
                <button 
                  key={tab.id} 
                  className={`tab-btn${activeTab === tab.id ? ' active' : ''}`} 
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            <div style={{ padding: '24px 0' }}>
              {activeTab === 'platform' && (
                <div className="settings-section">
                  <h3 style={{ marginBottom: '16px' }}>Platform Configuration</h3>
                  
                  <div className="setting-item">
                    <div className="setting-info">
                      <b>Commission Rate</b>
                      <span className="text-muted">Percentage fee charged to hotels</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={settings.platform.commission_rate}
                        onChange={(e) => handleSettingChange('platform', 'commission_rate', parseFloat(e.target.value))}
                        className="input"
                        style={{ width: '80px' }}
                      />
                      <span>%</span>
                    </div>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <b>Auto Approval</b>
                      <span className="text-muted">Automatically approve hotel registrations</span>
                    </div>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={settings.platform.auto_approval}
                        onChange={(e) => handleSettingChange('platform', 'auto_approval', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <b>Maintenance Mode</b>
                      <span className="text-muted">Temporarily disable platform access</span>
                    </div>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={settings.platform.maintenance_mode}
                        onChange={(e) => handleSettingChange('platform', 'maintenance_mode', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <b>Hotel Registration</b>
                      <span className="text-muted">Allow new hotel registrations</span>
                    </div>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={settings.platform.registration_enabled}
                        onChange={(e) => handleSettingChange('platform', 'registration_enabled', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <b>Cleaning Service</b>
                      <span className="text-muted">Enable cleaning request feature</span>
                    </div>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={settings.platform.cleaning_service_enabled}
                        onChange={(e) => handleSettingChange('platform', 'cleaning_service_enabled', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <b>Minimum Hotel Rating</b>
                      <span className="text-muted">Minimum rating to stay active</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        step="0.1"
                        value={settings.platform.min_hotel_rating}
                        onChange={(e) => handleSettingChange('platform', 'min_hotel_rating', parseFloat(e.target.value))}
                        className="input"
                        style={{ width: '80px' }}
                      />
                      <span>★</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="settings-section">
                  <h3 style={{ marginBottom: '16px' }}>Notification Preferences</h3>
                  
                  <div className="setting-item">
                    <div className="setting-info">
                      <b>Email Notifications</b>
                      <span className="text-muted">Receive notifications via email</span>
                    </div>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={settings.notifications.email_notifications}
                        onChange={(e) => handleSettingChange('notifications', 'email_notifications', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <b>SMS Notifications</b>
                      <span className="text-muted">Receive critical alerts via SMS</span>
                    </div>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={settings.notifications.sms_notifications}
                        onChange={(e) => handleSettingChange('notifications', 'sms_notifications', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <b>Push Notifications</b>
                      <span className="text-muted">Browser push notifications</span>
                    </div>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={settings.notifications.push_notifications}
                        onChange={(e) => handleSettingChange('notifications', 'push_notifications', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <b>Weekly Reports</b>
                      <span className="text-muted">Receive weekly analytics summary</span>
                    </div>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={settings.notifications.weekly_reports}
                        onChange={(e) => handleSettingChange('notifications', 'weekly_reports', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <b>Critical Alerts Only</b>
                      <span className="text-muted">Only receive high-priority notifications</span>
                    </div>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={settings.notifications.critical_alerts_only}
                        onChange={(e) => handleSettingChange('notifications', 'critical_alerts_only', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="settings-section">
                  <h3 style={{ marginBottom: '16px' }}>Security Settings</h3>
                  
                  <div className="setting-item">
                    <div className="setting-info">
                      <b>Require Two-Factor Authentication</b>
                      <span className="text-muted">Enforce 2FA for all admin accounts</span>
                    </div>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={settings.security.require_2fa}
                        onChange={(e) => handleSettingChange('security', 'require_2fa', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <b>Session Timeout</b>
                      <span className="text-muted">Minutes before automatic logout</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="number"
                        min="15"
                        max="480"
                        value={settings.security.session_timeout}
                        onChange={(e) => handleSettingChange('security', 'session_timeout', parseInt(e.target.value))}
                        className="input"
                        style={{ width: '100px' }}
                      />
                      <span>minutes</span>
                    </div>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <b>Max Login Attempts</b>
                      <span className="text-muted">Failed attempts before account lock</span>
                    </div>
                    <input
                      type="number"
                      min="3"
                      max="10"
                      value={settings.security.max_login_attempts}
                      onChange={(e) => handleSettingChange('security', 'max_login_attempts', parseInt(e.target.value))}
                      className="input"
                      style={{ width: '80px' }}
                    />
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <b>Password Expiry</b>
                      <span className="text-muted">Days before password must be changed</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="number"
                        min="30"
                        max="365"
                        value={settings.security.password_expiry_days}
                        onChange={(e) => handleSettingChange('security', 'password_expiry_days', parseInt(e.target.value))}
                        className="input"
                        style={{ width: '100px' }}
                      />
                      <span>days</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'features' && (
                <div className="settings-section">
                  <h3 style={{ marginBottom: '16px' }}>Feature Management</h3>
                  
                  <div className="setting-item">
                    <div className="setting-info">
                      <b>Advanced Analytics</b>
                      <span className="text-muted">Enable detailed reporting and insights</span>
                    </div>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={settings.features.advanced_analytics}
                        onChange={(e) => handleSettingChange('features', 'advanced_analytics', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <b>Bulk Operations</b>
                      <span className="text-muted">Allow batch actions on multiple items</span>
                    </div>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={settings.features.bulk_operations}
                        onChange={(e) => handleSettingChange('features', 'bulk_operations', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <b>API Access</b>
                      <span className="text-muted">Enable REST API for third-party integrations</span>
                    </div>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={settings.features.api_access}
                        onChange={(e) => handleSettingChange('features', 'api_access', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <b>Custom Branding</b>
                      <span className="text-muted">Allow hotels to customize their profile appearance</span>
                    </div>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={settings.features.custom_branding}
                        onChange={(e) => handleSettingChange('features', 'custom_branding', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="panel mt-32">
            <div className="panel-head">
              <h3>Danger Zone</h3>
              <span className="tag" style={{ background: 'var(--rust)', color: '#fff' }}>Caution</span>
            </div>
            <div style={{ padding: '16px 0' }}>
              <div className="setting-item" style={{ borderColor: 'var(--rust)' }}>
                <div className="setting-info">
                  <b style={{ color: 'var(--rust)' }}>Reset Platform Data</b>
                  <span className="text-muted">Permanently delete all hotels, bookings, and user data</span>
                </div>
                <button 
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--rust)', borderColor: 'var(--rust)' }}
                  onClick={() => {
                    if (confirm('Are you sure you want to reset demo data? This action will reset system metrics.')) {
                      alert('Platform settings restored to default values.');
                    }
                  }}
                >
                  Reset Data
                </button>
              </div>
              
              <div className="setting-item" style={{ borderColor: 'var(--rust)' }}>
                <div className="setting-info">
                  <b style={{ color: 'var(--rust)' }}>Export Platform Data</b>
                  <span className="text-muted">Download complete platform configuration backup</span>
                </div>
                <button 
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    const exportData = {
                      exported_at: new Date().toISOString(),
                      platform_settings: settings,
                      environment: 'production',
                      app: 'Stayfolio Hotel Management Platform'
                    };
                    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `stayfolio_platform_backup_${new Date().toISOString().split('T')[0]}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  📥 Export Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .settings-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .setting-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border: 1px solid var(--hairline);
          border-radius: 8px;
          background: var(--parchment-1);
        }

        .setting-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .setting-info b {
          font-size: 0.9rem;
          font-weight: 600;
        }

        .setting-info .text-muted {
          font-size: 0.8rem;
        }

        .toggle {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
        }

        .toggle input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: var(--hairline);
          transition: 0.2s;
          border-radius: 12px;
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: 0.2s;
          border-radius: 50%;
        }

        .toggle input:checked + .toggle-slider {
          background-color: var(--emerald);
        }

        .toggle input:checked + .toggle-slider:before {
          transform: translateX(20px);
        }
      `}</style>
    </div>
  );
}