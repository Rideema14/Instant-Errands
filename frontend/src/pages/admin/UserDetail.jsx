import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const KYC_BADGE = {
  not_submitted: { label: 'Not Submitted', cls: '' },
  pending:       { label: 'Pending Review', cls: 'badge-yellow' },
  approved:      { label: 'Approved ✓',     cls: 'badge-green' },
  rejected:      { label: 'Rejected',        cls: 'badge-urgent' },
};

export default function AdminUserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [kycAction, setKycAction] = useState('');
  const [rejReason, setRejReason] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/admin/users/${id}`).then(r => setData(r.data)).finally(() => setLoading(false));
  }, [id]);

  const reviewKYC = async (action) => {
    if (action === 'reject' && !rejReason.trim()) {
      alert('Please enter a rejection reason'); return;
    }
    setSaving(true);
    try {
      await api.put(`/admin/kyc/${id}/review`, { action, rejectionReason: rejReason });
      const r = await api.get(`/admin/users/${id}`);
      setData(r.data);
      setKycAction('');
    } catch (e) {
      alert(e.response?.data?.message || 'Action failed');
    } finally { setSaving(false); }
  };

  const toggleActive = async () => {
    await api.put(`/admin/users/${id}/toggle-active`);
    const r = await api.get(`/admin/users/${id}`);
    setData(r.data);
  };

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'60vh' }}>
      <div className="spinner" style={{ width:36, height:36 }} />
    </div>
  );
  if (!data) return <div className="page">User not found.</div>;

  const { user, providerProfile, bookings } = data;
  const kyc = user.kyc || {};
  const kycBadge = KYC_BADGE[kyc.status] || KYC_BADGE.not_submitted;

  return (
    <div className="page" style={{ maxWidth: 860 }}>
      <button onClick={() => navigate('/admin')} className="btn-ghost" style={{ marginBottom: 24 }}>
        ← Back to Dashboard
      </button>

      {/* ── User Header ── */}
      <div className="card" style={{ marginBottom: 20, display:'flex', gap:20, alignItems:'center', flexWrap:'wrap' }}>
        <div style={{
          width:72, height:72, borderRadius:'50%',
          background: user.role === 'admin' ? 'var(--purple)' : user.role === 'provider' ? 'var(--accent)' : 'var(--blue)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:30, fontWeight:800, color:'white', fontFamily:'var(--font-display)', flexShrink:0,
        }}>{user.name?.[0]?.toUpperCase()}</div>

        <div style={{ flex:1, minWidth:200 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', marginBottom:6 }}>
            <h1 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:22 }}>{user.name}</h1>
            <span className={`badge ${user.role==='admin'?'badge-purple':user.role==='provider'?'badge-urgent':'badge-blue'}`}>
              {user.role}
            </span>
            <span style={{ fontSize:12, fontWeight:600, color: user.isActive ? 'var(--green)':'var(--text3)' }}>
              {user.isActive ? '● Active' : '○ Disabled'}
            </span>
          </div>
          <div style={{ fontSize:14, color:'var(--text2)' }}>{user.email}</div>
          <div style={{ fontSize:14, color:'var(--text2)' }}>{user.phone || 'No phone'}</div>
          <div style={{ fontSize:12, color:'var(--text3)', marginTop:4 }}>
            Joined: {new Date(user.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}
          </div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {user.role !== 'admin' && (
            <button
              onClick={toggleActive}
              style={{
                padding:'10px 20px', borderRadius:8, fontWeight:700, cursor:'pointer', fontSize:14,
                background: user.isActive ? 'rgba(255,92,43,0.12)' : 'rgba(34,197,94,0.12)',
                color: user.isActive ? 'var(--accent)' : 'var(--green)',
                border: `1px solid ${user.isActive ? 'rgba(255,92,43,0.3)' : 'rgba(34,197,94,0.3)'}`,
              }}
            >{user.isActive ? '🔒 Disable Account' : '🔓 Enable Account'}</button>
          )}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
        {/* Address */}
        <div className="card">
          <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:15, marginBottom:12 }}>📍 Address</div>
          {user.address?.city ? (
            <div style={{ fontSize:14, color:'var(--text2)', lineHeight:1.8 }}>
              <div>{user.address.street}</div>
              <div>{user.address.city}{user.address.pincode ? ` — ${user.address.pincode}` : ''}</div>
              <div>{user.address.state}</div>
            </div>
          ) : <div style={{ color:'var(--text3)', fontSize:14 }}>No address saved</div>}
        </div>

        {/* Provider stats */}
        {providerProfile && (
          <div className="card">
            <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:15, marginBottom:12 }}>🔧 Provider Stats</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[
                { l:'Rating', v: providerProfile.rating ? `${providerProfile.rating.toFixed(1)} ★` : 'No ratings' },
                { l:'Jobs Done', v: providerProfile.completedJobs },
                { l:'Reviews', v: providerProfile.totalReviews },
                { l:'Rate', v: `₹${providerProfile.pricePerHour}/hr` },
                { l:'Verified', v: providerProfile.isVerified ? '✅ Yes' : '❌ No' },
                { l:'Available', v: providerProfile.isAvailable ? '● Online' : '○ Offline' },
              ].map(({ l, v }) => (
                <div key={l} style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
                  <span style={{ color:'var(--text3)' }}>{l}</span>
                  <span style={{ fontWeight:600, color:'var(--text)' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── KYC Section ── */}
      {user.role === 'provider' && (
        <div className="card" style={{ marginBottom:20 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:16 }}>🪪 KYC Verification</div>
            {kyc.status && <span className={`badge ${kycBadge.cls}`} style={{ fontSize:12 }}>{kycBadge.label}</span>}
          </div>

          {kyc.status === 'not_submitted' ? (
            <div style={{ color:'var(--text3)', fontSize:14 }}>Provider has not submitted KYC documents yet.</div>
          ) : (
            <>
              {/* Doc info */}
              <div style={{ display:'flex', gap:16, marginBottom:20, flexWrap:'wrap' }}>
                <div>
                  <div style={{ fontSize:12, color:'var(--text3)', marginBottom:4 }}>Document Type</div>
                  <span className="badge badge-blue" style={{ fontSize:13 }}>
                    {kyc.docType === 'aadhaar' ? '🪪 Aadhaar Card' : '💳 PAN Card'}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize:12, color:'var(--text3)', marginBottom:4 }}>Document Number</div>
                  <span style={{ fontFamily:'monospace', fontSize:16, background:'var(--surface2)', padding:'4px 12px', borderRadius:6, letterSpacing:'0.12em' }}>
                    {kyc.docType === 'aadhaar'
                      ? kyc.docNumber?.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3')
                      : kyc.docNumber}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize:12, color:'var(--text3)', marginBottom:4 }}>Submitted</div>
                  <div style={{ fontSize:13, color:'var(--text2)' }}>
                    {kyc.submittedAt ? new Date(kyc.submittedAt).toLocaleString('en-IN') : '—'}
                  </div>
                </div>
                {kyc.reviewedAt && (
                  <div>
                    <div style={{ fontSize:12, color:'var(--text3)', marginBottom:4 }}>Reviewed</div>
                    <div style={{ fontSize:13, color:'var(--text2)' }}>{new Date(kyc.reviewedAt).toLocaleString('en-IN')}</div>
                  </div>
                )}
              </div>

              {/* KYC Images */}
              <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:20 }}>
                {[
                  { src: kyc.docFrontImage, label: kyc.docType === 'aadhaar' ? 'Aadhaar Front' : 'PAN Card', shape:'rect' },
                  { src: kyc.docBackImage,  label: 'Aadhaar Back', shape:'rect' },
                  { src: kyc.selfieImage,   label: 'Selfie with Doc', shape:'circle' },
                ].filter(i => i.src).map(({ src, label, shape }) => (
                  <div key={label}>
                    <div style={{ fontSize:12, color:'var(--text3)', marginBottom:6, fontWeight:600 }}>{label}</div>
                    <a href={src} target="_blank" rel="noopener noreferrer">
                      <img
                        src={src} alt={label}
                        style={{
                          width: shape === 'circle' ? 100 : 160,
                          height: shape === 'circle' ? 100 : 100,
                          objectFit:'cover',
                          borderRadius: shape === 'circle' ? '50%' : 10,
                          border:'2px solid var(--border)',
                          cursor:'pointer', transition:'border 0.2s',
                        }}
                        onMouseEnter={e => e.target.style.border = '2px solid var(--accent)'}
                        onMouseLeave={e => e.target.style.border = '2px solid var(--border)'}
                      />
                    </a>
                  </div>
                ))}
              </div>

              {kyc.status === 'rejected' && kyc.rejectionReason && (
                <div style={{ padding:'12px 16px', background:'rgba(255,92,43,0.08)', border:'1px solid rgba(255,92,43,0.25)', borderRadius:8, marginBottom:16, fontSize:14, color:'var(--text2)' }}>
                  <strong style={{ color:'var(--accent)' }}>Rejection Reason:</strong> {kyc.rejectionReason}
                </div>
              )}

              {/* Admin review actions */}
              {kyc.status === 'pending' && (
                <div style={{ borderTop:'1px solid var(--border)', paddingTop:20 }}>
                  <div style={{ fontWeight:700, marginBottom:14, fontSize:15 }}>Review Decision</div>
                  {!kycAction ? (
                    <div style={{ display:'flex', gap:10 }}>
                      <button
                        onClick={() => setKycAction('approve')}
                        style={{ padding:'12px 24px', borderRadius:8, background:'rgba(34,197,94,0.15)', color:'var(--green)', border:'1px solid rgba(34,197,94,0.3)', fontWeight:700, cursor:'pointer', fontSize:14 }}
                      >✅ Approve KYC</button>
                      <button
                        onClick={() => setKycAction('reject')}
                        style={{ padding:'12px 24px', borderRadius:8, background:'rgba(255,92,43,0.1)', color:'var(--accent)', border:'1px solid rgba(255,92,43,0.25)', fontWeight:700, cursor:'pointer', fontSize:14 }}
                      >❌ Reject KYC</button>
                    </div>
                  ) : (
                    <div style={{ animation:'fadeIn 0.2s ease' }}>
                      {kycAction === 'approve' ? (
                        <div>
                          <div style={{ fontSize:14, color:'var(--text2)', marginBottom:14 }}>
                            Confirm approval? This will mark the provider as verified and allow them to accept jobs.
                          </div>
                          <div style={{ display:'flex', gap:10 }}>
                            <button onClick={() => reviewKYC('approve')} disabled={saving}
                              style={{ padding:'12px 24px', borderRadius:8, background:'var(--green)', color:'white', border:'none', fontWeight:700, cursor:'pointer', fontSize:14 }}>
                              {saving ? 'Approving...' : '✅ Confirm Approval'}
                            </button>
                            <button onClick={() => setKycAction('')} className="btn-ghost">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label style={{ fontSize:13, color:'var(--text2)', display:'block', marginBottom:8 }}>
                            Rejection Reason <span style={{ color:'var(--accent)' }}>*</span>
                          </label>
                          <textarea rows={3} placeholder="e.g. Document image is blurry, name mismatch, invalid Aadhaar number..."
                            value={rejReason} onChange={e => setRejReason(e.target.value)}
                            style={{ marginBottom:12, resize:'none' }} />
                          <div style={{ display:'flex', gap:10 }}>
                            <button onClick={() => reviewKYC('reject')} disabled={saving || !rejReason.trim()}
                              style={{ padding:'12px 24px', borderRadius:8, background:'var(--accent)', color:'white', border:'none', fontWeight:700, cursor:'pointer', fontSize:14 }}>
                              {saving ? 'Rejecting...' : '❌ Confirm Rejection'}
                            </button>
                            <button onClick={() => setKycAction('')} className="btn-ghost">Cancel</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Booking History ── */}
      <div className="card">
        <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:16, marginBottom:16 }}>
          📋 Booking History ({bookings?.length || 0})
        </div>
        {!bookings?.length ? (
          <div style={{ color:'var(--text3)', fontSize:14 }}>No bookings found for this user.</div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {bookings.map(b => (
              <div key={b._id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px', background:'var(--surface2)', borderRadius:8 }}>
                <span style={{ fontSize:24 }}>{b.service?.icon || '🔧'}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:600 }}>{b.service?.name}</div>
                  <div style={{ fontSize:12, color:'var(--text3)' }}>
                    {new Date(b.createdAt).toLocaleDateString('en-IN')} · {b.address?.city}
                  </div>
                </div>
                <span style={{ fontSize:12, padding:'3px 10px', borderRadius:100, background:'var(--surface)', color:'var(--text2)', fontWeight:600 }}>
                  {b.status?.replace('_',' ')}
                </span>
                {b.isUrgent && <span className="badge badge-urgent" style={{ fontSize:10 }}>⚡</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
