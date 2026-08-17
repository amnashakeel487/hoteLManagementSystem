import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

const BLANK_ROOM = { category: '', price: '', total_units: 1, amenities: [], description: '', max_occupancy: 2, size_sqm: 25 };
const AMENITIES = ['Wi-Fi','AC','Minibar','City View','Ocean View','Balcony','Work Desk','Safe','TV','Coffee Machine'];

export default function OwnerDashboard() {
  const { user, apiCall, logout, cachedHotel } = useAuth();
  const [hotel, setHotel] = useState(cachedHotel);
  const [bookings, setBookings] = useState(cachedHotel?.bookings || []);
  const [reviews, setReviews] = useState(cachedHotel?.reviews || []);
  const [rooms, setRooms] = useState(cachedHotel?.rooms || []);
  const [analytics, setAnalytics] = useState(null);
  // Always start loading=true so we ALWAYS do a fresh status check before rendering the dashboard.
  // This prevents a stale sessionStorage cache from bypassing the pending/rejected status gate.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [newRoom, setNewRoom] = useState(BLANK_ROOM);
  const [savingRoom, setSavingRoom] = useState(false);
  const [roomError, setRoomError] = useState('');
  const [replyingReviewId, setReplyingReviewId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [updatingBookingId, setUpdatingBookingId] = useState(null);

  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    try {
      if (!cachedHotel && !hotel) setLoading(true);
      const res = await apiCall('/api/hotels/owner/my-hotel');
      if (res.ok) {
        const data = await res.json();
        setHotel(data.hotel);
        setRooms(data.hotel.rooms || []);
        setBookings(data.hotel.bookings || []);
        setReviews(data.hotel.reviews || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
    if (!hotel?.id) {
      alert('Hotel data is still loading. Please wait a moment and try again.');
      return;
    }
    setUpdatingBookingId(bookingId);
    try {
      const res = await apiCall(`/api/hotels/${hotel.id}/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        setBookings(prev => prev.map(b =>
          b.id === bookingId ? { ...b, status } : b
        ));
      } else {
        const d = await res.json().catch(() => ({}));
        alert('Failed to update booking: ' + (d.error || `Server error ${res.status}`));
      }
    } catch (err) {
      console.error('Error updating booking status:', err);
      alert('Network error. Please check your connection and try again.');
    } finally {
      setUpdatingBookingId(null);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    const hotelName = hotel?.name || 'My Hotel';
    const initials = hotelName.split(' ').map(n => n[0]).join('').slice(0, 2);
    return (
      <div className="app-shell">
        <Sidebar
          items={sidebarItems.map(section => ({
            ...section,
            links: section.links.map(link => link.text === 'Log out' ? { ...link, onClick: handleLogout } : link)
          }))}
          who={{ initials, name: hotelName, subtitle: 'Owner · Verifying...' }}
        />
        <main className="app-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#64748b', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🏨</div>
            Verifying hotel status...
          </div>
        </main>
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

  // ── STATUS GATE: Block access if hotel is not approved/active ──────────────
  if (hotel && hotel.status !== 'approved' && hotel.status !== 'active') {
    const isPending = hotel.status === 'pending';
    const isRejected = hotel.status === 'rejected';
    const isSuspended = hotel.status === 'suspended';

    return (
      <div style={{ minHeight: '100vh', background: 'var(--parchment)', display: 'flex', flexDirection: 'column' }}>
        {/* Minimal nav */}
        <nav className="site-nav">
          <div className="container">
            <Link to="/" className="brand"><span className="mark"></span> Stayfolio</Link>
            <div className="nav-cta">
              <button onClick={handleLogout} className="btn btn-ghost btn-sm">Log out</button>
            </div>
          </div>
        </nav>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 24px' }}>
          <div className="panel" style={{ maxWidth: '600px', width: '100%', textAlign: 'center', padding: '56px 44px' }}>
            {/* Status icon */}
            <div style={{ width: '70px', height: '70px', margin: '0 auto 26px', borderRadius: '50%', background: 'var(--parchment-2)', display: 'grid', placeItems: 'center' }}>
              <span
                className={`stamp ${hotel.status}`}
                style={{ position: 'static', opacity: 1, animation: 'none', transform: 'rotate(-8deg)', borderWidth: '2.5px', padding: '6px 10px', fontSize: '.6rem' }}
              >
                {hotel.status}
              </span>
            </div>

            <span className="eyebrow" style={{ justifyContent: 'center' }}>
              {isPending ? 'Under Review' : isRejected ? 'Registration Rejected' : 'Account Suspended'}
            </span>
            <h1 className="mt-16" style={{ fontSize: '1.8rem' }}>
              {hotel.name || 'Your Hotel'} — <span style={{ color: isPending ? 'var(--brass-dark)' : 'var(--rust)' }}>
                {isPending ? 'Pending Approval' : isRejected ? 'Rejected' : 'Suspended'}
              </span>
            </h1>

            <p className="lede" style={{ margin: '16px auto 0' }}>
              {isPending && 'Your hotel registration is currently under review by our admin team. Rooms, bookings, and dashboard features will unlock the moment your hotel is approved. This usually takes up to 48 hours.'}
              {isRejected && `Your hotel registration was reviewed and rejected. ${hotel.rejection_reason ? `Reason: "${hotel.rejection_reason}"` : 'Please check your email for details.'} You can contact support or register again with corrected information.`}
              {isSuspended && 'Your hotel has been temporarily suspended by the platform administrator. Please contact support for more information.'}
            </p>

            {/* Status timeline for pending */}
            {isPending && (
              <div className="flow mt-32" style={{ textAlign: 'left' }}>
                <div className="flow-step">
                  <span className="fnum">01</span>
                  <h4>Submitted</h4>
                  <p>Your registration has been received.</p>
                </div>
                <div className="flow-step">
                  <span className="fnum">02</span>
                  <h4 style={{ color: 'var(--brass-dark)' }}>In review</h4>
                  <p>Admin is checking your documents now.</p>
                </div>
                <div className="flow-step" style={{ opacity: 0.5 }}>
                  <span className="fnum">03</span>
                  <h4>Decision</h4>
                  <p>Approved, or returned with a reason to fix.</p>
                </div>
              </div>
            )}

            {/* Rejection details */}
            {isRejected && hotel.rejection_reason && (
              <div style={{ background: 'rgba(166, 61, 64, 0.06)', border: '1px solid rgba(166, 61, 64, 0.2)', borderRadius: '8px', padding: '16px 20px', marginTop: '24px', textAlign: 'left' }}>
                <b style={{ color: 'var(--rust)', display: 'block', marginBottom: '6px' }}>Rejection Reason:</b>
                <p style={{ margin: 0, fontSize: '.9rem' }}>{hotel.rejection_reason}</p>
              </div>
            )}

            <div className="flex gap-12 mt-32" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/" className="btn btn-ghost">Back to home</Link>
              {isRejected && (
                <Link to="/register" className="btn btn-brass">Re-register Hotel</Link>
              )}
              <button onClick={handleLogout} className="btn btn-ghost" style={{ borderColor: 'var(--rust)', color: 'var(--rust)' }}>Log out</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate metrics from live data
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const currentMonthBookings = bookings.length;
  const currentMonthRevenue = bookings
    .filter(b => b.status === 'approved')
    .reduce((sum, b) => sum + (parseFloat(b.total_amount) || 0), 0);
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / reviews.length).toFixed(1)
    : '5.0';
  const totalReviews = reviews.length;

  // Generate calendar cells (simplified for demo)
  const calendarCells = Array.from({ length: 30 }, (_, i) => {
    const random = Math.random();
    let status = '';
    if (random > 0.8) status = 'booked';
    else if (random > 0.6) status = 'hold';
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
          initials: hotel.name.split(' ').map(n => n[0]).join('').slice(0, 2), 
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
              {hotel.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
          </div>
        </div>

        <div className="app-body">
          <div className="stat-row">
            <div className="keycard">
              <span className="k-eyebrow">Rooms live</span>
              <div className="k-value">{hotel.room_count || rooms.reduce((s, r) => s + (r.total_units || 0), 0)}</div>
              <span className="k-note">{rooms.length} categories configured</span>
            </div>
            <div className="keycard">
              <span className="k-eyebrow">Total Bookings</span>
              <div className="k-value">{currentMonthBookings}</div>
              <span className="k-note">{pendingBookings} pending approval</span>
            </div>
            <div className="keycard">
              <span className="k-eyebrow">Revenue (Approved)</span>
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
              {bookings.length === 0 ? (
                <div style={{ padding: '36px 20px', textAlign: 'center', color: '#64748b' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>📅</div>
                  <b style={{ color: '#0f172a', display: 'block', marginBottom: '4px' }}>No booking requests yet</b>
                  <span style={{ fontSize: '.85rem' }}>When a guest reserves a room on the public website, it will appear here for your review.</span>
                </div>
              ) : (
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
                              <div>
                                <b>{booking.guest_name}</b>
                                <span>{booking.guest_email || `Booking #${booking.id}`}</span>
                              </div>
                            </div>
                          </td>
                          <td>{booking.room_category || 'Room'}</td>
                          <td>{booking.check_in} - {booking.check_out}</td>
                          <td><StatusBadge status={booking.status} /></td>
                          <td>
                            <div className="table-actions">
                              {booking.status === 'pending' ? (
                                <>
                                  <button
                                    title="Approve"
                                    className="approve"
                                    disabled={updatingBookingId === booking.id}
                                    onClick={() => setBookingStatus(booking.id, 'approved')}
                                    style={{ opacity: updatingBookingId === booking.id ? 0.5 : 1, cursor: updatingBookingId === booking.id ? 'not-allowed' : 'pointer' }}
                                  >
                                    {updatingBookingId === booking.id ? '…' : '✓'}
                                  </button>
                                  <button
                                    title="Reject"
                                    className="reject"
                                    disabled={updatingBookingId === booking.id}
                                    onClick={() => setBookingStatus(booking.id, 'rejected')}
                                    style={{ opacity: updatingBookingId === booking.id ? 0.5 : 1, cursor: updatingBookingId === booking.id ? 'not-allowed' : 'pointer' }}
                                  >
                                    {updatingBookingId === booking.id ? '…' : '✕'}
                                  </button>
                                </>
                              ) : (
                                <span style={{ fontSize: '.75rem', color: booking.status === 'approved' ? 'var(--forest)' : 'var(--rust)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                                  {booking.status}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
              <Link to="/owner/bookings" className="btn btn-ghost btn-sm btn-block mt-24">Open full calendar →</Link>
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
                <Link to="/owner/reviews" style={{ fontSize: '.8rem', color: 'var(--brass-dark)', fontWeight: 600, textDecoration: 'none' }}>View all →</Link>
              </div>
              {reviews.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '.88rem' }}>No reviews received yet.</div>
              ) : (
                reviews.slice(0, 2).map((review) => (
                  <div key={review.id} className="review-item">
                    <div className="avatar" style={{ background: 'var(--emerald)', color: '#fff' }}>
                      {review.guest_name?.split(' ').map(n => n[0]).join('') || 'G'}
                    </div>
                    <div>
                      <div className="flex justify-between" style={{ width: '100%' }}>
                        <b style={{ fontSize: '.88rem' }}>{review.guest_name}</b>
                        <span className="stars">{'★'.repeat(review.rating || 5)}{'☆'.repeat(5 - (review.rating || 5))}</span>
                      </div>
                      <p className="text-muted mt-8" style={{ fontSize: '.85rem', margin: '6px 0 0' }}>
                        "{review.comment}"
                      </p>
                      {!review.owner_reply && (
                        <Link to="/owner/reviews" style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--brass-dark)', display: 'inline-block', marginTop: 8 }}>Reply →</Link>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="panel mt-32">
            <div className="panel-head">
              <h3>Room categories</h3>
              <button className="btn btn-brass btn-sm" onClick={() => { setShowAddRoom(true); setRoomError(''); }}>+ Add room category</button>
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

        </div>
      </main>

      {/* Add Room Modal */}
      {showAddRoom && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '660px', maxHeight: '90vh', overflow: 'auto', padding: '32px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>Add New Room Category</h2>
              <button onClick={() => setShowAddRoom(false)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#64748b' }}>×</button>
            </div>
            {roomError && <div style={{ background: '#fff1f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '.88rem' }}>⚠️ {roomError}</div>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <div className="form-group">
                  <label>Room Category Name *</label>
                  <input type="text" className="input" placeholder="e.g. Deluxe King" value={newRoom.category} onChange={e => setNewRoom({ ...newRoom, category: e.target.value })} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Price / night (Rs) *</label>
                    <input type="number" className="input" value={newRoom.price} onChange={e => setNewRoom({ ...newRoom, price: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Units</label>
                    <input type="number" className="input" min="1" value={newRoom.total_units} onChange={e => setNewRoom({ ...newRoom, total_units: e.target.value })} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Max Occupancy</label>
                    <input type="number" className="input" min="1" value={newRoom.max_occupancy} onChange={e => setNewRoom({ ...newRoom, max_occupancy: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Size (sqm)</label>
                    <input type="number" className="input" min="1" value={newRoom.size_sqm} onChange={e => setNewRoom({ ...newRoom, size_sqm: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea className="input" rows={3} placeholder="Describe this room..." value={newRoom.description} onChange={e => setNewRoom({ ...newRoom, description: e.target.value })} />
                </div>
              </div>
              <div>
                <div className="form-group">
                  <label>Amenities</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
                    {AMENITIES.map(a => (
                      <label key={a} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '.85rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={newRoom.amenities.includes(a)}
                          onChange={() => setNewRoom(prev => ({ ...prev, amenities: prev.amenities.includes(a) ? prev.amenities.filter(x => x !== a) : [...prev.amenities, a] }))} />
                        {a}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddRoom(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" disabled={savingRoom || !newRoom.category || !newRoom.price}
                onClick={async () => {
                  setSavingRoom(true); setRoomError('');
                  try {
                    const res = await apiCall(`/api/hotels/${hotel.id}/rooms`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ category: newRoom.category, price: parseFloat(newRoom.price), total_units: parseInt(newRoom.total_units), amenities: newRoom.amenities, description: newRoom.description, max_occupancy: parseInt(newRoom.max_occupancy), size_sqm: parseInt(newRoom.size_sqm) })
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || 'Failed');
                    setRooms(prev => [...prev, data.room]);
                    setNewRoom(BLANK_ROOM);
                    setShowAddRoom(false);
                  } catch (err) { setRoomError(err.message); }
                  finally { setSavingRoom(false); }
                }}>
                {savingRoom ? 'Saving...' : 'Add Room Category'}
              </button>
            </div>
          </div>
        </div>
      )}
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
