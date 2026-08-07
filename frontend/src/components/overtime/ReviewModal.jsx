import { useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useReviewOvertimeMutation } from '../../features/overtime/overtimeApi';
import { formatDate, formatHours } from '../../utils/formatters';

export default function ReviewModal({ open, onClose, request }) {
  const [reviewComment, setReviewComment] = useState('');
  const [reviewOvertime, { isLoading }] = useReviewOvertimeMutation();

  const handleClose = () => {
    setReviewComment('');
    onClose();
  };

  const handleDecision = async (status) => {
    try {
      await reviewOvertime({ id: request._id, status, reviewComment }).unwrap();
      toast.success(`Overtime request ${status}`);
      handleClose();
    } catch (err) {
      toast.error(err?.data?.message ?? 'Could not review this request');
    }
  };

  if (!request) return null;

  return (
    <Modal open={open} onClose={handleClose} title={`Review Overtime — ${request.user?.name ?? ''}`}>
      <div className="space-y-4">
        <div className="text-sm space-y-1">
          <p className="text-slate-500 dark:text-slate-400">
            {formatDate(request.date)} — requested {formatHours(request.requestedHours)}
          </p>
          <p className="text-slate-700 dark:text-slate-300">{request.reason}</p>
        </div>

        <div className="space-y-1">
          <label htmlFor="reviewComment" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Review comment
          </label>
          <textarea
            id="reviewComment"
            rows={3}
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="Optional note for the employee"
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="danger" onClick={() => handleDecision('rejected')} isLoading={isLoading}>
            Reject
          </Button>
          <Button onClick={() => handleDecision('approved')} isLoading={isLoading}>
            Approve
          </Button>
        </div>
      </div>
    </Modal>
  );
}
