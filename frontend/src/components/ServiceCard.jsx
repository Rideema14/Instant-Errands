import { useNavigate } from 'react-router-dom';

export default function ServiceCard({ service }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/book/${service._id}`)}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: 24,
        cursor: 'pointer',
        transition: 'all 0.25s',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.border = '1px solid var(--accent)';
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-accent)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.border = '1px solid var(--border)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {service.isUrgent && (
        <span className="badge badge-urgent" style={{ position: 'absolute', top: 14, right: 14, fontSize: 11 }}>
          ⚡ URGENT
        </span>
      )}
      <div style={{ fontSize: 38, marginBottom: 14 }}>{service.icon}</div>
      <h3 style={{
        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17,
        color: 'var(--text)', marginBottom: 6,
      }}>{service.name}</h3>
      <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16, lineHeight: 1.5 }}>
        {service.description}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>
            ₹{service.basePrice}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>starting price</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 13, color: 'var(--text2)' }}>
            ⏱ {service.estimatedTime >= 60
              ? `${Math.floor(service.estimatedTime / 60)}h${service.estimatedTime % 60 ? ` ${service.estimatedTime % 60}m` : ''}`
              : `${service.estimatedTime}m`}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>estimated time</div>
        </div>
      </div>
    </div>
  );
}
