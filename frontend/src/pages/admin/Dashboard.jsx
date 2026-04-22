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
  const [userFilter, setUserFilter] = useState({ role: '', search: '' });

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'admin') { navigate('/'); return; }
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [s, u, k, b] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/kyc/pending'),
        api.get('/admin/bookings'),
      ]);
      setStats(s.data);
      setUsers(u.data.users);
      setKycQueue(k.data);
      setBookings(b.data.bookings);
    } finally { setLoading(false); }
  };

  const loadUsers = async () => {
    const params = new URLSearchParams();
    if (userFilter.role) params.set('role', userFilter.role);
    if (userFilter.search) params.set('search', userFilter.search);
    const { data } = await api.get(`/admin/users?${params}`);
    setUsers(data.users);
  };

  const reviewKYC = async (userId, action, rejectionReason = '') => {
    if (action === 'reject' && !rejectionReason) {
      rejectionReason = window.prompt('Enter rejection reason:') || 'Documents could not be verified';
    }
    await api.put(`/admin/kyc/${userId}/review`, { action, rejectionReason });
    setKycQueue(q => q.filter(u => u._id !== userId));
    alert(`KYC ${action}d successfully`);
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
    <div className="page">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="section-title">Admin Dashboard</h1>
          <p className="section-sub" style={{ marginBottom: 0 }}>Manage users, KYC verifications, and bookings</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {kycQueue.length > 0 && (
            <div style={{ background: 'var(--accent)', color: 'white', borderRadius: 100, padding: '4px 12px', fontSize: 13, fontWeight: 700 }}>
              {kycQueue.length} KYC pending
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 28, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '10px 20px', background: 'none', border: 'none',
            borderBottom: `2px solid ${tab === t ? 'var(--accent)' : 'transparent'}`,
            color: tab === t ? 'var(--accent)' : 'var(--text2)',
            fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14,
            cursor: 'pointer', transition: 'all 0.2s', marginBottom: -1,
          }}>
            {t} {t === 'KYC Queue' && kycQueue.length > 0 && `(${kycQueue.length})`}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {tab === 'Overview' && stats && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <div className="grid-4" style={{ marginBottom: 24 }}>
            {[
              { icon: '👥', label: 'Total Users', value: stats.totalUsers, color: 'var(--blue)' },
              { icon: '🛒', label: 'Customers', value: stats.totalCustomers, color: 'var(--blue)' },
              { icon: '🔧', label: 'Providers', value: stats.totalProviders, color: 'var(--accent)' },
              { icon: '📋', label: 'Total Bookings', value: stats.totalBookings, color: 'var(--green)' },
            ].map(({ icon, label, value, color }) => (
              <div key={label} className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, color }}>{value}</div>
                <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
          <div className="grid-3" style={{ marginBottom: 28 }}>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: 'var(--yellow)' }}>{stats.kyc.pending}</div>
              <div style={{ fontSize: 13, color: 'var(--text2)' }}>KYC Pending Review</div>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>✅</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: 'var(--green)' }}>{stats.kyc.approved}</div>
              <div style={{ fontSize: 13, color: 'var(--text2)' }}>KYC Approved</div>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>❌</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: 'var(--accent)' }}>{stats.kyc.rejected}</div>
              <div style={{ fontSize: 13, color: 'var(--text2)' }}>KYC Rejected</div>
            </div>
          </div>

          {/* Recent bookings */}
          <div className="card">
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Recent Bookings</div>
            {stats.recentBookings?.map(b => (
              <div key={b._id} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                <span style={{ fontSize: 22 }}>{b.service?.icon || '🔧'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{b.service?.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>{b.user?.name} · {b.user?.email}</div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 100, background: 'var(--surface2)', color: 'var(--text2)' }}>
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── All Users ── */}
      {tab === 'All Users' && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
            <input placeholder="Search name or email..." value={userFilter.search}
              onChange={e => setUserFilter(f => ({ ...f, search: e.target.value }))}
              style={{ flex: 1, minWidth: 200, maxWidth: 300 }} />
            <select value={userFilter.role} onChange={e => setUserFilter(f => ({ ...f, role: e.target.value }))}
              style={{ minWidth: 140 }}>
              <option value="">All Roles</option>
              <option value="customer">Customers</option>
              <option value="provider">Providers</option>
              <option value="admin">Admins</option>
            </select>
            <button className="btn-secondary" onClick={loadUsers}>🔍 Search</button>
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
                  {['User', 'Role', 'KYC Status', 'Joined', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text3)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u._id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>{u.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text3)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge ${u.role === 'admin' ? 'badge-purple' : u.role === 'provider' ? 'badge-urgent' : 'badge-blue'}`} style={{ fontSize: 11 }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {u.role === 'provider' ? (
                        <span className={`badge ${u.kyc?.status === 'approved' ? 'badge-green' : u.kyc?.status === 'pending' ? 'badge-yellow' : u.kyc?.status === 'rejected' ? 'badge-urgent' : ''}`} style={{ fontSize: 11 }}>
                          {u.kyc?.status || 'not_submitted'}
                        </span>
                      ) : <span style={{ color: 'var(--text3)', fontSize: 13 }}>—</span>}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text2)' }}>
                      {new Date(u.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: u.isActive ? 'var(--green)' : 'var(--text3)' }}>
                        {u.isActive ? '● Active' : '○ Disabled'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Link to={`/admin/users/${u._id}`}>
                          <button className="btn-ghost" style={{ padding: '6px 12px', fontSize: 12 }}>View</button>
                        </Link>
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => toggleUser(u._id)}
                            style={{
                              padding: '6px 12px', fontSize: 12, borderRadius: 6, border: 'none',
                              background: u.isActive ? 'rgba(255,92,43,0.1)' : 'rgba(34,197,94,0.1)',
                              color: u.isActive ? 'var(--accent)' : 'var(--green)', cursor: 'pointer',
                            }}
                          >{u.isActive ? 'Disable' : 'Enable'}</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>No users found</div>
            )}
          </div>
        </div>
      )}

      {/* ── KYC Queue ── */}
      {tab === 'KYC Queue' && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          {kycQueue.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>All caught up!</div>
              <div style={{ color: 'var(--text2)' }}>No KYC applications pending review.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {kycQueue.map(u => (
                <div key={u._id} className="card">
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    {/* User info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: '0 0 auto' }}>
                      <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: 'white', fontFamily: 'var(--font-display)' }}>
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>{u.name}</div>
                        <div style={{ fontSize: 13, color: 'var(--text2)' }}>{u.email} · {u.phone}</div>
                        <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
                          Submitted: {new Date(u.kyc.submittedAt).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>

                    {/* Doc info */}
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                        <span className="badge badge-blue" style={{ fontSize: 12 }}>
                          {u.kyc.docType === 'aadhaar' ? '🪪 Aadhaar' : '💳 PAN'}
                        </span>
                        <span style={{ fontFamily: 'monospace', fontSize: 14, background: 'var(--surface2)', padding: '3px 10px', borderRadius: 6, letterSpacing: '0.1em' }}>
                          {u.kyc.docType === 'aadhaar'
                            ? u.kyc.docNumber?.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3')
                            : u.kyc.docNumber}
                        </span>
                      </div>

                      {/* Document images */}
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {u.kyc.docFrontImage && (
                          <div>
                            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>Doc Front</div>
                            <a href={u.kyc.docFrontImage} target="_blank" rel="noopener noreferrer">
                              <img src={u.kyc.docFrontImage} alt="Doc Front" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer' }} />
                            </a>
                          </div>
                        )}
                        {u.kyc.docBackImage && (
                          <div>
                            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>Doc Back</div>
                            <a href={u.kyc.docBackImage} target="_blank" rel="noopener noreferrer">
                              <img src={u.kyc.docBackImage} alt="Doc Back" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer' }} />
                            </a>
                          </div>
                        )}
                        {u.kyc.selfieImage && (
                          <div>
                            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>Selfie with Doc</div>
                            <a href={u.kyc.selfieImage} target="_blank" rel="noopener noreferrer">
                              <img src={u.kyc.selfieImage} alt="Selfie" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '50%', border: '2px solid var(--border)', cursor: 'pointer' }} />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                      <button
                        onClick={() => reviewKYC(u._id, 'approve')}
                        style={{ padding: '10px 20px', borderRadius: 8, background: 'rgba(34,197,94,0.15)', color: 'var(--green)', border: '1px solid rgba(34,197,94,0.3)', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
                      >✅ Approve</button>
                      <button
                        onClick={() => reviewKYC(u._id, 'reject')}
                        style={{ padding: '10px 20px', borderRadius: 8, background: 'rgba(255,92,43,0.1)', color: 'var(--accent)', border: '1px solid rgba(255,92,43,0.25)', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
                      >❌ Reject</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Bookings ── */}
      {tab === 'Bookings' && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {bookings.map(b => (
              <div key={b._id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px' }}>
                <span style={{ fontSize: 28 }}>{b.service?.icon || '🔧'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{b.service?.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text2)' }}>
                    Customer: {b.user?.name} · Provider: {b.provider?.user?.name || 'Unassigned'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>{new Date(b.createdAt).toLocaleString('en-IN')}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 100, background: 'var(--surface2)', color: 'var(--text2)' }}>
                    {b.status?.replace('_', ' ')}
                  </span>
                  {b.isUrgent && <div style={{ marginTop: 4 }}><span className="badge badge-urgent" style={{ fontSize: 10 }}>⚡ Urgent</span></div>}
                </div>
              </div>
            ))}
            {bookings.length === 0 && (
              <div style={{ textAlign: 'center', padding: 60, color: 'var(--text3)' }}>No bookings yet</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
