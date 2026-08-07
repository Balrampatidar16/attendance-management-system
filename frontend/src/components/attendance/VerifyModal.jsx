import { useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import PunchDetails from './PunchDetails';
import { useVerifyAttendanceMutation } from '../../features/attendance/attendanceApi';
import { formatDate, formatHours } from '../../utils/formatters';

export default function VerifyModal({ open, onClose, record }) {
  const [remarks, setRemarks] = useState('');
  const [verifyAttendance, { isLoading }] = useVerifyAttendanceMutation();

  const handleClose = () => {
    setRemarks('');
    onClose();
  };

  const handleDecision = async (verificationStatus) => {
    try {
      await verifyAttendance({ id: record._id, verificationStatus, remarks }).unwrap();
      toast.success(`Marked as ${verificationStatus}`);
      handleClose();
    } catch (err) {
      toast.error(err?.data?.message ?? 'Could not update verification status');
    }
  };

  if (!record) return null;

  return (
    <Modal open={open} onClose={handleClose} title={`Verify Attendance — ${record.user?.name ?? ''}`}>
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <Badge status={record.workStatus} />
          <Badge status={record.verificationStatus} />
          <span className="text-sm text-slate-500 dark:text-slate-400">{formatDate(record.date)}</span>
        </div>

        <PunchDetails record={record} />

        <p className="text-sm text-slate-600 dark:text-slate-300">
          Total working hours:{' '}
          <span className="font-semibold text-slate-900 dark:text-white">{formatHours(record.totalWorkingHours)}</span>
        </p>

        <div className="space-y-1">
          <label htmlFor="remarks" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Remarks
          </label>
          <textarea
            id="remarks"
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Optional notes about this verification"
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="danger" onClick={() => handleDecision('invalid')} isLoading={isLoading}>
            Mark Invalid
          </Button>
          <Button onClick={() => handleDecision('valid')} isLoading={isLoading}>
            Mark Valid
          </Button>
        </div>
      </div>
    </Modal>
  );
}
