import Table from '../ui/Table';
import Badge from '../ui/Badge';
import { formatDate, formatHours } from '../../utils/formatters';

export default function OvertimeTable({ data, isLoading, showEmployee = false, renderActions }) {
  const columns = [
    ...(showEmployee ? [{ key: 'employee', header: 'Employee', render: (row) => row.user?.name ?? '-' }] : []),
    { key: 'date', header: 'Date', render: (row) => formatDate(row.date) },
    { key: 'requestedHours', header: 'Requested', render: (row) => formatHours(row.requestedHours) },
    {
      key: 'reason',
      header: 'Reason',
      render: (row) => <span className="line-clamp-1 max-w-xs block">{row.reason}</span>,
    },
    { key: 'status', header: 'Status', render: (row) => <Badge status={row.status} /> },
    ...(renderActions ? [{ key: 'actions', header: '', render: renderActions }] : []),
  ];

  return <Table columns={columns} data={data} isLoading={isLoading} />;
}
