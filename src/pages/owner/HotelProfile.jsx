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
  const { user, logout } = useAuth();
  const [hotel, setHotel] = useState({
    id: 1,
    name: 'The Marlow Hotel',
    business_name: 'Marlow Hospitality Ltd',
    email: 'info@marlowhotel.com',
    phone: '+92 300 1234567',
    address: '123 Main Street, Gulberg',
    city: 'Lahore',
    country: 'Pakistan',
    description: 'A luxury boutique hotel in the heart of Lahore, offering personalized service and elegant accommodations.',
    category: '5-Star',
    room_count: 24,
    latitude: 31.5497,
    longitude: 74.3436,
    status: 'approved'
  });
  
  const [gallery, setGallery] = useState([
    { id: 1, url: '/api/placeholder/400/300', alt: 'Hotel Exterior' },
    { id: 2, url: '/api/placeholder/400/300', alt: 'Lobby' },
    { id: 3, url: '/api/placeholder/400/300', alt: 'Restaurant' },
    { id: 4, url: '/api/placeholder/400/300', alt: 'Pool Area' }
  ]);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEditing(false);
    } catch (error) {
      console.error('Error saving hotel profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Simulate upload
      const newImage = {
        id: gallery.length + 1,
        url: URL.createObjectURL(file),
        alt: file.name
      };
      setGallery([...gallery, newImage]);
    }
  };

  const removeImage = (imageId) => {
    setGallery(gallery.filter(img => img.id !== imageId));
  };

  const handleLogout = () => {
    logout();
  };

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
          <h1>Hotel Profile</h1>
          <div className="topbar-actions">
            {editing ? (
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  className="btn btn-ghost btn-sm"
                  onClick={() => setEditing(false)}
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
              {hotel.name.split(' ').map(n => n[0]).join('')}
            </div>
          </div>
        </div>

        <div className="app-body">
          <div className="split" style={{ alignItems: 'flex-start', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div className="panel">
              <div className="panel-head">
                <h3>Basic Information</h3>
                <span className={`badge-stamp ${hotel.status}`}>
                  <span className="dot"></span> {hotel.status}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="form-group">
                  <label>Hotel Name</label>
                  {editing ? (
                    <input
                      type="text"
                      className="input"
                      value={hotel.name}
                      onChange={(e) => setHotel({...hotel, name: e.target.value})}
                    />
                  ) : (
                    <p style={{ margin: 0, fontWeight: '600' }}>{hotel.name}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>Business Name</label>
                  {editing ? (
                    <input
                      type="text"
                      className="input"
                      value={hotel.business_name}
                      onChange={(e) => setHotel({...hotel, business_name: e.target.value})}
                    />
                  ) : (
                    <p style={{ margin: 0 }}>{hotel.business_name}</p>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email</label>
                    {editing ? (
                      <input
                        type="email"
                        className="input"
                        value={hotel.email}
                        onChange={(e) => setHotel({...hotel, email: e.target.value})}
                      />
                    ) : (
                      <p style={{ margin: 0 }}>{hotel.email}</p>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    {editing ? (
                      <input
                        type="tel"
                        className="input"
                        value={hotel.phone}
                        onChange={(e) => setHotel({...hotel, phone: e.target.value})}
                      />
                    ) : (
                      <p style={{ margin: 0 }}>{hotel.phone}</p>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>Address</label>
                  {editing ? (
                    <input
                      type="text"
                      className="input"
                      value={hotel.address}
                      onChange={(e) => setHotel({...hotel, address: e.target.value})}
                    />
                  ) : (
                    <p style={{ margin: 0 }}>{hotel.address}</p>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    {editing ? (
                      <input
                        type="text"
                        className="input"
                        value={hotel.city}
                        onChange={(e) => setHotel({...hotel, city: e.target.value})}
                      />
                    ) : (
                      <p style={{ margin: 0 }}>{hotel.city}</p>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Country</label>
                    {editing ? (
                      <input
                        type="text"
                        className="input"
                        value={hotel.country}
                        onChange={(e) => setHotel({...hotel, country: e.target.value})}
                      />
                    ) : (
                      <p style={{ margin: 0 }}>{hotel.country}</p>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    {editing ? (
                      <select
                        className="input"
                        value={hotel.category}
                        onChange={(e) => setHotel({...hotel, category: e.target.value})}
                      >
                        <option value="5-Star">5-Star</option>
                        <option value="4-Star">4-Star</option>
                        <option value="3-Star">3-Star</option>
                        <option value="Boutique">Boutique</option>
                        <option value="Guest House">Guest House</option>
                      </select>
                    ) : (
                      <p style={{ margin: 0 }}>{hotel.category}</p>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Room Count</label>
                    {editing ? (
                      <input
                        type="number"
                        className="input"
                        value={hotel.room_count}
                        onChange={(e) => setHotel({...hotel, room_count: parseInt(e.target.value)})}
                      />
                    ) : (
                      <p style={{ margin: 0 }}>{hotel.room_count} rooms</p>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  {editing ? (
                    <textarea
                      className="input"
                      rows={4}
                      value={hotel.description}
                      onChange={(e) => setHotel({...hotel, description: e.target.value})}
                    />
                  ) : (
                    <p style={{ margin: 0, lineHeight: '1.5' }}>{hotel.description}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-head">
                <h3>Photo Gallery</h3>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="btn btn-brass btn-sm">
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
                {gallery.map((image) => (
                  <div key={image.id} style={{ 
                    position: 'relative', 
                    aspectRatio: '4/3',
                    background: 'var(--parchment-2)', 
                    borderRadius: '8px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: '100%',
                      height: '100%',
                      background: `linear-gradient(135deg, var(--brass) 0%, var(--brass-dark) 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: '1.2rem'
                    }}>
                      🏨
                    </div>
                    <button
                      onClick={() => removeImage(image.id)}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: 'none',
                        background: 'rgba(0,0,0,0.7)',
                        color: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px'
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-32">
                <h4>Cover Photo</h4>
                <div style={{ 
                  aspectRatio: '16/9',
                  background: `linear-gradient(135deg, var(--emerald) 0%, var(--emerald-dk) 100%)`,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '2rem',
                  marginTop: '12px'
                }}>
                  🏨
                </div>
                <button className="btn btn-ghost btn-sm btn-block mt-12">
                  Update Cover Photo
                </button>
              </div>
            </div>
          </div>

          <div className="panel mt-32">
            <div className="panel-head">
              <h3>Location & Map</h3>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Latitude</label>
                {editing ? (
                  <input
                    type="number"
                    step="any"
                    className="input"
                    value={hotel.latitude}
                    onChange={(e) => setHotel({...hotel, latitude: parseFloat(e.target.value)})}
                  />
                ) : (
                  <p style={{ margin: 0, fontFamily: 'var(--font-mono)' }}>{hotel.latitude}</p>
                )}
              </div>
              <div className="form-group">
                <label>Longitude</label>
                {editing ? (
                  <input
                    type="number"
                    step="any"
                    className="input"
                    value={hotel.longitude}
                    onChange={(e) => setHotel({...hotel, longitude: parseFloat(e.target.value)})}
                  />
                ) : (
                  <p style={{ margin: 0, fontFamily: 'var(--font-mono)' }}>{hotel.longitude}</p>
                )}
              </div>
            </div>
            <div style={{
              height: '200px',
              background: 'var(--parchment-2)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '16px',
              color: 'var(--muted)'
            }}>
              📍 Map integration would be implemented here
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}