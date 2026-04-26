import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const KYC_STATUS = {
  not_submitted: { label: 'Not Submitted', color: '#f97316', bg: '#fff7ed', border: '#fed7aa', icon: '📋', action: true },
  pending:       { label: 'Under Review',  color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', icon: '⏳', action: false },
  approved:      { label: 'Verified ✓',   color: 'var(--blink-green)', bg: '#f0fdf4', border: '#bbf7d0', icon: '✅', action: false },
  rejected:      { label: 'Rejected — Resubmit', color: '#ef4444', bg: '#fef2f2', border: '#fecaca', icon: '❌', action: true },
};

export default function ProviderDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'provider') { navigate('/'); return; }
    Promise.all([api.get('/auth/me'), api.get('/bookings/my')])
      .then(([me, bk]) => { setProfile(me.data.providerProfile); setBookings(bk.data); })
      .finally(() => setLoading(false));
  }, []);

  const toggleAvailability = async () => {
    if (!profile) return;
    setToggling(true);
    try {
      const { data } = await api.patch('/providers/availability', { isAvailable: !profile.isAvailable });
      setProfile(p => ({ ...p, isAvailable: data.isAvailable }));
    } finally { setToggling(false); }
  };

  const kycStatus = user?.kyc?.status || 'not_submitted';
  const kycInfo = KYC_STATUS[kycStatus];
  const isVerified = kycStatus === 'approved';

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div className="spinner" style={{ width: 36, height: 36 }} />
    </div>
  );

  const activeBookings = bookings.filter(b => !['completed', 'cancelled'].includes(b.status));
  const completedBookings = bookings.filter(b => b.status === 'completed');

  return (
    <div style={{ background: 'white', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0c831f, #16a34a)', padding: '28px 20px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>Provider Dashboard</div>
            <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 26, color: 'white' }}>
              Welcome back, {user?.name?.split(' ')[0]}! 👋
            </h1>
          </div>
          <Link to="/provider/profile">
            <button style={{
              background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.4)',
              borderRadius: 12, padding: '10px 20px', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer',
            }}>Edit Profile →</button>
          </Link>
        </div>
      </div>

      <div className="page" style={{ maxWidth: 1200 }}>
        {/* KYC Banner */}
        <div style={{
          background: kycInfo.bg, border: `2px solid ${kycInfo.border}`,
          borderRadius: 16, padding: '18px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 14, marginBottom: 28,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontSize: 32 }}>{kycInfo.icon}</div>
            <div>
              <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 15 }}>
                KYC Status: <span style={{ color: kycInfo.color }}>{kycInfo.label}</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--blink-text2)', marginTop: 2 }}>
                {kycStatus === 'not_submitted' && 'Submit your Aadhaar or PAN to start accepting jobs'}
                {kycStatus === 'pending' && 'Our team is reviewing your documents (24–48 hours)'}
                {kycStatus === 'approved' && 'Your identity is verified. You can accept service jobs!'}
                {kycStatus === 'rejected' && (user?.kyc?.rejectionReason || 'Documents could not be verified. Please resubmit.')}
              </div>
            </div>
          </div>
          {kycInfo.action && (
            <button className="btn-primary" onClick={() => navigate('/provider/kyc')}>
              {kycStatus === 'rejected' ? '🔄 Resubmit KYC' : '📋 Start KYC →'}
            </button>
          )}
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
          {[
            { icon: '⭐', label: 'Rating', value: profile?.rating ? profile.rating.toFixed(1) : 'N/A', sub: `${profile?.totalReviews || 0} reviews`, color: '#f8c000', bg: '#fffbeb' },
            { icon: '✅', label: 'Jobs Done', value: profile?.completedJobs || 0, sub: 'completed', color: 'var(--blink-green)', bg: '#f0fdf4' },
            { icon: '🔥', label: 'Active', value: activeBookings.length, sub: 'right now', color: '#f97316', bg: '#fff7ed' },
            { icon: '💰', label: 'Rate', value: `₹${profile?.pricePerHour || 300}`, sub: 'per hour', color: '#7c3aed', bg: '#ede9fe' },
            { icon: '⚡', label: 'Response', value: `${profile?.responseTime || 15}m`, sub: 'avg time', color: '#0284c7', bg: '#e0f2fe' },
          ].map(({ icon, label, value, sub, color, bg }) => (
            <div key={label} className="blink-card" style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: bg, fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>{icon}</div>
              <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 22, color: 'var(--blink-text)' }}>{value}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--blink-text2)' }}>{label}</div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* Availability toggle */}
        {isVerified && profile && (
          <div className="blink-card" style={{ padding: '20px 24px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
            <div>
              <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 16 }}>Availability</div>
              <div style={{ fontSize: 13, color: 'var(--blink-text2)', marginTop: 2 }}>
                You are currently{' '}
                <span style={{ fontWeight: 800, color: profile.isAvailable ? 'var(--blink-green)' : '#9ca3af' }}>
                  {profile.isAvailable ? 'online and accepting jobs' : 'offline'}
                </span>
              </div>
            </div>
            <button onClick={toggleAvailability} disabled={toggling} style={{
              background: profile.isAvailable ? '#fef2f2' : '#f0fdf4',
              color: profile.isAvailable ? '#ef4444' : 'var(--blink-green)',
              border: `2px solid ${profile.isAvailable ? '#fecaca' : '#bbf7d0'}`,
              borderRadius: 12, padding: '12px 24px', fontWeight: 800, fontSize: 14, cursor: 'pointer',
              transition: 'all 0.2s', opacity: toggling ? 0.7 : 1,
            }}>
              {profile.isAvailable ? '🔴 Go Offline' : '🟢 Go Online'}
            </button>
          </div>
        )}

        {/* Recent jobs */}
        <div>
          <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 18, marginBottom: 16 }}>
            Recent Bookings
          </div>
          {bookings.length === 0 ? (
            <div className="blink-card" style={{ padding: 48, textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
              <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 6 }}>No jobs yet</div>
              <p style={{ color: 'var(--blink-text2)', fontSize: 13 }}>
                {!isVerified ? 'Complete KYC to start receiving job requests.' : 'Job requests will appear here once matched.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {bookings.slice(0, 8).map(b => {
                const statusColors = { pending: '#6b7280', matched: '#3b82f6', accepted: '#3b82f6', en_route: '#f97316', in_progress: '#f59e0b', completed: 'var(--blink-green)', cancelled: '#ef4444' };
                const statusBg = { pending: '#f3f4f6', matched: '#eff6ff', accepted: '#eff6ff', en_route: '#fff7ed', in_progress: '#fffbeb', completed: '#f0fdf4', cancelled: '#fef2f2' };
                return (
                  <div key={b._id} onClick={() => navigate(`/bookings/${b._id}`)} className="blink-card"
                    style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ fontSize: 28, flexShrink: 0 }}>{b.service?.icon || '🛠️'}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{b.service?.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--blink-text2)', marginTop: 2 }}>
                        📍 {b.address?.city} · {new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 800, background: statusBg[b.status] || '#f3f4f6', color: statusColors[b.status] || '#6b7280', textTransform: 'capitalize' }}>
                        {b.status?.replace('_', ' ')}
                      </span>
                      <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 14 }}>₹{b.totalPrice || b.service?.basePrice || '—'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
