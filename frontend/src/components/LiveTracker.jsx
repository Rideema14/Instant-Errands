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
            : 'white',
        border: `1px solid ${status === 'completed' ? 'rgba(34,197,94,0.3)' : status === 'en_route' ? 'rgba(255,92,43,0.3)' : 'var(--blink-border)'}`,
        borderRadius: '12px',
        padding: 20, marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div style={{ fontSize: 40 }}>{STATUS_ICONS[status]}</div>
        <div>
          <div style={{
            fontFamily: 'Poppins, sans-serif', fontWeight: 800,
            fontSize: 20, color: 'var(--blink-text)',
          }}>{STATUS_LABELS[status]}</div>
          <div style={{ fontSize: 14, color: 'var(--blink-text2)', marginTop: 4 }}>
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
                background: i <= currentStep ? 'var(--blink-green)' : '#f9fafb',
                border: `2px solid ${i <= currentStep ? 'var(--blink-green)' : 'var(--blink-border)'}`,
                fontSize: 14, transition: 'all 0.4s',
                animation: i === currentStep ? 'pulse-glow 2s infinite' : 'none',
              }}>
                {i < currentStep ? '✓' : STATUS_ICONS[step]}
              </div>
              {i < STATUS_STEPS.length - 2 && (
                <div style={{
                  flex: 1, height: 2,
                  background: i < currentStep ? 'var(--blink-green)' : 'var(--blink-border)',
                  transition: 'background 0.4s',
                }} />
              )}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', marginTop: 8 }}>
          {STATUS_STEPS.slice(0, -1).map((step, i) => (
            <div key={step} style={{ flex: 1, fontSize: 10, color: i <= currentStep ? 'var(--blink-green)' : 'var(--blink-text3)', textAlign: 'center' }}>
              {STATUS_LABELS[step].split(' ')[0]}
            </div>
          ))}
        </div>
      </div>

      {/* Provider Info */}
      {booking?.provider && (
        <div style={{
          background: 'white', border: '1px solid var(--blink-border)',
          borderRadius: '12px', padding: 16, marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'var(--blink-green)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 700, color: 'white',
            fontFamily: 'Poppins, sans-serif',
          }}>
            {booking.provider.user?.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{booking.provider.user?.name}</div>
            <div style={{ fontSize: 13, color: 'var(--blink-text2)' }}>
              ⭐ {booking.provider.rating?.toFixed(1)} · {booking.provider.completedJobs} jobs
            </div>
          </div>
          <a href={`tel:${booking.provider.user?.phone}`} style={{
            background: 'var(--blink-green)', color: 'white',
            padding: '10px 16px', borderRadius: 8, fontSize: 14,
            fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
          }}>📞 Call</a>
        </div>
      )}

      {/* OTP */}
      {booking?.otp && status !== 'completed' && (
        <div style={{
          background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)',
          borderRadius: '12px', padding: 16, marginBottom: 20, textAlign: 'center',
        }}>
          <div style={{ fontSize: 12, color: 'var(--blink-text2)', marginBottom: 6 }}>
            Share this OTP with provider to confirm arrival:
          </div>
          <div style={{
            fontFamily: 'Poppins, sans-serif', fontSize: 36, fontWeight: 800,
            color: 'var(--purple)', letterSpacing: '0.3em',
          }}>{booking.otp}</div>
        </div>
      )}

      {/* Timeline */}
      <div>
        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--blink-text2)', marginBottom: 12 }}>Activity Log</div>
        {[...updates].reverse().map((update, i) => (
          <div key={i} style={{
            display: 'flex', gap: 12, marginBottom: 12,
            opacity: i === 0 ? 1 : 0.6,
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: i === 0 ? 'var(--blink-green)' : 'var(--border2)',
              flexShrink: 0, marginTop: 5,
            }}/>
            <div>
              <div style={{ fontSize: 13, color: 'var(--blink-text)' }}>{update.message}</div>
              <div style={{ fontSize: 11, color: 'var(--blink-text3)', marginTop: 2 }}>
                {new Date(update.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
