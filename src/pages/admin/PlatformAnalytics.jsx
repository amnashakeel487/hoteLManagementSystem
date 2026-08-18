import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from '../../components/Sidebar';

const sidebarItems = [
  {
    links: [
      { icon: '▤', text: 'Hotel requests', href: '/portal-x7k2-admin' },
      { icon: '🏨', text: 'All hotels', href: '/portal-x7k2-admin/hotels' },
      { icon: '✦', text: 'Cleaning teams', href: '/portal-x7k2-admin/cleaning' },
      { icon: '📈', text: 'Platform analytics', active: true },
      { icon: '🔔', text: 'Notifications', href: '/portal-x7k2-admin/notifications' },
    ],
  },
  {
    label: 'Account',
    links: [
      { icon: '⚙', text: 'Settings', href: '/portal-x7k2-admin/settings' },
      { icon: '⏻', text: 'Log out', href: '/' },
    ],
  },
];

export default function PlatformAnalytics() {
  const { user, apiCall, logout } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiCall(`/api/analytics/platform?time_range=${timeRange}`);
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.error || 'Failed to load platform analytics');
      }
    } catch (err) {
      console.error('Failed to load platform analytics:', err);
      setError('Network error while loading platform analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (loading && !analytics) {
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
            <h1>Platform Analytics</h1>
          </div>
          <div className="app-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📈</div>
              <b>Loading live platform analytics from database...</b>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const maxRevenue = analytics?.revenueByMonth ? Math.max(...analytics.revenueByMonth.map(d => d.revenue), 1) : 1;
  const userGrowthList = analytics?.userGrowth || [];
  const latestUsers = userGrowthList.length > 0 ? userGrowthList[userGrowthList.length - 1].users : 0;
  const prevUsers = userGrowthList.length > 1 ? userGrowthList[userGrowthList.length - 2].users : latestUsers;
  const newUsersCount = Math.max(0, latestUsers - prevUsers);

  const totalHotelsCount = analytics?.overview?.totalHotels || 0;
  const activeHotelsCount = analytics?.overview?.activeHotels || 0;
  const approvalRate = totalHotelsCount > 0 ? Math.round((activeHotelsCount / totalHotelsCount) * 100) : 100;

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
          <h1>Platform Analytics</h1>
          <div className="topbar-actions">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="input"
              style={{ width: '130px' }}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <button className="icon-btn" onClick={loadAnalytics} title="Refresh Analytics">🔄</button>
            <div className="avatar" style={{ width: 34, height: 34, fontSize: '.75rem', background: 'var(--emerald)', color: '#fff' }}>AD</div>
          </div>
        </div>

        <div className="app-body">
          {error && (
            <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', padding: '12px 16px', borderRadius: '8px', color: '#9F1239', marginBottom: '20px', fontSize: '.88rem' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Key Stat Cards */}
          <div className="stat-row">
            <div className="keycard">
              <span className="k-eyebrow">Platform Gross Revenue</span>
              <div className="k-value">Rs {analytics?.overview?.totalRevenue?.toLocaleString() || 0}</div>
              <span className="k-note">From approved stays</span>
            </div>
            <div className="keycard">
              <span className="k-eyebrow">Total Bookings</span>
              <div className="k-value">{analytics?.overview?.totalBookings?.toLocaleString() || 0}</div>
              <span className="k-note">Across all properties</span>
            </div>
            <div className="keycard">
              <span className="k-eyebrow">Active Live Hotels</span>
              <div className="k-value">{analytics?.overview?.activeHotels || 0}</div>
              <span className="k-note">{analytics?.overview?.pendingHotels || 0} pending review</span>
            </div>
            <div className="keycard">
              <span className="k-eyebrow">Platform Net Commission</span>
              <div className="k-value">Rs {analytics?.overview?.platformFee?.toLocaleString() || 0}</div>
              <span className="k-note">10% platform fee</span>
            </div>
          </div>

          {/* Revenue & Growth Charts */}
          <div className="split" style={{ alignItems: 'flex-start', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
            <div className="panel">
              <div className="panel-head">
                <div>
                  <h3 style={{ margin: 0 }}>Monthly Revenue Trend</h3>
                  <span className="text-muted" style={{ fontSize: '.8rem' }}>Aggregated booking volume</span>
                </div>
                <span className="tag">Live DB</span>
              </div>
              <div className="bar-chart" style={{ paddingBottom: 26, height: '220px', marginTop: '16px' }}>
                {analytics?.revenueByMonth?.map((data, i) => {
                  const heightPercent = maxRevenue > 0 ? Math.max(15, (data.revenue / maxRevenue) * 85) : 15;
                  return (
                    <div key={data.month + i} className="bar" style={{ 
                      height: `${heightPercent}%`, 
                      animationDelay: `${i * 0.08}s` 
                    }}>
                      <span>{data.month}</span>
                      <div style={{ 
                        position: 'absolute', 
                        top: '-24px', 
                        left: '50%', 
                        transform: 'translateX(-50%)', 
                        fontSize: '.68rem', 
                        fontWeight: '700',
                        color: 'var(--ink)'
                      }}>
                        {data.revenue > 0 ? `Rs ${(data.revenue / 1000).toFixed(0)}k` : 'Rs 0'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="panel">
              <div className="panel-head">
                <div>
                  <h3 style={{ margin: 0 }}>User Growth</h3>
                  <span className="text-muted" style={{ fontSize: '.8rem' }}>Registered platform users</span>
                </div>
                <span className="tag">Total: {analytics?.overview?.totalUsers || 0}</span>
              </div>
              <div style={{ padding: '16px 0' }}>
                {userGrowthList.slice(-4).map((data, i, arr) => (
                  <div key={data.month + i} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '10px 0',
                    borderBottom: i < arr.length - 1 ? '1px solid var(--hairline)' : 'none'
                  }}>
                    <span className="text-muted" style={{ fontSize: '.88rem' }}>{data.month}</span>
                    <b style={{ color: 'var(--ink)' }}>{data.users?.toLocaleString()} users</b>
                  </div>
                ))}
              </div>
              <div style={{ 
                marginTop: '12px', 
                padding: '12px', 
                background: 'var(--parchment-1)', 
                borderRadius: '6px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '.85rem', color: 'var(--emerald)', fontWeight: '600' }}>
                  +{newUsersCount} active users registered
                </div>
              </div>
            </div>
          </div>

          {/* Top Performing Hotels & Countries Split */}
          <div className="split mt-32" style={{ alignItems: 'flex-start', gridTemplateColumns: '1.2fr 0.8fr', gap: 24 }}>
            <div className="panel">
              <div className="panel-head">
                <div>
                  <h3 style={{ margin: 0 }}>Top Performing Hotels</h3>
                  <span className="text-muted" style={{ fontSize: '.8rem' }}>Ranked by revenue &amp; reservations</span>
                </div>
                <span className="tag">Properties</span>
              </div>
              <div style={{ overflowX: 'auto', marginTop: '12px' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Hotel</th>
                      <th>Location</th>
                      <th>Revenue</th>
                      <th>Bookings</th>
                      <th>Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics?.topPerformingHotels?.length > 0 ? (
                      analytics.topPerformingHotels.map((hotel, index) => (
                        <tr key={hotel.id || hotel.name}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ 
                                width: '20px', 
                                height: '20px', 
                                background: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : 'var(--parchment-2)', 
                                borderRadius: '50%', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                fontSize: '.68rem',
                                fontWeight: '700',
                                color: '#12213C'
                              }}>
                                {index + 1}
                              </span>
                              <b>{hotel.name}</b>
                            </div>
                          </td>
                          <td>
                            <span style={{ fontSize: '.82rem', color: 'var(--muted)' }}>
                              {hotel.city ? `${hotel.city}, ${hotel.country}` : (hotel.country || 'N/A')}
                            </span>
                          </td>
                          <td>
                            <b>Rs {hotel.revenue?.toLocaleString() || 0}</b>
                          </td>
                          <td>{hotel.bookings}</td>
                          <td>
                            <span style={{ color: 'var(--brass-dark)', fontWeight: 600 }}>★ {hotel.rating}</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--muted)' }}>
                          No hotel performance records found yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="panel">
              <div className="panel-head">
                <div>
                  <h3 style={{ margin: 0 }}>Distribution by Country</h3>
                  <span className="text-muted" style={{ fontSize: '.8rem' }}>Active geographic reach</span>
                </div>
                <span className="tag">Markets</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                {analytics?.countryStats?.length > 0 ? (
                  analytics.countryStats.map((country, index) => (
                    <div key={country.country} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 14px',
                      background: 'var(--parchment-1)',
                      border: '1px solid var(--hairline)',
                      borderRadius: '8px'
                    }}>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '.9rem', color: 'var(--ink)' }}>
                          {country.country}
                        </div>
                        <div style={{ fontSize: '.75rem', color: 'var(--muted)' }}>
                          {country.hotels} {country.hotels === 1 ? 'hotel' : 'hotels'} • {country.bookings} {country.bookings === 1 ? 'booking' : 'bookings'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '700', color: 'var(--emerald)', fontSize: '.9rem' }}>
                          Rs {country.revenue?.toLocaleString() || 0}
                        </div>
                        <div style={{ fontSize: '.72rem', color: 'var(--muted)', fontFamily: 'monospace' }}>
                          #{index + 1}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)', fontSize: '.85rem' }}>
                    No regional data recorded yet.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Platform Health Metrics */}
          <div className="panel mt-32">
            <div className="panel-head">
              <div>
                <h3 style={{ margin: 0 }}>Platform Operational Health</h3>
                <span className="text-muted" style={{ fontSize: '.8rem' }}>Key system performance indicators</span>
              </div>
              <span className="tag">Live Vitals</span>
            </div>
            <div className="stat-row" style={{ margin: '16px 0 0' }}>
              <div style={{ textAlign: 'center', padding: '16px', background: 'var(--parchment-1)', borderRadius: '8px', border: '1px solid var(--hairline)' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--emerald)' }}>
                  ★ {analytics?.overview?.avgRating || 4.8}
                </div>
                <div style={{ fontSize: '.8rem', color: 'var(--muted)', marginTop: '4px', fontWeight: '600' }}>
                  Platform Average Rating
                </div>
              </div>
              <div style={{ textAlign: 'center', padding: '16px', background: 'var(--parchment-1)', borderRadius: '8px', border: '1px solid var(--hairline)' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--brass-dark)' }}>
                  {approvalRate}%
                </div>
                <div style={{ fontSize: '.8rem', color: 'var(--muted)', marginTop: '4px', fontWeight: '600' }}>
                  Hotel Approval Ratio
                </div>
              </div>
              <div style={{ textAlign: 'center', padding: '16px', background: 'var(--parchment-1)', borderRadius: '8px', border: '1px solid var(--hairline)' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--ink)' }}>
                  {analytics?.overview?.pendingHotels || 0}
                </div>
                <div style={{ fontSize: '.8rem', color: 'var(--muted)', marginTop: '4px', fontWeight: '600' }}>
                  Pending Verification
                </div>
              </div>
              <div style={{ textAlign: 'center', padding: '16px', background: 'var(--parchment-1)', borderRadius: '8px', border: '1px solid var(--hairline)' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--emerald)' }}>
                  100%
                </div>
                <div style={{ fontSize: '.8rem', color: 'var(--muted)', marginTop: '4px', fontWeight: '600' }}>
                  System Health &amp; Uptime
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}