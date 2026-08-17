import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from '../../components/Sidebar';

const sidebarItems = [
  {
    links: [
      { icon: '▤', text: 'Hotel requests', href: '/admin' },
      { icon: '🏨', text: 'All hotels', href: '/admin/hotels' },
      { icon: '✦', text: 'Cleaning teams', href: '/admin/cleaning' },
      { icon: '📈', text: 'Platform analytics', active: true },
      { icon: '🔔', text: 'Notifications', href: '/admin/notifications' },
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

export default function PlatformAnalytics() {
  const { user, logout } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = () => {
    setAnalytics({
      overview: {
        totalRevenue: 24580000,
        totalBookings: 1247,
        activeHotels: 89,
        totalUsers: 3421,
        avgRating: 4.6,
        platformFee: 2458000
      },
      revenueByMonth: [
        { month: 'Jan', revenue: 3250000, bookings: 145 },
        { month: 'Feb', revenue: 2890000, bookings: 132 },
        { month: 'Mar', revenue: 4120000, bookings: 189 },
        { month: 'Apr', revenue: 3870000, bookings: 167 },
        { month: 'May', revenue: 4530000, bookings: 201 },
        { month: 'Jun', revenue: 4210000, bookings: 186 },
        { month: 'Jul', revenue: 4890000, bookings: 227 }
      ],
      topPerformingHotels: [
        { name: 'The Marlow Hotel', revenue: 1840000, bookings: 118, rating: 4.7, growth: 12 },
        { name: 'Sunset Ridge Resort', revenue: 1520000, bookings: 89, rating: 4.8, growth: 8 },
        { name: 'Coral Bay Villas', revenue: 1280000, bookings: 76, rating: 4.5, growth: 15 },
        { name: 'Northgate Inn', revenue: 960000, bookings: 54, rating: 4.3, growth: -3 }
      ],
      userGrowth: [
        { month: 'Jan', users: 2856 },
        { month: 'Feb', users: 2943 },
        { month: 'Mar', users: 3102 },
        { month: 'Apr', users: 3187 },
        { month: 'May', users: 3298 },
        { month: 'Jun', users: 3356 },
        { month: 'Jul', users: 3421 }
      ],
      countryStats: [
        { country: 'Pakistan', hotels: 23, revenue: 8940000, bookings: 456 },
        { country: 'India', hotels: 18, revenue: 6720000, bookings: 342 },
        { country: 'UAE', hotels: 15, revenue: 7890000, bookings: 289 },
        { country: 'Turkey', hotels: 12, revenue: 4560000, bookings: 198 },
        { country: 'Tanzania', hotels: 8, revenue: 3420000, bookings: 156 }
      ]
    });
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        Loading platform analytics...
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
          <h1>Platform Analytics</h1>
          <div className="topbar-actions">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="input"
              style={{ width: '120px' }}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <button className="icon-btn">🔔<span className="ping"></span></button>
            <div className="avatar" style={{ width: 34, height: 34, fontSize: '.75rem', background: 'var(--emerald)', color: '#fff' }}>AD</div>
          </div>
        </div>

        <div className="app-body">
          <div className="stat-row">
            <div className="keycard">
              <span className="k-eyebrow">Total Revenue</span>
              <div className="k-value">Rs {analytics.overview.totalRevenue.toLocaleString()}</div>
              <span className="k-note">↑ 18% vs last period</span>
            </div>
            <div className="keycard">
              <span className="k-eyebrow">Total Bookings</span>
              <div className="k-value">{analytics.overview.totalBookings.toLocaleString()}</div>
              <span className="k-note">↑ 12% vs last period</span>
            </div>
            <div className="keycard">
              <span className="k-eyebrow">Active Hotels</span>
              <div className="k-value">{analytics.overview.activeHotels}</div>
              <span className="k-note">Across 15 countries</span>
            </div>
            <div className="keycard">
              <span className="k-eyebrow">Platform Fee</span>
              <div className="k-value">Rs {analytics.overview.platformFee.toLocaleString()}</div>
              <span className="k-note">10% commission</span>
            </div>
          </div>

          <div className="split" style={{ alignItems: 'flex-start', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
            <div className="panel">
              <div className="panel-head">
                <h3>Revenue Trend</h3>
                <span className="tag">Monthly</span>
              </div>
              <div className="bar-chart" style={{ paddingBottom: 26, height: '200px' }}>
                {analytics.revenueByMonth.map((data, i) => (
                  <div key={data.month} className="bar" style={{ 
                    height: `${(data.revenue / Math.max(...analytics.revenueByMonth.map(d => d.revenue))) * 80 + 20}%`, 
                    animationDelay: `${i * 0.1}s` 
                  }}>
                    <span>{data.month}</span>
                    <div style={{ 
                      position: 'absolute', 
                      top: '-25px', 
                      left: '50%', 
                      transform: 'translateX(-50%)', 
                      fontSize: '.7rem', 
                      fontWeight: '600' 
                    }}>
                      Rs {(data.revenue / 1000).toFixed(0)}k
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel">
              <div className="panel-head">
                <h3>User Growth</h3>
                <span className="tag">Total: {analytics.overview.totalUsers}</span>
              </div>
              <div style={{ padding: '16px 0' }}>
                {analytics.userGrowth.slice(-4).map((data, i) => (
                  <div key={data.month} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: i < 3 ? '1px solid var(--hairline)' : 'none'
                  }}>
                    <span className="text-muted">{data.month}</span>
                    <b>{data.users.toLocaleString()}</b>
                  </div>
                ))}
              </div>
              <div style={{ 
                marginTop: '16px', 
                padding: '12px', 
                background: 'var(--parchment-1)', 
                borderRadius: '6px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '.85rem', color: 'var(--emerald)', fontWeight: '600' }}>
                  +{analytics.userGrowth[analytics.userGrowth.length - 1].users - analytics.userGrowth[analytics.userGrowth.length - 2].users} new users this month
                </div>
              </div>
            </div>
          </div>

          <div className="split mt-32" style={{ alignItems: 'flex-start', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div className="panel">
              <div className="panel-head">
                <h3>Top Performing Hotels</h3>
                <span className="tag">By Revenue</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Hotel</th>
                      <th>Revenue</th>
                      <th>Bookings</th>
                      <th>Rating</th>
                      <th>Growth</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.topPerformingHotels.map((hotel, index) => (
                      <tr key={hotel.name}>
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
                              fontSize: '.7rem',
                              fontWeight: '600'
                            }}>
                              {index + 1}
                            </span>
                            <b>{hotel.name}</b>
                          </div>
                        </td>
                        <td>Rs {hotel.revenue.toLocaleString()}</td>
                        <td>{hotel.bookings}</td>
                        <td>★ {hotel.rating}</td>
                        <td>
                          <span style={{ 
                            color: hotel.growth >= 0 ? 'var(--emerald)' : 'var(--rust)',
                            fontWeight: '600'
                          }}>
                            {hotel.growth >= 0 ? '+' : ''}{hotel.growth}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="panel">
              <div className="panel-head">
                <h3>Revenue by Country</h3>
                <span className="tag">Top Markets</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {analytics.countryStats.map((country, index) => (
                  <div key={country.country} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    background: 'var(--parchment-1)',
                    borderRadius: '6px'
                  }}>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '.9rem' }}>
                        {country.country}
                      </div>
                      <div style={{ fontSize: '.75rem', color: 'var(--ink-3)' }}>
                        {country.hotels} hotels • {country.bookings} bookings
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: '600', color: 'var(--emerald)' }}>
                        Rs {country.revenue.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '.75rem', color: 'var(--ink-3)' }}>
                        #{index + 1}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="panel mt-32">
            <div className="panel-head">
              <h3>Platform Health</h3>
              <span className="tag">Key Metrics</span>
            </div>
            <div className="stat-row" style={{ margin: '0' }}>
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '2rem', fontWeight: '600', color: 'var(--emerald)' }}>
                  {analytics.overview.avgRating}
                </div>
                <div style={{ fontSize: '.85rem', color: 'var(--ink-3)', marginTop: '4px' }}>
                  Average Rating
                </div>
              </div>
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '2rem', fontWeight: '600', color: 'var(--brass)' }}>
                  94%
                </div>
                <div style={{ fontSize: '.85rem', color: 'var(--ink-3)', marginTop: '4px' }}>
                  Approval Rate
                </div>
              </div>
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '2rem', fontWeight: '600', color: 'var(--emerald)' }}>
                  2.3h
                </div>
                <div style={{ fontSize: '.85rem', color: 'var(--ink-3)', marginTop: '4px' }}>
                  Avg Response Time
                </div>
              </div>
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '2rem', fontWeight: '600', color: 'var(--brass)' }}>
                  18%
                </div>
                <div style={{ fontSize: '.85rem', color: 'var(--ink-3)', marginTop: '4px' }}>
                  Growth Rate
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}