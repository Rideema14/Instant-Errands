import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const TABS = ['Overview', 'All Users', 'KYC Queue', 'Bookings'];

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('Overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [kycQueue, setKycQueue] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'admin') { navigate('/'); return; }
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [s, u, k, b] = await Promise.all([
        api.get('/admin/stats'), api.get('/admin/users'),
        api.get('/admin/kyc/pending'), api.get('/admin/bookings'),
      ]);
      setStats(s.data); setUsers(u.data.users);
      setKycQueue(k.data); setBookings(b.data.bookings);
    } finally { setLoading(false); }
  };

  const loadUsers = async () => {
    const params = new URLSearchParams();
    if (roleFilter) params.set('role', roleFilter);
    if (search) params.set('search', search);
    const { data } = await api.get(`/admin/users?${params}`);
    setUsers(data.users);
  };

  const reviewKYC = async (userId, action) => {
    let rejectionReason = '';
    if (action === 'reject') {
      rejectionReason = window.prompt('Enter rejection reason:') || 'Documents could not be verified';
    }
    await api.put(`/admin/kyc/${userId}/review`, { action, rejectionReason });
    setKycQueue(q => q.filter(u => u._id !== userId));
    loadAll();
  };

  const toggleUser = async (userId) => {
    await api.put(`/admin/users/${userId}/toggle-active`);
    loadUsers();
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div className="spinner" style={{ width: 36, height: 36 }} />
    </div>
  );

  return (
    <div style={{ background: 'white', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #3730a3)', padding: '28px 20px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>🛡️ Admin Panel</div>
            <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 26, color: 'white' }}>Dashboard</h1>
          </div>
          {kycQueue.length > 0 && (
            <div style={{ background: '#ef4444', color: 'white', borderRadius: 100, padding: '6px 16px', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
              onClick={() => setTab('KYC Queue')}>
              🔴 {kycQueue.length} KYC pending review
            </div>
          )}
        </div>
      </div>

      <div className="page" style={{ maxWidth: 1280 }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 28, background: '#f9fafb', borderRadius: 12, padding: 4, width: 'fit-content' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '9px 20px', borderRadius: 10, fontSize: 14, fontWeight: 700,
              background: tab === t ? 'white' : 'transparent',
              color: tab === t ? 'var(--blink-text)' : '#6b7280',
              border: 'none', cursor: 'pointer', transition: 'all 0.15s',
              boxShadow: tab === t ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
            }}>
              {t}
              {t === 'KYC Queue' && kycQueue.length > 0 && (
                <span style={{ background: '#ef4444', color: 'white', borderRadius: '50%', padding: '1px 6px', fontSize: 10, marginLeft: 6, fontWeight: 900 }}>
                  {kycQueue.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === 'Overview' && stats && (
          <div className="animate-fade-in">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 16, marginBottom: 28 }}>
              {[
                { icon: '👥', label: 'Total Users', value: stats.totalUsers, color: '#0284c7', bg: '#e0f2fe' },
                { icon: '🔧', label: 'Providers', value: stats.totalProviders, color: 'var(--blink-green)', bg: '#dcfce7' },
                { icon: '🛒', label: 'Customers', value: stats.totalCustomers, color: '#7c3aed', bg: '#ede9fe' },
                { icon: '📋', label: 'Total Bookings', value: stats.totalBookings, color: '#f97316', bg: '#fff7ed' },
                { icon: '✅', label: 'Completed', value: stats.completedBookings, color: '#16a34a', bg: '#f0fdf4' },
                { icon: '⏳', label: 'KYC Pending', value: stats.pendingKYC, color: '#f59e0b', bg: '#fffbeb' },
              ].map(({ icon, label, value, color, bg }) => (
                <div key={label} className="blink-card" style={{ padding: 20, textAlign: 'center' }}>
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: bg, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>{icon}</div>
                  <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 28, color: 'var(--blink-text)' }}>{value ?? '—'}</div>
                  <div style={{ fontSize: 12, color: 'var(--blink-text2)', fontWeight: 600 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Users Tab */}
        {tab === 'All Users' && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
              <div className="input-icon-wrap" style={{ flex: 1, minWidth: 200, maxWidth: 320 }}>
                <span className="input-icon">🔍</span>
                <input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && loadUsers()} style={{ paddingLeft: 42 }} />
              </div>
              <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ width: 'auto', minWidth: 140 }}>
                <option value="">All Roles</option>
                <option value="customer">Customers</option>
                <option value="provider">Providers</option>
                <option value="admin">Admins</option>
              </select>
              <button className="btn-primary" style={{ padding: '12px 20px' }} onClick={loadUsers}>Search</button>
            </div>

            <div className="blink-card" style={{ overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '2px solid #f0f0f0' }}>
                    {['User', 'Role', 'KYC', 'Joined', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} style={{ borderBottom: '1px solid #f9fafb' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--blink-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: 'white' }}>
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700 }}>{u.name}</div>
                            <div style={{ fontSize: 12, color: '#9ca3af' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', background: u.role === 'admin' ? '#ede9fe' : u.role === 'provider' ? '#dcfce7' : '#e0f2fe', color: u.role === 'admin' ? '#7c3aed' : u.role === 'provider' ? 'var(--blink-green)' : '#0284c7' }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {u.role === 'provider' ? (
                          <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, background: u.kyc?.status === 'approved' ? '#f0fdf4' : u.kyc?.status === 'pending' ? '#fffbeb' : '#fef2f2', color: u.kyc?.status === 'approved' ? 'var(--blink-green)' : u.kyc?.status === 'pending' ? '#f59e0b' : '#ef4444' }}>
                            {u.kyc?.status || 'not submitted'}
                          </span>
                        ) : <span style={{ color: '#d1d5db', fontSize: 13 }}>—</span>}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--blink-text2)' }}>
                        {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: u.isActive ? 'var(--blink-green)' : '#9ca3af' }}>
                          {u.isActive ? '● Active' : '○ Disabled'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <Link to={`/admin/users/${u._id}`}>
                            <button style={{ padding: '5px 12px', fontSize: 12, fontWeight: 700, borderRadius: 8, background: '#f9fafb', border: '1.5px solid #e5e7eb', cursor: 'pointer', color: 'var(--blink-text)' }}>View</button>
                          </Link>
                          {u.role !== 'admin' && (
                            <button onClick={() => toggleUser(u._id)} style={{ padding: '5px 12px', fontSize: 12, fontWeight: 700, borderRadius: 8, border: 'none', cursor: 'pointer', background: u.isActive ? '#fef2f2' : '#f0fdf4', color: u.isActive ? '#ef4444' : 'var(--blink-green)' }}>
                              {u.isActive ? 'Disable' : 'Enable'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No users found</div>}
            </div>
          </div>
        )}

        {/* KYC Queue Tab */}
        {tab === 'KYC Queue' && (
          <div className="animate-fade-in">
            {kycQueue.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 80 }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
                <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 20, fontWeight: 700, marginBottom: 6 }}>All caught up!</div>
                <p style={{ color: 'var(--blink-text2)' }}>No KYC applications pending review.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {kycQueue.map(u => (
                  <div key={u._id} className="blink-card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: '0 0 auto' }}>
                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--blink-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: 'white' }}>
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 16 }}>{u.name}</div>
                          <div style={{ fontSize: 13, color: 'var(--blink-text2)' }}>{u.email} · {u.phone}</div>
                          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                            Submitted: {new Date(u.kyc.submittedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>

                      <div style={{ flex: 1, minWidth: 220 }}>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                          <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 800, background: '#e0f2fe', color: '#0284c7' }}>
                            {u.kyc.docType === 'aadhaar' ? '🪪 Aadhaar' : '💳 PAN'}
                          </span>
                          <span style={{ fontFamily: 'monospace', fontSize: 14, background: '#f9fafb', padding: '3px 10px', borderRadius: 6, letterSpacing: '0.1em', border: '1px solid #e5e7eb' }}>
                            {u.kyc.docType === 'aadhaar' ? u.kyc.docNumber?.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3') : u.kyc.docNumber}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                          {[{ src: u.kyc.docFrontImage, label: 'Doc Front', round: false }, { src: u.kyc.docBackImage, label: 'Doc Back', round: false }, { src: u.kyc.selfieImage, label: 'Selfie', round: true }].filter(x => x.src).map(({ src, label, round }) => (
                            <div key={label}>
                              <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 4, fontWeight: 700 }}>{label}</div>
                              <a href={src} target="_blank" rel="noopener noreferrer">
                                <img src={src} alt={label} style={{ width: round ? 72 : 110, height: 72, objectFit: 'cover', borderRadius: round ? '50%' : 10, border: '2px solid #e5e7eb', cursor: 'pointer' }} />
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <button onClick={() => reviewKYC(u._id, 'approve')} style={{ padding: '10px 20px', borderRadius: 10, background: '#f0fdf4', color: 'var(--blink-green)', border: '2px solid #bbf7d0', fontWeight: 800, cursor: 'pointer', fontSize: 14 }}>
                          ✅ Approve
                        </button>
                        <button onClick={() => reviewKYC(u._id, 'reject')} style={{ padding: '10px 20px', borderRadius: 10, background: '#fef2f2', color: '#ef4444', border: '2px solid #fecaca', fontWeight: 800, cursor: 'pointer', fontSize: 14 }}>
                          ❌ Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {tab === 'Bookings' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {bookings.map(b => {
              const statusColors = { pending: '#6b7280', matched: '#3b82f6', accepted: '#3b82f6', en_route: '#f97316', in_progress: '#f59e0b', completed: 'var(--blink-green)', cancelled: '#ef4444' };
              const statusBg = { pending: '#f3f4f6', matched: '#eff6ff', accepted: '#eff6ff', en_route: '#fff7ed', in_progress: '#fffbeb', completed: '#f0fdf4', cancelled: '#fef2f2' };
              return (
                <div key={b._id} className="blink-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ fontSize: 28 }}>{b.service?.icon || '🔧'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{b.service?.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--blink-text2)', marginTop: 2 }}>
                      👤 {b.user?.name} · 🔧 {b.provider?.user?.name || 'Unassigned'} · 📍 {b.address?.city}
                    </div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{new Date(b.createdAt).toLocaleString('en-IN')}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, background: statusBg[b.status] || '#f3f4f6', color: statusColors[b.status] || '#6b7280', textTransform: 'capitalize' }}>
                      {b.status?.replace('_', ' ')}
                    </span>
                    {b.isUrgent && <span style={{ fontSize: 10, fontWeight: 900, padding: '2px 7px', borderRadius: 5, background: '#fff7ed', color: '#f97316' }}>⚡ URGENT</span>}
                    <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 14 }}>₹{b.totalPrice || '—'}</span>
                  </div>
                </div>
              );
            })}
            {bookings.length === 0 && <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>No bookings yet</div>}
          </div>
        )}
      </div>
    </div>
  );
}
