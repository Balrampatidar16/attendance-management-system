import { useEffect } from 'react';
import { useCamera } from '../../hooks/useCamera';
import Button from '../ui/Button';

export default function CameraCapture({ capturedImage, onCapture, onRetake }) {
  const { videoRef, status, error, start, stop, capture } = useCamera();

  useEffect(() => {
    if (!capturedImage) {
      start();
    }
    // Only run once on mount — start()/stop() are stable across renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCapture = () => {
    const image = capture();
    if (image) {
      onCapture(image);
      stop();
    }
  };

  const handleRetake = () => {
    onRetake();
    start();
  };

  if (capturedImage) {
    return (
      <div className="space-y-3">
        <img
          src={capturedImage}
          alt="Captured selfie"
          className="w-full max-w-xs rounded-lg border border-slate-200 dark:border-slate-700"
        />
        <Button type="button" variant="secondary" onClick={handleRetake}>
          Retake photo
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative w-full max-w-xs aspect-square rounded-lg overflow-hidden bg-slate-900 flex items-center justify-center">
        {status === 'starting' && <p className="text-sm text-slate-300">Starting camera…</p>}
        {status === 'denied' && (
          <p className="text-sm text-red-300 text-center px-4">{error}</p>
        )}
        {status === 'unavailable' && <p className="text-sm text-red-300 text-center px-4">{error}</p>}
        {status === 'error' && <p className="text-sm text-red-300 text-center px-4">{error}</p>}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${status === 'ready' ? 'block' : 'hidden'}`}
        />
      </div>
      <div className="flex gap-2">
        <Button type="button" onClick={handleCapture} disabled={status !== 'ready'}>
          Capture selfie
        </Button>
        {(status === 'denied' || status === 'error' || status === 'unavailable') && (
          <Button type="button" variant="secondary" onClick={start}>
            Try again
          </Button>
        )}
      </div>
    </div>
  );
}
