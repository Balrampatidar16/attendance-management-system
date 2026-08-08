import { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import DateRangeFilter from '../../components/common/DateRangeFilter';
import ExportButtons from '../../components/common/ExportButtons';
import AttendanceTable from '../../components/attendance/AttendanceTable';
import SelfieViewer from '../../components/attendance/SelfieViewer';
import { useGetDailyReportQuery, useGetRangeReportQuery } from '../../features/reports/reportApi';

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function Reports({ title = 'Reports', description = 'Attendance report for the selected date or range.' }) {
  const [mode, setMode] = useState('daily'); // 'daily' | 'range'
  const [date, setDate] = useState(todayStr());
  const [range, setRange] = useState({ startDate: todayStr(), endDate: todayStr() });
  const [viewRecord, setViewRecord] = useState(null);

  const dailyResult = useGetDailyReportQuery({ date }, { skip: mode !== 'daily' });
  const rangeResult = useGetRangeReportQuery(range, { skip: mode !== 'range' });

  const { data, isLoading, isFetching } = mode === 'daily' ? dailyResult : rangeResult;
  const records = data?.records ?? [];
  const exportParams = mode === 'daily' ? { date } : range;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        <ExportButtons params={exportParams} />
      </div>

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-4">
          <div className="flex gap-2">
            <Button variant={mode === 'daily' ? 'primary' : 'secondary'} onClick={() => setMode('daily')}>
              Daily
            </Button>
            <Button variant={mode === 'range' ? 'primary' : 'secondary'} onClick={() => setMode('range')}>
              Date range
            </Button>
          </div>

          {mode === 'daily' ? (
            <Input
              type="date"
              label="Date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="sm:max-w-[10rem]"
            />
          ) : (
            <DateRangeFilter
              startDate={range.startDate}
              endDate={range.endDate}
              onChange={(patch) => setRange((prev) => ({ ...prev, ...patch }))}
            />
          )}
        </div>

        <AttendanceTable
          data={records}
          isLoading={isLoading || isFetching}
          showEmployee
          onView={setViewRecord}
        />
      </Card>

      <SelfieViewer open={!!viewRecord} onClose={() => setViewRecord(null)} record={viewRecord} />
    </div>
  );
}
