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
      { icon: '★', text: 'Reviews', active: true },
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

export default function Reviews() {
  const { user, apiCall, logout, cachedHotel } = useAuth();
  const [hotel, setHotel] = useState(cachedHotel);
  const [reviews, setReviews] = useState(cachedHotel?.reviews || []);
  const [loading, setLoading] = useState(!cachedHotel);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    loadReviewsData();
  }, []);

  const loadReviewsData = async () => {
    try {
      if (!cachedHotel && !hotel) setLoading(true);
      const hRes = await apiCall('/api/hotels/owner/my-hotel');
      if (hRes.ok) {
        const hData = await hRes.json();
        setHotel(hData.hotel);
        setReviews(hData.hotel?.reviews || []);
      }
    } catch (err) {
      console.error('Error loading reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = (reviewId) => {
    if (!replyText.trim()) return;
    setReviews(reviews.map(review => 
      review.id === reviewId 
        ? { ...review, owner_reply: replyText.trim() }
        : review
    ));
    setReplyingTo(null);
    setReplyText('');
  };

  const handleLogout = () => {
    logout();
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + (review.rating || 5), 0) / reviews.length)
    : 5.0;

  const ratingDistribution = {
    5: reviews.filter(r => (r.rating || 5) === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
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
            <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>★</div>
            Loading reviews...
          </div>
        </main>
      </div>
    );
  }

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
          subtitle: `Owner · ${hotel?.status || 'Active'}` 
        }}
      />

      <main className="app-main">
        <div className="app-topbar">
          <h1>Reviews</h1>
          <div className="topbar-actions">
            <button className="icon-btn">🔔</button>
            <div className="avatar" style={{ width: 34, height: 34, fontSize: '.75rem' }}>
              {hotelName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
          </div>
        </div>

        <div className="app-body">
          <div className="stat-row">
            <div className="keycard">
              <span className="k-eyebrow">Average Rating</span>
              <div className="k-value">{averageRating.toFixed(1)}</div>
              <span className="k-note">★★★★★</span>
            </div>
            <div className="keycard">
              <span className="k-eyebrow">Total Reviews</span>
              <div className="k-value">{reviews.length}</div>
              <span className="k-note">All time</span>
            </div>
            <div className="keycard">
              <span className="k-eyebrow">5-Star Reviews</span>
              <div className="k-value">{ratingDistribution[5]}</div>
              <span className="k-note">{Math.round((ratingDistribution[5] / reviews.length) * 100)}% of total</span>
            </div>
            <div className="keycard">
              <span className="k-eyebrow">Pending Replies</span>
              <div className="k-value">{reviews.filter(r => !r.owner_reply).length}</div>
              <span className="k-note">Need response</span>
            </div>
          </div>

          <div className="split" style={{ alignItems: 'flex-start', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div className="panel">
              <div className="panel-head">
                <h3>Rating Distribution</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[5, 4, 3, 2, 1].map(rating => (
                  <div key={rating} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ minWidth: '60px' }}>{rating} ★</span>
                    <div style={{ 
                      flex: 1, 
                      height: '8px', 
                      background: 'var(--parchment-2)', 
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${(ratingDistribution[rating] / reviews.length) * 100}%`,
                        height: '100%',
                        background: rating >= 4 ? 'var(--emerald)' : rating >= 3 ? 'var(--brass)' : 'var(--rust)',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                    <span style={{ minWidth: '30px', fontSize: '.85rem', color: 'var(--muted)' }}>
                      {ratingDistribution[rating]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel">
              <div className="panel-head">
                <h3>Review Summary</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: '600', color: 'var(--emerald)' }}>
                    {averageRating.toFixed(1)}
                  </div>
                  <div style={{ fontSize: '.9rem', color: 'var(--muted)', marginTop: '4px' }}>
                    out of 5 stars
                  </div>
                  <div style={{ fontSize: '.8rem', color: 'var(--muted)', marginTop: '8px' }}>
                    Based on {reviews.length} reviews
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="panel mt-32">
            <div className="panel-head">
              <h3>Guest Reviews</h3>
              <span className="tag">{reviews.length} reviews</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {reviews.map((review) => (
                <div key={review.id} style={{
                  padding: '20px',
                  border: '1px solid var(--hairline)',
                  borderRadius: '12px',
                  background: 'var(--paper)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="avatar" style={{ 
                        background: 'var(--brass)', 
                        color: '#fff',
                        width: '40px',
                        height: '40px'
                      }}>
                        {review.guest_name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600' }}>{review.guest_name}</div>
                        <div style={{ fontSize: '.8rem', color: 'var(--muted)' }}>
                          {new Date(review.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} style={{ color: i < review.rating ? '#ffd700' : '#ddd' }}>★</span>
                      ))}
                    </div>
                  </div>

                  <p style={{ 
                    margin: '0 0 16px 0', 
                    lineHeight: '1.5', 
                    fontSize: '.9rem' 
                  }}>
                    "{review.comment}"
                  </p>

                  {review.owner_reply ? (
                    <div style={{
                      background: 'var(--parchment-1)',
                      padding: '16px',
                      borderRadius: '8px',
                      borderLeft: '3px solid var(--emerald)'
                    }}>
                      <div style={{ fontWeight: '600', fontSize: '.85rem', marginBottom: '8px' }}>
                        Hotel Response:
                      </div>
                      <p style={{ margin: 0, fontSize: '.85rem', lineHeight: '1.4' }}>
                        {review.owner_reply}
                      </p>
                    </div>
                  ) : replyingTo === review.id ? (
                    <div style={{ marginTop: '16px' }}>
                      <textarea
                        className="input"
                        rows={3}
                        placeholder="Write your response to this review..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        style={{ marginBottom: '12px' }}
                      />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn btn-ghost btn-sm"
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyText('');
                          }}
                        >
                          Cancel
                        </button>
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => handleReply(review.id)}
                          disabled={!replyText.trim()}
                        >
                          Post Reply
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      className="btn btn-ghost btn-sm"
                      onClick={() => setReplyingTo(review.id)}
                      style={{ marginTop: '8px' }}
                    >
                      Reply to Review
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}