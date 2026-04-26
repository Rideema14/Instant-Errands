import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import LiveTracker from '../components/LiveTracker';
import { useAuth } from '../context/AuthContext';

const STATUS_CONFIG = {
  pending:     { label: 'Pending',     bg: '#f3f4f6', color: '#6b7280', icon: '⏳', step: 0 },
  matched:     { label: 'Matched',     bg: '#eff6ff', color: '#3b82f6', icon: '🔍', step: 1 },
  accepted:    { label: 'Accepted',    bg: '#eff6ff', color: '#3b82f6', icon: '✅', step: 1 },
  en_route:    { label: 'On the way',  bg: '#fff7ed', color: '#f97316', icon: '🚗', step: 2 },
  arrived:     { label: 'Arrived',     bg: '#fff7ed', color: '#f97316', icon: '📍', step: 2 },
  in_progress: { label: 'In Progress', bg: '#fffbeb', color: '#f59e0b', icon: '🔧', step: 3 },
  completed:   { label: 'Completed',   bg: '#f0fdf4', color: 'var(--blink-green)', icon: '✅', step: 4 },
  cancelled:   { label: 'Cancelled',   bg: '#fef2f2', color: '#ef4444', icon: '❌', step: -1 },
};

const STEPS = ['Booking Placed', 'Provider Matched', 'On the Way', 'In Progress', 'Completed'];

