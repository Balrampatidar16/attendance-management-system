import { useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useRequestOvertimeMutation } from '../../features/overtime/overtimeApi';
import { formatDate, formatHours } from '../../utils/formatters';

export default function OvertimeRequestModal({ open, onClose, attendance }) {
  const [reason, setReason] = useState('');
  const [requestedHours, setRequestedHours] = useState('');
  const [requestOvertime, { isLoading }] = useRequestOvertimeMutation();

  const handleClose = () => {
    setReason('');
    setRequestedHours('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!attendance) return;

    try {
      await requestOvertime({
        attendanceId: attendance._id,
        requestedHours: Number(requestedHours),
        reason,
      }).unwrap();
      toast.success('Overtime request submitted');
      handleClose();
    } catch (err) {
      toast.error(err?.data?.message ?? 'Could not submit overtime request');
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Request Overtime">
      {attendance && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {formatDate(attendance.date)} — worked {formatHours(attendance.totalWorkingHours)}
          </p>

          <Input
            id="requestedHours"
            label="Requested hours"
            type="number"
            min="0.5"
            step="0.5"
            required
            value={requestedHours}
            onChange={(e) => setRequestedHours(e.target.value)}
          />

          <div className="space-y-1">
            <label htmlFor="reason" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Reason
            </label>
            <textarea
              id="reason"
              required
              minLength={10}
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="At least 10 characters"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              Submit request
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
