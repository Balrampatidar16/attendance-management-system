import Table from '../ui/Table';
import Badge from '../ui/Badge';
import { formatDate, formatTime, formatHours } from '../../utils/formatters';

export default function AttendanceTable({
  data,
  isLoading,
  showEmployee = false,
  onView,
  viewLabel = 'View',
  onRequestOvertime,
  canRequestOvertime,
}) {
  const hasActions = !!onView || !!onRequestOvertime;

  const columns = [
    ...(showEmployee ? [{ key: 'employee', header: 'Employee', render: (row) => row.user?.name ?? '-' }] : []),
    { key: 'date', header: 'Date', render: (row) => formatDate(row.date) },
    { key: 'punchIn', header: 'Punch In', hideOnMobile: true, render: (row) => formatTime(row.punchIn?.time) },
    { key: 'punchOut', header: 'Punch Out', hideOnMobile: true, render: (row) => formatTime(row.punchOut?.time) },
    { key: 'hours', header: 'Hours', render: (row) => formatHours(row.totalWorkingHours) },
    { key: 'status', header: 'Status', render: (row) => <Badge status={row.workStatus} /> },
    {
      key: 'verification',
      header: 'Verification',
      hideOnMobile: true,
      render: (row) => <Badge status={row.verificationStatus} />,
    },
    ...(hasActions
      ? [
          {
            key: 'actions',
            header: '',
            render: (row) => (
              <div className="flex items-center gap-3">
                {onView && (
                  <button
                    type="button"
                    onClick={() => onView(row)}
                    className="text-brand-600 hover:text-brand-700 dark:text-brand-400 text-sm font-medium"
                  >
                    {viewLabel}
                  </button>
                )}
                {onRequestOvertime && canRequestOvertime?.(row) && (
                  <button
                    type="button"
                    onClick={() => onRequestOvertime(row)}
                    className="text-amber-600 hover:text-amber-700 dark:text-amber-400 text-sm font-medium"
                  >
                    Request OT
                  </button>
                )}
              </div>
            ),
          },
        ]
      : []),
  ];

  return <Table columns={columns} data={data} isLoading={isLoading} />;
}
