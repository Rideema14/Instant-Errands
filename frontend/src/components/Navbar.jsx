import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); setMenuOpen(false); };

  const publicLinks = [
    { path: '/services', label: 'Services' },
    { path: '/providers', label: 'Providers' },
  ];
  const roleLinks = {
    customer: [{ path: '/bookings', label: 'My Bookings' }],
    provider: [{ path: '/provider/dashboard', label: 'Dashboard' }, { path: '/provider/profile', label: 'My Profile' }],
    admin: [{ path: '/admin', label: 'Admin Panel' }],
  };
  const userLinks = user ? (roleLinks[user.role] || []) : [];

  const kycStatus = user?.kyc?.status;
  const showKycWarning = user?.role === 'provider' && kycStatus !== 'approved';

  return (
    <nav className="blink-nav">
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--blink-green)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 900,
          }}>⚡</div>
          <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 20, color: 'var(--blink-text)' }}>
            Quick<span style={{ color: 'var(--blink-green)' }}>Serve</span>
          </span>
        </Link>

        {/* Location bar — Blinkit-style */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: '#f3f4f6', borderRadius: 10, padding: '8px 14px',
          cursor: 'pointer', flex: '0 1 240px',
        }}>
          <span style={{ fontSize: 16 }}>📍</span>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--blink-green)', lineHeight: 1.2 }}>Deliver to</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--blink-text)', lineHeight: 1.2 }}>
              {user?.address?.city || 'Indore'} <span style={{ color: '#9ca3af', fontWeight: 600 }}>▾</span>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div style={{
          flex: 1, maxWidth: 360, position: 'relative',
        }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: '#9ca3af' }}>🔍</span>
          <input
            placeholder="Search for services..."
            style={{
              paddingLeft: 42, borderRadius: 12, height: 40, fontSize: 14,
              border: '1.5px solid #e5e7eb', background: '#f9fafb',
            }}
            onFocus={() => navigate('/services')}
            readOnly
          />
        </div>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
          {[...publicLinks, ...userLinks].map(l => (
            <Link key={l.path} to={l.path}>
              <div className={`nav-link ${isActive(l.path) ? 'active' : ''}`}>{l.label}</div>
            </Link>
          ))}
        </div>

        {/* KYC warning */}
        {showKycWarning && (
          <Link to="/provider/kyc" style={{
            fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 100, flexShrink: 0,
            background: '#fff3e0', color: 'var(--blink-orange)', border: '1px solid #fed7aa',
          }}>
            {kycStatus === 'pending' ? '⏳ KYC Pending' : kycStatus === 'rejected' ? '⚠️ KYC Rejected' : '📋 Submit KYC'}
          </Link>
        )}

        {/* User section */}
        {user ? (
          <div style={{ position: 'relative', flexShrink: 0 }} ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: menuOpen ? '#f0fdf4' : '#f9fafb',
                border: `2px solid ${menuOpen ? 'var(--blink-green)' : '#e5e7eb'}`,
                borderRadius: 100, padding: '5px 14px 5px 5px',
                cursor: 'pointer', color: 'var(--blink-text)', transition: 'all 0.15s',
              }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: 'var(--blink-green)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 800, color: 'white', overflow: 'hidden',
              }}>
                {user.avatar
                  ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : user.name?.[0]?.toUpperCase()}
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, maxWidth: 70, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name?.split(' ')[0]}
              </span>
              <span style={{ fontSize: 10, color: '#9ca3af' }}>▼</span>
            </button>

            {menuOpen && (
              <div className="animate-scale-in" style={{
                position: 'absolute', right: 0, top: 'calc(100% + 10px)',
                background: 'white', border: '1.5px solid #f0f0f0',
                borderRadius: 16, padding: 8, minWidth: 210,
                boxShadow: '0 12px 48px rgba(0,0,0,0.12)', zIndex: 200,
              }}>
                <div style={{ padding: '12px 14px 14px', borderBottom: '1px solid #f0f0f0', marginBottom: 6 }}>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Signed in as</div>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>{user.name}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>{user.email}</div>
                  <div style={{ marginTop: 8 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 100,
                      background: '#e8f5e9', color: 'var(--blink-green)', textTransform: 'uppercase',
                    }}>{user.role}</span>
                  </div>
                </div>

                {user.role === 'customer' && (<>
                  <MenuItem to="/bookings" icon="📋" label="My Bookings" onClick={() => setMenuOpen(false)} />
                  <MenuItem to="/profile" icon="👤" label="Account" onClick={() => setMenuOpen(false)} />
                </>)}
                {user.role === 'provider' && (<>
                  <MenuItem to="/provider/dashboard" icon="📊" label="Dashboard" onClick={() => setMenuOpen(false)} />
                  <MenuItem to="/provider/profile" icon="🔧" label="Provider Profile" onClick={() => setMenuOpen(false)} />
                  <MenuItem to="/provider/kyc" icon="🪪" label="KYC Verification" onClick={() => setMenuOpen(false)} />
                  <MenuItem to="/profile" icon="👤" label="Account" onClick={() => setMenuOpen(false)} />
                </>)}
                {user.role === 'admin' && (<>
                  <MenuItem to="/admin" icon="🛡️" label="Admin Dashboard" onClick={() => setMenuOpen(false)} />
                  <MenuItem to="/profile" icon="👤" label="Account" onClick={() => setMenuOpen(false)} />
                </>)}

                <div style={{ borderTop: '1px solid #f0f0f0', marginTop: 6, paddingTop: 6 }}>
                  <button onClick={handleLogout} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    width: '100%', textAlign: 'left', padding: '10px 14px',
                    fontSize: 14, fontWeight: 700,
                    background: 'transparent', color: '#ef4444',
                    borderRadius: 10, border: 'none', cursor: 'pointer', transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >🚪 Sign Out</button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <Link to="/login"><button className="btn-ghost">Login</button></Link>
            <Link to="/register"><button className="btn-primary" style={{ padding: '10px 20px', fontSize: 14 }}>Sign Up →</button></Link>
          </div>
        )}
      </div>
    </nav>
  );
}

function MenuItem({ to, icon, label, onClick }) {
  return (
    <Link to={to} onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 14px', fontSize: 14, fontWeight: 600, color: '#374151',
      borderRadius: 10, transition: 'all 0.15s',
    }}
      onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.color = 'var(--blink-text)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#374151'; }}
    >
      <span style={{ width: 20, textAlign: 'center' }}>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
