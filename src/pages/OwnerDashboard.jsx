import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';

const sidebarItems = [
  {
    links: [
      { icon: '▤', text: 'Overview', active: true },
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
      { icon: '⚙', text: 'Settings', href: '/owner/settings' },
      { icon: '⏻', text: 'Log out', href: '/' },
    ],
  },
];

export default function OwnerDashboard() {
  const { user, apiCall, logout } = useAuth();
  const [hotel, setHotel] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Use sample data for now instead of API calls
    setLoading(false);
    setHotel({
      id: 1,
      name: 'The Marlow Hotel',
      status: 'approved',
      room_count: 24
    });
    setBookings([
      { id: 1, guest_name: 'Hana Kobayashi', room_category: 'Deluxe King', check_in: '2026-08-20', check_out: '2026-08-23', status: 'pending' },
      { id: 2, guest_name: 'Marco Rossi', room_category: 'Twin Standard', check_in: '2026-08-22', check_out: '2026-08-24', status: 'pending' }
    ]);
    setReviews([
      { id: 1, guest_name: 'Hana Kobayashi', rating: 5, comment: 'Amazing stay! Perfect location.' },
      { id: 2, guest_name: 'Marco Rossi', rating: 4, comment: 'Great service, excellent breakfast.' }
    ]);
    setRooms([
      { id: 1, category: 'Deluxe King', price: 14200, total_units: 8, amenities: ['Wi-Fi', 'AC', 'Minibar'] },
      { id: 2, category: 'Twin Standard', price: 9600, total_units: 10, amenities: ['Wi-Fi', 'AC'] },
      { id: 3, category: 'Suite Ocean View', price: 26800, total_units: 6, amenities: ['Wi-Fi', 'AC', 'Balcony', 'Minibar'] }
    ]);
    setAnalytics({
      current_month: { bookings: 118, revenue: 1840000 },
      rating: { average: 4.7, total_reviews: 212 },
      monthly_revenue: [
        { month: 4, revenue: 520000 }, { month: 5, revenue: 640000 }, { month: 6, revenue: 480000 },
        { month: 7, revenue: 780000 }, { month: 8, revenue: 700000 }
      ]
    });
  }, []);

  const fetchDashboardData = async () => {
    try {
      // For demo purposes, we'll assume the user owns hotel ID 1
      // In a real app, you'd get this from the user profile or a separate API call
      const hotelId = 1;
      
      const [hotelRes, bookingsRes, reviewsRes, roomsRes, analyticsRes] = await Promise.all([
        apiCall(`/api/hotels/${hotelId}`),
        apiCall(`/api/hotels/${hotelId}/bookings`),
        apiCall(`/api/hotels/${hotelId}/reviews`),
        apiCall(`/api/hotels/${hotelId}/rooms`),
        apiCall(`/api/analytics/hotels/${hotelId}`)
      ]);

      if (hotelRes.ok) {
        const hotelData = await hotelRes.json();
        setHotel(hotelData.hotel);
      }

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData.bookings);
      }

      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        setReviews(reviewsData.reviews);
      }

      if (roomsRes.ok) {
        const roomsData = await roomsRes.json();
        setRooms(roomsData.rooms);
      }

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const setBookingStatus = async (bookingId, status) => {
    try {
      const res = await apiCall(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        // Update booking status in local state
        setBookings(bookings.map(booking => 
          booking.id === bookingId ? { ...booking, status } : booking
        ));
      }
    } catch (err) {
      console.error('Error updating booking status:', err);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Error Loading Dashboard</h2>
          <p>{error}</p>
          <button onClick={fetchDashboardData} className="btn btn-primary">Retry</button>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <h2>No Hotel Found</h2>
          <p>You don't appear to have a hotel associated with your account.</p>
          <button onClick={() => window.location.href = '/register'} className="btn btn-primary">Register a Hotel</button>
        </div>
      </div>
    );
  }

  // Calculate metrics
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const currentMonthRevenue = analytics?.current_month?.revenue || 0;
  const currentMonthBookings = analytics?.current_month?.bookings || 0;
  const averageRating = analytics?.rating?.average || 0;
  const totalReviews = analytics?.rating?.total_reviews || 0;

  // Generate calendar cells (simplified for demo)
  const calendarCells = Array.from({ length: 30 }, (_, i) => {
    const random = Math.random();
    let status = '';
    if (random > 0.8) status = 'booked';
    else if (random > 0.9) status = 'hold';
    return status;
  });

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
          <h1>Overview</h1>
          <div className="topbar-actions">
            <span className={`badge-stamp ${hotel.status}`}>
              <span className="dot"></span> {hotel.status.charAt(0).toUpperCase() + hotel.status.slice(1)}
            </span>
            <button className="icon-btn">🔔<span className="ping"></span></button>
            <div className="avatar" style={{ width: 34, height: 34, fontSize: '.75rem' }}>
              {hotel.name.split(' ').map(n => n[0]).join('')}
            </div>
          </div>
        </div>

        <div className="app-body">
          <div className="stat-row">
            <div className="keycard">
              <span className="k-eyebrow">Rooms live</span>
              <div className="k-value">{hotel.room_count}</div>
              <span className="k-note">{rooms.length} categories configured</span>
            </div>
            <div className="keycard">
              <span className="k-eyebrow">Bookings this month</span>
              <div className="k-value">{currentMonthBookings}</div>
              <span className="k-note">{pendingBookings} pending approval</span>
            </div>
            <div className="keycard">
              <span className="k-eyebrow">Revenue (MTD)</span>
              <div className="k-value">Rs {currentMonthRevenue.toLocaleString()}</div>
              <span className="k-note">Payouts every Friday</span>
            </div>
            <div className="keycard">
              <span className="k-eyebrow">Avg. rating</span>
              <div className="k-value">{averageRating}</div>
              <span className="k-note">Based on {totalReviews} reviews</span>
            </div>
          </div>

          <div className="split" style={{ alignItems: 'flex-start', gridTemplateColumns: '1.5fr 1fr', gap: 24 }}>
            <div className="panel">
              <div className="panel-head">
                <h3>Booking requests</h3>
                <span className="tag">{pendingBookings} need a response</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr><th>Guest</th><th>Room</th><th>Dates</th><th>Status</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {bookings.slice(0, 10).map((booking) => (
                      <tr key={booking.id}>
                        <td>
                          <div className="row-hotel">
                            <div className="thumb"></div>
                            <div><b>{booking.guest_name}</b><span>Booking #{booking.id}</span></div>
                          </div>
                        </td>
                        <td>{booking.room_category || 'N/A'}</td>
                        <td>{new Date(booking.check_in).toLocaleDateString()} - {new Date(booking.check_out).toLocaleDateString()}</td>
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
                <h3>Availability — Current Month</h3>
                <span className="tag">{hotel.room_count} rooms</span>
              </div>
              <div className="calendar-mini">
                {calendarCells.map((state, i) => (
                  <div key={i} className={`cell${state ? ` ${state}` : ''}`}>{i + 1}</div>
                ))}
              </div>
              <div className="flex gap-12 mt-16" style={{ fontSize: '.75rem' }}>
                <span className="flex items-center gap-8"><span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--emerald)', display: 'inline-block' }}></span> Booked</span>
                <span className="flex items-center gap-8"><span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--brass)', display: 'inline-block' }}></span> On hold</span>
                <span className="flex items-center gap-8"><span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--parchment-2)', display: 'inline-block' }}></span> Open</span>
              </div>
              <a href="#" className="btn btn-ghost btn-sm btn-block mt-24">Open full calendar</a>
            </div>
          </div>

          <div className="split mt-32" style={{ alignItems: 'flex-start', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div className="panel">
              <div className="panel-head">
                <h3>Revenue — last 6 months</h3>
                <span className="tag">PKR</span>
              </div>
              <div className="bar-chart" style={{ paddingBottom: 26 }}>
                {(analytics?.monthly_revenue || []).map((data, i) => (
                  <div key={i} className="bar" style={{ height: `${Math.min(data.revenue / 100, 100)}%`, animationDelay: `${i * 0.05}s` }}>
                    <span>M{data.month}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel">
              <div className="panel-head">
                <h3>Recent reviews</h3>
                <span className="tag">{averageRating} avg</span>
              </div>
              {reviews.slice(0, 2).map((review) => (
                <div key={review.id} className="review-item">
                  <div className="avatar" style={{ background: 'var(--emerald)', color: '#fff' }}>
                    {review.guest_name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="flex justify-between" style={{ width: '100%' }}>
                      <b style={{ fontSize: '.88rem' }}>{review.guest_name}</b>
                      <span className="stars">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                    </div>
                    <p className="text-muted mt-8" style={{ fontSize: '.85rem', margin: '6px 0 0' }}>
                      "{review.comment}"
                    </p>
                    {!review.owner_reply && (
                      <a href="#" style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--brass-dark)', display: 'inline-block', marginTop: 8 }}>Reply →</a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel mt-32">
            <div className="panel-head">
              <h3>Room categories</h3>
              <a href="#" className="btn btn-brass btn-sm">+ Add room category</a>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead><tr><th>Room</th><th>Amenities</th><th>Price / night</th><th>Units</th><th></th></tr></thead>
                <tbody>
                  {rooms.map((room) => (
                    <tr key={room.id}>
                      <td>
                        <div className="row-hotel">
                          <div className="thumb"></div>
                          <div><b>{room.category}</b><span>{room.total_units} rooms</span></div>
                        </div>
                      </td>
                      <td className="text-muted">{room.amenities.slice(0, 3).join(', ')}</td>
                      <td>Rs {room.price}</td>
                      <td>{room.total_units}</td>
                      <td><div className="table-actions"><button>✎</button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {currentMonthBookings >= 10 && (
            <div className="panel mt-32 flex justify-between items-center" style={{ flexWrap: 'wrap', gap: 20 }}>
              <div>
                <h3>Free cleaning service</h3>
                <p className="text-muted mt-8" style={{ fontSize: '.88rem' }}>
                  You're eligible based on {currentMonthBookings} bookings this month. Request a team for your next turnover.
                </p>
              </div>
              <a href="#" className="btn btn-primary">Request cleaning</a>
            </div>
          )}
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
