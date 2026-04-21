import { useEffect, useState } from 'react';
import { useBookingTracking } from '../hooks/useSocket';

const STATUS_STEPS = ['pending', 'matched', 'accepted', 'en_route', 'arrived', 'in_progress', 'completed'];
const STATUS_LABELS = {
  pending: 'Finding Provider',
  matched: 'Provider Matched',
  accepted: 'Booking Confirmed',
  en_route: 'Provider En Route',
  arrived: 'Provider Arrived',
  in_progress: 'Work In Progress',
  completed: 'Completed',
};
const STATUS_ICONS = {
  pending: '🔍', matched: '🤝', accepted: '✅', en_route: '🏎️',
  arrived: '📍', in_progress: '🔧', completed: '🎉',
};

export default function LiveTracker({ booking }) {
  const [status, setStatus] = useState(booking?.status || 'pending');
  const [location, setLocation] = useState(null);
  const [updates, setUpdates] = useState(booking?.trackingUpdates || []);

  useBookingTracking(
    booking?._id,
    (loc) => setLocation(loc),
    ({ status: s, message }) => {
      setStatus(s);
      setUpdates(prev => [...prev, { status: s, message, timestamp: new Date() }]);
    }
  );

  const currentStep = STATUS_STEPS.indexOf(status);

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      {/* Status Banner */}
      <div style={{
        background: status === 'completed'
          ? 'rgba(34,197,94,0.12)'
          : status === 'en_route' || status === 'arrived'
            ? 'rgba(255,92,43,0.12)'
            : 'var(--surface)',
        border: `1px solid ${status === 'completed' ? 'rgba(34,197,94,0.3)' : status === 'en_route' ? 'rgba(255,92,43,0.3)' : 'var(--border)'}`,
        borderRadius: 'var(--radius)',
        padding: 20, marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div style={{ fontSize: 40 }}>{STATUS_ICONS[status]}</div>
        <div>
          <div style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: 20, color: 'var(--text)',
          }}>{STATUS_LABELS[status]}</div>
          <div style={{ fontSize: 14, color: 'var(--text2)', marginTop: 4 }}>
            {booking?.isUrgent ? '⚡ Urgent booking' : '📅 Scheduled booking'}
            {booking?.estimatedArrival && status !== 'completed' && (
              <span style={{ marginLeft: 12 }}>
                ETA: {new Date(booking.estimatedArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {STATUS_STEPS.slice(0, -1).map((step, i) => (
            <div key={step} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: i <= currentStep ? 'var(--accent)' : 'var(--surface2)',
                border: `2px solid ${i <= currentStep ? 'var(--accent)' : 'var(--border)'}`,
                fontSize: 14, transition: 'all 0.4s',
                animation: i === currentStep ? 'pulse-glow 2s infinite' : 'none',
              }}>
                {i < currentStep ? '✓' : STATUS_ICONS[step]}
              </div>
              {i < STATUS_STEPS.length - 2 && (
                <div style={{
                  flex: 1, height: 2,
                  background: i < currentStep ? 'var(--accent)' : 'var(--border)',
                  transition: 'background 0.4s',
                }} />
              )}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', marginTop: 8 }}>
          {STATUS_STEPS.slice(0, -1).map((step, i) => (
            <div key={step} style={{ flex: 1, fontSize: 10, color: i <= currentStep ? 'var(--accent)' : 'var(--text3)', textAlign: 'center' }}>
              {STATUS_LABELS[step].split(' ')[0]}
            </div>
          ))}
        </div>
      </div>

      {/* Provider Info */}
      {booking?.provider && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: 16, marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 700, color: 'white',
            fontFamily: 'var(--font-display)',
          }}>
            {booking.provider.user?.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{booking.provider.user?.name}</div>
            <div style={{ fontSize: 13, color: 'var(--text2)' }}>
              ⭐ {booking.provider.rating?.toFixed(1)} · {booking.provider.completedJobs} jobs
            </div>
          </div>
          <a href={`tel:${booking.provider.user?.phone}`} style={{
            background: 'var(--green)', color: 'white',
            padding: '10px 16px', borderRadius: 8, fontSize: 14,
            fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
          }}>📞 Call</a>
        </div>
      )}

      {/* OTP */}
      {booking?.otp && status !== 'completed' && (
        <div style={{
          background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)',
          borderRadius: 'var(--radius)', padding: 16, marginBottom: 20, textAlign: 'center',
        }}>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>
            Share this OTP with provider to confirm arrival:
          </div>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800,
            color: 'var(--purple)', letterSpacing: '0.3em',
          }}>{booking.otp}</div>
        </div>
      )}

      {/* Timeline */}
      <div>
        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text2)', marginBottom: 12 }}>Activity Log</div>
        {[...updates].reverse().map((update, i) => (
          <div key={i} style={{
            display: 'flex', gap: 12, marginBottom: 12,
            opacity: i === 0 ? 1 : 0.6,
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: i === 0 ? 'var(--accent)' : 'var(--border2)',
              flexShrink: 0, marginTop: 5,
            }}/>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text)' }}>{update.message}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                {new Date(update.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
