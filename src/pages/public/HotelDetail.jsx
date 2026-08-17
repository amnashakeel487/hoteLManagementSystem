import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PublicNav from '../../components/PublicNav';
import Footer from '../../components/Footer';
import { API_BASE_URL } from '../../config';

export default function HotelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Booking Modal State
  const [bookingRoom, setBookingRoom] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    check_in: new Date().toISOString().split('T')[0],
    check_out: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    guests_count: 2,
    special_requests: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    fetchHotel();
  }, [id]);

  const fetchHotel = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/hotels/public/${id}`);
      if (res.ok) {
        const data = await res.json();
        setHotel(data.hotel);
      } else {
        setError('Hotel not found or currently unavailable.');
      }
    } catch (err) {
      console.error('Error fetching hotel:', err);
      setError('Unable to load hotel details.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate nights and price
  const calculateTotal = (pricePerNight) => {
    if (!bookingForm.check_in || !bookingForm.check_out) return { nights: 1, total: pricePerNight };
    const d1 = new Date(bookingForm.check_in);
    const d2 = new Date(bookingForm.check_out);
    const diffTime = Math.abs(d2 - d1);
    const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    return {
      nights,
      total: nights * pricePerNight
    };
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setBookingError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/hotels/${id}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_id: bookingRoom.id,
          guest_name: bookingForm.guest_name,
          guest_email: bookingForm.guest_email,
          guest_phone: bookingForm.guest_phone,
          check_in: bookingForm.check_in,
          check_out: bookingForm.check_out
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Booking submission failed');
      }

      navigate(`/booking-confirmed/${data.booking?.id || id}`, {
        state: {
          booking: data.booking,
          hotel_name: data.hotel_name || hotel.name,
          room_category: data.room_category || bookingRoom.category,
          nights: data.nights,
          total_amount: data.total_amount
        }
      });
    } catch (err) {
      setBookingError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--cream-bg, #fbf6ec)' }}>
        <PublicNav />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
          <p>Loading hotel details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--cream-bg, #fbf6ec)' }}>
        <PublicNav />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
          <h2>{error || 'Hotel not found'}</h2>
          <Link to="/explore" className="btn btn-primary mt-16">← Back to explore stays</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const coverUrl = hotel.cover_path
    ? (hotel.cover_path.startsWith('http') ? hotel.cover_path : `${API_BASE_URL}/uploads/${hotel.cover_path.replace(/^\/+/, '')}`)
    : null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--cream-bg, #fbf6ec)' }}>
      <PublicNav />

      {/* Hotel Hero Banner */}
      <div style={{
        height: '360px',
        background: 'linear-gradient(rgba(10, 17, 40, 0.45), rgba(10, 17, 40, 0.85))',
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-end',
        paddingBottom: '40px'
      }}>
        {coverUrl && (
          <img 
            src={coverUrl} 
            alt={hotel.name}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: -1 }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        )}

        <div className="container" style={{ color: '#fff' }}>
          <div style={{ marginBottom: '12px' }}>
            <Link to="/explore" style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: '.85rem' }}>
              ← Back to all stays
            </Link>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span style={{
                background: 'var(--brass, #c5a880)',
                color: '#0f172a',
                fontSize: '.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: '4px 10px',
                borderRadius: '4px',
                display: 'inline-block',
                marginBottom: '8px'
              }}>
                {hotel.category || 'Hotel'} · Verified
              </span>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 700, margin: '4px 0', color: '#fff' }}>
                {hotel.name}
              </h1>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.85)', fontSize: '.95rem' }}>
                📍 {hotel.address}, {hotel.city}, {hotel.country}
              </p>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(8px)',
              padding: '12px 20px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.25)',
              textAlign: 'right'
            }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>★ {hotel.rating || 4.8} / 5.0</div>
              <span style={{ fontSize: '.8rem', color: 'rgba(255,255,255,0.8)' }}>
                Based on {hotel.review_count || 0} reviews
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Detail & Rooms Area */}
      <main className="container" style={{ padding: '40px 20px 80px', flex: 1 }}>
        <div className="detail-main-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px', alignItems: 'flex-start' }}>
          {/* Left Column: About & Room Showcase */}
          <div>
            <section style={{ background: '#ffffff', borderRadius: '12px', padding: '32px', border: '1px solid #e2e8f0', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 16px', color: '#0f172a' }}>
                About {hotel.name}
              </h2>
              <p style={{ color: '#475569', lineHeight: 1.7, fontSize: '.95rem', margin: '0 0 24px' }}>
                {hotel.description || 'Welcome to this prestigious property. Located in prime surroundings, offering guests an unforgettable stay with top-tier amenities and exceptional hospitality.'}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', background: '#f8fafc', padding: '20px', borderRadius: '8px' }}>
                <div>
                  <span style={{ fontSize: '.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Total Rooms</span>
                  <div style={{ fontWeight: 600, fontSize: '.95rem', color: '#0f172a' }}>{hotel.room_count || 10} Units</div>
                </div>
                <div>
                  <span style={{ fontSize: '.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Contact Email</span>
                  <div style={{ fontWeight: 600, fontSize: '.95rem', color: '#0f172a' }}>{hotel.email}</div>
                </div>
                <div>
                  <span style={{ fontSize: '.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Phone</span>
                  <div style={{ fontWeight: 600, fontSize: '.95rem', color: '#0f172a' }}>{hotel.phone}</div>
                </div>
              </div>
            </section>

            {/* Room Categories */}
            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                  Available Room Types ({hotel.rooms?.length || 0})
                </h2>
                <span style={{ fontSize: '.85rem', color: '#64748b' }}>Select a room to book</span>
              </div>

              {(!hotel.rooms || hotel.rooms.length === 0) ? (
                <div style={{ background: '#ffffff', borderRadius: '12px', padding: '32px', textAlign: 'center', border: '1px dashed #cbd5e1' }}>
                  <p style={{ color: '#64748b', margin: 0 }}>No standard room categories added yet. Contact hotel directly at {hotel.phone}.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {hotel.rooms.map(room => (
                    <div 
                      key={room.id}
                      className="detail-room-card"
                      style={{
                        background: '#ffffff',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        padding: '24px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '24px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
                            {room.category}
                          </h3>
                          <span style={{ fontSize: '.72rem', background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                            {room.total_units} Units Available
                          </span>
                        </div>

                        {/* Amenities */}
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '12px 0' }}>
                          {(room.amenities || ['Wi-Fi', 'Air Conditioning', 'Room Service']).map((am, i) => (
                            <span key={i} style={{ fontSize: '.78rem', background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '4px' }}>
                              ✓ {am}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="room-price-col" style={{ textAlign: 'right', borderLeft: '1px solid #f1f5f9', paddingLeft: '24px', minWidth: '170px' }}>
                        <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', fontFamily: 'var(--font-mono, monospace)' }}>
                          PKR {Number(room.price).toLocaleString()}
                        </div>
                        <span style={{ fontSize: '.75rem', color: '#64748b', display: 'block', marginBottom: '12px' }}>
                          per night (taxes incl.)
                        </span>
                        <button 
                          onClick={() => setBookingRoom(room)}
                          className="btn btn-primary"
                          style={{ width: '100%', padding: '10px 16px', fontWeight: 600 }}
                        >
                          Book Room →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Guest Reviews Section */}
            <section style={{ marginTop: '40px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 20px', color: '#0f172a' }}>
                Guest Reviews ({hotel.reviews?.length || 0})
              </h2>

              {(!hotel.reviews || hotel.reviews.length === 0) ? (
                <div style={{ background: '#ffffff', borderRadius: '12px', padding: '28px', color: '#64748b' }}>
                  No reviews posted yet. Be the first guest to review after your stay!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {hotel.reviews.map(rev => (
                    <div key={rev.id} style={{ background: '#ffffff', borderRadius: '8px', padding: '20px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <b style={{ color: '#0f172a' }}>{rev.guest_name}</b>
                        <span style={{ color: 'var(--brass-dark, #a88350)', fontWeight: 700 }}>★ {rev.rating} / 5</span>
                      </div>
                      <p style={{ color: '#475569', fontSize: '.9rem', margin: '0 0 12px', lineHeight: 1.5 }}>
                        "{rev.comment}"
                      </p>
                      {rev.owner_reply && (
                        <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', fontSize: '.85rem', color: '#334155', borderLeft: '3px solid var(--brass, #c5a880)' }}>
                          <b>Hotel response:</b> {rev.owner_reply}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Hotel Contact Card */}
          <div>
            <div className="detail-sticky-card" style={{ background: '#ffffff', borderRadius: '12px', padding: '28px', border: '1px solid #e2e8f0', position: 'sticky', top: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a' }}>Stay Guarantee</h3>
                <span className="hotel-free-cleaning-badge">✦ Certified</span>
              </div>
              <ul style={{ paddingLeft: '20px', color: '#475569', fontSize: '.88rem', lineHeight: 1.8, margin: '0 0 20px' }}>
                <li><strong style={{ color: 'var(--emerald, #1F6F5C)' }}>✦ Complimentary professional cleaning</strong> on every stay</li>
                <li>Direct communication with property owner</li>
                <li>Instant reservation confirmation</li>
                <li>Clean, certified accommodations</li>
                <li>Free cancellation up to 24h before check-in</li>
              </ul>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <span style={{ fontSize: '.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Direct Inquiries</span>
                <b style={{ color: '#0f172a', fontSize: '1rem' }}>{hotel.phone}</b>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Interactive Booking Modal */}
      {bookingRoom && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '24px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            maxWidth: '560px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '32px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#0f172a' }}>Book {bookingRoom.category}</h3>
                <span style={{ fontSize: '.85rem', color: '#64748b' }}>{hotel.name} · PKR {Number(bookingRoom.price).toLocaleString()} / night</span>
              </div>
              <button 
                type="button" 
                className="btn btn-ghost btn-sm" 
                onClick={() => setBookingRoom(null)}
                style={{ fontSize: '1.2rem', padding: '4px 10px' }}
              >
                ✕
              </button>
            </div>

            {bookingError && (
              <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '12px', borderRadius: '6px', fontSize: '.85rem', marginBottom: '16px' }}>
                {bookingError}
              </div>
            )}

            <form onSubmit={handleBookingSubmit}>
              <div className="field-group" style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Your Full Name</label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="e.g. John Doe"
                  value={bookingForm.guest_name}
                  onChange={(e) => setBookingForm(f => ({ ...f, guest_name: e.target.value }))}
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="field-group">
                  <label style={{ fontSize: '.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Email Address</label>
                  <input 
                    type="email" 
                    className="input" 
                    placeholder="john@example.com"
                    value={bookingForm.guest_email}
                    onChange={(e) => setBookingForm(f => ({ ...f, guest_email: e.target.value }))}
                    required 
                  />
                </div>
                <div className="field-group">
                  <label style={{ fontSize: '.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Phone Number</label>
                  <input 
                    type="tel" 
                    className="input" 
                    placeholder="+92 300 1234567"
                    value={bookingForm.guest_phone}
                    onChange={(e) => setBookingForm(f => ({ ...f, guest_phone: e.target.value }))}
                    required 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div className="field-group">
                  <label style={{ fontSize: '.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Check-in Date</label>
                  <input 
                    type="date" 
                    className="input" 
                    value={bookingForm.check_in}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setBookingForm(f => ({ ...f, check_in: e.target.value }))}
                    required 
                  />
                </div>
                <div className="field-group">
                  <label style={{ fontSize: '.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Check-out Date</label>
                  <input 
                    type="date" 
                    className="input" 
                    value={bookingForm.check_out}
                    min={bookingForm.check_in}
                    onChange={(e) => setBookingForm(f => ({ ...f, check_out: e.target.value }))}
                    required 
                  />
                </div>
              </div>

              {/* Price Calculation Summary */}
              {(() => {
                const { nights, total } = calculateTotal(Number(bookingRoom.price));
                return (
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.88rem', color: '#475569', marginBottom: '6px' }}>
                      <span>PKR {Number(bookingRoom.price).toLocaleString()} × {nights} {nights === 1 ? 'night' : 'nights'}</span>
                      <span>PKR {total.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.88rem', color: '#475569', marginBottom: '10px' }}>
                      <span>Taxes &amp; Service Fee</span>
                      <span style={{ color: '#059669', fontWeight: 600 }}>Included</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', borderTop: '1px solid #cbd5e1', paddingTop: '10px' }}>
                      <span>Total Due</span>
                      <span style={{ fontFamily: 'var(--font-mono, monospace)' }}>PKR {total.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })()}

              <button 
                type="submit" 
                className="btn btn-primary btn-block"
                style={{ padding: '14px', fontSize: '1rem', fontWeight: 600 }}
                disabled={submitting}
              >
                {submitting ? 'Submitting reservation...' : 'Confirm & Request Booking'}
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
