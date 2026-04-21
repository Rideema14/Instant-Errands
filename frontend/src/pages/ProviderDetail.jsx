import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function ProviderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/providers/${id}`)
      .then(({ data }) => setProvider(data))
      .finally(() => setLoading(false));
  }, [id]);

  const submitReview = async () => {
    if (!user) { navigate('/login'); return; }
    if (!reviewForm.rating) { alert('Please select a rating.'); return; }
    setSubmitting(true);
    try {
      const { data } = await api.post(`/providers/${id}/review`, reviewForm);
      setProvider(prev => ({ ...prev, rating: data.rating }));
      setReviewForm({ rating: 0, comment: '' });
      alert('Review submitted!');
    } catch {
      alert('Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div className="spinner" style={{ width: 36, height: 36 }} />
    </div>
  );

  if (!provider) return <div className="page">Provider not found.</div>;

  const u = provider.user || {};

  return (
    <div className="page" style={{ maxWidth: 800 }}>
      <button onClick={() => navigate(-1)} className="btn-ghost" style={{ marginBottom: 24 }}>
        ← Back
      </button>

      {/* Hero card */}
      <div className="card" style={{ marginBottom: 20, display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent), var(--purple))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 34, fontWeight: 800, color: 'white',
          fontFamily: 'var(--font-display)', flexShrink: 0,
        }}>
          {u.name?.[0]?.toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24 }}>{u.name}</h1>
            {provider.isVerified && (
              <span className="badge badge-blue" style={{ fontSize: 12 }}>✓ Verified</span>
            )}
            <span style={{
              background: provider.isAvailable ? 'rgba(34,197,94,0.12)' : 'rgba(96,96,120,0.15)',
              color: provider.isAvailable ? 'var(--green)' : 'var(--text3)',
              fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 100,
            }}>
              {provider.isAvailable ? '● Available Now' : '○ Busy'}
            </span>
          </div>

          {provider.bio && (
            <p style={{ fontSize: 15, color: 'var(--text2)', marginBottom: 12, lineHeight: 1.6 }}>
              {provider.bio}
            </p>
          )}

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {[
              { label: 'Rating', value: `${(provider.rating || 0).toFixed(1)} ★` },
              { label: 'Reviews', value: provider.totalReviews || 0 },
              { label: 'Jobs Done', value: provider.completedJobs || 0 },
              { label: 'Experience', value: `${provider.experience || 0} yrs` },
              { label: 'Response', value: `~${provider.responseTime} min` },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: 18, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
                  {value}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Price + CTA */}
        <div style={{ flexShrink: 0, textAlign: 'right' }}>
          <div style={{ fontSize: 28, fontWeight: 900, fontFamily: 'var(--font-display)', color: 'var(--text)', marginBottom: 4 }}>
            ₹{provider.pricePerHour}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 16 }}>per hour</div>
          <button
            className="btn-primary"
            disabled={!provider.isAvailable}
            onClick={() => navigate('/services')}
            style={{ whiteSpace: 'nowrap' }}
          >
            {provider.isAvailable ? '⚡ Book Now' : 'Currently Busy'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        {/* Services offered */}
        <div className="card">
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 14 }}>
            Services Offered
          </div>
          {provider.services?.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {provider.services.map(s => (
                <div key={s._id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', background: 'var(--surface2)', borderRadius: 8,
                }}>
                  <span style={{ fontSize: 14 }}>{s.icon} {s.name}</span>
                  <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>
                    ₹{s.basePrice}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text3)', fontSize: 14 }}>No services listed.</p>
          )}
        </div>

        {/* Badges */}
        <div className="card">
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 14 }}>
            Badges & Highlights
          </div>
          {provider.badges?.length ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {provider.badges.map(b => (
                <span key={b} className="badge badge-purple">{b}</span>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {provider.completedJobs >= 50 && <span className="badge badge-yellow">🏆 50+ Jobs</span>}
              {provider.rating >= 4.5 && <span className="badge badge-green">⭐ Top Rated</span>}
              {provider.isVerified && <span className="badge badge-blue">✓ Verified Pro</span>}
              {provider.responseTime <= 15 && <span className="badge badge-urgent">⚡ Fast Responder</span>}
              {!provider.completedJobs && !provider.rating && (
                <p style={{ color: 'var(--text3)', fontSize: 14 }}>No badges yet.</p>
              )}
            </div>
          )}

          {/* Video preview */}
          {provider.videoPreviewUrl && (
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>Intro Video</div>
              {showVideo ? (
                <video
                  src={provider.videoPreviewUrl}
                  controls autoPlay
                  style={{ width: '100%', borderRadius: 8, background: '#000' }}
                />
              ) : (
                <button
                  onClick={() => setShowVideo(true)}
                  style={{
                    width: '100%', padding: '20px', borderRadius: 8,
                    background: 'var(--surface2)', border: '1px solid var(--border)',
                    color: 'var(--accent)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    fontSize: 14, fontWeight: 600,
                  }}
                >
                  ▶ Watch Intro Video
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
          Customer Reviews ({provider.totalReviews || 0})
        </div>
        {provider.reviews?.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {provider.reviews.slice().reverse().slice(0, 5).map((r, i) => (
              <div key={i} style={{
                padding: '14px 16px', background: 'var(--surface2)',
                borderRadius: 10, borderLeft: '3px solid var(--accent)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {[1,2,3,4,5].map(s => (
                      <span key={s} style={{ color: s <= r.rating ? 'var(--yellow)' : 'var(--border2)', fontSize: 14 }}>★</span>
                    ))}
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text3)' }}>
                    {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                {r.comment && (
                  <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.5 }}>{r.comment}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text3)', fontSize: 14 }}>No reviews yet. Be the first!</p>
        )}
      </div>

      {/* Leave a review */}
      {user && (
        <div className="card">
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
            Leave a Review
          </div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
            {[1,2,3,4,5].map(s => (
              <button
                key={s}
                onClick={() => setReviewForm(f => ({ ...f, rating: s }))}
                style={{
                  fontSize: 28, background: 'none', border: 'none', cursor: 'pointer',
                  color: s <= reviewForm.rating ? 'var(--yellow)' : 'var(--border2)',
                  transition: 'color 0.15s',
                }}
              >★</button>
            ))}
          </div>
          <textarea
            rows={3}
            placeholder="Share your experience with this provider..."
            value={reviewForm.comment}
            onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
            style={{ marginBottom: 12, resize: 'none' }}
          />
          <button
            className="btn-primary"
            onClick={submitReview}
            disabled={submitting || !reviewForm.rating}
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      )}
    </div>
  );
}
