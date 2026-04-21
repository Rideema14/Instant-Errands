import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(10,10,15,0.92)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        padding: '0 20px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>⚡</div>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800, fontSize: 20,
            color: 'var(--text)',
          }}>Quick<span style={{ color: 'var(--accent)' }}>Serve</span></span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {[
            { path: '/services', label: 'Services' },
            { path: '/providers', label: 'Providers' },
          ].map(({ path, label }) => (
            <Link key={path} to={path} style={{
              padding: '8px 16px',
              borderRadius: 8, fontSize: 14,
              fontWeight: 500,
              color: isActive(path) ? 'var(--accent)' : 'var(--text2)',
              background: isActive(path) ? 'rgba(255,92,43,0.1)' : 'transparent',
              transition: 'all 0.2s',
            }}>{label}</Link>
          ))}

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8 }}>
              <Link to="/bookings" style={{
                padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 500,
                color: isActive('/bookings') ? 'var(--accent)' : 'var(--text2)',
                background: isActive('/bookings') ? 'rgba(255,92,43,0.1)' : 'transparent',
              }}>My Bookings</Link>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 100, padding: '6px 14px 6px 6px',
                    cursor: 'pointer', color: 'var(--text)',
                  }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'var(--accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: 'white',
                  }}>{user.name?.[0]?.toUpperCase()}</div>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{user.name?.split(' ')[0]}</span>
                </button>
                {menuOpen && (
                  <div style={{
                    position: 'absolute', right: 0, top: '110%',
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)', padding: 8, minWidth: 160,
                    boxShadow: 'var(--shadow)',
                    animation: 'fadeIn 0.15s ease',
                  }}>
                    <Link to="/profile" onClick={() => setMenuOpen(false)} style={{
                      display: 'block', padding: '10px 14px', fontSize: 14,
                      color: 'var(--text2)', borderRadius: 6,
                      transition: 'all 0.15s',
                    }}
                      onMouseEnter={e => e.target.style.background = 'var(--surface2)'}
                      onMouseLeave={e => e.target.style.background = 'transparent'}>
                      👤 Profile
                    </Link>
                    <button onClick={handleLogout} style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '10px 14px', fontSize: 14, background: 'transparent',
                      color: 'var(--accent)', borderRadius: 6, border: 'none',
                      cursor: 'pointer',
                    }}>🚪 Logout</button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8, marginLeft: 8 }}>
              <Link to="/login">
                <button className="btn-ghost">Login</button>
              </Link>
              <Link to="/register">
                <button className="btn-primary" style={{ padding: '10px 20px', fontSize: 14 }}>
                  Sign Up
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
