import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      background: 'var(--bg2)',
      marginTop: 80,
      padding: '48px 20px 32px',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 40, marginBottom: 40 }}>

          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16,
              }}>⚡</div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18 }}>
                Quick<span style={{ color: 'var(--accent)' }}>Serve</span>
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.7, maxWidth: 200 }}>
              Urgent home services delivered in 30–60 minutes. Trusted by 50,000+ urban households.
            </p>
          </div>

          {/* Services */}
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, marginBottom: 14, color: 'var(--text)' }}>
              Services
            </div>
            {['AC Repair', 'Plumbing', 'Electrical', 'Cleaning', 'Grooming', 'Laundry'].map(s => (
              <Link key={s} to="/services" style={{ display: 'block', fontSize: 13, color: 'var(--text3)', marginBottom: 8, transition: 'color 0.15s' }}
                onMouseEnter={e => e.target.style.color = 'var(--text)'}
                onMouseLeave={e => e.target.style.color = 'var(--text3)'}
              >{s}</Link>
            ))}
          </div>

          {/* Company */}
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, marginBottom: 14, color: 'var(--text)' }}>
              Company
            </div>
            {[
              { label: 'About Us', path: '/' },
              { label: 'Become a Provider', path: '/register' },
              { label: 'Providers', path: '/providers' },
              { label: 'My Bookings', path: '/bookings' },
            ].map(({ label, path }) => (
              <Link key={label} to={path} style={{ display: 'block', fontSize: 13, color: 'var(--text3)', marginBottom: 8, transition: 'color 0.15s' }}
                onMouseEnter={e => e.target.style.color = 'var(--text)'}
                onMouseLeave={e => e.target.style.color = 'var(--text3)'}
              >{label}</Link>
            ))}
          </div>

          {/* Contact */}
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, marginBottom: 14, color: 'var(--text)' }}>
              Contact
            </div>
            {[
              { icon: '📧', text: 'support@quickserve.in' },
              { icon: '📞', text: '1800-123-4567 (Toll Free)' },
              { icon: '🕐', text: '24/7 Customer Support' },
              { icon: '📍', text: 'Serving 20+ cities in India' },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: 'flex', gap: 8, marginBottom: 10, fontSize: 13, color: 'var(--text3)' }}>
                <span>{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          borderTop: '1px solid var(--border)', paddingTop: 24,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
        }}>
          <div style={{ fontSize: 13, color: 'var(--text3)' }}>
            © 2025 QuickServe. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Privacy Policy', 'Terms of Service', 'Refund Policy'].map(t => (
              <span key={t} style={{ fontSize: 13, color: 'var(--text3)', cursor: 'pointer' }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
