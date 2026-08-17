import { useLocation, Link, useParams } from 'react-router-dom';
import PublicNav from '../../components/PublicNav';
import Footer from '../../components/Footer';

export default function BookingConfirmation() {
  const { id } = useParams();
  const location = useLocation();
  const state = location.state || {};
  const booking = state.booking || {};

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--cream-bg, #fbf6ec)' }}>
      <PublicNav />

      <main className="container" style={{ flex: 1, padding: '60px 20px 100px', maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '48px 36px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: '#ecfdf5',
            color: '#059669',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            margin: '0 auto 20px'
          }}>
            ✓
          </div>

          <span style={{ fontSize: '.78rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--brass, #c5a880)', fontWeight: 700 }}>
            Reservation Received
          </span>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: '8px 0 16px', color: '#0f172a' }}>
            Your Booking Request is Confirmed!
          </h1>
          <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.6, margin: '0 0 32px' }}>
            We've sent the details to the property owner for instant check-in preparation.
          </p>

          <div style={{
            background: '#f8fafc',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'left',
            marginBottom: '32px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ color: '#64748b', fontSize: '.88rem' }}>Booking Reference</span>
              <b style={{ color: '#0f172a', fontFamily: 'var(--font-mono, monospace)' }}>#STAY-{booking.id || id}</b>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: '#64748b', fontSize: '.88rem' }}>Property</span>
              <b style={{ color: '#0f172a' }}>{state.hotel_name || 'Hotel Property'}</b>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: '#64748b', fontSize: '.88rem' }}>Room Selected</span>
              <span style={{ color: '#0f172a', fontWeight: 600 }}>{state.room_category || 'Room Category'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: '#64748b', fontSize: '.88rem' }}>Stay Dates</span>
              <span style={{ color: '#0f172a', fontWeight: 600 }}>
                {booking.check_in || 'Selected Date'} → {booking.check_out || 'Selected Date'} ({state.nights || 2} nights)
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
              <span style={{ color: '#0f172a', fontWeight: 700 }}>Total Amount</span>
              <b style={{ color: '#0f172a', fontSize: '1.2rem', fontFamily: 'var(--font-mono, monospace)' }}>
                PKR {state.total_amount?.toLocaleString() || '14,000'}
              </b>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <Link to="/explore" className="btn btn-primary">
              Explore More Stays
            </Link>
            <Link to="/" className="btn btn-ghost">
              Back to Home
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
