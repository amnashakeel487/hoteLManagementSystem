import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from '../../components/Sidebar';

const sidebarItems = [
  {
    links: [
      { icon: '▤', text: 'Overview', href: '/owner' },
      { icon: '🏨', text: 'Hotel profile', href: '/owner/profile' },
      { icon: '🛏', text: 'Rooms & pricing', href: '/owner/rooms' },
      { icon: '📅', text: 'Bookings & calendar', active: true },
      { icon: '★', text: 'Reviews', href: '/owner/reviews' },
      { icon: '📈', text: 'Analytics & revenue', href: '/owner/analytics' },
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

export default function BookingsCalendar() {
  const { user, apiCall, logout, cachedHotel } = useAuth();
  const [hotel, setHotel] = useState(cachedHotel);
  const [bookings, setBookings] = useState(cachedHotel?.bookings || []);
  const [loading, setLoading] = useState(!cachedHotel);
  const [filter, setFilter] = useState('all');
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

  useEffect(() => {
    loadBookingsData();
  }, []);

  const loadBookingsData = async () => {
    try {
      if (!cachedHotel && !hotel) setLoading(true);
      const hRes = await apiCall('/api/hotels/owner/my-hotel');
      if (hRes.ok) {
        const hData = await hRes.json();
        setHotel(hData.hotel);
        setBookings(hData.hotel?.bookings || []);
      }
    } catch (err) {
      console.error('Error loading bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const setBookingStatus = async (bookingId, status) => {
    try {
      if (!hotel?.id) return;
      const res = await apiCall(`/api/hotels/${hotel.id}/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
      } else {
        const d = await res.json();
        alert('Failed: ' + (d.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error updating booking status:', err);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  const statusCounts = {
    pending: bookings.filter(b => b.status === 'pending').length,
    approved: bookings.filter(b => b.status === 'approved').length,
    rejected: bookings.filter(b => b.status === 'rejected').length
  };

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const monthName = currentMonthDate.toLocaleString('default', { month: 'long' });
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const generateCalendar = () => {
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayBookings = bookings.filter(b => 
        dateStr >= b.check_in && dateStr < b.check_out && b.status === 'approved'
      );
      days.push({ date: i, bookings: dayBookings });
    }
    return days;
  };

  const hotelName = hotel?.name || 'My Hotel';

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
          <h1>Bookings & Calendar</h1>
          <div className="topbar-actions">
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input"
              style={{ width: '140px' }}
            >
              <option value="all">All bookings</option>
              <option value="pending">Pending ({statusCounts.pending})</option>
              <option value="approved">Approved ({statusCounts.approved})</option>
              <option value="rejected">Rejected ({statusCounts.rejected})</option>
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
              <span className="k-eyebrow">Pending</span>
              <div className="k-value">{statusCounts.pending}</div>
              <span className="k-note">Need response</span>
            </div>
            <div className="keycard">
              <span className="k-eyebrow">Approved</span>
              <div className="k-value">{statusCounts.approved}</div>
              <span className="k-note">Confirmed bookings</span>
            </div>
            <div className="keycard">
              <span className="k-eyebrow">This Month</span>
              <div className="k-value">{bookings.length}</div>
              <span className="k-note">Total bookings</span>
            </div>
            <div className="keycard">
              <span className="k-eyebrow">Revenue</span>
              <div className="k-value">Rs {bookings.reduce((sum, b) => sum + b.total_amount, 0).toLocaleString()}</div>
              <span className="k-note">Total value</span>
            </div>
          </div>

          <div className="split" style={{ alignItems: 'flex-start', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div className="panel">
              <div className="panel-head">
                <h3>Booking Requests</h3>
                <span className="tag">{filteredBookings.length} bookings</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr><th>Guest</th><th>Room</th><th>Dates</th><th>Amount</th><th>Status</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((booking) => (
                      <tr key={booking.id}>
                        <td>
                          <div className="row-hotel">
                            <div className="thumb"></div>
                            <div>
                              <b>{booking.guest_name}</b>
                              <span>{booking.guest_email}</span>
                            </div>
                          </div>
                        </td>
                        <td>{booking.room_category}</td>
                        <td>
                          <div style={{ fontSize: '.8rem' }}>
                            <div>{new Date(booking.check_in).toLocaleDateString()}</div>
                            <div className="text-muted">to {new Date(booking.check_out).toLocaleDateString()}</div>
                          </div>
                        </td>
                        <td>Rs {booking.total_amount}</td>
                        <td><StatusBadge status={booking.status} /></td>
                        <td>
                          <div className="table-actions">
                            {booking.status === 'pending' ? (
                              <>
                                <button className="approve" onClick={() => setBookingStatus(booking.id, 'approved')}>✓</button>
                                <button className="reject" onClick={() => setBookingStatus(booking.id, 'rejected')}>✕</button>
                              </>
                            ) : (
                              <button>👁</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="panel">
              <div className="panel-head">
                <h3>{monthName} {year}</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className="btn btn-ghost btn-sm"
                    onClick={() => setCurrentMonthDate(new Date(year, month - 1, 1))}
                  >
                    ‹
                  </button>
                  <button 
                    className="btn btn-ghost btn-sm"
                    onClick={() => setCurrentMonthDate(new Date(year, month + 1, 1))}
                  >
                    ›
                  </button>
                </div>
              </div>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(7, 1fr)', 
                gap: '2px',
                marginBottom: '12px'
              }}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                  <div key={day} style={{ 
                    textAlign: 'center', 
                    fontSize: '.7rem', 
                    fontWeight: '600',
                    padding: '4px',
                    color: 'var(--muted)'
                  }}>
                    {day}
                  </div>
                ))}
              </div>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(7, 1fr)', 
                gap: '2px' 
              }}>
                {generateCalendar().map((day, index) => (
                  <div key={index} style={{
                    aspectRatio: '1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '.8rem',
                    borderRadius: '4px',
                    background: day.bookings.length > 0 ? 'var(--emerald)' : 'var(--parchment-2)',
                    color: day.bookings.length > 0 ? '#fff' : 'var(--ink-text)',
                    cursor: 'pointer'
                  }}>
                    {day.date}
                  </div>
                ))}
              </div>
              <div className="flex gap-12 mt-16" style={{ fontSize: '.75rem' }}>
                <span className="flex items-center gap-8">
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--emerald)', display: 'inline-block' }}></span> 
                  Booked
                </span>
                <span className="flex items-center gap-8">
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--parchment-2)', display: 'inline-block' }}></span> 
                  Available
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatusBadge({ status }) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span className={`badge-stamp ${status}`}>
      <span className="dot"></span> {label}
    </span>
  );
}