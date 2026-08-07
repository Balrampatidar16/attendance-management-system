import { useAuth } from '../../hooks/useAuth';
import StatCard from '../../components/dashboard/StatCard';
import Spinner from '../../components/ui/Spinner';
import { useGetAttendanceStatsQuery } from '../../features/attendance/attendanceApi';
import { useGetPendingOvertimeQuery } from '../../features/overtime/overtimeApi';

export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useGetAttendanceStatsQuery();
  const { data: pendingOt, isLoading: otLoading } = useGetPendingOvertimeQuery({ page: 1, limit: 1 });

  const isLoading = statsLoading || otLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
          Welcome back, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Here&apos;s your team&apos;s attendance overview.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Team records" value={stats?.totalRecords ?? 0} />
          <StatCard label="Pending verification" value={stats?.pendingVerification ?? 0} tone="amber" />
          <StatCard label="Pending overtime" value={pendingOt?.meta?.total ?? 0} tone="amber" />
          <StatCard label="Avg. working hours" value={`${stats?.avgWorkingHours ?? 0}h`} />
        </div>
      )}
    </div>
  );
}
