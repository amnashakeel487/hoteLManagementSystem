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
      { icon: '📈', text: 'Analytics & revenue', active: true },
      { icon: '✦', text: 'Cleaning service', href: '/owner/cleaning' },
    ],
  },
  {
    label: 'Account',
    links: [
      { icon: '⚙', text: 'Settings', href: '/owner/settings' },
      { icon: '⏻', text: 'Log out', href: '/' },
    ],
  },
];

export default function Analytics() {
  const { user, apiCall, logout } = useAuth();
  const [hotel, setHotel] = useState(null);
  const [timeRange, setTimeRange] = useState('6m');

  useEffect(() => {
    loadHotel();
  }, []);

  const loadHotel = async () => {
    try {
      const res = await apiCall('/api/hotels/owner/my-hotel');
      if (res.ok) {
        const data = await res.json();
        setHotel(data.hotel);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const hotelName = hotel?.name || 'My Hotel';
  const revenueGrowth = ((analytics.revenue.current_month - analytics.revenue.last_month) / analytics.revenue.last_month * 100).toFixed(1);

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
          initials: hotelName.split(' ').map(n => n[0]).join('').slice(0, 2), 
          name: hotelName, 
          subtitle: `Owner · ${hotel?.status || 'Active'}` 
        }}
      />

      <main className="app-main">
        <div className="app-topbar">
          <h1>Analytics & Revenue</h1>
          <div className="topbar-actions">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="input"
              style={{ width: '120px' }}
            >
              <option value="1m">Last month</option>
              <option value="3m">Last 3 months</option>
              <option value="6m">Last 6 months</option>
              <option value="1y">Last year</option>
            </select>
            <button className="icon-btn">🔔</button>
            <div className="avatar" style={{ width: 34, height: 34, fontSize: '.75rem' }}>
              {hotel.name.split(' ').map(n => n[0]).join('')}
            </div>
          </div>
        </div>

        <div className="app-body">
          <div className="stat-row">
            <div className="keycard">
              <span className="k-eyebrow">This Month</span>
              <div className="k-value">Rs {analytics.revenue.current_month.toLocaleString()}</div>
              <span className="k-note" style={{ color: revenueGrowth >= 0 ? 'var(--emerald)' : 'var(--rust)' }}>
                {revenueGrowth >= 0 ? '↑' : '↓'} {Math.abs(revenueGrowth)}% vs last month
              </span>
            </div>
            <div className="keycard">
              <span className="k-eyebrow">YTD Revenue</span>
              <div className="k-value">Rs {analytics.revenue.ytd.toLocaleString()}</div>
              <span className="k-note">Year to date</span>
            </div>
            <div className="keycard">
              <span className="k-eyebrow">Occupancy Rate</span>
              <div className="k-value">{analytics.bookings.occupancy_rate}%</div>
              <span className="k-note">Average this month</span>
            </div>
            <div className="keycard">
              <span className="k-eyebrow">Total Bookings</span>
              <div className="k-value">{analytics.bookings.total}</div>
              <span className="k-note">{analytics.bookings.pending} pending</span>
            </div>
          </div>

          <div className="split" style={{ alignItems: 'flex-start', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
            <div className="panel">
              <div className="panel-head">
                <h3>Revenue Trend</h3>
                <span className="tag">Monthly</span>
              </div>
              <div className="bar-chart" style={{ paddingBottom: 26, height: '200px' }}>
                {analytics.revenue.monthly_data.map((data, i) => (
                  <div key={data.month} className="bar" style={{ 
                    height: `${(data.revenue / Math.max(...analytics.revenue.monthly_data.map(d => d.revenue))) * 80 + 20}%`, 
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
                <h3>Booking Status</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="text-muted">Approved</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ 
                      width: '60px', 
                      height: '6px', 
                      background: 'var(--parchment-2)', 
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${(analytics.bookings.approved / analytics.bookings.total) * 100}%`,
                        height: '100%',
                        background: 'var(--emerald)'
                      }} />
                    </div>
                    <span style={{ fontWeight: '600' }}>{analytics.bookings.approved}</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="text-muted">Pending</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ 
                      width: '60px', 
                      height: '6px', 
                      background: 'var(--parchment-2)', 
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${(analytics.bookings.pending / analytics.bookings.total) * 100}%`,
                        height: '100%',
                        background: 'var(--brass)'
                      }} />
                    </div>
                    <span style={{ fontWeight: '600' }}>{analytics.bookings.pending}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="text-muted">Cancelled</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ 
                      width: '60px', 
                      height: '6px', 
                      background: 'var(--parchment-2)', 
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${(analytics.bookings.cancelled / analytics.bookings.total) * 100}%`,
                        height: '100%',
                        background: 'var(--rust)'
                      }} />
                    </div>
                    <span style={{ fontWeight: '600' }}>{analytics.bookings.cancelled}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="split mt-32" style={{ alignItems: 'flex-start', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div className="panel">
              <div className="panel-head">
                <h3>Top Performing Rooms</h3>
                <span className="tag">By Revenue</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Room Category</th>
                      <th>Bookings</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.top_rooms.map((room, index) => (
                      <tr key={room.category}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ 
                              width: '20px', 
                              height: '20px', 
                              background: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : '#cd7f32', 
                              borderRadius: '50%', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              fontSize: '.7rem',
                              fontWeight: '600'
                            }}>
                              {index + 1}
                            </span>
                            <b>{room.category}</b>
                          </div>
                        </td>
                        <td>{room.bookings}</td>
                        <td>Rs {room.revenue.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="panel">
              <div className="panel-head">
                <h3>Performance Insights</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{
                  padding: '16px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: '8px',
                  borderLeft: '3px solid var(--emerald)'
                }}>
                  <div style={{ fontWeight: '600', fontSize: '.9rem', marginBottom: '4px' }}>
                    🎉 Great Performance!
                  </div>
                  <p style={{ margin: 0, fontSize: '.8rem', color: 'var(--muted)' }}>
                    Your revenue is up {revenueGrowth}% compared to last month. Keep up the excellent work!
                  </p>
                </div>

                <div style={{
                  padding: '16px',
                  background: 'rgba(176, 141, 87, 0.1)',
                  borderRadius: '8px',
                  borderLeft: '3px solid var(--brass)'
                }}>
                  <div style={{ fontWeight: '600', fontSize: '.9rem', marginBottom: '4px' }}>
                    💡 Optimization Tip
                  </div>
                  <p style={{ margin: 0, fontSize: '.8rem', color: 'var(--muted)' }}>
                    Your Deluxe King rooms have the highest booking rate. Consider adjusting pricing during peak periods.
                  </p>
                </div>

                <div style={{
                  padding: '16px',
                  background: 'rgba(251, 246, 236, 0.8)',
                  borderRadius: '8px',
                  borderLeft: '3px solid var(--hairline)'
                }}>
                  <div style={{ fontWeight: '600', fontSize: '.9rem', marginBottom: '4px' }}>
                    📊 Monthly Goals
                  </div>
                  <p style={{ margin: 0, fontSize: '.8rem', color: 'var(--muted)' }}>
                    You're 92% toward your monthly revenue target of Rs 2,000,000. Just Rs 160,000 to go!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}