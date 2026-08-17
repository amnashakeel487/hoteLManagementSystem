import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import { API_BASE_URL } from '../config';

const TABS = ['pending', 'approved', 'rejected', 'suspended'];

const sidebarItems = [
  {
    links: [
      { icon: '▤', text: 'Hotel requests', active: true },
      { icon: '🏨', text: 'All hotels', href: '/admin/hotels' },
      { icon: '✦', text: 'Cleaning teams', href: '/admin/cleaning' },
      { icon: '📈', text: 'Platform analytics', href: '/admin/analytics' },
      { icon: '🔔', text: 'Notifications', href: '/admin/notifications' },
      { icon: '🌐', text: 'Public website', href: '/explore' },
    ],
  },
  {
    label: 'Account',
    links: [
      { icon: '⚙', text: 'Settings', href: '/admin/settings' },
      { icon: '⏻', text: 'Log out', href: '/' },
    ],
  },
];

export default function AdminDashboard() {
  const { user, apiCall, logout } = useAuth();
  const [tab, setTab] = useState('pending');
  const [hotels, setHotels] = useState({
    pending: [],
    approved: [],
    rejected: [],
    suspended: []
  });
  const [reviewing, setReviewing] = useState(null);
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [rejectingHotel, setRejectingHotel] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectSubmitting, setRejectSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const res = await apiCall('/api/admin/hotels?status=all');
      if (res.ok) {
        const data = await res.json();
        const allHotels = data.hotels || [];
        
        const grouped = {
          pending: allHotels.filter(h => h.status === 'pending'),
          approved: allHotels.filter(h => h.status === 'approved' || h.status === 'active'),
          rejected: allHotels.filter(h => h.status === 'rejected'),
          suspended: allHotels.filter(h => h.status === 'suspended')
        };
        
        setHotels(grouped);
        if (grouped.pending.length > 0) {
          setReviewing(grouped.pending[0]);
        } else if (allHotels.length > 0) {
          setReviewing(allHotels[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const approveHotel = async (hotelId) => {
    try {
      const res = await apiCall(`/api/admin/hotels/${hotelId}/approve`, {
        method: 'POST'
      });
      if (res.ok) {
        const hotel = hotels.pending.find(h => h.id === hotelId);
        if (hotel) {
          setHotels(prev => ({
            ...prev,
            pending: prev.pending.filter(h => h.id !== hotelId),
            approved: [{ ...hotel, status: 'approved' }, ...prev.approved]
          }));
          if (reviewing?.id === hotelId) {
            setReviewing({ ...reviewing, status: 'approved' });
          }
        }
      }
    } catch (err) {
      console.error('Failed to approve hotel:', err);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingHotel) return;
    const reason = rejectReason.trim() || 'Application does not meet platform criteria.';
    try {
      setRejectSubmitting(true);
      const res = await apiCall(`/api/admin/hotels/${rejectingHotel.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      if (res.ok) {
        const hotelId = rejectingHotel.id;
        const hotel = hotels.pending.find(h => h.id === hotelId);
        if (hotel) {
          setHotels(prev => ({
            ...prev,
            pending: prev.pending.filter(h => h.id !== hotelId),
            rejected: [{ ...hotel, status: 'rejected', rejection_reason: reason }, ...prev.rejected]
          }));
          if (reviewing?.id === hotelId) {
            setReviewing({ ...reviewing, status: 'rejected', rejection_reason: reason });
          }
        }
        setRejectingHotel(null);
        setRejectReason('');
      }
    } catch (err) {
      console.error('Failed to reject hotel:', err);
    } finally {
      setRejectSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        Loading admin dashboard...
      </div>
    );
  }

  const counts = {
    pending: hotels.pending?.length || 0,
    approved: hotels.approved?.length || 0,
    rejected: hotels.rejected?.length || 0,
    suspended: hotels.suspended?.length || 0
  };

  const currentHotels = hotels[tab] || [];

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
          initials: 'AD', 
          name: user?.email?.split('@')[0] || 'Admin', 
          subtitle: 'Platform Admin', 
          avatarStyle: { background: 'var(--emerald)', color: '#fff' } 
        }}
      />

      <main className="app-main">
        <div className="app-topbar">
          <h1>Hotel requests</h1>
          <div className="topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link 
              to="/explore" 
              target="_blank" 
              className="btn btn-ghost btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '.82rem', fontWeight: 600, padding: '6px 14px' }}
            >
              🌐 Visit Public Website ↗
            </Link>
            <button className="icon-btn">🔔<span className="ping"></span></button>
            <div className="avatar" style={{ width: 34, height: 34, fontSize: '.75rem', background: 'var(--emerald)', color: '#fff' }}>AD</div>
          </div>
        </div>

        <div className="app-body">
          <div className="stat-row">
            <div className="keycard">
              <span className="k-eyebrow">Pending</span>
              <div className="k-value">{counts.pending}</div>
              <span className="k-note">Awaiting review</span>
            </div>
            <div className="keycard">
              <span className="k-eyebrow">Approved</span>
              <div className="k-value">{counts.approved}</div>
              <span className="k-note">Active hotels</span>
            </div>
            <div className="keycard">
              <span className="k-eyebrow">Rejected</span>
              <div className="k-value">{counts.rejected}</div>
              <span className="k-note">Need revision</span>
            </div>
            <div className="keycard">
              <span className="k-eyebrow">Suspended</span>
              <div className="k-value">{counts.suspended}</div>
              <span className="k-note">Policy holds</span>
            </div>
          </div>

          <div className="panel">
            <div className="tab-row">
              {TABS.map((t) => (
                <button key={t} className={`tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
                  {t.charAt(0).toUpperCase() + t.slice(1)} <span className="count">{counts[t]}</span>
                </button>
              ))}
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Hotel</th>
                    <th>Owner</th>
                    <th>Location</th>
                    <th>{tab === 'pending' ? 'Submitted' : tab === 'rejected' ? 'Reason' : 'Status'}</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentHotels.map((hotel) => (
                    <tr key={hotel.id}>
                      <td>
                        <div className="row-hotel">
                          <div className="thumb"></div>
                          <div>
                            <b>{hotel.name}</b>
                            <span>#{hotel.id} · {hotel.category}</span>
                          </div>
                        </div>
                      </td>
                      <td>{hotel.business_name}</td>
                      <td>{hotel.city}, {hotel.country}</td>
                      <td>
                        {tab === 'pending' && <span className="text-muted">{new Date(hotel.created_at).toLocaleDateString()}</span>}
                        {tab === 'rejected' && <span className="text-muted">{hotel.rejection_reason}</span>}
                        {(tab === 'approved' || tab === 'suspended') && <StatusBadge status={hotel.status} />}
                      </td>
                      <td>
                        <div className="table-actions">
                          {tab === 'pending' && (
                            <>
                              <button className="approve" onClick={() => approveHotel(hotel.id)}>✓</button>
                              <button className="reject" onClick={() => {
                                setRejectingHotel(hotel);
                                setRejectReason('');
                              }}>✕</button>
                            </>
                          )}
                          <button onClick={() => setReviewing(hotel)}>👁</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="split mt-32" style={{ alignItems: 'flex-start', gridTemplateColumns: '1.3fr 1fr', gap: 24 }}>
            {reviewing && (
              <div className="panel">
                <div className="panel-head">
                  <h3>Reviewing — {reviewing.name}</h3>
                  <StatusBadge status={reviewing.status} />
                </div>
                <div className="field-row">
                  <div>
                    <span className="text-muted" style={{ fontSize: '.76rem' }}>Business / owner</span>
                    <p style={{ margin: '4px 0 0', fontWeight: 600 }}>{reviewing.business_name}</p>
                  </div>
                  <div>
                    <span className="text-muted" style={{ fontSize: '.76rem' }}>Category</span>
                    <p style={{ margin: '4px 0 0', fontWeight: 600 }}>{reviewing.category}, {reviewing.room_count} rooms</p>
                  </div>
                </div>
                <div className="field-row mt-16">
                  <div>
                    <span className="text-muted" style={{ fontSize: '.76rem' }}>Email</span>
                    <p style={{ margin: '4px 0 0', fontWeight: 600 }}>{reviewing.email}</p>
                  </div>
                  <div>
                    <span className="text-muted" style={{ fontSize: '.76rem' }}>Phone</span>
                    <p style={{ margin: '4px 0 0', fontWeight: 600 }}>{reviewing.phone}</p>
                  </div>
                </div>
                <div className="mt-16">
                  <span className="text-muted" style={{ fontSize: '.76rem' }}>Address</span>
                  <p style={{ margin: '4px 0 0', fontWeight: 600 }}>{reviewing.address}, {reviewing.city}, {reviewing.country}</p>
                </div>
                <div className="mt-16">
                  <span className="text-muted" style={{ fontSize: '.76rem' }}>Description</span>
                  <p style={{ margin: '4px 0 0', fontWeight: 400, fontSize: '.9rem' }}>{reviewing.description || 'No description provided'}</p>
                </div>
                {reviewing.status === 'rejected' && reviewing.rejection_reason && (
                  <div className="mt-16">
                    <span className="text-muted" style={{ fontSize: '.76rem' }}>Rejection Reason</span>
                    <p style={{ margin: '4px 0 0', fontWeight: 400, fontSize: '.9rem', color: 'var(--rust)' }}>{reviewing.rejection_reason}</p>
                  </div>
                )}
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn btn-ghost btn-sm" 
                    style={{ fontSize: '.85rem', fontWeight: 600 }}
                    onClick={() => setShowDocsModal(true)}
                  >
                    📄 View uploaded documents
                  </button>
                  {reviewing.status === 'pending' && (
                    <div className="flex gap-12">
                      <button 
                        className="btn btn-ghost btn-sm" 
                        style={{ color: 'var(--rust)', borderColor: 'var(--rust)' }}
                        onClick={() => {
                          setRejectingHotel(reviewing);
                          setRejectReason('');
                        }}
                      >
                        Reject
                      </button>
                      <button 
                        className="btn btn-primary btn-sm" 
                        onClick={() => approveHotel(reviewing.id)}
                      >
                        Approve hotel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="panel">
              <div className="panel-head">
                <h3>Activity Overview</h3>
                <span className="tag">This week</span>
              </div>
              <div className="mt-24">
                <div className="flex justify-between items-center">
                  <span className="text-muted" style={{ fontSize: '.85rem' }}>New registrations</span>
                  <b style={{ fontFamily: 'var(--font-mono)' }}>{counts.pending}</b>
                </div>
                <div className="flex justify-between items-center mt-12">
                  <span className="text-muted" style={{ fontSize: '.85rem' }}>Total active hotels</span>
                  <b style={{ fontFamily: 'var(--font-mono)' }}>{counts.approved}</b>
                </div>
                <div className="flex justify-between items-center mt-12">
                  <span className="text-muted" style={{ fontSize: '.85rem' }}>Rejected applications</span>
                  <b style={{ fontFamily: 'var(--font-mono)' }}>{counts.rejected}</b>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Documents Modal */}
      {showDocsModal && reviewing && (
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
            maxWidth: '750px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '32px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{reviewing.name} — Documents</h3>
                <span className="text-muted" style={{ fontSize: '.85rem' }}>Uploaded during registration</span>
              </div>
              <button 
                type="button" 
                className="btn btn-ghost btn-sm" 
                onClick={() => setShowDocsModal(false)}
                style={{ fontSize: '1.2rem', padding: '4px 12px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Business License */}
              <DocumentCard 
                title="Business License" 
                filePath={reviewing.license_path} 
                icon="📜"
              />

              {/* Identity Document */}
              <DocumentCard 
                title="CNIC / Identity Document" 
                filePath={reviewing.id_doc_path} 
                icon="🪪"
              />

              {/* Logo */}
              <DocumentCard 
                title="Hotel Logo" 
                filePath={reviewing.logo_path} 
                icon="🏷️"
                isImage={true}
              />

              {/* Cover Image */}
              <DocumentCard 
                title="Cover Image" 
                filePath={reviewing.cover_path} 
                icon="🖼️"
                isImage={true}
              />
            </div>

            <div style={{ marginTop: '28px', textAlign: 'right' }}>
              <button className="btn btn-primary" onClick={() => setShowDocsModal(false)}>
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Professional Rejection Modal */}
      {rejectingHotel && (
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
            maxWidth: '540px',
            width: '100%',
            padding: '32px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '.75rem', textTransform: 'uppercase', color: 'var(--rust)', fontWeight: 700, letterSpacing: '0.05em' }}>
                  Decline Registration
                </span>
                <h3 style={{ margin: '4px 0 0', fontSize: '1.3rem', color: '#0f172a' }}>
                  Reject {rejectingHotel.name}
                </h3>
              </div>
              <button 
                type="button" 
                className="btn btn-ghost btn-sm" 
                onClick={() => setRejectingHotel(null)}
                style={{ fontSize: '1.2rem', padding: '4px 10px' }}
              >
                ✕
              </button>
            </div>

            <p style={{ color: '#64748b', fontSize: '.88rem', margin: '0 0 16px', lineHeight: 1.5 }}>
              Select a standard reason or enter specific feedback below. The owner will be notified to revise and resubmit.
            </p>

            {/* Quick Reason Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
              {[
                'Incomplete business license',
                'CNIC / ID document unreadable',
                'Property address unverified',
                'Quality standards not met',
                'Duplicate application'
              ].map(chip => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setRejectReason(chip)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '16px',
                    border: rejectReason === chip ? '1px solid var(--rust)' : '1px solid #cbd5e1',
                    background: rejectReason === chip ? '#fff1f2' : '#f8fafc',
                    color: rejectReason === chip ? 'var(--rust)' : '#475569',
                    fontSize: '.75rem',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  + {chip}
                </button>
              ))}
            </div>

            <div className="field-group" style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Detailed feedback / notes for owner
              </label>
              <textarea 
                className="input" 
                rows={4}
                placeholder="Explain what needs to be corrected for approval..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                style={{ width: '100%', resize: 'vertical' }}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                className="btn btn-ghost" 
                onClick={() => setRejectingHotel(null)}
                disabled={rejectSubmitting}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-primary"
                style={{ background: 'var(--rust, #c2410c)', borderColor: 'var(--rust, #c2410c)' }}
                onClick={handleConfirmReject}
                disabled={rejectSubmitting}
              >
                {rejectSubmitting ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DocumentCard({ title, filePath, icon, isImage = false }) {
  if (!filePath) {
    return (
      <div style={{
        border: '1px dashed var(--hairline)',
        borderRadius: '8px',
        padding: '20px',
        textAlign: 'center',
        background: 'rgba(0,0,0,0.01)'
      }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{icon}</div>
        <b style={{ display: 'block', fontSize: '.9rem' }}>{title}</b>
        <span className="text-muted" style={{ fontSize: '.8rem' }}>Not provided (Optional)</span>
      </div>
    );
  }

  const fileUrl = filePath.startsWith('http') ? filePath : `${API_BASE_URL}/uploads/${filePath.replace(/^\/+/, '')}`;
  const isImgFile = isImage || /\.(jpg|jpeg|png|webp|gif)$/i.test(filePath);

  return (
    <div style={{
      border: '1px solid var(--hairline)',
      borderRadius: '8px',
      padding: '16px',
      background: '#fff',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{ fontSize: '1.2rem' }}>{icon}</span>
          <b style={{ fontSize: '.92rem' }}>{title}</b>
        </div>

        {isImgFile ? (
          <div style={{ height: '140px', background: '#f8fafc', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <img 
              src={fileUrl} 
              alt={title} 
              style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        ) : (
          <div style={{ height: '80px', background: '#f8fafc', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', fontSize: '.85rem', color: '#64748b' }}>
            Document available (PDF / File)
          </div>
        )}
      </div>

      <a 
        href={fileUrl} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="btn btn-ghost btn-sm"
        style={{ width: '100%', textAlign: 'center', display: 'block' }}
      >
        Open Full File ↗
      </a>
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