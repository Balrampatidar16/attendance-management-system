import { useState } from 'react';
import toast from 'react-hot-toast';
import CameraCapture from './CameraCapture';
import LocationCapture from './LocationCapture';
import Button from '../ui/Button';
import Card from '../ui/Card';

export default function PunchCard({ mode, onSubmit, isSubmitting }) {
  const [selfie, setSelfie] = useState(null);
  const [location, setLocation] = useState(null);

  const canSubmit = !!selfie && !!location && !isSubmitting;

  const handleSubmit = async () => {
    try {
      await onSubmit({
        selfie,
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
      });
      setSelfie(null);
      setLocation(null);
    } catch (err) {
      toast.error(err?.data?.message ?? 'Something went wrong. Please try again.');
    }
  };

  return (
    <Card title={mode === 'in' ? 'Punch In' : 'Punch Out'}>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">1. Take a selfie</p>
          <CameraCapture capturedImage={selfie} onCapture={setSelfie} onRetake={() => setSelfie(null)} />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">2. Capture location</p>
          <LocationCapture onCapture={setLocation} />
        </div>
      </div>
      <div className="mt-6">
        <Button onClick={handleSubmit} disabled={!canSubmit} isLoading={isSubmitting} className="w-full sm:w-auto">
          {mode === 'in' ? 'Punch In' : 'Punch Out'}
        </Button>
        {(!selfie || !location) && (
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Capture both a selfie and your location to continue.
          </p>
        )}
      </div>
    </Card>
  );
}
