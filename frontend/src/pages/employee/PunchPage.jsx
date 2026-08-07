import toast from 'react-hot-toast';
import PunchCard from '../../components/attendance/PunchCard';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import {
  useGetTodayAttendanceQuery,
  usePunchInMutation,
  usePunchOutMutation,
} from '../../features/attendance/attendanceApi';
import { formatTime, formatHours } from '../../utils/formatters';

export default function PunchPage() {
  const { data: today, isLoading, isFetching } = useGetTodayAttendanceQuery();
  const [punchIn, { isLoading: isPunchingIn }] = usePunchInMutation();
  const [punchOut, { isLoading: isPunchingOut }] = usePunchOutMutation();

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  const hasPunchedIn = !!today?.punchIn?.time;
  const hasPunchedOut = !!today?.punchOut?.time;

  const handlePunchIn = async (payload) => {
    await punchIn(payload).unwrap();
    toast.success('Punched in successfully');
  };

  const handlePunchOut = async (payload) => {
    await punchOut(payload).unwrap();
    toast.success('Punched out successfully');
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Punch In / Out</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Capture a live selfie and your location to mark attendance.
        </p>
      </div>

      {hasPunchedOut ? (
        <Card title="Today's attendance">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Punched in at {formatTime(today.punchIn.time)}, out at {formatTime(today.punchOut.time)}
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                Total: {formatHours(today.totalWorkingHours)}
              </p>
            </div>
            <Badge status={today.workStatus} />
          </div>
        </Card>
      ) : hasPunchedIn ? (
        <>
          <Card title="Today's attendance" className="mb-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Punched in at {formatTime(today.punchIn.time)}. Don&apos;t forget to punch out at the end of your
              shift.
            </p>
          </Card>
          <PunchCard mode="out" onSubmit={handlePunchOut} isSubmitting={isPunchingOut || isFetching} />
        </>
      ) : (
        <PunchCard mode="in" onSubmit={handlePunchIn} isSubmitting={isPunchingIn || isFetching} />
      )}
    </div>
  );
}
