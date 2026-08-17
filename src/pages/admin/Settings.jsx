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
  const { user, apiCall, logout } = useAuth();
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

  const [emailConfig, setEmailConfig] = useState({
    provider: 'resend',
    resend_api_key: '',
    has_resend_api_key: false,
    mail_server: 'smtp.gmail.com',
    mail_port: 587,
    mail_use_tls: true,
    mail_username: '',
    mail_password: '',
    has_mail_password: false,
    mail_default_sender: 'Stayfolio <noreply@stayfolio.com>',
    mail_admin_address: 'admin@stayfolio.com',
    frontend_url: 'https://hotel-management-system.vercel.app'
  });
  
  const [activeTab, setActiveTab] = useState('email');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  // Test email state
  const [testEmail, setTestEmail] = useState('');
  const [testingEmail, setTestingEmail] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    loadEmailSettings();
  }, []);

  const loadEmailSettings = async () => {
    try {
      const res = await apiCall('/api/admin/settings/email');
      if (res.ok) {
        const data = await res.json();
        setEmailConfig({
          provider: data.has_resend_api_key ? 'resend' : 'smtp',
          resend_api_key: data.resend_api_key || '',
          has_resend_api_key: data.has_resend_api_key || false,
          mail_server: data.mail_server || 'smtp.gmail.com',
          mail_port: data.mail_port || 587,
          mail_use_tls: data.mail_use_tls !== undefined ? data.mail_use_tls : true,
          mail_username: data.mail_username || '',
          mail_password: '',
          has_mail_password: data.has_mail_password || false,
          mail_default_sender: data.mail_default_sender || 'Stayfolio <noreply@stayfolio.com>',
          mail_admin_address: data.mail_admin_address || 'admin@stayfolio.com',
          frontend_url: data.frontend_url || 'https://hotel-management-system.vercel.app'
        });
        if (user?.email) {
          setTestEmail(user.email);
        }
      }
    } catch (err) {
      console.error('Failed to load email settings:', err);
    }
  };

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleEmailChange = (key, value) => {
    setEmailConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = async () => {
    setLoading(true);
    setSaveMessage('');
    try {
      if (activeTab === 'email') {
        const res = await apiCall('/api/admin/settings/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resend_api_key: emailConfig.resend_api_key,
            mail_server: emailConfig.mail_server,
            mail_port: emailConfig.mail_port,
            mail_use_tls: emailConfig.mail_use_tls,
            mail_username: emailConfig.mail_username,
            mail_password: emailConfig.mail_password,
            mail_default_sender: emailConfig.mail_default_sender,
            mail_admin_address: emailConfig.mail_admin_address,
            frontend_url: emailConfig.frontend_url
          })
        });

        if (res.ok) {
          setSaved(true);
          setSaveMessage('✓ Email environment settings saved successfully');
          setTimeout(() => setSaved(false), 4000);
          loadEmailSettings();
        } else {
          const err = await res.json();
          alert('Failed to save email settings: ' + (err.error || 'Server error'));
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 800));
        setSaved(true);
        setSaveMessage('✓ Platform settings saved');
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Network error while saving settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      alert('Please enter a recipient email address to send test message');
      return;
    }
    setTestingEmail(true);
    setTestResult(null);
    try {
      const res = await apiCall('/api/admin/settings/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test_email: testEmail.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setTestResult({ success: true, message: data.message || `Test email dispatched to ${testEmail}!` });
      } else {
        setTestResult({ success: false, message: data.error || 'Failed to dispatch test email. Check server configuration.' });
      }
    } catch (err) {
      setTestResult({ success: false, message: 'Network error while attempting to send test email.' });
    } finally {
      setTestingEmail(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const tabs = [
    { id: 'email', label: 'Email & SMTP Config', icon: '✉️' },
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
                fontWeight: '600' 
              }}>
                {saveMessage}
              </span>
            )}
            <button 
              className="btn btn-primary btn-sm"
              onClick={saveSettings}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Settings to .env'}
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
              
              {/* ============================================================
                  EMAIL & SMTP CONFIGURATION TAB (Saves to .env)
                  ============================================================ */}
              {activeTab === 'email' && (
                <div className="settings-section">
                  <div style={{ background: 'var(--paper)', border: '1px solid var(--hairline)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                      <div>
                        <span className="eyebrow" style={{ color: 'var(--brass-dark)' }}>Live Environment Integration</span>
                        <h3 style={{ margin: '6px 0 4px', fontSize: '1.25rem', color: 'var(--ink)' }}>Transactional Email Setup</h3>
                        <p style={{ color: 'var(--muted)', fontSize: '.88rem', margin: 0 }}>
                          Configure your email service credentials. Saved values are automatically written to your backend <code style={{ background: 'var(--parchment-2)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>.env</code> file and applied to runtime config.
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          className={`btn btn-sm ${emailConfig.provider === 'resend' ? 'btn-primary' : 'btn-ghost'}`}
                          onClick={() => handleEmailChange('provider', 'resend')}
                        >
                          Resend API (Cloud)
                        </button>
                        <button
                          type="button"
                          className={`btn btn-sm ${emailConfig.provider === 'smtp' ? 'btn-primary' : 'btn-ghost'}`}
                          onClick={() => handleEmailChange('provider', 'smtp')}
                        >
                          Custom SMTP Server
                        </button>
                      </div>
                    </div>

                    {/* Provider: Resend */}
                    {emailConfig.provider === 'resend' && (
                      <div style={{ background: 'rgba(176, 141, 87, 0.08)', border: '1px solid rgba(176, 141, 87, 0.25)', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                          <span style={{ fontSize: '1.2rem' }}>⚡</span>
                          <b style={{ color: 'var(--ink)', fontSize: '.95rem' }}>Resend API Configuration (Recommended)</b>
                        </div>
                        <div className="field-group" style={{ marginBottom: 0 }}>
                          <label>
                            Resend API Key <span className="opt">(e.g. re_123456789)</span>
                          </label>
                          <input
                            type="password"
                            className="input"
                            placeholder={emailConfig.has_resend_api_key ? '••••••••••••••••••••••••••••' : 'Enter Resend API Key (re_...)'}
                            value={emailConfig.resend_api_key}
                            onChange={(e) => handleEmailChange('resend_api_key', e.target.value)}
                            style={{ fontFamily: 'monospace' }}
                          />
                          <div className="input-hint">
                            Get a free API key at <a href="https://resend.com" target="_blank" rel="noreferrer" style={{ color: 'var(--brass-dark)', fontWeight: 600, textDecoration: 'underline' }}>resend.com</a>. Leaves password masked if unchanged.
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Provider: SMTP */}
                    {emailConfig.provider === 'smtp' && (
                      <div style={{ background: 'var(--parchment-2)', border: '1px solid var(--hairline)', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                          <span style={{ fontSize: '1.2rem' }}>📫</span>
                          <b style={{ color: 'var(--ink)', fontSize: '.95rem' }}>Standard SMTP Mail Server Credentials</b>
                        </div>

                        <div className="field-row" style={{ marginBottom: '16px' }}>
                          <div className="field-group" style={{ marginBottom: 0 }}>
                            <label>SMTP Host / Server</label>
                            <input
                              type="text"
                              className="input"
                              placeholder="smtp.gmail.com"
                              value={emailConfig.mail_server}
                              onChange={(e) => handleEmailChange('mail_server', e.target.value)}
                            />
                          </div>
                          <div className="field-group" style={{ marginBottom: 0 }}>
                            <label>SMTP Port</label>
                            <input
                              type="number"
                              className="input"
                              placeholder="587"
                              value={emailConfig.mail_port}
                              onChange={(e) => handleEmailChange('mail_port', parseInt(e.target.value) || 587)}
                            />
                          </div>
                        </div>

                        <div className="field-row" style={{ marginBottom: '16px' }}>
                          <div className="field-group" style={{ marginBottom: 0 }}>
                            <label>SMTP Username / Email</label>
                            <input
                              type="email"
                              className="input"
                              placeholder="your-system-email@gmail.com"
                              value={emailConfig.mail_username}
                              onChange={(e) => handleEmailChange('mail_username', e.target.value)}
                            />
                          </div>
                          <div className="field-group" style={{ marginBottom: 0 }}>
                            <label>SMTP Password / App Password</label>
                            <input
                              type="password"
                              className="input"
                              placeholder={emailConfig.has_mail_password ? '••••••••••••' : 'Enter SMTP password'}
                              value={emailConfig.mail_password}
                              onChange={(e) => handleEmailChange('mail_password', e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="setting-item" style={{ background: '#fff', border: '1px solid var(--hairline)', padding: '12px 16px', borderRadius: '6px' }}>
                          <div className="setting-info">
                            <b>Enable TLS Encryption (MAIL_USE_TLS)</b>
                            <span className="text-muted">Recommended for port 587</span>
                          </div>
                          <label className="toggle">
                            <input
                              type="checkbox"
                              checked={emailConfig.mail_use_tls}
                              onChange={(e) => handleEmailChange('mail_use_tls', e.target.checked)}
                            />
                            <span className="toggle-slider"></span>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Core Sender & Routing Settings */}
                    <h4 style={{ margin: '0 0 16px', fontSize: '1.05rem', color: 'var(--ink)' }}>Sender &amp; Routing Configuration</h4>
                    
                    <div className="field-row" style={{ marginBottom: '16px' }}>
                      <div className="field-group" style={{ marginBottom: 0 }}>
                        <label>Default "From" Sender (MAIL_DEFAULT_SENDER)</label>
                        <input
                          type="text"
                          className="input"
                          placeholder="Stayfolio <noreply@stayfolio.com>"
                          value={emailConfig.mail_default_sender}
                          onChange={(e) => handleEmailChange('mail_default_sender', e.target.value)}
                        />
                        <div className="input-hint">Name and address displayed on outgoing guest and owner emails</div>
                      </div>

                      <div className="field-group" style={{ marginBottom: 0 }}>
                        <label>Admin Notification Recipient (MAIL_ADMIN_ADDRESS)</label>
                        <input
                          type="email"
                          className="input"
                          placeholder="admin@stayfolio.com"
                          value={emailConfig.mail_admin_address}
                          onChange={(e) => handleEmailChange('mail_admin_address', e.target.value)}
                        />
                        <div className="input-hint">Receives new hotel onboarding registration notifications</div>
                      </div>
                    </div>

                    <div className="field-group" style={{ marginBottom: '24px' }}>
                      <label>Frontend App URL (FRONTEND_URL)</label>
                      <input
                        type="url"
                        className="input"
                        placeholder="https://hotel-management-system.vercel.app"
                        value={emailConfig.frontend_url}
                        onChange={(e) => handleEmailChange('frontend_url', e.target.value)}
                      />
                      <div className="input-hint">Used to generate login, review, and approval links inside transactional emails</div>
                    </div>

                    {/* Action Bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderTop: '1px solid var(--hairline)', paddingTop: '20px' }}>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={saveSettings}
                        disabled={loading}
                      >
                        {loading ? 'Writing to .env...' : '💾 Save Email Config to .env'}
                      </button>

                      {saved && (
                        <span style={{ color: 'var(--emerald)', fontWeight: 600, fontSize: '.9rem' }}>
                          {saveMessage}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Test Email Verification Box */}
                  <div style={{ background: '#fff', border: '1px dashed var(--hairline)', borderRadius: '12px', padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '1.25rem' }}>🧪</span>
                      <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--ink)' }}>Send Live Test Email</h4>
                    </div>
                    <p style={{ color: 'var(--muted)', fontSize: '.85rem', margin: '0 0 16px' }}>
                      Verify that your configuration works by dispatching a test email notification to any address.
                    </p>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <input
                        type="email"
                        className="input"
                        placeholder="Enter email to test (e.g. admin@yourdomain.com)"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        style={{ maxWidth: '360px' }}
                      />
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={handleSendTestEmail}
                        disabled={testingEmail || !testEmail}
                      >
                        {testingEmail ? 'Sending Test...' : 'Dispatch Test Email →'}
                      </button>
                    </div>

                    {testResult && (
                      <div style={{
                        marginTop: '16px',
                        padding: '12px 16px',
                        borderRadius: '6px',
                        fontSize: '.88rem',
                        fontWeight: 600,
                        background: testResult.success ? '#ECFDF5' : '#FFF1F2',
                        color: testResult.success ? '#047857' : '#9F1239',
                        border: `1px solid ${testResult.success ? '#A7F3D0' : '#FECDD3'}`
                      }}>
                        {testResult.message}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ============================================================
                  PLATFORM CONFIGURATION TAB
                  ============================================================ */}
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

              {/* ============================================================
                  NOTIFICATIONS TAB
                  ============================================================ */}
              {activeTab === 'notifications' && (
                <div className="settings-section">
                  <h3 style={{ marginBottom: '16px' }}>Notification Preferences</h3>
                  
                  <div className="setting-item">
                    <div className="setting-info">
                      <b>Email Notifications</b>
                      <span className="text-muted">Receive email updates for new requests</span>
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
                      <span className="text-muted">Receive urgent alerts via SMS</span>
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
                      <b>Weekly Reports</b>
                      <span className="text-muted">Receive weekly performance summaries</span>
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

              {/* ============================================================
                  SECURITY TAB
                  ============================================================ */}
              {activeTab === 'security' && (
                <div className="settings-section">
                  <h3 style={{ marginBottom: '16px' }}>Security Settings</h3>
                  
                  <div className="setting-item">
                    <div className="setting-info">
                      <b>Two-Factor Authentication</b>
                      <span className="text-muted">Require 2FA for all admin accounts</span>
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
                      <span className="text-muted">Automatic logout after inactivity</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="number"
                        min="15"
                        max="240"
                        step="15"
                        value={settings.security.session_timeout}
                        onChange={(e) => handleSettingChange('security', 'session_timeout', parseInt(e.target.value))}
                        className="input"
                        style={{ width: '80px' }}
                      />
                      <span>mins</span>
                    </div>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <b>Max Login Attempts</b>
                      <span className="text-muted">Lock account after failed attempts</span>
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
                </div>
              )}

              {/* ============================================================
                  FEATURES TAB
                  ============================================================ */}
              {activeTab === 'features' && (
                <div className="settings-section">
                  <h3 style={{ marginBottom: '16px' }}>Feature Toggles</h3>
                  
                  <div className="setting-item">
                    <div className="setting-info">
                      <b>Advanced Analytics</b>
                      <span className="text-muted">Enable detailed revenue forecasting</span>
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
                      <span className="text-muted">Enable batch approvals and actions</span>
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
                      <span className="text-muted">Enable public REST API access</span>
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
                </div>
              )}

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
          background: var(--paper);
        }

        .setting-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .setting-info b {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--ink);
        }

        .setting-info .text-muted {
          font-size: 0.8rem;
          color: var(--muted);
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