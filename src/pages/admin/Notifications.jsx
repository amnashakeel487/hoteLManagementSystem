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
      { icon: '🔔', text: 'Notifications', active: true },
    ],
  },
  {
    label: 'Account',
    links: [
      { icon: '⚙', text: 'Settings', href: '/admin/settings' },
      { icon: '⏻', text: 'Log out', href: '/' },
    ],
  },
];

export default function Notifications() {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    setNotifications([
      {
        id: 1,
        type: 'hotel_approval',
        title: 'Hotel Registration Approved',
        message: 'The Marlow Hotel registration has been approved and is now live on the platform.',
        timestamp: '2026-08-16T09:30:00Z',
        read: false,
        priority: 'medium',
        action_url: '/admin/hotels',
        metadata: { hotel_name: 'The Marlow Hotel', hotel_id: 1 }
      },
      {
        id: 2,
        type: 'cleaning_request',
        title: 'New Cleaning Request',
        message: 'Coral Bay Villas has requested cleaning services for 12 rooms.',
        timestamp: '2026-08-16T08:15:00Z',
        read: false,
        priority: 'high',
        action_url: '/admin/cleaning',
        metadata: { hotel_name: 'Coral Bay Villas', room_count: 12 }
      },
      {
        id: 3,
        type: 'hotel_registration',
        title: 'New Hotel Registration',
        message: 'Sierra Guest House has submitted their registration for review.',
        timestamp: '2026-08-15T16:45:00Z',
        read: true,
        priority: 'medium',
        action_url: '/admin',
        metadata: { hotel_name: 'Sierra Guest House', category: 'Guest House' }
      },
      {
        id: 4,
        type: 'revenue_milestone',
        title: 'Revenue Milestone Reached',
        message: 'Platform monthly revenue has exceeded Rs 5,000,000 for the first time!',
        timestamp: '2026-08-15T12:00:00Z',
        read: true,
        priority: 'low',
        action_url: '/admin/analytics',
        metadata: { amount: 5000000, milestone: 'monthly_revenue' }
      },
      {
        id: 5,
        type: 'system_alert',
        title: 'System Maintenance Scheduled',
        message: 'Platform maintenance is scheduled for August 20th, 2:00 AM - 4:00 AM UTC.',
        timestamp: '2026-08-14T10:00:00Z',
        read: true,
        priority: 'medium',
        action_url: null,
        metadata: { maintenance_date: '2026-08-20T02:00:00Z' }
      },
      {
        id: 6,
        type: 'hotel_suspension',
        title: 'Hotel Suspended',
        message: 'Palm Court Suites has been suspended due to policy violations.',
        timestamp: '2026-08-14T07:30:00Z',
        read: true,
        priority: 'high',
        action_url: '/admin/hotels',
        metadata: { hotel_name: 'Palm Court Suites', reason: 'Policy violation' }
      }
    ]);
    setLoading(false);
  };

  const markAsRead = (notificationId) => {
    setNotifications(notifications =>
      notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications =>
      notifications.map(n => ({ ...n, read: true }))
    );
  };

  const deleteNotification = (notificationId) => {
    setNotifications(notifications =>
      notifications.filter(n => n.id !== notificationId)
    );
  };

  const handleLogout = () => {
    logout();
  };

  const getNotificationIcon = (type) => {
    const icons = {
      'hotel_approval': '✅',
      'hotel_registration': '🏨',
      'cleaning_request': '🧹',
      'revenue_milestone': '💰',
      'system_alert': '⚠️',
      'hotel_suspension': '🚫'
    };
    return icons[type] || '📢';
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'high') return notification.priority === 'high';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        Loading notifications...
      </div>
    );
  }

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
          <h1>Notifications</h1>
          <div className="topbar-actions">
            <button 
              className="btn btn-ghost btn-sm"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              Mark all read
            </button>
            <button className="icon-btn">🔔<span className="ping"></span></button>
            <div className="avatar" style={{ width: 34, height: 34, fontSize: '.75rem', background: 'var(--emerald)', color: '#fff' }}>AD</div>
          </div>
        </div>

        <div className="app-body">
          <div className="stat-row">
            <div className="keycard">
              <span className="k-eyebrow">Total</span>
              <div className="k-value">{notifications.length}</div>
              <span className="k-note">All notifications</span>
            </div>
            <div className="keycard">
              <span className="k-eyebrow">Unread</span>
              <div className="k-value">{unreadCount}</div>
              <span className="k-note">Require attention</span>
            </div>
            <div className="keycard">
              <span className="k-eyebrow">High Priority</span>
              <div className="k-value">{notifications.filter(n => n.priority === 'high').length}</div>
              <span className="k-note">Urgent items</span>
            </div>
            <div className="keycard">
              <span className="k-eyebrow">Today</span>
              <div className="k-value">{notifications.filter(n => {
                const today = new Date().toDateString();
                const notificationDate = new Date(n.timestamp).toDateString();
                return today === notificationDate;
              }).length}</div>
              <span className="k-note">Recent activity</span>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <h3>Recent Activity</h3>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <select 
                  className="input" 
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  style={{ width: '140px' }}
                >
                  <option value="all">All notifications</option>
                  <option value="unread">Unread only</option>
                  <option value="high">High priority</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filteredNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px',
                    padding: '16px',
                    borderBottom: '1px solid var(--hairline)',
                    background: !notification.read ? 'rgba(16, 185, 129, 0.02)' : 'transparent',
                    cursor: 'pointer'
                  }}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: notification.priority === 'high' ? 'var(--rust)' : 
                              notification.priority === 'medium' ? 'var(--brass)' : 'var(--emerald)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    color: '#fff',
                    flexShrink: 0
                  }}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <h4 style={{ 
                        margin: 0, 
                        fontSize: '.9rem', 
                        fontWeight: !notification.read ? '600' : '500',
                        color: !notification.read ? 'var(--ink-1)' : 'var(--ink-2)'
                      }}>
                        {notification.title}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        <span style={{ 
                          fontSize: '.75rem', 
                          color: 'var(--ink-3)',
                          whiteSpace: 'nowrap'
                        }}>
                          {getTimeAgo(notification.timestamp)}
                        </span>
                        <button 
                          className="icon-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          style={{ 
                            width: '24px', 
                            height: '24px', 
                            fontSize: '.8rem',
                            color: 'var(--ink-3)'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    
                    <p style={{ 
                      margin: 0, 
                      fontSize: '.85rem', 
                      color: 'var(--ink-3)', 
                      lineHeight: '1.4',
                      marginBottom: notification.action_url ? '8px' : '0'
                    }}>
                      {notification.message}
                    </p>

                    {notification.action_url && (
                      <a 
                        href={notification.action_url}
                        style={{
                          fontSize: '.8rem',
                          color: 'var(--emerald)',
                          textDecoration: 'none',
                          fontWeight: '500'
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        View details →
                      </a>
                    )}

                    {!notification.read && (
                      <div style={{
                        position: 'absolute',
                        left: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: 'var(--emerald)'
                      }} />
                    )}
                  </div>
                </div>
              ))}

              {filteredNotifications.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--ink-3)' }}>
                  <p>No notifications found.</p>
                  {filter !== 'all' && (
                    <button 
                      className="btn btn-ghost btn-sm"
                      onClick={() => setFilter('all')}
                      style={{ marginTop: '12px' }}
                    >
                      View all notifications
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}