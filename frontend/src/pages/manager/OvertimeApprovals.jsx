import { useState } from 'react';
import Card from '../../components/ui/Card';
import Pagination from '../../components/ui/Pagination';
import OvertimeTable from '../../components/overtime/OvertimeTable';
import ReviewModal from '../../components/overtime/ReviewModal';
import { useGetPendingOvertimeQuery } from '../../features/overtime/overtimeApi';

export default function OvertimeApprovals() {
  const [page, setPage] = useState(1);
  const [reviewRequest, setReviewRequest] = useState(null);

  const { data, isLoading, isFetching } = useGetPendingOvertimeQuery({ page, limit: 10 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Overtime Approvals</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Pending overtime requests from your team.</p>
      </div>

      <Card>
        <OvertimeTable
          data={data?.items ?? []}
          isLoading={isLoading || isFetching}
          showEmployee
          renderActions={(row) => (
            <button
              type="button"
              onClick={() => setReviewRequest(row)}
              className="text-brand-600 hover:text-brand-700 dark:text-brand-400 text-sm font-medium"
            >
              Review
            </button>
          )}
        />
        <Pagination page={data?.meta?.page ?? 1} totalPages={data?.meta?.totalPages ?? 1} onPageChange={setPage} />
      </Card>

      <ReviewModal open={!!reviewRequest} onClose={() => setReviewRequest(null)} request={reviewRequest} />
    </div>
  );
}
