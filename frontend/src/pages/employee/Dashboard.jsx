import { useAuth } from '../../hooks/useAuth';
import StatCard from '../../components/dashboard/StatCard';
import AttendanceChart from '../../components/dashboard/AttendanceChart';
import Spinner from '../../components/ui/Spinner';
import { useGetAttendanceStatsQuery, useGetMyAttendanceQuery } from '../../features/attendance/attendanceApi';

export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useGetAttendanceStatsQuery();
  const { data: recent, isLoading: recentLoading } = useGetMyAttendanceQuery({ limit: 14, page: 1 });

  const chartData = recent?.items ? [...recent.items].reverse() : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
          Welcome back, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Here&apos;s your attendance overview.</p>
      </div>

      {statsLoading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total records" value={stats?.totalRecords ?? 0} />
          <StatCard label="Completed days" value={stats?.completed ?? 0} tone="green" />
          <StatCard label="Incomplete days" value={stats?.incomplete ?? 0} tone="red" />
          <StatCard label="Avg. working hours" value={`${stats?.avgWorkingHours ?? 0}h`} />
        </div>
      )}

      {!recentLoading && chartData.length > 0 && <AttendanceChart data={chartData} title="Last 14 working days" />}
    </div>
  );
}
