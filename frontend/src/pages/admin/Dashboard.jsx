import { useAuth } from '../../hooks/useAuth';
import StatCard from '../../components/dashboard/StatCard';
import Spinner from '../../components/ui/Spinner';
import { useGetAttendanceStatsQuery } from '../../features/attendance/attendanceApi';
import { useGetUsersQuery } from '../../features/users/userApi';
import { useGetAllOvertimeQuery } from '../../features/overtime/overtimeApi';

export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useGetAttendanceStatsQuery();
  const { data: usersData, isLoading: usersLoading } = useGetUsersQuery({ limit: 1 });
  const { data: otData, isLoading: otLoading } = useGetAllOvertimeQuery({ status: 'pending', limit: 1 });

  const isLoading = statsLoading || usersLoading || otLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
          Welcome back, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">System-wide attendance overview.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total users" value={usersData?.meta?.total ?? 0} />
          <StatCard label="Attendance records" value={stats?.totalRecords ?? 0} />
          <StatCard label="Pending verification" value={stats?.pendingVerification ?? 0} tone="amber" />
          <StatCard label="Pending overtime" value={otData?.meta?.total ?? 0} tone="amber" />
        </div>
      )}
    </div>
  );
}
