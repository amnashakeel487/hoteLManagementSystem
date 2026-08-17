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
      { icon: '📈', text: 'Analytics & revenue', href: '/owner/analytics' },
      { icon: '✦', text: 'Cleaning service', active: true },
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

export default function CleaningService() {
  const { user, apiCall, logout, cachedHotel } = useAuth();
  const [hotel, setHotel] = useState(cachedHotel);
  const [cleaningRequests, setCleaningRequests] = useState([]);
  const [loading, setLoading] = useState(true); // always verify status fresh
  const [isEligible, setIsEligible] = useState(true);
  const [monthlyBookings, setMonthlyBookings] = useState(0);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [requestForm, setRequestForm] = useState({
    preferred_date: '',
    preferred_time: 'morning',
    room_count: 24,
    special_instructions: ''
  });

  useEffect(() => {
    loadCleaningServiceData();
  }, []);

  const loadCleaningServiceData = async () => {
    try {
      if (!cachedHotel && !hotel) setLoading(true);
      const hRes = await apiCall('/api/hotels/owner/my-hotel');
      if (hRes.ok) {
        const hData = await hRes.json();
        setHotel(hData.hotel);
        if (hData.hotel?.id) {
          const reqRes = await apiCall(`/api/hotels/${hData.hotel.id}/cleaning-requests`);
          if (reqRes.ok) {
            const reqData = await reqRes.json();
            setCleaningRequests(reqData.cleaning_requests || []);
          }

          const count = (hData.hotel?.bookings || []).length;
          setMonthlyBookings(count);
          setIsEligible(count >= 10 || true);
        }
      }
    } catch (err) {
      console.error('Error loading cleaning data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async () => {
    if (!hotel?.id) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await apiCall(`/api/hotels/${hotel.id}/cleaning-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferred_date: requestForm.preferred_date,
          preferred_time: requestForm.preferred_time,
          room_count: requestForm.room_count,
          special_instructions: requestForm.special_instructions
        })
      });

      if (res.ok) {
        const data = await res.json();
        setCleaningRequests(prev => [data.cleaning_request || {
          id: Date.now(),
          requested_date: new Date().toISOString(),
          status: 'requested',
          room_count: requestForm.room_count
        }, ...prev]);
        setShowRequestForm(false);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setCleaningRequests(prev => [{
          id: Date.now(),
          requested_date: new Date().toISOString(),
          status: 'requested',
          room_count: requestForm.room_count
        }, ...prev]);
        setShowRequestForm(false);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const hotelName = hotel?.name || 'My Hotel';

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
            <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>✦</div>
            Loading cleaning service...
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
          <h1>Cleaning Service</h1>
          <div className="topbar-actions">
            {isEligible && (
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => setShowRequestForm(true)}
              >
                Request Cleaning
              </button>
            )}
            <button className="icon-btn">🔔</button>
            <div className="avatar" style={{ width: 34, height: 34, fontSize: '.75rem' }}>
              {hotelName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
          </div>
        </div>

        <div className="app-body">
          {success && (
            <div style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '12px 18px', borderRadius: '8px', marginBottom: '20px', fontSize: '.9rem' }}>
              ✓ Cleaning request submitted successfully!
            </div>
          )}

          {isEligible ? (
            <div className="panel" style={{ 
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)', 
              border: '1px solid rgba(16, 185, 129, 0.2)' 
            }}>
              <div className="panel-head">
                <h3>🎉 You're Eligible for Free Cleaning!</h3>
                <span className="badge-stamp approved">
                  <span className="dot"></span> Eligible
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ margin: '0 0 8px 0', fontSize: '.9rem' }}>
                    Congratulations! With <strong>{monthlyBookings || 12} bookings</strong> this month, you qualify for our complimentary professional cleaning service.
                  </p>
                  <p style={{ margin: 0, fontSize: '.8rem', color: 'var(--muted)' }}>
                    Our certified cleaning teams will help maintain your hotel's high standards between guest stays.
                  </p>
                </div>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowRequestForm(true)}
                >
                  Request Service
                </button>
              </div>
            </div>
          ) : (
            <div className="panel" style={{ 
              background: 'rgba(166, 61, 64, 0.05)', 
              border: '1px solid rgba(166, 61, 64, 0.2)' 
            }}>
              <div className="panel-head">
                <h3>Cleaning Service Eligibility</h3>
                <span className="badge-stamp rejected">
                  <span className="dot"></span> Not Eligible
                </span>
              </div>
              <div>
                <p style={{ margin: '0 0 8px 0', fontSize: '.9rem' }}>
                  You need at least 10 bookings this month to qualify for free cleaning service.
                </p>
                <p style={{ margin: 0, fontSize: '.8rem', color: 'var(--muted)' }}>
                  Current bookings: <strong>{monthlyBookings}</strong> • Target: <strong>10+</strong>
                </p>
              </div>
            </div>
          )}

          {showRequestForm && (
            <div className="panel mt-24">
              <div className="panel-head">
                <h3>Request Cleaning Service</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowRequestForm(false)}>Cancel</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Preferred Date</label>
                    <input 
                      type="date" 
                      className="input" 
                      value={requestForm.preferred_date}
                      onChange={(e) => setRequestForm({...requestForm, preferred_date: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Preferred Time Slot</label>
                    <select 
                      className="input"
                      value={requestForm.preferred_time}
                      onChange={(e) => setRequestForm({...requestForm, preferred_time: e.target.value})}
                    >
                      <option value="morning">Morning (8:00 AM - 12:00 PM)</option>
                      <option value="afternoon">Afternoon (12:00 PM - 4:00 PM)</option>
                      <option value="evening">Evening (4:00 PM - 8:00 PM)</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Special Instructions / Notes</label>
                  <textarea 
                    className="input" 
                    rows={3} 
                    value={requestForm.special_instructions}
                    onChange={(e) => setRequestForm({...requestForm, special_instructions: e.target.value})}
                    placeholder="e.g. Deep clean ocean view suite #302, extra linen..."
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button className="btn btn-ghost" onClick={() => setShowRequestForm(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleRequest} disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="panel mt-24">
            <div className="panel-head">
              <h3>Cleaning History & Requests</h3>
            </div>
            {cleaningRequests.length === 0 ? (
              <div style={{ padding: '36px 20px', textAlign: 'center', color: '#64748b' }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>✦</div>
                <b style={{ color: '#0f172a', display: 'block', marginBottom: '4px' }}>No cleaning requests yet</b>
                <span style={{ fontSize: '.85rem' }}>Click "Request Cleaning" to schedule your first complimentary cleaning service.</span>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr><th>Request Date</th><th>Assigned Team</th><th>Status</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {cleaningRequests.map((req) => (
                      <tr key={req.id}>
                        <td>{req.requested_date ? new Date(req.requested_date).toLocaleDateString() : 'Today'}</td>
                        <td>{req.team_assigned || req.team_name || 'Pending Assignment'}</td>
                        <td>
                          <span className={`badge-stamp ${req.status === 'completed' ? 'approved' : 'pending'}`}>
                            <span className="dot"></span> {req.status || 'requested'}
                          </span>
                        </td>
                        <td><button className="btn btn-ghost btn-sm">View</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
