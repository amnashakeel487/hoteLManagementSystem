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
  const { user, logout } = useAuth();
  const [cleaningRequests, setCleaningRequests] = useState([
    { id: 1, requested_date: '2026-08-15T10:00:00Z', status: 'completed', team_assigned: 'Team Alpha', service_date: '2026-08-15T14:00:00Z' },
    { id: 2, requested_date: '2026-07-28T09:30:00Z', status: 'completed', team_assigned: 'Team Beta', service_date: '2026-07-29T11:00:00Z' }
  ]);

  const [isEligible, setIsEligible] = useState(true);
  const [monthlyBookings] = useState(118); // Current month bookings
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestForm, setRequestForm] = useState({
    preferred_date: '',
    preferred_time: 'morning',
    room_count: 24,
    special_instructions: ''
  });

  const handleRequest = () => {
    const newRequest = {
      id: cleaningRequests.length + 1,
      requested_date: new Date().toISOString(),
      status: 'requested',
      preferred_date: requestForm.preferred_date,
      preferred_time: requestForm.preferred_time,
      room_count: requestForm.room_count,
      special_instructions: requestForm.special_instructions
    };
    
    setCleaningRequests([newRequest, ...cleaningRequests]);
    setShowRequestForm(false);
    setRequestForm({
      preferred_date: '',
      preferred_time: 'morning',
      room_count: 24,
      special_instructions: ''
    });
  };

  const handleLogout = () => {
    logout();
  };

  const hotel = { name: 'The Marlow Hotel', status: 'approved' };

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
              {hotel.name.split(' ').map(n => n[0]).join('')}
            </div>
          </div>
        </div>

        <div className="app-body">
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
                    Congratulations! With <strong>{monthlyBookings} bookings</strong> this month, you qualify for our complimentary professional cleaning service.
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
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    className="btn btn-ghost btn-sm"
                    onClick={() => setShowRequestForm(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={handleRequest}
                    disabled={!requestForm.preferred_date}
                  >
                    Submit Request
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <div className="form-group">
                    <label>Preferred Date *</label>
                    <input
                      type="date"
                      className="input"
                      value={requestForm.preferred_date}
                      onChange={(e) => setRequestForm({...requestForm, preferred_date: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div className="form-group">
                    <label>Preferred Time</label>
                    <select
                      className="input"
                      value={requestForm.preferred_time}
                      onChange={(e) => setRequestForm({...requestForm, preferred_time: e.target.value})}
                    >
                      <option value="morning">Morning (8 AM - 12 PM)</option>
                      <option value="afternoon">Afternoon (12 PM - 4 PM)</option>
                      <option value="evening">Evening (4 PM - 8 PM)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Rooms to Clean</label>
                    <input
                      type="number"
                      className="input"
                      value={requestForm.room_count}
                      onChange={(e) => setRequestForm({...requestForm, room_count: parseInt(e.target.value)})}
                      min="1"
                      max="24"
                    />
                  </div>
                </div>

                <div>
                  <div className="form-group">
                    <label>Special Instructions</label>
                    <textarea
                      className="input"
                      rows={6}
                      value={requestForm.special_instructions}
                      onChange={(e) => setRequestForm({...requestForm, special_instructions: e.target.value})}
                      placeholder="Any specific cleaning requirements, areas of focus, or special instructions for the cleaning team..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="split mt-32" style={{ alignItems: 'flex-start', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
            <div className="panel">
              <div className="panel-head">
                <h3>Cleaning History</h3>
                <span className="tag">{cleaningRequests.length} requests</span>
              </div>
              
              {cleaningRequests.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {cleaningRequests.map((request) => (
                    <div key={request.id} style={{
                      padding: '16px',
                      border: '1px solid var(--hairline)',
                      borderRadius: '8px',
                      background: 'var(--paper)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                            Cleaning Request #{request.id}
                          </div>
                          <div style={{ fontSize: '.8rem', color: 'var(--muted)' }}>
                            Requested: {new Date(request.requested_date).toLocaleDateString()}
                          </div>
                        </div>
                        <StatusBadge status={request.status} />
                      </div>
                      
                      {request.team_assigned && (
                        <div style={{ fontSize: '.85rem', color: 'var(--muted)', marginBottom: '4px' }}>
                          Team: {request.team_assigned}
                        </div>
                      )}
                      
                      {request.service_date && (
                        <div style={{ fontSize: '.85rem', color: 'var(--muted)' }}>
                          Service Date: {new Date(request.service_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
                  <p>No cleaning requests yet.</p>
                  <p style={{ fontSize: '.8rem' }}>Submit your first request to get started!</p>
                </div>
              )}
            </div>

            <div className="panel">
              <div className="panel-head">
                <h3>Service Details</h3>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '.9rem' }}>What's Included</h4>
                  <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '.8rem', color: 'var(--muted)' }}>
                    <li>Deep cleaning of all rooms</li>
                    <li>Bathroom sanitization</li>
                    <li>Bed linen change</li>
                    <li>Vacuum and floor cleaning</li>
                    <li>Surface disinfection</li>
                    <li>Trash removal</li>
                  </ul>
                </div>

                <div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '.9rem' }}>Eligibility Requirements</h4>
                  <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '.8rem', color: 'var(--muted)' }}>
                    <li>Minimum 10 bookings per month</li>
                    <li>Hotel status: Approved</li>
                    <li>Good standing with platform</li>
                  </ul>
                </div>

                <div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '.9rem' }}>Service Schedule</h4>
                  <p style={{ margin: 0, fontSize: '.8rem', color: 'var(--muted)' }}>
                    Available 7 days a week, 8 AM - 8 PM. Advance booking recommended.
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

function StatusBadge({ status }) {
  const statusMap = {
    'requested': 'pending',
    'assigned': 'approved',
    'completed': 'approved'
  };
  
  const mappedStatus = statusMap[status] || status;
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  
  return (
    <span className={`badge-stamp ${mappedStatus}`}>
      <span className="dot"></span> {label}
    </span>
  );
}