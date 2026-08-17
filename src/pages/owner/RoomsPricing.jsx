import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from '../../components/Sidebar';

const sidebarItems = [
  {
    links: [
      { icon: '▤', text: 'Overview', href: '/owner' },
      { icon: '🏨', text: 'Hotel profile', href: '/owner/profile' },
      { icon: '🛏', text: 'Rooms & pricing', active: true },
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

const BLANK_ROOM = {
  category: '',
  price: '',
  total_units: 1,
  amenities: [],
  description: '',
  max_occupancy: 2,
  size_sqm: 25
};

const AVAILABLE_AMENITIES = [
  'Wi-Fi', 'AC', 'Minibar', 'City View', 'Ocean View', 'Balcony',
  'Work Desk', 'Safe', 'TV', 'Coffee Machine', 'Sitting Area', 'Jacuzzi'
];

export default function RoomsPricing() {
  const { apiCall, logout } = useAuth();
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Add room modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRoom, setNewRoom] = useState(BLANK_ROOM);

  // Edit room (inline)
  const [editingRoom, setEditingRoom] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await apiCall('/api/hotels/owner/my-hotel');
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to load hotel data');
      }
      const data = await res.json();
      setHotel(data.hotel);
      setRooms(data.hotel.rooms || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => logout();

  // ─── Amenity toggle helper ──────────────────────────────────────────────────
  const toggleAmenity = (amenity, state, setter) => {
    const list = state.amenities.includes(amenity)
      ? state.amenities.filter(a => a !== amenity)
      : [...state.amenities, amenity];
    setter({ ...state, amenities: list });
  };

  // ─── Add room ──────────────────────────────────────────────────────────────
  const handleAddRoom = async () => {
    if (!newRoom.category || !newRoom.price) return;
    setSaving(true);
    setSaveError('');
    try {
      const res = await apiCall(`/api/hotels/${hotel.id}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: newRoom.category,
          price: parseFloat(newRoom.price),
          total_units: parseInt(newRoom.total_units),
          amenities: newRoom.amenities,
          description: newRoom.description,
          max_occupancy: parseInt(newRoom.max_occupancy),
          size_sqm: parseInt(newRoom.size_sqm)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add room');
      setRooms(prev => [...prev, data.room]);
      setNewRoom(BLANK_ROOM);
      setShowAddModal(false);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ─── Edit / save room ──────────────────────────────────────────────────────
  const handleSaveRoom = async () => {
    setSaving(true);
    setSaveError('');
    try {
      const res = await apiCall(`/api/hotels/${hotel.id}/rooms/${editingRoom.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: editingRoom.category,
          price: parseFloat(editingRoom.price),
          total_units: parseInt(editingRoom.total_units),
          amenities: editingRoom.amenities,
          description: editingRoom.description,
          max_occupancy: parseInt(editingRoom.max_occupancy),
          size_sqm: parseInt(editingRoom.size_sqm)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update room');
      setRooms(prev => prev.map(r => r.id === editingRoom.id ? data.room : r));
      setEditingRoom(null);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ─── Delete room ───────────────────────────────────────────────────────────
  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room category?')) return;
    try {
      const res = await apiCall(`/api/hotels/${hotel.id}/rooms/${roomId}`, { method: 'DELETE' });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setRooms(prev => prev.filter(r => r.id !== roomId));
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // ─── Loading / error states ────────────────────────────────────────────────
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '12px', color: '#64748b' }}>
      <div style={{ fontSize: '1.5rem' }}>🛏</div>
      Loading rooms...
    </div>
  );

  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#dc2626' }}>⚠️ {error}</p>
        <button onClick={loadData} className="btn btn-primary" style={{ marginTop: 12 }}>Retry</button>
      </div>
    </div>
  );

  const hotelName = hotel?.name || 'My Hotel';

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
          subtitle: `Owner · ${hotel?.status || 'active'}`
        }}
      />

      <main className="app-main">
        <div className="app-topbar">
          <h1>Rooms &amp; Pricing</h1>
          <div className="topbar-actions">
            <button
              className="btn btn-brass btn-sm"
              onClick={() => { setShowAddModal(true); setSaveError(''); }}
            >
              + Add Room Category
            </button>
            <button className="icon-btn">🔔</button>
            <div className="avatar" style={{ width: 34, height: 34, fontSize: '.75rem' }}>
              {hotelName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
          </div>
        </div>

        <div className="app-body">
          {/* Stats */}
          <div className="stat-row">
            <div className="keycard">
              <span className="k-eyebrow">Room Categories</span>
              <div className="k-value">{rooms.length}</div>
              <span className="k-note">Different room types</span>
            </div>
            <div className="keycard">
              <span className="k-eyebrow">Total Rooms</span>
              <div className="k-value">{rooms.reduce((s, r) => s + (r.total_units || 0), 0)}</div>
              <span className="k-note">Available units</span>
            </div>
            <div className="keycard">
              <span className="k-eyebrow">Avg. Price</span>
              <div className="k-value">
                Rs {rooms.length > 0 ? Math.round(rooms.reduce((s, r) => s + (parseFloat(r.price) || 0), 0) / rooms.length).toLocaleString() : '—'}
              </div>
              <span className="k-note">Per night</span>
            </div>
            <div className="keycard">
              <span className="k-eyebrow">Max Capacity</span>
              <div className="k-value">{rooms.reduce((s, r) => s + ((r.total_units || 0) * (r.max_occupancy || 2)), 0)}</div>
              <span className="k-note">Total guests</span>
            </div>
          </div>

          {/* Error banner */}
          {saveError && (
            <div style={{ background: '#fff1f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '12px 18px', borderRadius: '8px', marginBottom: '16px', fontSize: '.9rem' }}>
              ⚠️ {saveError}
            </div>
          )}

          {/* Add Room Modal */}
          {showAddModal && (
            <div style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
              zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
            }}>
              <div style={{
                background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '680px',
                maxHeight: '90vh', overflow: 'auto', padding: '32px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>Add New Room Category</h2>
                  <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#64748b' }}>×</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div>
                    <div className="form-group">
                      <label>Room Category Name *</label>
                      <input type="text" className="input" placeholder="e.g. Deluxe King, Standard Twin"
                        value={newRoom.category} onChange={e => setNewRoom({ ...newRoom, category: e.target.value })} />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Price per night (Rs) *</label>
                        <input type="number" className="input" placeholder="0"
                          value={newRoom.price} onChange={e => setNewRoom({ ...newRoom, price: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>Number of units</label>
                        <input type="number" className="input" min="1"
                          value={newRoom.total_units} onChange={e => setNewRoom({ ...newRoom, total_units: e.target.value })} />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Max Occupancy</label>
                        <input type="number" className="input" min="1"
                          value={newRoom.max_occupancy} onChange={e => setNewRoom({ ...newRoom, max_occupancy: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>Size (sqm)</label>
                        <input type="number" className="input" min="1"
                          value={newRoom.size_sqm} onChange={e => setNewRoom({ ...newRoom, size_sqm: e.target.value })} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <textarea className="input" rows={3} placeholder="Describe the room features..."
                        value={newRoom.description} onChange={e => setNewRoom({ ...newRoom, description: e.target.value })} />
                    </div>
                  </div>

                  <div>
                    <div className="form-group">
                      <label>Amenities</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
                        {AVAILABLE_AMENITIES.map(a => (
                          <label key={a} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '.85rem', cursor: 'pointer' }}>
                            <input type="checkbox" checked={newRoom.amenities.includes(a)}
                              onChange={() => toggleAmenity(a, newRoom, setNewRoom)} />
                            {a}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleAddRoom}
                    disabled={saving || !newRoom.category || !newRoom.price}
                  >
                    {saving ? 'Saving...' : 'Add Room Category'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Room Cards */}
          {rooms.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 24px', background: '#fff', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🛏️</div>
              <h3 style={{ margin: '0 0 8px', color: '#0f172a' }}>No room categories yet</h3>
              <p style={{ color: '#64748b', margin: '0 0 20px', fontSize: '.9rem' }}>Add your first room type to start accepting bookings.</p>
              <button className="btn btn-brass btn-sm" onClick={() => setShowAddModal(true)}>+ Add Room Category</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {rooms.map(room => (
                <div key={room.id} className="panel">
                  <div className="panel-head">
                    <div>
                      <h3>{room.category}</h3>
                      <span className="tag">{room.total_units} units · Rs {Number(room.price).toLocaleString()}/night</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {editingRoom?.id === room.id ? (
                        <>
                          <button className="btn btn-ghost btn-sm" onClick={() => setEditingRoom(null)}>Cancel</button>
                          <button className="btn btn-primary btn-sm" onClick={handleSaveRoom} disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="btn btn-ghost btn-sm" onClick={() => { setEditingRoom({ ...room, amenities: room.amenities || [] }); setSaveError(''); }}>Edit</button>
                          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--rust)' }} onClick={() => handleDeleteRoom(room.id)}>Delete</button>
                        </>
                      )}
                    </div>
                  </div>

                  {editingRoom?.id === room.id ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                      <div>
                        <div className="form-group">
                          <label>Room Category Name</label>
                          <input type="text" className="input" value={editingRoom.category}
                            onChange={e => setEditingRoom({ ...editingRoom, category: e.target.value })} />
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Price per night (Rs)</label>
                            <input type="number" className="input" value={editingRoom.price}
                              onChange={e => setEditingRoom({ ...editingRoom, price: e.target.value })} />
                          </div>
                          <div className="form-group">
                            <label>Number of units</label>
                            <input type="number" className="input" value={editingRoom.total_units}
                              onChange={e => setEditingRoom({ ...editingRoom, total_units: e.target.value })} />
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Max Occupancy</label>
                            <input type="number" className="input" value={editingRoom.max_occupancy || 2}
                              onChange={e => setEditingRoom({ ...editingRoom, max_occupancy: e.target.value })} />
                          </div>
                          <div className="form-group">
                            <label>Size (sqm)</label>
                            <input type="number" className="input" value={editingRoom.size_sqm || 25}
                              onChange={e => setEditingRoom({ ...editingRoom, size_sqm: e.target.value })} />
                          </div>
                        </div>
                        <div className="form-group">
                          <label>Description</label>
                          <textarea className="input" rows={3} value={editingRoom.description || ''}
                            onChange={e => setEditingRoom({ ...editingRoom, description: e.target.value })} />
                        </div>
                      </div>
                      <div>
                        <div className="form-group">
                          <label>Amenities</label>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
                            {AVAILABLE_AMENITIES.map(a => (
                              <label key={a} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '.85rem', cursor: 'pointer' }}>
                                <input type="checkbox" checked={(editingRoom.amenities || []).includes(a)}
                                  onChange={() => toggleAmenity(a, editingRoom, setEditingRoom)} />
                                {a}
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
                      <div>
                        <div style={{ aspectRatio: '4/3', background: 'linear-gradient(135deg, var(--brass) 0%, var(--brass-dark) 100%)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.5rem', marginBottom: '12px' }}>
                          🛏️
                        </div>
                      </div>
                      <div>
                        {room.description && <p style={{ margin: '0 0 12px', fontSize: '.9rem', lineHeight: 1.5, color: '#475569' }}>{room.description}</p>}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '14px' }}>
                          <div>
                            <span style={{ fontSize: '.72rem', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Max Occupancy</span>
                            <b>{room.max_occupancy || 2} guests</b>
                          </div>
                          <div>
                            <span style={{ fontSize: '.72rem', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Room Size</span>
                            <b>{room.size_sqm || '—'} sqm</b>
                          </div>
                          <div>
                            <span style={{ fontSize: '.72rem', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Available</span>
                            <b>{room.total_units} rooms</b>
                          </div>
                        </div>
                        <div>
                          <span style={{ fontSize: '.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Amenities</span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                            {(room.amenities || []).map(a => (
                              <span key={a} style={{ fontSize: '.75rem', padding: '3px 8px', background: 'var(--parchment-2)', borderRadius: '4px', color: 'var(--ink-2)' }}>{a}</span>
                            ))}
                            {(!room.amenities || room.amenities.length === 0) && <span style={{ color: '#94a3b8', fontSize: '.85rem' }}>No amenities listed</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}