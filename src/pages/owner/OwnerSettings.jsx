import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from '../../components/Sidebar';

const sidebarItems = [
  {
    links: [
      { icon: '▤', text: 'Overview', href: '/owner' },
      { icon: '🏨', text: 'Hotel profile', href: '/owner/profile' },
      { icon: '🛏', text: 'Rooms & pricing', href: '/owner/rooms' },
      { icon: '📅', text: 'Bookings & calendar', href: '/owner/bookings' },
      { icon: '★', text: 'Reviews', href: '/owner/reviews' },
      { icon: '📈', text: 'Analytics & revenue', href: '/owner/analytics' },
      { icon: '✦', text: 'Cleaning service', href: '/owner/cleaning' },
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

export default function OwnerSettings() {
  const { user, logout } = useAuth();
  const [settings, setSettings] = useState({
    notifications: {
      email_bookings: true,
      email_reviews: true,
      sms_urgent: false,
      push_notifications: true
    },
    booking: {
      auto_approve: false,
      advance_notice_hours: 24,
      max_stay_days: 30,
      allow_same_day: true
    },
    account: {
      email: 'owner@marlowhotel.com',
      phone: '+92 300 1234567',
      language: 'en',
      timezone: 'Asia/Karachi'
    }
  });
  
  const [activeTab, setActiveTab] = useState('notifications');
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

  const hotel = { name: 'The Marlow Hotel', status: 'approved' };

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'booking', label: 'Booking Rules', icon: '📅' },
    { id: 'account', label: 'Account', icon: '👤' }
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
          initials: hotel.name.split(' ').map(n => n[0]).join(''), 
          name: hotel.name, 
          subtitle: `Owner · ${hotel.status}` 
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
            <button className="icon-btn">🔔</button>
            <div className="avatar" style={{ width: 34, height: 34, fontSize: '.75rem' }}>
              {hotel.name.split(' ').map(n => n[0]).join('')}
            </div>
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
              {activeTab === 'notifications' && (
                <div className="settings-section">
                  <h3 style={{ marginBottom: '16px' }}>Notification Preferences</h3>
                  
                  <div className="setting-item">
                    <div className="setting-info">
                      <b>Email - New Bookings</b>
                      <span className="text-muted">Get notified when you receive new booking requests</span>
                    </div>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={settings.notifications.email_bookings}
                        onChange={(e) => handleSettingChange('notifications', 'email_bookings', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <b>Email - New Reviews</b>
                      <span className="text-muted">Get notified when guests leave reviews</span>
                    </div>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={settings.notifications.email_reviews}
                        onChange={(e) => handleSettingChange('notifications', 'email_reviews', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <b>SMS - Urgent Alerts</b>
                      <span className="text-muted">Receive urgent notifications via SMS</span>
                    </div>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={settings.notifications.sms_urgent}
                        onChange={(e) => handleSettingChange('notifications', 'sms_urgent', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <b>Push Notifications</b>
                      <span className="text-muted">Browser push notifications for real-time updates</span>
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
                </div>
              )}

              {activeTab === 'booking' && (
                <div className="settings-section">
                  <h3 style={{ marginBottom: '16px' }}>Booking Rules & Preferences</h3>
                  
                  <div className="setting-item">
                    <div className="setting-info">
                      <b>Auto-Approve Bookings</b>
                      <span className="text-muted">Automatically approve all booking requests</span>
                    </div>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={settings.booking.auto_approve}
                        onChange={(e) => handleSettingChange('booking', 'auto_approve', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <b>Advance Notice Required</b>
                      <span className="text-muted">Minimum hours before check-in for new bookings</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="number"
                        min="0"
                        max="168"
                        value={settings.booking.advance_notice_hours}
                        onChange={(e) => handleSettingChange('booking', 'advance_notice_hours', parseInt(e.target.value))}
                        className="input"
                        style={{ width: '100px' }}
                      />
                      <span>hours</span>
                    </div>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <b>Maximum Stay Duration</b>
                      <span className="text-muted">Maximum number of days for a single booking</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={settings.booking.max_stay_days}
                        onChange={(e) => handleSettingChange('booking', 'max_stay_days', parseInt(e.target.value))}
                        className="input"
                        style={{ width: '100px' }}
                      />
                      <span>days</span>
                    </div>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <b>Allow Same-Day Bookings</b>
                      <span className="text-muted">Accept bookings for today (subject to advance notice)</span>
                    </div>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={settings.booking.allow_same_day}
                        onChange={(e) => handleSettingChange('booking', 'allow_same_day', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'account' && (
                <div className="settings-section">
                  <h3 style={{ marginBottom: '16px' }}>Account Information</h3>
                  
                  <div className="setting-item">
                    <div className="setting-info">
                      <b>Email Address</b>
                      <span className="text-muted">Your account email for login and notifications</span>
                    </div>
                    <input
                      type="email"
                      className="input"
                      value={settings.account.email}
                      onChange={(e) => handleSettingChange('account', 'email', e.target.value)}
                      style={{ width: '250px' }}
                    />
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <b>Phone Number</b>
                      <span className="text-muted">Contact phone number for urgent communications</span>
                    </div>
                    <input
                      type="tel"
                      className="input"
                      value={settings.account.phone}
                      onChange={(e) => handleSettingChange('account', 'phone', e.target.value)}
                      style={{ width: '200px' }}
                    />
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <b>Language</b>
                      <span className="text-muted">Dashboard and notification language</span>
                    </div>
                    <select
                      className="input"
                      value={settings.account.language}
                      onChange={(e) => handleSettingChange('account', 'language', e.target.value)}
                      style={{ width: '150px' }}
                    >
                      <option value="en">English</option>
                      <option value="ur">Urdu</option>
                      <option value="ar">العربية</option>
                      <option value="fr">Français</option>
                    </select>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <b>Timezone</b>
                      <span className="text-muted">Local timezone for bookings and notifications</span>
                    </div>
                    <select
                      className="input"
                      value={settings.account.timezone}
                      onChange={(e) => handleSettingChange('account', 'timezone', e.target.value)}
                      style={{ width: '200px' }}
                    >
                      <option value="Asia/Karachi">Asia/Karachi (PKT)</option>
                      <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="panel mt-32">
            <div className="panel-head">
              <h3>Account Actions</h3>
            </div>
            <div style={{ padding: '16px 0' }}>
              <div className="setting-item">
                <div className="setting-info">
                  <b>Change Password</b>
                  <span className="text-muted">Update your account password for security</span>
                </div>
                <button className="btn btn-ghost btn-sm">
                  Change Password
                </button>
              </div>
              
              <div className="setting-item">
                <div className="setting-info">
                  <b>Download Account Data</b>
                  <span className="text-muted">Export your hotel data and analytics</span>
                </div>
                <button className="btn btn-ghost btn-sm">
                  Download Data
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