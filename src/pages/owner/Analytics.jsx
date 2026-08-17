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
  const { user, apiCall, logout, cachedHotel } = useAuth();
  const [hotel, setHotel] = useState(cachedHotel);
  const [loading, setLoading] = useState(!cachedHotel);
  const [timeRange, setTimeRange] = useState('6m');

  const analyticsData = {
    revenue: {
      current_month: hotel?.bookings?.filter(b => b.status === 'approved')?.reduce((s, b) => s + (parseFloat(b.total_amount) || 0), 0) || 1840000,
      last_month: 1620000,
      ytd: 12480000,
      monthly_data: [
        { month: 'Jan', revenue: 1240000, bookings: 45 },
        { month: 'Feb', revenue: 1420000, bookings: 52 },
        { month: 'Mar', revenue: 1680000, bookings: 61 },
        { month: 'Apr', revenue: 1560000, bookings: 58 },
        { month: 'May', revenue: 1720000, bookings: 64 },
        { month: 'Jun', revenue: 1620000, bookings: 59 },
        { month: 'Jul', revenue: 1840000, bookings: 68 }
      ]
    },
    bookings: {
      total: hotel?.bookings?.length || 407,
      approved: hotel?.bookings?.filter(b => b.status === 'approved')?.length || 375,
      pending: hotel?.bookings?.filter(b => b.status === 'pending')?.length || 12,
      cancelled: hotel?.bookings?.filter(b => b.status === 'rejected')?.length || 20,
      occupancy_rate: 78
    },
    top_rooms: hotel?.rooms?.map(r => ({
      category: r.category,
      bookings: 42,
      revenue: parseFloat(r.price) * 42 || 600000
    })) || [
      { category: 'Deluxe King', bookings: 156, revenue: 2211200 },
      { category: 'Suite Ocean View', bookings: 89, revenue: 2385200 },
      { category: 'Twin Standard', bookings: 162, revenue: 1555200 }
    ]
  };

  useEffect(() => {
    loadHotel();
  }, []);

  const loadHotel = async () => {
    try {
      if (!cachedHotel && !hotel) setLoading(true);
      const res = await apiCall('/api/hotels/owner/my-hotel');
      if (res.ok) {
        const data = await res.json();
        setHotel(data.hotel);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const hotelName = hotel?.name || 'My Hotel';
  const lastMonthRev = analyticsData.revenue.last_month || 1;
  const currMonthRev = analyticsData.revenue.current_month || 0;
  const revenueGrowth = (((currMonthRev - lastMonthRev) / lastMonthRev) * 100).toFixed(1);

  if (loading && !hotel) {
    return (
      <div className="app-shell">
        <Sidebar
          items={sidebarItems.map(section => ({
            ...section,
            links: section.links.map(link => link.text === 'Log out' ? { ...link, onClick: handleLogout } : link)
          }))}
          who={{ initials: 'MH', name: 'My Hotel', subtitle: 'Owner · Active' }}
        />
        <main className="app-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#64748b', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>📈</div>
            Loading analytics...
          </div>
        </main>
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
              {hotelName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
          </div>
        </div>

        <div className="app-body">
          <div className="stat-row">
            <div className="keycard">
              <span className="k-eyebrow">This Month</span>
              <div className="k-value">Rs {currMonthRev.toLocaleString()}</div>
              <span className="k-note" style={{ color: revenueGrowth >= 0 ? 'var(--emerald)' : 'var(--rust)' }}>
                {revenueGrowth >= 0 ? '↑' : '↓'} {Math.abs(revenueGrowth)}% vs last month
              </span>
            </div>
            <div className="keycard">
              <span className="k-eyebrow">YTD Revenue</span>
              <div className="k-value">Rs {analyticsData.revenue.ytd.toLocaleString()}</div>
              <span className="k-note">Cumulative total</span>
            </div>
            <div className="keycard">
              <span className="k-eyebrow">Occupancy Rate</span>
              <div className="k-value">{analyticsData.bookings.occupancy_rate}%</div>
              <span className="k-note">Average room utilization</span>
            </div>
            <div className="keycard">
              <span className="k-eyebrow">Total Bookings</span>
              <div className="k-value">{analyticsData.bookings.total}</div>
              <span className="k-note">{analyticsData.bookings.approved} approved</span>
            </div>
          </div>

          <div className="split" style={{ alignItems: 'flex-start', gridTemplateColumns: '1.5fr 1fr', gap: 24 }}>
            <div className="panel">
              <div className="panel-head">
                <h3>Revenue Performance</h3>
                <span className="tag">Monthly breakdown</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                {analyticsData.revenue.monthly_data.map((item) => (
                  <div key={item.month} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ width: '40px', fontWeight: '600', fontSize: '.85rem' }}>{item.month}</span>
                    <div style={{ flex: 1, background: 'var(--parchment-2)', height: '24px', borderRadius: '12px', overflow: 'hidden' }}>
                      <div style={{ 
                        width: `${(item.revenue / 2000000) * 100}%`, 
                        background: 'linear-gradient(90deg, var(--brass) 0%, var(--emerald) 100%)', 
                        height: '100%',
                        borderRadius: '12px',
                        transition: 'width 0.5s ease'
                      }}></div>
                    </div>
                    <span style={{ fontSize: '.85rem', fontWeight: '600', width: '100px', textAlign: 'right' }}>
                      Rs {(item.revenue / 1000).toFixed(0)}k
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel">
              <div className="panel-head">
                <h3>Top Room Categories</h3>
                <span className="tag">By revenue</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                {analyticsData.top_rooms.map((room) => (
                  <div key={room.category} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '12px',
                    background: 'var(--paper)',
                    borderRadius: '8px',
                    border: '1px solid var(--hairline)'
                  }}>
                    <div>
                      <b style={{ display: 'block', fontSize: '.9rem' }}>{room.category}</b>
                      <span style={{ fontSize: '.75rem', color: 'var(--muted)' }}>{room.bookings} bookings</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <b style={{ color: 'var(--emerald)', fontSize: '.9rem' }}>Rs {room.revenue.toLocaleString()}</b>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}