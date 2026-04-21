import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const STATUS_COLORS = {
  pending: 'var(--text3)', matched: 'var(--blue)', accepted: 'var(--blue)',
  en_route: 'var(--accent)', arrived: 'var(--accent)', in_progress: 'var(--yellow)',
  completed: 'var(--green)', cancelled: 'var(--text3)',
};
const STATUS_BG = {
  pending: 'rgba(96,96,120,0.15)', matched: 'rgba(59,130,246,0.12)', accepted: 'rgba(59,130,246,0.12)',
  en_route: 'rgba(255,92,43,0.12)', arrived: 'rgba(255,92,43,0.12)',
  in_progress: 'rgba(245,158,11,0.12)', completed: 'rgba(34,197,94,0.12)', cancelled: 'rgba(96,96,120,0.1)',
};

export default function Bookings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get('/bookings/my').then(({ data }) => setBookings(data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div className="spinner" style={{ width: 36, height: 36 }} />
    </div>
  );

  return (
    <div className="page" style={{ maxWidth: 860 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 className="section-title">My Bookings</h1>
          <p className="section-sub" style={{ marginBottom: 0 }}>{bookings.length} total bookings</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/services')}>+ New Booking</button>
      </div>

      {bookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📋</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
            No bookings yet
          </div>
          <p style={{ color: 'var(--text2)', marginBottom: 24 }}>Book your first service and get help fast!</p>
          <button className="btn-primary" onClick={() => navigate('/services')}>Browse Services</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {bookings.map(b => (
            <div
              key={b._id}
              onClick={() => navigate(`/bookings/${b._id}`)}
              style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: 20, cursor: 'pointer',
                transition: 'all 0.2s', display: 'flex', gap: 16, alignItems: 'center',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={{ fontSize: 36, flexShrink: 0 }}>{b.service?.icon || '🔧'}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>
                    {b.service?.name}
                  </span>
                  {b.isUrgent && <span className="badge badge-urgent" style={{ fontSize: 11 }}>⚡ Urgent</span>}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 6 }}>
                  {b.problem?.slice(0, 80)}{b.problem?.length > 80 ? '...' : ''}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                  📅 {new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  &nbsp;·&nbsp;
                  {b.address?.city}
                </div>
              </div>
              <div style={{ flexShrink: 0, textAlign: 'right' }}>
                <div style={{
                  display: 'inline-block', padding: '5px 12px',
                  borderRadius: 100, fontSize: 12, fontWeight: 600,
                  background: STATUS_BG[b.status],
                  color: STATUS_COLORS[b.status],
                  marginBottom: 6,
                }}>
                  {b.status?.replace('_', ' ').toUpperCase()}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>→ View Details</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
