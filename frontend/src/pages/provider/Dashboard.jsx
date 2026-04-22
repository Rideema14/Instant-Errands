import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const KYC_STATUS = {
  not_submitted: { label: 'Not Submitted', color: 'var(--text3)', bg: 'var(--surface2)', icon: '📋', action: true },
  pending:       { label: 'Under Review', color: 'var(--yellow)', bg: 'rgba(245,158,11,0.12)', icon: '⏳', action: false },
  approved:      { label: 'Verified ✓', color: 'var(--green)', bg: 'rgba(34,197,94,0.12)', icon: '✅', action: false },
  rejected:      { label: 'Rejected — Resubmit', color: 'var(--accent)', bg: 'rgba(255,92,43,0.12)', icon: '❌', action: true },
};

export default function ProviderDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'provider') { navigate('/'); return; }
    Promise.all([
      api.get('/auth/me'),
      api.get('/bookings/my'),
    ]).then(([me, bk]) => {
      setProfile(me.data.providerProfile);
      setBookings(bk.data);
    }).finally(() => setLoading(false));
  }, []);

  const kycStatus = user?.kyc?.status || 'not_submitted';
  const kycInfo = KYC_STATUS[kycStatus];
  const isVerified = kycStatus === 'approved';

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div className="spinner" style={{ width: 36, height: 36 }} />
    </div>
  );

  return (
    <div className="page">
      <div style={{ marginBottom: 28 }}>
        <h1 className="section-title">Provider Dashboard</h1>
        <p className="section-sub" style={{ marginBottom: 0 }}>Welcome back, {user?.name?.split(' ')[0]}!</p>
      </div>

      {/* KYC Status Banner */}
      <div style={{
        background: kycInfo.bg,
        border: `1px solid ${kycInfo.color}40`,
        borderRadius: 'var(--radius)', padding: '18px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 14, marginBottom: 28,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontSize: 32 }}>{kycInfo.icon}</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>
              KYC Status: <span style={{ color: kycInfo.color }}>{kycInfo.label}</span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>
              {kycStatus === 'not_submitted' && 'Submit your Aadhaar or PAN to start accepting jobs'}
              {kycStatus === 'pending' && 'Our team is reviewing your documents (24–48 hours)'}
              {kycStatus === 'approved' && 'Your identity is verified. You can accept service jobs!'}
              {kycStatus === 'rejected' && (user?.kyc?.rejectionReason || 'Documents could not be verified. Please resubmit.')}
            </div>
          </div>
        </div>
        {kycInfo.action && (
          <button className="btn-primary" onClick={() => navigate('/provider/kyc')} style={{ whiteSpace: 'nowrap' }}>
            {kycStatus === 'rejected' ? '🔄 Resubmit KYC' : '📋 Start KYC →'}
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {[
          { icon: '⭐', label: 'Rating', value: profile?.rating ? profile.rating.toFixed(1) : 'N/A', sub: `${profile?.totalReviews || 0} reviews` },
          { icon: '✅', label: 'Jobs Done', value: profile?.completedJobs || 0, sub: 'completed' },
          { icon: '⚡', label: 'Response Time', value: `${profile?.responseTime || 15}m`, sub: 'average' },
          { icon: '💰', label: 'Rate', value: `₹${profile?.pricePerHour || 300}`, sub: 'per hour' },
        ].map(({ icon, label, value, sub }) => (
          <div key={label} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: 'var(--text)' }}>{value}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>{label}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Availability toggle */}
      {isVerified && profile && (
        <div className="card" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>Availability</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>
              {profile.isAvailable ? 'You are online and can receive bookings' : 'You are offline. Customers cannot book you.'}
            </div>
          </div>
          <button
            onClick={async () => {
              const { data } = await api.put('/providers/availability', { isAvailable: !profile.isAvailable });
              setProfile(p => ({ ...p, isAvailable: data.isAvailable }));
            }}
            style={{
              padding: '12px 24px', borderRadius: 8, fontWeight: 700,
              background: profile.isAvailable ? 'rgba(34,197,94,0.15)' : 'var(--surface2)',
              color: profile.isAvailable ? 'var(--green)' : 'var(--text2)',
              border: `1px solid ${profile.isAvailable ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
              cursor: 'pointer', fontSize: 14, transition: 'all 0.2s',
            }}
          >
            {profile.isAvailable ? '● Online — Go Offline' : '○ Offline — Go Online'}
          </button>
        </div>
      )}

      {/* Recent jobs */}
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Recent Jobs</div>
        {bookings.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <div style={{ color: 'var(--text2)', fontSize: 15 }}>
              {isVerified ? 'No jobs yet. Stay online to receive bookings!' : 'Complete KYC verification to start receiving jobs.'}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {bookings.slice(0, 8).map(b => (
              <Link key={b._id} to={`/bookings/${b._id}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', transition: 'all 0.2s', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <span style={{ fontSize: 28 }}>{b.service?.icon || '🔧'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{b.service?.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--text2)' }}>{b.address?.city} · {new Date(b.createdAt).toLocaleDateString('en-IN')}</div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 100, background: 'var(--surface2)', color: 'var(--text2)' }}>
                    {b.status?.replace('_', ' ')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