export default function BookingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [rated, setRated] = useState(false);
  const [hoverStar, setHoverStar] = useState(0);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get(`/bookings/${id}`).then(({ data }) => {
      setBooking(data);
      if (data.rating) { setRating(data.rating); setReview(data.review || ''); setRated(true); }
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
  if (!booking) return <div className="page" style={{ textAlign: 'center', paddingTop: 80 }}>Booking not found.</div>;

  const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
  const currentStep = cfg.step;

  return (
    <div style={{ background: 'white', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0c831f, #16a34a)', padding: '20px 20px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button onClick={() => navigate('/bookings')} style={{
              background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 10,
              padding: '8px 14px', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer',
            }}>← Bookings</button>
            <div>
              <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 20, color: 'white' }}>
                {booking.service?.name}
              </h1>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>
                Order #{booking._id?.slice(-8).toUpperCase()}
              </div>
            </div>
          </div>
          <span style={{
            padding: '6px 14px', borderRadius: 100, fontSize: 12, fontWeight: 800,
            background: 'rgba(255,255,255,0.2)', color: 'white',
            display: 'flex', alignItems: 'center', gap: 5,
          }}>{cfg.icon} {cfg.label}</span>
        </div>
      </div>

      <div className="page" style={{ maxWidth: 800 }}>
        {/* Progress tracker — Instamart style */}
        {booking.status !== 'cancelled' && (
          <div className="blink-card" style={{ padding: '24px 28px', marginBottom: 20 }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {/* Progress line */}
              <div style={{ position: 'absolute', left: 20, right: 20, height: 3, background: '#e5e7eb', zIndex: 0 }} />
              <div style={{
                position: 'absolute', left: 20, height: 3, background: 'var(--blink-green)', zIndex: 1,
                width: currentStep > 0 ? `${(currentStep / 4) * 100}%` : '0%',
                transition: 'width 0.6s ease',
              }} />
              {STEPS.map((step, i) => (
                <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 2 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: i <= currentStep ? 'var(--blink-green)' : 'white',
                    border: `3px solid ${i <= currentStep ? 'var(--blink-green)' : '#e5e7eb'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, transition: 'all 0.3s',
                  }}>
                    {i < currentStep ? <span style={{ color: 'white', fontSize: 16 }}>✓</span>
                      : i === currentStep ? <div style={{ width: 10, height: 10, borderRadius: '50%', background: i === currentStep ? 'white' : '#d1d5db' }} />
                      : <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#d1d5db' }} />}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: i <= currentStep ? 'var(--blink-green)' : '#9ca3af', textAlign: 'center', maxWidth: 70 }}>{step}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live tracker */}
        <LiveTracker booking={booking} />

        {/* Details grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 20 }}>
          {/* Service details */}
          <div className="blink-card" style={{ padding: 22 }}>
            <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Service Details</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Service', value: booking.service?.name },
                { label: 'Category', value: booking.service?.category },
                { label: 'Address', value: `${booking.address?.street ? booking.address.street + ', ' : ''}${booking.address?.city}` },
                { label: 'Booked At', value: new Date(booking.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600, flexShrink: 0 }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, textAlign: 'right' }}>{value || '—'}</span>
                </div>
              ))}
            </div>
            {booking.problem && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #f3f4f6' }}>
                <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 700, marginBottom: 6 }}>PROBLEM DESCRIBED</div>
                <p style={{ fontSize: 13, color: 'var(--blink-text2)', lineHeight: 1.6 }}>{booking.problem}</p>
              </div>
            )}
          </div>

          {/* Provider + pricing */}
          <div className="blink-card" style={{ padding: 22 }}>
            <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>
              {booking.provider ? 'Your Provider' : 'Pricing'}
            </div>
            {booking.provider && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: '#f0fdf4', borderRadius: 12, marginBottom: 16 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', background: 'var(--blink-green)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, fontWeight: 800, color: 'white', overflow: 'hidden',
                }}>
                  {booking.provider.avatar
                    ? <img src={booking.provider.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                    : booking.provider.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>{booking.provider.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--blink-text2)' }}>📞 {booking.provider.phone || 'N/A'}</div>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Base Price', val: `₹${booking.service?.basePrice || 0}` },
                booking.isUrgent && { label: 'Priority Fee', val: '+₹99', color: '#f97316' },
                { label: 'Total', val: `₹${booking.totalPrice || booking.service?.basePrice || 0}`, bold: true },
              ].filter(Boolean).map(({ label, val, color, bold }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: bold ? 16 : 14, fontWeight: bold ? 900 : 600, borderTop: bold ? '2px dashed #e5e7eb' : 'none', paddingTop: bold ? 10 : 0 }}>
                  <span style={{ color: bold ? 'var(--blink-text)' : 'var(--blink-text2)' }}>{label}</span>
                  <span style={{ color: color || (bold ? 'var(--blink-text)' : 'var(--blink-text)') }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rating section */}
        {booking.status === 'completed' && (
          <div className="blink-card" style={{ padding: 24, marginTop: 16 }}>
            <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
              {rated ? '⭐ Your Review' : 'Rate this Service'}
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              {[1, 2, 3, 4, 5].map(i => (
                <button key={i}
                  onClick={() => !rated && setRating(i)}
                  onMouseEnter={() => !rated && setHoverStar(i)}
                  onMouseLeave={() => !rated && setHoverStar(0)}
                  style={{
                    fontSize: 32, background: 'none', border: 'none',
                    cursor: rated ? 'default' : 'pointer',
                    color: i <= (hoverStar || rating) ? '#f8c000' : '#e5e7eb',
                    transition: 'color 0.15s, transform 0.1s',
                    transform: i <= (hoverStar || rating) ? 'scale(1.1)' : 'scale(1)',
                  }}>★</button>
              ))}
              {rating > 0 && <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--blink-text2)', alignSelf: 'center', marginLeft: 6 }}>
                {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating]}
              </span>}
            </div>
            {!rated && (
              <>
                <textarea rows={3} placeholder="Share your experience (optional)..."
                  value={review} onChange={e => setReview(e.target.value)}
                  style={{ marginBottom: 12, resize: 'none', fontSize: 14 }} />
                <button className="btn-primary" onClick={submitRating} disabled={!rating}>
                  Submit Review
                </button>
              </>
            )}
            {rated && review && (
              <div style={{ background: '#f9fafb', borderRadius: 12, padding: 14 }}>
                <p style={{ fontSize: 14, color: 'var(--blink-text2)', fontStyle: 'italic', lineHeight: 1.6 }}>"{review}"</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
