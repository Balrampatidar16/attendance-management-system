import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Card from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import Pagination from '../../components/ui/Pagination';
import DateRangeFilter from '../../components/common/DateRangeFilter';
import AttendanceTable from '../../components/attendance/AttendanceTable';
import SelfieViewer from '../../components/attendance/SelfieViewer';
import OvertimeRequestModal from '../../components/overtime/OvertimeRequestModal';
import { useGetMyAttendanceQuery } from '../../features/attendance/attendanceApi';
import { selectMyAttendanceFilters, setMyFilters } from '../../features/attendance/attendanceSlice';
import { WORK_STATUS } from '../../utils/constants';

const canRequestOvertime = (row) => !!row.punchOut?.time && row.totalWorkingHours > 8 && !row.overtime;

export default function MyAttendance() {
  const dispatch = useDispatch();
  const filters = useSelector(selectMyAttendanceFilters);
  const [viewRecord, setViewRecord] = useState(null);
  const [otRecord, setOtRecord] = useState(null);

  const { data, isLoading, isFetching } = useGetMyAttendanceQuery({
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
    workStatus: filters.workStatus || undefined,
    page: filters.page,
    limit: 10,
  });

  const handleFilterChange = (patch) => {
    dispatch(setMyFilters({ ...patch, page: 1 }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">My Attendance</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Your personal punch history.</p>
      </div>

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-4">
          <DateRangeFilter startDate={filters.startDate} endDate={filters.endDate} onChange={handleFilterChange} />
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
            className="sm:max-w-[10rem]"
          />
        </div>

        <AttendanceTable
          data={data?.items ?? []}
          isLoading={isLoading || isFetching}
          onView={setViewRecord}
          onRequestOvertime={setOtRecord}
          canRequestOvertime={canRequestOvertime}
        />

        <Pagination
          page={data?.meta?.page ?? 1}
          totalPages={data?.meta?.totalPages ?? 1}
          onPageChange={(page) => dispatch(setMyFilters({ page }))}
        />
      </Card>

      <SelfieViewer open={!!viewRecord} onClose={() => setViewRecord(null)} record={viewRecord} />
      <OvertimeRequestModal open={!!otRecord} onClose={() => setOtRecord(null)} attendance={otRecord} />
    </div>
  );
}
