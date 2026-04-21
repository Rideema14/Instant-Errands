import { useNavigate } from 'react-router-dom';

function Stars({ rating }) {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ color: i <= Math.round(rating) ? 'var(--yellow)' : 'var(--border2)' }}>★</span>
      ))}
      <span style={{ color: 'var(--text2)', marginLeft: 4, fontSize: 13 }}>
        {rating?.toFixed(1)} ({/* reviews */})
      </span>
    </div>
  );
}

export default function ProviderCard({ provider }) {
  const navigate = useNavigate();
  const u = provider.user || {};

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: 20,
        cursor: 'pointer',
        transition: 'all 0.25s',
      }}
      onClick={() => navigate(`/providers/${provider._id}`)}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--accent)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={{ display: 'flex', gap: 14, marginBottom: 14, alignItems: 'center' }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, fontWeight: 700, color: 'white', flexShrink: 0,
          fontFamily: 'var(--font-display)',
        }}>
          {u.name?.[0]?.toUpperCase() || '?'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: 16, color: 'var(--text)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {u.name}
            {provider.isVerified && <span title="Verified" style={{ color: 'var(--blue)' }}>✓</span>}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)' }}>
            {provider.completedJobs} jobs done
          </div>
        </div>
        <div style={{
          background: provider.isAvailable ? 'rgba(34,197,94,0.12)' : 'rgba(96,96,120,0.2)',
          color: provider.isAvailable ? 'var(--green)' : 'var(--text3)',
          fontSize: 11, fontWeight: 600,
          padding: '4px 10px', borderRadius: 100,
        }}>
          {provider.isAvailable ? '● Online' : '○ Busy'}
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div className="stars" style={{ marginBottom: 6 }}>
          {[1,2,3,4,5].map(i => (
            <span key={i} style={{ color: i <= Math.round(provider.rating || 0) ? 'var(--yellow)' : 'var(--border2)' }}>★</span>
          ))}
          <span style={{ color: 'var(--text2)', marginLeft: 4, fontSize: 12 }}>
            {(provider.rating || 0).toFixed(1)} · {provider.totalReviews} reviews
          </span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {provider.services?.slice(0, 3).map(s => (
            <span key={s._id} style={{
              background: 'var(--surface2)', fontSize: 11,
              padding: '3px 8px', borderRadius: 4, color: 'var(--text2)',
            }}>{s.icon} {s.category}</span>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
            ₹{provider.pricePerHour}/hr
          </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: 13, color: 'var(--text2)' }}>
          ⚡ ~{provider.responseTime} min response
        </div>
      </div>

      {provider.videoPreviewUrl && (
        <div style={{ marginTop: 12 }}>
          <span style={{
            fontSize: 12, color: 'var(--accent)',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>▶ Watch intro video</span>
        </div>
      )}
    </div>
  );
}
