import { useState } from 'react';
import Card from '../../components/ui/Card';
import Pagination from '../../components/ui/Pagination';
import AttendanceTable from '../../components/attendance/AttendanceTable';
import VerifyModal from '../../components/attendance/VerifyModal';
import { useGetTeamAttendanceQuery } from '../../features/attendance/attendanceApi';
import { VERIFICATION_STATUS } from '../../utils/constants';

export default function VerifyAttendance() {
  const [page, setPage] = useState(1);
  const [reviewRecord, setReviewRecord] = useState(null);

  const { data, isLoading, isFetching } = useGetTeamAttendanceQuery({
    verificationStatus: VERIFICATION_STATUS.PENDING,
    page,
    limit: 10,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Verify Attendance</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Review selfies and location for records pending verification.
        </p>
      </div>

      <Card>
        <AttendanceTable
          data={data?.items ?? []}
          isLoading={isLoading || isFetching}
          showEmployee
          onView={setReviewRecord}
          viewLabel="Review"
        />
        <Pagination
          page={data?.meta?.page ?? 1}
          totalPages={data?.meta?.totalPages ?? 1}
          onPageChange={setPage}
        />
      </Card>

      <VerifyModal open={!!reviewRecord} onClose={() => setReviewRecord(null)} record={reviewRecord} />
    </div>
  );
}
