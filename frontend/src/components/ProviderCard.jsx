import { useNavigate } from 'react-router-dom';

export default function ProviderCard({ provider }) {
  const navigate = useNavigate();
  const u = provider.user || {};

  return (
    <div className="blink-card" style={{ padding: 22, cursor: 'pointer' }}
      onClick={() => navigate(`/providers/${provider._id}`)}>

      {/* Header row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 14, alignItems: 'center' }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
          background: 'var(--blink-green)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 20, fontWeight: 800, color: 'white',
          border: '3px solid #dcfce7',
        }}>
          {u.avatar ? <img src={u.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
            : u.name?.[0]?.toUpperCase() || '?'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 5 }}>
            {u.name}
            {provider.isVerified && (
              <span style={{ fontSize: 13, color: '#0284c7' }} title="Verified">✓</span>
            )}
          </div>
          <div style={{ fontSize: 12, color: 'var(--blink-text2)' }}>{provider.completedJobs || 0} jobs done</div>
        </div>
        <div style={{
          padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700,
          background: provider.isAvailable ? '#dcfce7' : '#f3f4f6',
          color: provider.isAvailable ? 'var(--blink-green)' : '#9ca3af',
          flexShrink: 0,
        }}>
          {provider.isAvailable ? '● Online' : '○ Busy'}
        </div>
      </div>

      {/* Stars */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 10 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <span key={i} style={{ fontSize: 14, color: i <= Math.round(provider.rating || 0) ? '#f8c000' : '#e5e7eb' }}>★</span>
        ))}
        <span style={{ fontSize: 12, color: 'var(--blink-text2)', marginLeft: 4, fontWeight: 600 }}>
          {(provider.rating || 0).toFixed(1)} · {provider.totalReviews || 0} reviews
        </span>
      </div>

      {/* Service tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
        {provider.services?.slice(0, 3).map(s => (
          <span key={s._id} style={{
            background: '#f0fdf4', color: 'var(--blink-green)',
            fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 100,
            border: '1px solid #bbf7d0',
          }}>{s.icon} {s.category}</span>
        ))}
        {provider.services?.length > 3 && (
          <span style={{ fontSize: 11, color: '#9ca3af', padding: '3px 6px' }}>+{provider.services.length - 3} more</span>
        )}
      </div>

      {/* Bottom row */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 12, borderTop: '1px solid #f3f4f6',
      }}>
        <div>
          <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 17 }}>
            ₹{provider.pricePerHour}/hr
          </div>
          <div style={{ fontSize: 11, color: '#9ca3af' }}>starting rate</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, color: 'var(--blink-text2)', fontWeight: 700 }}>
            ⚡ ~{provider.responseTime || 30}min
          </div>
          <div style={{ fontSize: 11, color: '#9ca3af' }}>avg response</div>
        </div>
      </div>

      {provider.videoPreviewUrl && (
        <div style={{ marginTop: 10, fontSize: 12, color: 'var(--blink-green)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
          ▶ Watch intro video
        </div>
      )}
    </div>
  );
}
