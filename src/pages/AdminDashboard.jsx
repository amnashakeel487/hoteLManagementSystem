import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';

const TABS = ['pending', 'approved', 'rejected', 'suspended'];

const sidebarItems = [
  {
    links: [
      { icon: '▤', text: 'Hotel requests', active: true },
      { icon: '🏨', text: 'All hotels', href: '/admin/hotels' },
      { icon: '✦', text: 'Cleaning teams', href: '/admin/cleaning' },
      { icon: '📈', text: 'Platform analytics', href: '/admin/analytics' },
      { icon: '🔔', text: 'Notifications', href: '/admin/notifications' },
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      // Load sample data immediately
      setHotels({
        pending: [
          {
            id: 2,
            name: 'Coral Bay Villas',
            business_name: 'Coral Bay Resort Ltd',
            category: 'Boutique',
            city: 'Zanzibar',
            country: 'Tanzania',
            email: 'info@coralbayvillas.com',
            phone: '+255 123 456789',
            address: 'Beach Road, Stone Town',
            description: 'Boutique beachfront villas',
            room_count: 12,
            status: 'pending',
            created_at: new Date().toISOString()
          }
        ],
        approved: [
          {
            id: 1,
            name: 'The Marlow Hotel',
            business_name: 'Marlow Hospitality Ltd',
            category: '5-Star',
            city: 'Lahore',
            country: 'Pakistan',
            status: 'approved'
          }
        ],
        rejected: [],
        suspended: []
      });
      setReviewing({
        id: 2,
        name: 'Coral Bay Villas',
        business_name: 'Coral Bay Resort Ltd',
        category: 'Boutique',
        city: 'Zanzibar',
        country: 'Tanzania',
        email: 'info@coralbayvillas.com',
        phone: '+255 123 456789',
        address: 'Beach Road, Stone Town',
        description: 'Boutique beachfront villas with stunning ocean views',
        room_count: 12,
        status: 'pending',
        created_at: new Date().toISOString()
      });
      setLoading(false);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setLoading(false);
    }
  };

  const approveHotel = async (hotelId) => {
    console.log('Approving hotel:', hotelId);
    // Move hotel from pending to approved
    const hotel = hotels.pending.find(h => h.id === hotelId);
    if (hotel) {
      setHotels(prev => ({
        ...prev,
        pending: prev.pending.filter(h => h.id !== hotelId),
        approved: [...prev.approved, { ...hotel, status: 'approved' }]
      }));
      
      if (reviewing?.id === hotelId) {
        setReviewing({ ...reviewing, status: 'approved' });
      }
    }
  };

  const rejectHotel = async (hotelId, reason) => {
    console.log('Rejecting hotel:', hotelId, 'Reason:', reason);
    // Move hotel from pending to rejected
    const hotel = hotels.pending.find(h => h.id === hotelId);
    if (hotel) {
      setHotels(prev => ({
        ...prev,
        pending: prev.pending.filter(h => h.id !== hotelId),
        rejected: [...prev.rejected, { ...hotel, status: 'rejected', rejection_reason: reason }]
      }));
      
      if (reviewing?.id === hotelId) {
        setReviewing({ ...reviewing, status: 'rejected', rejection_reason: reason });
      }
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
          <div className="topbar-actions">
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
                                const reason = prompt('Rejection reason:');
                                if (reason) {
                                  rejectHotel(hotel.id, reason);
                                }
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
                  <a href="#" className="text-muted" style={{ fontSize: '.85rem', fontWeight: 600 }}>View documents</a>
                  {reviewing.status === 'pending' && (
                    <div className="flex gap-12">
                      <button 
                        className="btn btn-ghost btn-sm" 
                        style={{ color: 'var(--rust)', borderColor: 'var(--rust)' }}
                        onClick={() => {
                          const reason = prompt('Rejection reason:');
                          if (reason) {
                            rejectHotel(reviewing.id, reason);
                          }
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