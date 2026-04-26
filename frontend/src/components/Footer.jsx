import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{
      background: '#111827',
      color: '#e5e7eb',
      padding: '56px 20px 28px',
      marginTop: 0,
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 40, marginBottom: 48 }}>

          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10, background: 'var(--blink-green)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
              }}>⚡</div>
              <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 20, color: 'white' }}>
                Quick<span style={{ color: '#4ade80' }}>Serve</span>
              </span>
            </div>
            <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7, maxWidth: 200 }}>
              Urgent home services delivered in 30–60 minutes. Trusted by 50,000+ households.
            </p>
            {/* App badges */}
            <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
              {['📱 App Store', '🤖 Play Store'].map(label => (
                <div key={label} style={{
                  background: '#1f2937', border: '1px solid #374151',
                  borderRadius: 8, padding: '6px 12px', fontSize: 11, fontWeight: 700, color: '#d1d5db', cursor: 'pointer',
                }}>{label}</div>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 16, color: '#f9fafb', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Services
            </div>
            {['AC Repair', 'Plumbing', 'Electrical', 'Cleaning', 'Grooming', 'Laundry', 'Carpentry', 'Pest Control'].map(s => (
              <Link key={s} to="/services" style={{ display: 'block', fontSize: 13, color: '#6b7280', marginBottom: 8, transition: 'color 0.15s' }}
                onMouseEnter={e => e.target.style.color = '#4ade80'}
                onMouseLeave={e => e.target.style.color = '#6b7280'}
              >{s}</Link>
            ))}
          </div>

          {/* Company */}
          <div>
            <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 16, color: '#f9fafb', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Company
            </div>
            {[
              { label: 'About Us', path: '/' },
              { label: 'Become a Provider', path: '/register' },
              { label: 'Browse Providers', path: '/providers' },
              { label: 'My Bookings', path: '/bookings' },
              { label: 'Admin Dashboard', path: '/admin' },
            ].map(({ label, path }) => (
              <Link key={label} to={path} style={{ display: 'block', fontSize: 13, color: '#6b7280', marginBottom: 8, transition: 'color 0.15s' }}
                onMouseEnter={e => e.target.style.color = '#4ade80'}
                onMouseLeave={e => e.target.style.color = '#6b7280'}
              >{label}</Link>
            ))}
          </div>

          {/* Contact */}
          <div>
            <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 16, color: '#f9fafb', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Support
            </div>
            {[
              { icon: '📧', text: 'support@quickserve.in' },
              { icon: '📞', text: '1800-123-4567 (Toll Free)' },
              { icon: '🕐', text: '24/7 Customer Support' },
              { icon: '📍', text: 'Serving 20+ cities in India' },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: 'flex', gap: 8, marginBottom: 12, fontSize: 13, color: '#6b7280' }}>
                <span>{icon}</span><span>{text}</span>
              </div>
            ))}

            {/* Social */}
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              {['Twitter', 'LinkedIn', 'Instagram'].map(s => (
                <div key={s} style={{
                  width: 32, height: 32, borderRadius: 8, background: '#1f2937',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, cursor: 'pointer', border: '1px solid #374151',
                }}>
                  {s === 'Twitter' ? '𝕏' : s === 'LinkedIn' ? 'in' : '📷'}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom strip */}
        <div style={{
          borderTop: '1px solid #1f2937', paddingTop: 24,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
        }}>
          <div style={{ fontSize: 13, color: '#4b5563' }}>
            © 2025 QuickServe Technologies Pvt. Ltd. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Privacy Policy', 'Terms of Service', 'Refund Policy'].map(t => (
              <span key={t} style={{ fontSize: 13, color: '#4b5563', cursor: 'pointer', transition: 'color 0.15s' }}
                onMouseEnter={e => e.target.style.color = '#4ade80'}
                onMouseLeave={e => e.target.style.color = '#4b5563'}
              >{t}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
