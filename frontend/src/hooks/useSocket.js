import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

let socket = null;

export function useSocket() {
  if (!socket) {
    socket = io('/', { autoConnect: true });
  }
  return socket;
}

export function useBookingTracking(bookingId, onLocationUpdate, onStatusChange) {
  const s = useSocket();

  useEffect(() => {
    if (!bookingId) return;
    s.emit('join_booking', bookingId);
    s.on('provider_location', onLocationUpdate);
    s.on('status_changed', onStatusChange);
    return () => {
      s.off('provider_location', onLocationUpdate);
      s.off('status_changed', onStatusChange);
    };
  }, [bookingId]);
}
