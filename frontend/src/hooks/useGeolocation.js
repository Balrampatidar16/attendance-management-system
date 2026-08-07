import { useCallback, useState } from 'react';

const reverseGeocode = async (latitude, longitude) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16`,
      { headers: { Accept: 'application/json' } }
    );
    if (!res.ok) throw new Error('reverse geocode request failed');
    const data = await res.json();
    return data?.display_name ?? `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
  } catch {
    // Free public endpoint with no uptime guarantee — fall back to raw coordinates rather than
    // blocking the punch flow on a third-party service being reachable.
    return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
  }
};

export function useGeolocation() {
  const [state, setState] = useState({
    latitude: null,
    longitude: null,
    address: null,
    status: 'idle', // idle | loading | success | error
    error: null,
  });

  const capture = useCallback(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, status: 'error', error: 'Geolocation is not supported by this browser' }));
      return;
    }

    setState((s) => ({ ...s, status: 'loading', error: null }));

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const address = await reverseGeocode(latitude, longitude);
        setState({ latitude, longitude, address, status: 'success', error: null });
      },
      (err) => {
        let message = 'Unable to retrieve your location';
        if (err.code === err.PERMISSION_DENIED) message = 'Location permission was denied';
        else if (err.code === err.POSITION_UNAVAILABLE) message = 'Location information is unavailable';
        else if (err.code === err.TIMEOUT) message = 'Location request timed out';
        setState((s) => ({ ...s, status: 'error', error: message }));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  const reset = useCallback(() => {
    setState({ latitude: null, longitude: null, address: null, status: 'idle', error: null });
  }, []);

  return { ...state, capture, reset };
}
