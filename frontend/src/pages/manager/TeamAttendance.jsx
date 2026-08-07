import { useState } from 'react';
import Card from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import Pagination from '../../components/ui/Pagination';
import DateRangeFilter from '../../components/common/DateRangeFilter';
import AttendanceTable from '../../components/attendance/AttendanceTable';
import SelfieViewer from '../../components/attendance/SelfieViewer';
import { useGetTeamAttendanceQuery } from '../../features/attendance/attendanceApi';
import { WORK_STATUS, VERIFICATION_STATUS } from '../../utils/constants';

export default function TeamAttendance() {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    workStatus: '',
    verificationStatus: '',
    page: 1,
  });
  const [viewRecord, setViewRecord] = useState(null);

  const { data, isLoading, isFetching } = useGetTeamAttendanceQuery({
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
    workStatus: filters.workStatus || undefined,
    verificationStatus: filters.verificationStatus || undefined,
    page: filters.page,
    limit: 10,
  });

  const handleFilterChange = (patch) => setFilters((prev) => ({ ...prev, ...patch, page: 1 }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Team Attendance</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Attendance history for your direct reports.</p>
      </div>

      <Card>
        <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
          <DateRangeFilter startDate={filters.startDate} endDate={filters.endDate} onChange={handleFilterChange} />
          <div className="flex gap-3">
            <Select
              label="Status"
              placeholder="All statuses"
              value={filters.workStatus}
              onChange={(e) => handleFilterChange({ workStatus: e.target.value })}
              options={[
                { value: WORK_STATUS.COMPLETED, label: 'Completed' },
                { value: WORK_STATUS.INCOMPLETE, label: 'Incomplete' },
                { value: WORK_STATUS.IN_PROGRESS, label: 'In progress' },
              ]}
              className="max-w-[10rem]"
            />
            <Select
              label="Verification"
              placeholder="All"
              value={filters.verificationStatus}
              onChange={(e) => handleFilterChange({ verificationStatus: e.target.value })}
              options={[
                { value: VERIFICATION_STATUS.PENDING, label: 'Pending' },
                { value: VERIFICATION_STATUS.VALID, label: 'Valid' },
                { value: VERIFICATION_STATUS.INVALID, label: 'Invalid' },
              ]}
              className="max-w-[10rem]"
            />
          </div>
        </div>

        <AttendanceTable
          data={data?.items ?? []}
          isLoading={isLoading || isFetching}
          showEmployee
          onView={setViewRecord}
        />

        <Pagination
          page={data?.meta?.page ?? 1}
          totalPages={data?.meta?.totalPages ?? 1}
          onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
        />
      </Card>

      <SelfieViewer open={!!viewRecord} onClose={() => setViewRecord(null)} record={viewRecord} />
    </div>
  );
}
