import { useNavigate } from 'react-router-dom';

const CATEGORY_COLORS = {
  'AC Repair': { bg: '#e0f2fe', icon: '❄️', accent: '#0284c7' },
  'Plumbing': { bg: '#ede9fe', icon: '🔧', accent: '#7c3aed' },
  'Electrical': { bg: '#fef9c3', icon: '⚡', accent: '#d97706' },
  'Cleaning': { bg: '#dcfce7', icon: '🧹', accent: '#16a34a' },
  'Grooming': { bg: '#fce7f3', icon: '✂️', accent: '#be185d' },
  'Laundry': { bg: '#e0f2fe', icon: '👕', accent: '#0369a1' },
  'Carpentry': { bg: '#ffedd5', icon: '🪚', accent: '#c2410c' },
  'Pest Control': { bg: '#f0fdf4', icon: '🐛', accent: '#15803d' },
};

export default function ServiceCard({ service }) {
  const navigate = useNavigate();
  const colors = CATEGORY_COLORS[service.category] || { bg: '#f3f4f6', icon: '🛠️', accent: '#6b7280' };

  return (
    <div
      className="service-card"
      onClick={() => navigate(`/book/${service._id}`)}
    >
      {/* Image area */}
      <div style={{
        background: colors.bg,
        padding: '24px 20px 16px',
        position: 'relative',
        minHeight: 110,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ fontSize: 52 }}>{service.icon || colors.icon}</div>

        {service.isUrgent && (
          <div className="badge-urgent" style={{ position: 'absolute', top: 10, left: 10 }}>
            ⚡ Urgent
          </div>
        )}
        <div className="delivery-badge" style={{ position: 'absolute', top: 10, right: 10 }}>
          ⚡ 30 min
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '14px 16px 16px' }}>
        <h3 style={{
          fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 15,
          color: 'var(--blink-text)', marginBottom: 4, lineHeight: 1.3,
        }}>{service.name}</h3>
        <p style={{ fontSize: 12, color: 'var(--blink-text2)', marginBottom: 12, lineHeight: 1.4, minHeight: 32 }}>
          {service.description?.slice(0, 55)}{service.description?.length > 55 ? '...' : ''}
        </p>

        {/* Price + CTA row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 17, color: 'var(--blink-text)' }}>
              ₹{service.basePrice}
            </div>
            <div style={{ fontSize: 11, color: '#9ca3af' }}>starting price</div>
          </div>
          <button style={{
            background: 'var(--blink-green)',
            color: 'white',
            border: 'none',
            borderRadius: 10,
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#0a7219'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--blink-green)'}
          >Book →</button>
        </div>

        {/* Time */}
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13 }}>⏱</span>
          <span style={{ fontSize: 12, color: 'var(--blink-text2)', fontWeight: 600 }}>
            {service.estimatedTime >= 60
              ? `${Math.floor(service.estimatedTime / 60)}h${service.estimatedTime % 60 ? ` ${service.estimatedTime % 60}m` : ''}`
              : `${service.estimatedTime} min`} estimated
          </span>
        </div>
      </div>
    </div>
  );
}
