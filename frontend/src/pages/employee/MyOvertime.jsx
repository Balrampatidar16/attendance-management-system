import Card from '../../components/ui/Card';
import OvertimeTable from '../../components/overtime/OvertimeTable';
import { useGetMyOvertimeQuery } from '../../features/overtime/overtimeApi';

export default function MyOvertime() {
  const { data, isLoading } = useGetMyOvertimeQuery({ page: 1, limit: 20 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">My Overtime</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Track the status of your overtime requests.</p>
      </div>

      <Card>
        <OvertimeTable data={data?.items ?? []} isLoading={isLoading} />
      </Card>
    </div>
  );
}
