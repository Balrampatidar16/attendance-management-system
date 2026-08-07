import { useState } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import { selectAccessToken } from '../../features/auth/authSlice';

// RTK Query isn't a good fit for file downloads (it expects JSON), and a plain <a href> can't
// attach the Authorization header these endpoints require — so this does a manual authenticated
// fetch, then turns the response blob into a download via a throwaway object URL.
export default function ExportButtons({ params }) {
  const accessToken = useSelector(selectAccessToken);
  const [downloading, setDownloading] = useState(null); // 'excel' | 'pdf' | null

  const download = async (format) => {
    setDownloading(format);
    try {
      const query = new URLSearchParams(
        Object.entries(params ?? {}).filter(([, v]) => v !== undefined && v !== '')
      ).toString();

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/reports/export/${format}${query ? `?${query}` : ''}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance-report.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Could not export the report. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="flex gap-2">
      <Button variant="secondary" onClick={() => download('excel')} isLoading={downloading === 'excel'}>
        Export Excel
      </Button>
      <Button variant="secondary" onClick={() => download('pdf')} isLoading={downloading === 'pdf'}>
        Export PDF
      </Button>
    </div>
  );
}
