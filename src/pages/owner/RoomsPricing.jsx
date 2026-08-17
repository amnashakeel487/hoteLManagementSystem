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

export default function RoomsPricing() {
  const { user, logout } = useAuth();
  const [rooms, setRooms] = useState([
    {
      id: 1,
      category: 'Deluxe King',
      price: 14200,
      total_units: 8,
      amenities: ['Wi-Fi', 'AC', 'Minibar', 'City View', 'Work Desk'],
      photos: ['/placeholder1.jpg', '/placeholder2.jpg'],
      description: 'Spacious room with king bed and city views',
      max_occupancy: 2,
      size_sqm: 35
    },
    {
      id: 2,
      category: 'Twin Standard',
      price: 9600,
      total_units: 10,
      amenities: ['Wi-Fi', 'AC', 'Work Desk'],
      photos: ['/placeholder3.jpg'],
      description: 'Comfortable twin bed room perfect for business travelers',
      max_occupancy: 2,
      size_sqm: 28
    },
    {
      id: 3,
      category: 'Suite Ocean View',
      price: 26800,
      total_units: 6,
      amenities: ['Wi-Fi', 'AC', 'Balcony', 'Minibar', 'Ocean View', 'Sitting Area'],
      photos: ['/placeholder4.jpg', '/placeholder5.jpg', '/placeholder6.jpg'],
      description: 'Luxury suite with private balcony and stunning ocean views',
      max_occupancy: 4,
      size_sqm: 55
    }
  ]);

  const [editingRoom, setEditingRoom] = useState(null);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [newRoom, setNewRoom] = useState({
    category: '',
    price: 0,
    total_units: 1,
    amenities: [],
    description: '',
    max_occupancy: 2,
    size_sqm: 25
  });

  const availableAmenities = [
    'Wi-Fi', 'AC', 'Minibar', 'City View', 'Ocean View', 'Balcony', 
    'Work Desk', 'Safe', 'TV', 'Coffee Machine', 'Sitting Area', 'Jacuzzi'
  ];

  const handleEditRoom = (room) => {
    setEditingRoom({ ...room });
  };

  const handleSaveRoom = () => {
    setRooms(rooms.map(room => 
      room.id === editingRoom.id ? editingRoom : room
    ));
    setEditingRoom(null);
  };

  const handleAddRoom = () => {
    const id = Math.max(...rooms.map(r => r.id)) + 1;
    setRooms([...rooms, { ...newRoom, id, photos: [] }]);
    setNewRoom({
      category: '',
      price: 0,
      total_units: 1,
      amenities: [],
      description: '',
      max_occupancy: 2,
      size_sqm: 25
    });
    setShowAddRoom(false);
  };

  const handleDeleteRoom = (roomId) => {
    if (confirm('Are you sure you want to delete this room category?')) {
      setRooms(rooms.filter(room => room.id !== roomId));
    }
  };

  const toggleAmenity = (amenity, isEditing = false) => {
    const targetRoom = isEditing ? editingRoom : newRoom;
    const setterFunction = isEditing ? setEditingRoom : setNewRoom;
    
    const amenities = targetRoom.amenities.includes(amenity)
      ? targetRoom.amenities.filter(a => a !== amenity)
      : [...targetRoom.amenities, amenity];
    
    setterFunction({ ...targetRoom, amenities });
  };

  const handleLogout = () => {
    logout();
  };

  const hotel = {
    name: 'The Marlow Hotel',
    status: 'approved'
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
          <h1>Rooms & Pricing</h1>
          <div className="topbar-actions">
            <button 
              className="btn btn-brass btn-sm"
              onClick={() => setShowAddRoom(true)}
            >
              + Add Room Category
            </button>
            <button className="icon-btn">🔔</button>
            <div className="avatar" style={{ width: 34, height: 34, fontSize: '.75rem' }}>
              {hotel.name.split(' ').map(n => n[0]).join('')}
            </div>
          </div>
        </div>

        <div className="app-body">
          <div className="stat-row">
            <div className="keycard">
              <span className="k-eyebrow">Room Categories</span>
              <div className="k-value">{rooms.length}</div>
              <span className="k-note">Different room types</span>
            </div>
            <div className="keycard">
              <span className="k-eyebrow">Total Rooms</span>
              <div className="k-value">{rooms.reduce((sum, room) => sum + room.total_units, 0)}</div>
              <span className="k-note">Available units</span>
            </div>
            <div className="keycard">
              <span className="k-eyebrow">Avg. Price</span>
              <div className="k-value">Rs {Math.round(rooms.reduce((sum, room) => sum + room.price, 0) / rooms.length)}</div>
              <span className="k-note">Per night</span>
            </div>
            <div className="keycard">
              <span className="k-eyebrow">Max Capacity</span>
              <div className="k-value">{rooms.reduce((sum, room) => sum + (room.total_units * room.max_occupancy), 0)}</div>
              <span className="k-note">Total guests</span>
            </div>
          </div>

          {showAddRoom && (
            <div className="panel">
              <div className="panel-head">
                <h3>Add New Room Category</h3>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    className="btn btn-ghost btn-sm"
                    onClick={() => setShowAddRoom(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={handleAddRoom}
                    disabled={!newRoom.category || !newRoom.price}
                  >
                    Add Room
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <div className="form-group">
                    <label>Room Category Name *</label>
                    <input
                      type="text"
                      className="input"
                      value={newRoom.category}
                      onChange={(e) => setNewRoom({...newRoom, category: e.target.value})}
                      placeholder="e.g. Deluxe King, Standard Twin"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Price per night *</label>
                      <input
                        type="number"
                        className="input"
                        value={newRoom.price}
                        onChange={(e) => setNewRoom({...newRoom, price: parseFloat(e.target.value)})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Number of units</label>
                      <input
                        type="number"
                        className="input"
                        value={newRoom.total_units}
                        onChange={(e) => setNewRoom({...newRoom, total_units: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Max Occupancy</label>
                      <input
                        type="number"
                        className="input"
                        value={newRoom.max_occupancy}
                        onChange={(e) => setNewRoom({...newRoom, max_occupancy: parseInt(e.target.value)})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Size (sqm)</label>
                      <input
                        type="number"
                        className="input"
                        value={newRoom.size_sqm}
                        onChange={(e) => setNewRoom({...newRoom, size_sqm: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      className="input"
                      rows={3}
                      value={newRoom.description}
                      onChange={(e) => setNewRoom({...newRoom, description: e.target.value})}
                      placeholder="Describe the room features and ambiance"
                    />
                  </div>
                </div>

                <div>
                  <div className="form-group">
                    <label>Amenities</label>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(2, 1fr)', 
                      gap: '8px',
                      marginTop: '8px'
                    }}>
                      {availableAmenities.map((amenity) => (
                        <label key={amenity} style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px',
                          fontSize: '.85rem'
                        }}>
                          <input
                            type="checkbox"
                            checked={newRoom.amenities.includes(amenity)}
                            onChange={() => toggleAmenity(amenity)}
                          />
                          {amenity}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {rooms.map((room) => (
              <div key={room.id} className="panel">
                <div className="panel-head">
                  <div>
                    <h3>{room.category}</h3>
                    <span className="tag">{room.total_units} units · Rs {room.price}/night</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleEditRoom(room)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleDeleteRoom(room.id)}
                      style={{ color: 'var(--rust)' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {editingRoom && editingRoom.id === room.id ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div>
                      <div className="form-group">
                        <label>Room Category Name</label>
                        <input
                          type="text"
                          className="input"
                          value={editingRoom.category}
                          onChange={(e) => setEditingRoom({...editingRoom, category: e.target.value})}
                        />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Price per night</label>
                          <input
                            type="number"
                            className="input"
                            value={editingRoom.price}
                            onChange={(e) => setEditingRoom({...editingRoom, price: parseFloat(e.target.value)})}
                          />
                        </div>
                        <div className="form-group">
                          <label>Number of units</label>
                          <input
                            type="number"
                            className="input"
                            value={editingRoom.total_units}
                            onChange={(e) => setEditingRoom({...editingRoom, total_units: parseInt(e.target.value)})}
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Max Occupancy</label>
                          <input
                            type="number"
                            className="input"
                            value={editingRoom.max_occupancy}
                            onChange={(e) => setEditingRoom({...editingRoom, max_occupancy: parseInt(e.target.value)})}
                          />
                        </div>
                        <div className="form-group">
                          <label>Size (sqm)</label>
                          <input
                            type="number"
                            className="input"
                            value={editingRoom.size_sqm}
                            onChange={(e) => setEditingRoom({...editingRoom, size_sqm: parseInt(e.target.value)})}
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Description</label>
                        <textarea
                          className="input"
                          rows={3}
                          value={editingRoom.description}
                          onChange={(e) => setEditingRoom({...editingRoom, description: e.target.value})}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                        <button 
                          className="btn btn-ghost btn-sm"
                          onClick={() => setEditingRoom(null)}
                        >
                          Cancel
                        </button>
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={handleSaveRoom}
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="form-group">
                        <label>Amenities</label>
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(2, 1fr)', 
                          gap: '8px',
                          marginTop: '8px'
                        }}>
                          {availableAmenities.map((amenity) => (
                            <label key={amenity} style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '8px',
                              fontSize: '.85rem'
                            }}>
                              <input
                                type="checkbox"
                                checked={editingRoom.amenities.includes(amenity)}
                                onChange={() => toggleAmenity(amenity, true)}
                              />
                              {amenity}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
                    <div>
                      <div style={{ 
                        aspectRatio: '4/3',
                        background: `linear-gradient(135deg, var(--brass) 0%, var(--brass-dark) 100%)`,
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '1.5rem',
                        marginBottom: '12px'
                      }}>
                        🛏️
                      </div>
                      <button className="btn btn-ghost btn-sm btn-block">
                        Manage Photos
                      </button>
                    </div>

                    <div>
                      <div className="room-details">
                        <p style={{ margin: '0 0 12px 0', fontSize: '.9rem', lineHeight: '1.4' }}>
                          {room.description}
                        </p>
                        
                        <div className="room-specs" style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(3, 1fr)', 
                          gap: '16px',
                          marginBottom: '16px'
                        }}>
                          <div>
                            <span className="text-muted" style={{ fontSize: '.75rem' }}>Max Occupancy</span>
                            <div style={{ fontWeight: '600' }}>{room.max_occupancy} guests</div>
                          </div>
                          <div>
                            <span className="text-muted" style={{ fontSize: '.75rem' }}>Room Size</span>
                            <div style={{ fontWeight: '600' }}>{room.size_sqm} sqm</div>
                          </div>
                          <div>
                            <span className="text-muted" style={{ fontSize: '.75rem' }}>Available Units</span>
                            <div style={{ fontWeight: '600' }}>{room.total_units} rooms</div>
                          </div>
                        </div>

                        <div>
                          <span className="text-muted" style={{ fontSize: '.75rem' }}>Amenities</span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                            {room.amenities.map((amenity) => (
                              <span key={amenity} style={{
                                fontSize: '.75rem',
                                padding: '4px 8px',
                                background: 'var(--parchment-2)',
                                borderRadius: '4px',
                                color: 'var(--ink-2)'
                              }}>
                                {amenity}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}