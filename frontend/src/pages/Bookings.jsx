import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const STATUS_CONFIG = {
  pending:     { label: 'Pending',     bg: '#f3f4f6', color: '#6b7280',           icon: '⏳' },
  matched:     { label: 'Matched',     bg: '#eff6ff', color: '#3b82f6',           icon: '🔍' },
  accepted:    { label: 'Accepted',    bg: '#eff6ff', color: '#3b82f6',           icon: '✅' },
  en_route:    { label: 'On the way',  bg: '#fff7ed', color: '#f97316',           icon: '🚗' },
  arrived:     { label: 'Arrived',     bg: '#fff7ed', color: '#f97316',           icon: '📍' },
  in_progress: { label: 'In Progress', bg: '#fffbeb', color: '#f59e0b',           icon: '🔧' },
  completed:   { label: 'Completed',   bg: '#f0fdf4', color: 'var(--blink-green)',icon: '✅' },
  cancelled:   { label: 'Cancelled',   bg: '#fef2f2', color: '#ef4444',           icon: '❌' },
};

export default function Bookings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get('/bookings/my').then(({ data }) => setBookings(data)).finally(() => setLoading(false));
  }, []);

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  const filtered = bookings.filter(b => {
    if (filter === 'all') return true;
    if (filter === 'active') return !['completed', 'cancelled'].includes(b.status);
    return b.status === filter;
  });

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div className="spinner" style={{ width: 36, height: 36 }} />
    </div>
  );

  return (
    <div style={{ background: 'white', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0c831f, #16a34a)', padding: '28px 20px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 26, color: 'white' }}>My Bookings</h1>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>{bookings.length} total bookings</p>
          </div>
          <button className="btn-yellow" onClick={() => navigate('/services')} style={{ fontSize: 14, padding: '12px 22px' }}>
            + New Booking
          </button>
        </div>
      </div>

      <div className="page" style={{ maxWidth: 900 }}>
        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {filters.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{
              padding: '8px 18px', borderRadius: 100, fontSize: 13, fontWeight: 700,
              background: filter === f.key ? 'var(--blink-green)' : 'white',
              color: filter === f.key ? 'white' : '#374151',
              border: `2px solid ${filter === f.key ? 'var(--blink-green)' : '#e5e7eb'}`,
              cursor: 'pointer', transition: 'all 0.15s',
            }}>{f.label}</button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>📋</div>
            <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>No bookings yet</div>
            <p style={{ color: 'var(--blink-text2)', marginBottom: 24 }}>Book your first service and get help fast!</p>
            <button className="btn-primary" onClick={() => navigate('/services')}>Browse Services</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filtered.map(b => {
              const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
              return (
                <div
                  key={b._id}
                  onClick={() => navigate(`/bookings/${b._id}`)}
                  className="blink-card"
                  style={{ padding: '20px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 20 }}
                >
                  {/* Service icon */}
                  <div style={{
                    width: 56, height: 56, borderRadius: 14, background: '#f0fdf4', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
                  }}>{b.service?.icon || '🛠️'}</div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 16 }}>
                        {b.service?.name || 'Service'}
                      </div>
                      {b.isUrgent && <div className="badge-urgent">⚡ Urgent</div>}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--blink-text2)', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      📍 {b.address?.city || 'N/A'} &nbsp;·&nbsp; 🗓 {new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '3px 10px', borderRadius: 100, fontSize: 12, fontWeight: 700,
                        background: cfg.bg, color: cfg.color,
                      }}>{cfg.icon} {cfg.label}</span>
                      {b.provider && <span style={{ fontSize: 12, color: 'var(--blink-text2)' }}>· {b.provider.name}</span>}
                    </div>
                  </div>

                  {/* Price + arrow */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 18 }}>₹{b.totalPrice || b.service?.basePrice || '—'}</div>
                    <div style={{ fontSize: 20, color: '#d1d5db', marginTop: 4 }}>›</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
