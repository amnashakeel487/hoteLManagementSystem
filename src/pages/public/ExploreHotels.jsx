import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicNav from '../../components/PublicNav';
import Footer from '../../components/Footer';
import { API_BASE_URL } from '../../config';

const CATEGORIES = ['All', '5-Star', '4-Star', 'Boutique', 'Resort', 'Guest House'];

export default function ExploreHotels() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/hotels/public`);
      if (res.ok) {
        const data = await res.json();
        setHotels(data.hotels || []);
      }
    } catch (err) {
      console.error('Failed to fetch hotels:', err);
    } finally {
      setLoading(false);
    }
  };

  const cities = ['All', ...new Set(hotels.map(h => h.city).filter(Boolean))];

  const filteredHotels = hotels.filter(h => {
    const matchesSearch = (
      h.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesCat = selectedCategory === 'All' || h.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesCity = selectedCity === 'All' || h.city?.toLowerCase() === selectedCity.toLowerCase();
    return matchesSearch && matchesCat && matchesCity;
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--cream-bg, #fbf6ec)' }}>
      <PublicNav />

      {/* Hero Search Header */}
      <section style={{
        background: 'linear-gradient(180deg, var(--navy-900, #0a1128) 0%, #151e3f 100%)',
        color: '#fff',
        padding: '60px 20px 80px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <span style={{
            fontSize: '.78rem',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            color: 'var(--brass, #c5a880)',
            fontWeight: 600,
            display: 'inline-block',
            marginBottom: '12px'
          }}>
            Curated Hotel Collection
          </span>
          <h1 style={{ fontSize: '2.8rem', fontWeight: 700, margin: '0 0 16px', letterSpacing: '-0.02em', color: '#ffffff' }}>
            Find &amp; Book Your Next Extraordinary Stay
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'rgba(251,246,236,0.7)', maxWidth: '640px', margin: '0 auto 36px', lineHeight: 1.6 }}>
            Explore certified boutique hotels, luxury resorts, and approved heritage stays. Real-time room availability, verified reviews, and instant bookings.
          </p>

          {/* Search Bar Container */}
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '12px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.35)',
            display: 'grid',
            gridTemplateColumns: '1.5fr 1fr 1fr auto',
            gap: '12px',
            alignItems: 'center',
            textAlign: 'left'
          }}>
            <div style={{ padding: '0 8px' }}>
              <span style={{ fontSize: '.72rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Destination / Hotel</span>
              <input 
                type="text" 
                placeholder="Search city, hotel name..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', border: 'none', outline: 'none', fontSize: '.95rem', color: '#0f172a', fontWeight: 500 }}
              />
            </div>

            <div style={{ borderLeft: '1px solid #e2e8f0', padding: '0 12px' }}>
              <span style={{ fontSize: '.72rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '4px' }}>City</span>
              <select 
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: '.95rem', color: '#0f172a', fontWeight: 500, cursor: 'pointer' }}
              >
                {cities.map(c => <option key={c} value={c}>{c === 'All' ? 'All Locations' : c}</option>)}
              </select>
            </div>

            <div style={{ borderLeft: '1px solid #e2e8f0', padding: '0 12px' }}>
              <span style={{ fontSize: '.72rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Category</span>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: '.95rem', color: '#0f172a', fontWeight: 500, cursor: 'pointer' }}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
              </select>
            </div>

            <button 
              onClick={fetchHotels}
              className="btn btn-primary"
              style={{ padding: '14px 28px', height: '100%', borderRadius: '8px', fontWeight: 600 }}
            >
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="container" style={{ padding: '40px 20px 80px', flex: 1 }}>
        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '24px' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '8px 18px',
                borderRadius: '24px',
                border: selectedCategory === cat ? '1px solid var(--navy-900, #0a1128)' : '1px solid #e2e8f0',
                background: selectedCategory === cat ? 'var(--navy-900, #0a1128)' : '#ffffff',
                color: selectedCategory === cat ? '#ffffff' : '#334155',
                fontSize: '.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
            Available Stays <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 400 }}>({filteredHotels.length} verified properties)</span>
          </h2>
          {(searchTerm || selectedCategory !== 'All' || selectedCity !== 'All') && (
            <button 
              onClick={() => { setSearchTerm(''); setSelectedCategory('All'); setSelectedCity('All'); }}
              style={{ background: 'none', border: 'none', color: 'var(--brass, #c5a880)', fontSize: '.88rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Clear filters ✕
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#64748b' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🏨</div>
            <b>Loading available hotels...</b>
          </div>
        ) : filteredHotels.length === 0 ? (
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '60px 20px',
            textAlign: 'center',
            border: '1px dashed #cbd5e1'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔍</div>
            <h3 style={{ margin: '0 0 8px', color: '#0f172a' }}>No hotels found</h3>
            <p style={{ color: '#64748b', margin: '0 0 20px' }}>Try adjusting your search terms or clearing your filters.</p>
            <button 
              onClick={() => { setSearchTerm(''); setSelectedCategory('All'); setSelectedCity('All'); }}
              className="btn btn-primary btn-sm"
            >
              Show All Hotels
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '28px'
          }}>
            {filteredHotels.map(hotel => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function HotelCard({ hotel }) {
  const coverUrl = hotel.cover_path
    ? (hotel.cover_path.startsWith('http') ? hotel.cover_path : `${API_BASE_URL}/uploads/${hotel.cover_path.replace(/^\/+/, '')}`)
    : null;

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '12px',
      overflow: 'hidden',
      border: '1px solid rgba(0,0,0,0.08)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      <div>
        {/* Cover Photo / Thumbnail */}
        <div style={{
          height: '200px',
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {coverUrl ? (
            <img 
              src={coverUrl} 
              alt={hotel.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '3rem' }}>
              🏨
            </div>
          )}

          {/* Category Tag */}
          <span style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(4px)',
            color: '#fff',
            fontSize: '.75rem',
            fontWeight: 600,
            padding: '4px 10px',
            borderRadius: '4px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            {hotel.category || 'Hotel'}
          </span>

          {/* Rating Tag */}
          <span style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            background: '#ffffff',
            color: '#0f172a',
            fontSize: '.8rem',
            fontWeight: 700,
            padding: '4px 8px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
          }}>
            ★ {hotel.rating || 4.8} <span style={{ fontWeight: 400, color: '#64748b', fontSize: '.72rem' }}>({hotel.review_count || 0})</span>
          </span>
        </div>

        {/* Hotel Details */}
        <div style={{ padding: '20px' }}>
          <div style={{ fontSize: '.82rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
            📍 {hotel.city}, {hotel.country}
          </div>
          <h3 style={{ margin: '0 0 8px', fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
            {hotel.name}
          </h3>
          <p style={{
            color: '#475569',
            fontSize: '.88rem',
            lineHeight: 1.5,
            margin: '0 0 16px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {hotel.description || 'Experience comfort and hospitality at this verified property.'}
          </p>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <span style={{ fontSize: '.75rem', background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', color: '#475569' }}>
              ✓ {hotel.room_count || 10} Total Units
            </span>
            <span style={{ fontSize: '.75rem', background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', color: '#475569' }}>
              ✓ Instant Confirmation
            </span>
          </div>
        </div>
      </div>

      {/* Card Footer with Price & CTA */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid #f1f5f9',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#fafafa'
      }}>
        <div>
          <span style={{ fontSize: '.72rem', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>From</span>
          <b style={{ fontSize: '1.15rem', color: '#0f172a', fontFamily: 'var(--font-mono, monospace)' }}>
            PKR {hotel.min_price?.toLocaleString() || '12,000'}
          </b>
          <span style={{ fontSize: '.72rem', color: '#64748b' }}> / night</span>
        </div>

        <Link 
          to={`/hotel/${hotel.id}`}
          className="btn btn-primary btn-sm"
          style={{ padding: '8px 18px', fontWeight: 600, textDecoration: 'none' }}
        >
          View &amp; Book →
        </Link>
      </div>
    </div>
  );
}
