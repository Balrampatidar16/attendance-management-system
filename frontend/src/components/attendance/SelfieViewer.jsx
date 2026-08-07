import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import PunchDetails from './PunchDetails';
import { formatDate, formatHours } from '../../utils/formatters';

export default function SelfieViewer({ open, onClose, record, footer }) {
  if (!record) return null;

  return (
    <Modal open={open} onClose={onClose} title={`Attendance — ${formatDate(record.date)}`} footer={footer}>
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <Badge status={record.workStatus} />
          <Badge status={record.verificationStatus} />
        </div>

        <PunchDetails record={record} />

        <div className="flex items-center justify-between text-sm border-t border-slate-200 dark:border-slate-800 pt-4">
          <span className="text-slate-500 dark:text-slate-400">Total working hours</span>
          <span className="font-semibold text-slate-900 dark:text-white">{formatHours(record.totalWorkingHours)}</span>
        </div>

        {record.remarks && (
          <div className="text-sm">
            <p className="text-slate-500 dark:text-slate-400">Remarks</p>
            <p className="text-slate-700 dark:text-slate-300">{record.remarks}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
