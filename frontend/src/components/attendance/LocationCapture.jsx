import { useEffect } from 'react';
import { useGeolocation } from '../../hooks/useGeolocation';
import Button from '../ui/Button';

export default function LocationCapture({ onCapture }) {
  const { latitude, longitude, address, status, error, capture } = useGeolocation();

  useEffect(() => {
    capture();
    // Only run once on mount — capture() is stable across renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status === 'success') {
      onCapture({ latitude, longitude, address });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, latitude, longitude, address]);

  return (
    <div className="space-y-2 min-h-[3rem]">
      {status === 'loading' && <p className="text-sm text-slate-500 dark:text-slate-400">Getting your location…</p>}
      {status === 'success' && (
        <p className="text-sm text-green-600 dark:text-green-400">Location captured: {address}</p>
      )}
      {status === 'error' && (
        <div className="space-y-2">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <Button type="button" variant="secondary" onClick={capture}>
            Retry
          </Button>
        </div>
      )}
    </div>
  );
}
