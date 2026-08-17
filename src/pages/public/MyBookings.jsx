import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import PublicNav from '../../components/PublicNav';
import Footer from '../../components/Footer';
import { API_BASE_URL } from '../../config';

const STATUS_META = {
  pending: {
    label: 'Pending Review',
    icon: '⏳',
    color: '#d97706',
    bg: '#fffbeb',
    border: '#fcd34d',
    desc: 'Your booking request has been received and is awaiting confirmation from the hotel owner.'
  },
  approved: {
    label: 'Confirmed',
    icon: '✅',
    color: '#059669',
    bg: '#ecfdf5',
    border: '#6ee7b7',
    desc: 'Great news! Your booking has been confirmed by the hotel. You are all set for your stay.'
  },
  rejected: {
    label: 'Declined',
    icon: '❌',
    color: '#dc2626',
    bg: '#fff1f2',
    border: '#fca5a5',
    desc: 'Unfortunately, this booking was declined. Please contact the hotel or try booking another room.'
  }
};

export default function MyBookings() {
  const [email, setEmail] = useState('');
  const [ref, setRef] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [printingId, setPrintingId] = useState(null);
  const printRef = useRef(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    setBookings([]);
    setSearched(false);

    try {
      const params = new URLSearchParams({ email: email.trim() });
      if (ref.trim()) params.append('ref', ref.trim());

      const res = await fetch(`${API_BASE_URL}/api/hotels/public/guest-bookings?${params}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Lookup failed');

      setBookings(data.bookings || []);
      setSearched(true);
    } catch (err) {
      setError(err.message || 'Unable to retrieve bookings. Please try again.');
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (booking) => {
    setPrintingId(booking.id);
    setTimeout(() => {
      const printContent = document.getElementById(`receipt-${booking.id}`);
      if (!printContent) return;

      const win = window.open('', '_blank', 'width=800,height=600');
      win.document.write(`
        <html>
          <head>
            <title>Booking Receipt — ${booking.reference}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #0f172a; background: #fff; padding: 40px; }
              .header { border-bottom: 2px solid #0a1128; padding-bottom: 20px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; }
              .brand { font-size: 1.4rem; font-weight: 700; color: #0a1128; }
              .brand small { display: block; font-size: .75rem; color: #64748b; font-weight: 400; margin-top: 2px; }
              .ref { font-size: 1rem; font-weight: 700; font-family: monospace; background: #f1f5f9; padding: 6px 14px; border-radius: 6px; }
              .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: .8rem; font-weight: 700; margin-bottom: 20px; }
              .status.approved { background: #ecfdf5; color: #059669; border: 1px solid #6ee7b7; }
              .status.pending { background: #fffbeb; color: #d97706; border: 1px solid #fcd34d; }
              .status.rejected { background: #fff1f2; color: #dc2626; border: 1px solid #fca5a5; }
              h2 { font-size: 1.1rem; color: #64748b; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
              td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: .9rem; }
              td:first-child { color: #64748b; width: 40%; font-weight: 500; }
              td:last-child { font-weight: 600; }
              .total-row td { font-size: 1rem; font-weight: 700; border-top: 2px solid #0a1128; padding-top: 14px; }
              .footer { margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: .78rem; color: #94a3b8; text-align: center; }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      win.document.close();
      win.focus();
      setTimeout(() => { win.print(); win.close(); }, 300);
      setPrintingId(null);
    }, 100);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fbf6ec' }}>
      <PublicNav />

      <main style={{ flex: 1, padding: '48px 20px 80px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>

          {/* Page Header */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{ fontSize: '.78rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#c5a880', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
              Booking Management
            </span>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 700, color: '#0f172a', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
              Track Your Reservation
            </h1>
            <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.6, maxWidth: '480px', margin: '0 auto' }}>
              Enter the email address you used when booking to retrieve all your reservations and their current status.
            </p>
          </div>

          {/* Search Form */}
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '28px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            marginBottom: '32px'
          }}>
            <form onSubmit={handleSearch}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'flex-end' }}>
                <div>
                  <label style={{ fontSize: '.82rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: '#334155' }}>
                    Email address used when booking *
                  </label>
                  <input
                    type="email"
                    className="input"
                    placeholder="e.g. john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ fontSize: '.95rem' }}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  style={{ padding: '11px 28px', fontWeight: 600, whiteSpace: 'nowrap' }}
                >
                  {loading ? 'Searching...' : 'Find Bookings'}
                </button>
              </div>

              <div style={{ marginTop: '12px' }}>
                <label style={{ fontSize: '.82rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: '#334155' }}>
                  Booking Reference (optional — e.g. STAY-0001)
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="STAY-0001"
                  value={ref}
                  onChange={(e) => setRef(e.target.value.toUpperCase())}
                  style={{ fontSize: '.9rem', maxWidth: '220px' }}
                />
              </div>
            </form>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: '#fff1f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '14px 18px', borderRadius: '8px', fontSize: '.9rem', marginBottom: '24px' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Empty State */}
          {searched && !error && bookings.length === 0 && (
            <div style={{
              background: '#ffffff',
              borderRadius: '12px',
              padding: '48px 24px',
              textAlign: 'center',
              border: '1px dashed #cbd5e1'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📋</div>
              <h3 style={{ margin: '0 0 8px', color: '#0f172a' }}>No bookings found</h3>
              <p style={{ color: '#64748b', margin: '0 0 20px', fontSize: '.9rem' }}>
                We couldn't find any reservations linked to this email address.
                Double-check the email you used when booking.
              </p>
              <Link to="/explore" className="btn btn-primary btn-sm">
                Browse Hotels →
              </Link>
            </div>
          )}

          {/* Booking Cards */}
          {bookings.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                  {bookings.length} Reservation{bookings.length > 1 ? 's' : ''} found
                </h2>
                <span style={{ fontSize: '.82rem', color: '#64748b' }}>Sorted by most recent</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {bookings.map(booking => {
                  const meta = STATUS_META[booking.status] || STATUS_META.pending;
                  return (
                    <div key={booking.id} style={{
                      background: '#ffffff',
                      borderRadius: '12px',
                      border: `1px solid #e2e8f0`,
                      overflow: 'hidden',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.03)'
                    }}>
                      {/* Status Banner */}
                      <div style={{ background: meta.bg, borderBottom: `1px solid ${meta.border}`, padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.1rem' }}>{meta.icon}</span>
                        <div>
                          <span style={{ fontSize: '.82rem', fontWeight: 700, color: meta.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {meta.label}
                          </span>
                          <p style={{ margin: '1px 0 0', fontSize: '.8rem', color: '#64748b' }}>{meta.desc}</p>
                        </div>
                      </div>

                      {/* Booking Detail Body */}
                      <div style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                          <div>
                            <div style={{ fontSize: '.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>
                              Booking Reference
                            </div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'monospace', color: '#0f172a' }}>
                              #{booking.reference}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>Total Amount</div>
                            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>
                              PKR {booking.total_amount?.toLocaleString() || '—'}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
                          <div>
                            <span style={{ fontSize: '.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>Hotel</span>
                            <b style={{ fontSize: '.95rem', color: '#0f172a' }}>{booking.hotel_name}</b>
                            <span style={{ fontSize: '.8rem', color: '#64748b', display: 'block' }}>{booking.hotel_city}, {booking.hotel_country}</span>
                          </div>
                          <div>
                            <span style={{ fontSize: '.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>Room Type</span>
                            <b style={{ fontSize: '.95rem', color: '#0f172a' }}>{booking.room_category}</b>
                            <span style={{ fontSize: '.8rem', color: '#64748b', display: 'block' }}>PKR {booking.room_price?.toLocaleString()} / night</span>
                          </div>
                          <div>
                            <span style={{ fontSize: '.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>Check-in</span>
                            <b style={{ fontSize: '.95rem', color: '#0f172a' }}>{new Date(booking.check_in + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</b>
                          </div>
                          <div>
                            <span style={{ fontSize: '.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>Check-out</span>
                            <b style={{ fontSize: '.95rem', color: '#0f172a' }}>{new Date(booking.check_out + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</b>
                          </div>
                          <div>
                            <span style={{ fontSize: '.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>Duration</span>
                            <b style={{ fontSize: '.95rem', color: '#0f172a' }}>{booking.nights} {booking.nights === 1 ? 'night' : 'nights'}</b>
                          </div>
                          <div>
                            <span style={{ fontSize: '.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>Booked On</span>
                            <b style={{ fontSize: '.95rem', color: '#0f172a' }}>{new Date(booking.created_at).toLocaleDateString()}</b>
                          </div>
                        </div>

                        {/* Hotel Contact */}
                        {booking.hotel_phone && (
                          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', fontSize: '.85rem', color: '#475569' }}>
                            <span>📞 Hotel: <b>{booking.hotel_phone}</b></span>
                            {booking.hotel_email && <span>✉️ <b>{booking.hotel_email}</b></span>}
                          </div>
                        )}

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => handlePrint(booking)}
                            disabled={printingId === booking.id}
                            className="btn btn-ghost btn-sm"
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
                          >
                            🖨️ {printingId === booking.id ? 'Preparing...' : 'Print Receipt'}
                          </button>
                          <Link
                            to={`/hotel/${booking.hotel_id}`}
                            className="btn btn-ghost btn-sm"
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
                          >
                            🏨 View Hotel
                          </Link>
                          {booking.status === 'rejected' && (
                            <Link
                              to="/explore"
                              className="btn btn-primary btn-sm"
                            >
                              Find Alternative Rooms →
                            </Link>
                          )}
                        </div>
                      </div>

                      {/* Hidden Receipt for Printing */}
                      <div id={`receipt-${booking.id}`} style={{ display: 'none' }}>
                        <div className="header">
                          <div>
                            <div className="brand">
                              Stayfolio — Guest Receipt
                              <small>Official Booking Confirmation Document</small>
                            </div>
                          </div>
                          <div className="ref">#{booking.reference}</div>
                        </div>

                        <span className={`status ${booking.status}`}>
                          {meta.label}
                        </span>

                        <h2>Reservation Details</h2>
                        <table>
                          <tbody>
                            <tr><td>Hotel</td><td>{booking.hotel_name}</td></tr>
                            <tr><td>Location</td><td>{booking.hotel_city}, {booking.hotel_country}</td></tr>
                            <tr><td>Hotel Contact</td><td>{booking.hotel_phone} · {booking.hotel_email}</td></tr>
                            <tr><td>Room Type</td><td>{booking.room_category}</td></tr>
                            <tr><td>Guest Name</td><td>{booking.guest_name}</td></tr>
                            <tr><td>Guest Email</td><td>{booking.guest_email}</td></tr>
                            {booking.guest_phone && <tr><td>Guest Phone</td><td>{booking.guest_phone}</td></tr>}
                            <tr><td>Check-in Date</td><td>{new Date(booking.check_in + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
                            <tr><td>Check-out Date</td><td>{new Date(booking.check_out + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
                            <tr><td>Duration</td><td>{booking.nights} {booking.nights === 1 ? 'night' : 'nights'}</td></tr>
                            <tr><td>Price per Night</td><td>PKR {booking.room_price?.toLocaleString()}</td></tr>
                            <tr><td>Booking Date</td><td>{new Date(booking.created_at).toLocaleString()}</td></tr>
                            <tr className="total-row"><td>Total Amount</td><td>PKR {booking.total_amount?.toLocaleString()}</td></tr>
                          </tbody>
                        </table>

                        <div className="footer">
                          This document is auto-generated by Stayfolio Platform. Reference: #{booking.reference} · {new Date().toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
