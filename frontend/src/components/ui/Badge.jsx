// Status pills: green = completed/approved/valid, amber = pending/in-progress, red = incomplete/rejected/invalid.
const TONE_BY_STATUS = {
  completed: 'green',
  approved: 'green',
  valid: 'green',
  pending: 'amber',
  'in-progress': 'amber',
  incomplete: 'red',
  rejected: 'red',
  invalid: 'red',
};

const TONE_CLASSES = {
  green: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  red: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

export default function Badge({ status, tone, children }) {
  const resolvedTone = tone ?? TONE_BY_STATUS[status] ?? 'slate';
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${TONE_CLASSES[resolvedTone]}`}
    >
      {children ?? status}
    </span>
  );
}
