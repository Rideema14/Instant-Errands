import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import LiveTracker from '../components/LiveTracker';
import { useAuth } from '../context/AuthContext';

export default function BookingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [rated, setRated] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get(`/bookings/${id}`).then(({ data }) => {
      setBooking(data);
      if (data.rating) { setRating(data.rating); setRated(true); }
    }).finally(() => setLoading(false));
  }, [id]);

  const submitRating = async () => {
    try {
      await api.post(`/bookings/${id}/rate`, { rating, review });
      setRated(true);
    } catch { alert('Failed to submit rating.'); }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div className="spinner" style={{ width: 36, height: 36 }} />
    </div>
  );

  if (!booking) return <div className="page">Booking not found.</div>;

  return (
    <div className="page" style={{ maxWidth: 760 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <button onClick={() => navigate('/bookings')} className="btn-ghost">← My Bookings</button>
        <div style={{ fontSize: 13, color: 'var(--text3)' }}>
          #{booking._id?.slice(-8).toUpperCase()}
        </div>
      </div>

      <LiveTracker booking={booking} />

      {/* Service details */}
      <div className="card" style={{ marginTop: 24 }}>
        <div style={{ fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: 16, fontSize: 16 }}>
          Service Details
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 14 }}>
          {[
            { label: 'Service', value: booking.service?.name },
            { label: 'Category', value: booking.service?.category },
            { label: 'Address', value: `${booking.address?.street || ''} ${booking.address?.city}` },
            { label: 'Booked At', value: new Date(booking.createdAt).toLocaleString('en-IN') },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{ color: 'var(--text3)', fontSize: 12, marginBottom: 3 }}>{label}</div>
              <div style={{ color: 'var(--text)', fontWeight: 500 }}>{value}</div>
            </div>
          ))}
        </div>
        {booking.problem && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
            <div style={{ color: 'var(--text3)', fontSize: 12, marginBottom: 4 }}>Problem Described</div>
            <div style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.5 }}>{booking.problem}</div>
          </div>
        )}
      </div>

      {/* Rating section */}
      {booking.status === 'completed' && (
        <div className="card" style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: 16, fontSize: 16 }}>
            {rated ? '⭐ Your Rating' : 'Rate this Service'}
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {[1,2,3,4,5].map(i => (
              <button
                key={i}
                onClick={() => !rated && setRating(i)}
                style={{
                  fontSize: 28, background: 'none', border: 'none', cursor: rated ? 'default' : 'pointer',
                  color: i <= rating ? 'var(--yellow)' : 'var(--border2)',
                  transition: 'color 0.2s',
                }}>★</button>
            ))}
          </div>
          {!rated && (
            <>
              <textarea
                rows={3} placeholder="Share your experience..."
                value={review} onChange={e => setReview(e.target.value)}
                style={{ marginBottom: 12, resize: 'none' }}
              />
              <button className="btn-primary" onClick={submitRating} disabled={!rating}>
                Submit Review
              </button>
            </>
          )}
          {rated && review && (
            <p style={{ color: 'var(--text2)', fontSize: 14, fontStyle: 'italic' }}>"{review}"</p>
          )}
        </div>
      )}
    </div>
  );
}
