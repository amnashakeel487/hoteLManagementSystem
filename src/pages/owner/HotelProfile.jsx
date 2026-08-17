import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from '../../components/Sidebar';

const sidebarItems = [
  {
    links: [
      { icon: '▤', text: 'Overview', href: '/owner' },
      { icon: '🏨', text: 'Hotel profile', active: true },
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

export default function HotelProfile() {
  const { user, apiCall, logout, cachedHotel } = useAuth();
  const [hotel, setHotel] = useState(cachedHotel);
  const [formData, setFormData] = useState(cachedHotel || {});
  const [loading, setLoading] = useState(true); // always verify status fresh
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [gallery, setGallery] = useState([
    { id: 1, title: 'Hotel Exterior' },
    { id: 2, title: 'Lobby & Reception' },
    { id: 3, title: 'Restaurant & Dining' },
    { id: 4, title: 'Suites & Rooms' }
  ]);

  useEffect(() => {
    loadHotelProfile();
  }, []);

  const loadHotelProfile = async () => {
    try {
      if (!cachedHotel && !hotel) setLoading(true);
      const res = await apiCall('/api/hotels/owner/my-hotel');
      if (res.ok) {
        const data = await res.json();
        setHotel(data.hotel);
        setFormData(data.hotel || {});
      }
    } catch (err) {
      console.error('Error loading hotel profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!hotel?.id) return;
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    try {
      const res = await apiCall(`/api/hotels/${hotel.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          business_name: formData.business_name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          description: formData.description,
          category: formData.category,
          room_count: parseInt(formData.room_count) || 1
        })
      });

      if (res.ok) {
        const data = await res.json();
        setHotel(data.hotel);
        setFormData(data.hotel);
        setEditing(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        const errData = await res.json();
        setSaveError(errData.error || 'Failed to save changes');
      }
    } catch (error) {
      setSaveError(error.message || 'Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddPhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGallery(prev => [...prev, { id: Date.now(), title: file.name.replace(/\.[^/.]+$/, "") }]);
    }
  };

  const removePhoto = (id) => {
    setGallery(prev => prev.filter(item => item.id !== id));
  };

  const handleLogout = () => {
    logout();
  };

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
            <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🏨</div>
            Loading hotel profile...
          </div>
        </main>
      </div>
    );
  }

  const hotelName = hotel?.name || 'Hotel Profile';

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
          <h1>Hotel Profile</h1>
          <div className="topbar-actions">
            {saveSuccess && (
              <span style={{ fontSize: '.85rem', color: 'var(--emerald)', fontWeight: 600 }}>
                ✓ Profile updated!
              </span>
            )}
            {editing ? (
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  className="btn btn-ghost btn-sm"
                  onClick={() => { setEditing(false); setFormData(hotel || {}); }}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            ) : (
              <button 
                className="btn btn-brass btn-sm"
                onClick={() => setEditing(true)}
              >
                Edit Profile
              </button>
            )}
            <button className="icon-btn">🔔</button>
            <div className="avatar" style={{ width: 34, height: 34, fontSize: '.75rem' }}>
              {hotelName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
          </div>
        </div>

        <div className="app-body">
          {saveError && (
            <div style={{ background: '#fff1f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '12px 18px', borderRadius: '8px', marginBottom: '20px', fontSize: '.9rem' }}>
              ⚠️ {saveError}
            </div>
          )}

          <div className="split" style={{ alignItems: 'flex-start', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
            <div className="panel">
              <div className="panel-head">
                <h3>Basic Information</h3>
                <span className={`badge-stamp ${hotel?.status || 'approved'}`}>
                  <span className="dot"></span> {hotel?.status || 'approved'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="form-group">
                  <label>Hotel Name</label>
                  {editing ? (
                    <input
                      type="text"
                      className="input"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  ) : (
                    <p style={{ margin: 0, fontWeight: '600' }}>{hotel?.name || '—'}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>Business / Legal Name</label>
                  {editing ? (
                    <input
                      type="text"
                      className="input"
                      value={formData.business_name || ''}
                      onChange={(e) => setFormData({...formData, business_name: e.target.value})}
                    />
                  ) : (
                    <p style={{ margin: 0 }}>{hotel?.business_name || '—'}</p>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Contact Email</label>
                    {editing ? (
                      <input
                        type="email"
                        className="input"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    ) : (
                      <p style={{ margin: 0 }}>{hotel?.email || '—'}</p>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Contact Phone</label>
                    {editing ? (
                      <input
                        type="tel"
                        className="input"
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    ) : (
                      <p style={{ margin: 0 }}>{hotel?.phone || '—'}</p>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>Address</label>
                  {editing ? (
                    <input
                      type="text"
                      className="input"
                      value={formData.address || ''}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                  ) : (
                    <p style={{ margin: 0 }}>{hotel?.address || '—'}</p>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    {editing ? (
                      <input
                        type="text"
                        className="input"
                        value={formData.city || ''}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                      />
                    ) : (
                      <p style={{ margin: 0 }}>{hotel?.city || '—'}</p>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Country</label>
                    {editing ? (
                      <input
                        type="text"
                        className="input"
                        value={formData.country || ''}
                        onChange={(e) => setFormData({...formData, country: e.target.value})}
                      />
                    ) : (
                      <p style={{ margin: 0 }}>{hotel?.country || '—'}</p>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    {editing ? (
                      <select
                        className="input"
                        value={formData.category || '4-Star'}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                      >
                        <option value="5-Star">5-Star</option>
                        <option value="4-Star">4-Star</option>
                        <option value="3-Star">3-Star</option>
                        <option value="Boutique">Boutique</option>
                        <option value="Guest House">Guest House</option>
                        <option value="Resort">Resort</option>
                      </select>
                    ) : (
                      <p style={{ margin: 0 }}>{hotel?.category || '—'}</p>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Total Room Count</label>
                    {editing ? (
                      <input
                        type="number"
                        className="input"
                        value={formData.room_count || 1}
                        onChange={(e) => setFormData({...formData, room_count: parseInt(e.target.value) || 1})}
                      />
                    ) : (
                      <p style={{ margin: 0 }}>{hotel?.room_count || 0} rooms</p>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>Hotel Description</label>
                  {editing ? (
                    <textarea
                      className="input"
                      rows={4}
                      value={formData.description || ''}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  ) : (
                    <p style={{ margin: 0, lineHeight: '1.5' }}>{hotel?.description || 'No description provided.'}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-head">
                <h3>Photo Showcase</h3>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAddPhoto}
                    style={{ display: 'none' }}
                    id="hotel-photo-input"
                  />
                  <label htmlFor="hotel-photo-input" className="btn btn-brass btn-sm" style={{ cursor: 'pointer' }}>
                    + Add Photo
                  </label>
                </div>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
                gap: '12px',
                marginTop: '16px'
              }}>
                {gallery.map((photo) => (
                  <div key={photo.id} style={{ 
                    position: 'relative', 
                    aspectRatio: '4/3',
                    background: 'linear-gradient(135deg, var(--brass) 0%, var(--brass-dark) 100%)', 
                    borderRadius: '8px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    padding: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>🏨</div>
                    <span style={{ fontSize: '.75rem', fontWeight: 600 }}>{photo.title}</span>
                    <button
                      type="button"
                      onClick={() => removePhoto(photo.id)}
                      style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        background: 'rgba(0,0,0,0.6)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        width: '22px',
                        height: '22px',
                        fontSize: '.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
