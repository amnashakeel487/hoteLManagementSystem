import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from '../../components/Sidebar';

const sidebarItems = [
  {
    links: [
      { icon: '▤', text: 'Hotel requests', href: '/admin' },
      { icon: '🏨', text: 'All hotels', active: true },
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

export default function AllHotels() {
  const { user, apiCall, logout } = useAuth();
  const [hotels, setHotels] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllHotels();
  }, []);

  const loadAllHotels = async () => {
    try {
      setLoading(true);
      const res = await apiCall('/api/admin/hotels?status=all');
      if (res.ok) {
        const data = await res.json();
        setHotels(data.hotels || []);
      }
    } catch (err) {
      console.error('Failed to load hotels:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const filteredHotels = hotels.filter(hotel => {
    const matchesSearch = hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hotel.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hotel.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || hotel.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        Loading all hotels...
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
          initials: 'AD', 
          name: user?.email?.split('@')[0] || 'Admin', 
          subtitle: 'Platform Admin', 
          avatarStyle: { background: 'var(--emerald)', color: '#fff' } 
        }}
      />

      <main className="app-main">
        <div className="app-topbar">
          <h1>All Hotels</h1>
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
              <span className="k-eyebrow">Total Hotels</span>
              <div className="k-value">{hotels.length}</div>
              <span className="k-note">Across {new Set(hotels.map(h => h.country)).size} countries</span>
            </div>
            <div className="keycard">
              <span className="k-eyebrow">Active Hotels</span>
              <div className="k-value">{hotels.filter(h => h.status === 'approved').length}</div>
              <span className="k-note">Currently accepting bookings</span>
            </div>
            <div className="keycard">
              <span className="k-eyebrow">Total Revenue (30d)</span>
              <div className="k-value">Rs {hotels.reduce((sum, h) => sum + h.revenue_30d, 0).toLocaleString()}</div>
              <span className="k-note">All active properties</span>
            </div>
            <div className="keycard">
              <span className="k-eyebrow">Avg Rating</span>
              <div className="k-value">{(hotels.filter(h => h.rating > 0).reduce((sum, h) => sum + h.rating, 0) / hotels.filter(h => h.rating > 0).length || 0).toFixed(1)}</div>
              <span className="k-note">Across all reviews</span>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <h3>Hotel Directory</h3>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input 
                  className="input" 
                  type="text" 
                  placeholder="Search hotels, cities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: '200px' }}
                />
                <select 
                  className="input" 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{ width: '140px' }}
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Hotel</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Bookings (30d)</th>
                    <th>Revenue (30d)</th>
                    <th>Rating</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHotels.map((hotel) => (
                    <tr key={hotel.id}>
                      <td>
                        <div className="row-hotel">
                          <div className="thumb"></div>
                          <div>
                            <b>{hotel.name}</b>
                            <span>{hotel.category} · {hotel.room_count} rooms</span>
                          </div>
                        </div>
                      </td>
                      <td>{hotel.city}, {hotel.country}</td>
                      <td><StatusBadge status={hotel.status} /></td>
                      <td>{hotel.bookings_30d}</td>
                      <td>Rs {hotel.revenue_30d.toLocaleString()}</td>
                      <td>
                        {hotel.rating > 0 ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>★</span>
                            <span>{hotel.rating}</span>
                          </div>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="text-muted">{new Date(hotel.created_at).toLocaleDateString()}</td>
                      <td>
                        <div className="table-actions">
                          <button title="View Details">👁</button>
                          <button title="Edit Hotel">✎</button>
                          {hotel.status === 'approved' && (
                            <button title="Suspend Hotel" style={{ color: 'var(--rust)' }}>⏸</button>
                          )}
                          {hotel.status === 'suspended' && (
                            <button title="Reactivate Hotel" style={{ color: 'var(--emerald)' }}>↻</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredHotels.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--ink-3)' }}>
                <p>No hotels found matching your criteria.</p>
              </div>
            )}
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