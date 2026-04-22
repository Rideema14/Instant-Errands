import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_COLOR = { admin: 'var(--purple)', provider: 'var(--accent)', customer: 'var(--blue)' };
const ROLE_ICON  = { admin: '🛡️', provider: '🔧', customer: '🛒' };

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef();

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); setMenuOpen(false); setMobileOpen(false); };

  // Build nav links based on role
  const publicLinks = [
    { path: '/services', label: 'Services' },
    { path: '/providers', label: 'Providers' },
  ];

  const roleLinks = {
    customer: [{ path: '/bookings', label: 'My Bookings' }],
    provider: [
      { path: '/provider/dashboard', label: 'Dashboard' },
      { path: '/provider/profile', label: 'My Profile' },
    ],
    admin: [{ path: '/admin', label: '🛡️ Admin Panel' }],
  };

  const userLinks = user ? (roleLinks[user.role] || []) : [];

  const NavLink = ({ path, label, onClick }) => (
    <Link to={path} onClick={onClick} style={{
      padding: '8px 14px', borderRadius: 8, fontSize: 14, fontWeight: 500,
      color: isActive(path) ? 'var(--accent)' : 'var(--text2)',
      background: isActive(path) ? 'rgba(255,92,43,0.1)' : 'transparent',
      transition: 'all 0.2s', whiteSpace: 'nowrap',
    }}>{label}</Link>
  );

  // KYC badge for providers
  const kycStatus = user?.kyc?.status;
  const showKycWarning = user?.role === 'provider' && kycStatus !== 'approved';
  const kycLabel = { not_submitted: '📋 Submit KYC', pending: '⏳ KYC Pending', rejected: '⚠️ KYC Rejected' };

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(10,10,15,0.95)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚡</div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--text)' }}>
            Quick<span style={{ color: 'var(--accent)' }}>Serve</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, justifyContent: 'center', flexWrap: 'nowrap', overflow: 'hidden' }}>
          {publicLinks.map(l => <NavLink key={l.path} {...l} />)}
          {userLinks.map(l => <NavLink key={l.path} {...l} />)}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

          {/* KYC warning pill */}
          {showKycWarning && (
            <Link to="/provider/kyc" style={{
              fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 100,
              background: kycStatus === 'rejected' ? 'rgba(255,92,43,0.15)' : 'rgba(245,158,11,0.12)',
              color: kycStatus === 'rejected' ? 'var(--accent)' : 'var(--yellow)',
              border: `1px solid ${kycStatus === 'rejected' ? 'rgba(255,92,43,0.3)' : 'rgba(245,158,11,0.3)'}`,
              whiteSpace: 'nowrap',
            }}>
              {kycLabel[kycStatus] || '📋 KYC'}
            </Link>
          )}

          {user ? (
            <div style={{ position: 'relative' }} ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'var(--surface)', border: `1px solid ${menuOpen ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 100, padding: '5px 14px 5px 5px',
                  cursor: 'pointer', color: 'var(--text)', transition: 'all 0.2s',
                }}>
                {/* Avatar */}
                <div style={{
                  width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                  background: ROLE_COLOR[user.role] || 'var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 800, color: 'white',
                  overflow: 'hidden',
                }}>
                  {user.avatar
                    ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : user.name?.[0]?.toUpperCase()}
                </div>
                <span style={{ fontSize: 14, fontWeight: 500, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name?.split(' ')[0]}
                </span>
                <span style={{ fontSize: 10, color: 'var(--text3)', transform: menuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
              </button>

              {menuOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)', padding: 8, minWidth: 200,
                  boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
                  animation: 'fadeIn 0.15s ease', zIndex: 200,
                }}>
                  {/* Role badge */}
                  <div style={{ padding: '10px 14px 12px', borderBottom: '1px solid var(--border)', marginBottom: 6 }}>
                    <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>Signed in as</div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{user.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>{user.email}</div>
                    <div style={{ marginTop: 6 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100,
                        background: `${ROLE_COLOR[user.role]}20`,
                        color: ROLE_COLOR[user.role],
                        border: `1px solid ${ROLE_COLOR[user.role]}40`,
                      }}>
                        {ROLE_ICON[user.role]} {user.role.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Menu items per role */}
                  {user.role === 'customer' && (
                    <>
                      <MenuItem to="/bookings" icon="📋" label="My Bookings" onClick={() => setMenuOpen(false)} />
                      <MenuItem to="/profile" icon="👤" label="Account Settings" onClick={() => setMenuOpen(false)} />
                    </>
                  )}
                  {user.role === 'provider' && (
                    <>
                      <MenuItem to="/provider/dashboard" icon="📊" label="Dashboard" onClick={() => setMenuOpen(false)} />
                      <MenuItem to="/provider/profile" icon="🔧" label="Provider Profile" onClick={() => setMenuOpen(false)} />
                      <MenuItem to="/provider/kyc" icon="🪪" label="KYC Verification" onClick={() => setMenuOpen(false)} />
                      <MenuItem to="/profile" icon="👤" label="Account Settings" onClick={() => setMenuOpen(false)} />
                    </>
                  )}
                  {user.role === 'admin' && (
                    <>
                      <MenuItem to="/admin" icon="🛡️" label="Admin Dashboard" onClick={() => setMenuOpen(false)} />
                      <MenuItem to="/profile" icon="👤" label="Account Settings" onClick={() => setMenuOpen(false)} />
                    </>
                  )}

                  <div style={{ borderTop: '1px solid var(--border)', marginTop: 6, paddingTop: 6 }}>
                    <button onClick={handleLogout} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      width: '100%', textAlign: 'left', padding: '10px 14px',
                      fontSize: 14, background: 'transparent', color: 'var(--accent)',
                      borderRadius: 8, border: 'none', cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,92,43,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      🚪 <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to="/login"><button className="btn-ghost">Login</button></Link>
              <Link to="/register"><button className="btn-primary" style={{ padding: '10px 20px', fontSize: 14 }}>Sign Up</button></Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

function MenuItem({ to, icon, label, onClick }) {
  return (
    <Link to={to} onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 14px', fontSize: 14, color: 'var(--text2)',
      borderRadius: 8, transition: 'all 0.15s',
    }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.color = 'var(--text)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text2)'; }}
    >
      <span style={{ width: 20, textAlign: 'center' }}>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
