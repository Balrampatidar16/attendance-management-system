import { formatTime, formatLocation } from '../../utils/formatters';

// Shared by SelfieViewer (read-only) and VerifyModal (view + decide) so the punch-in/punch-out
// selfie-and-location layout isn't duplicated between the two.
function PunchColumn({ label, punch, emptyLabel }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-2">{label}</p>
      {punch?.selfieUrl ? (
        <img
          src={punch.selfieUrl}
          alt={`${label} selfie`}
          className="rounded-lg border border-slate-200 dark:border-slate-700 w-full"
        />
      ) : (
        <p className="text-sm text-slate-400">{emptyLabel}</p>
      )}
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{formatTime(punch?.time)}</p>
      <p className="text-xs text-slate-400">{formatLocation(punch?.location)}</p>
    </div>
  );
}

export default function PunchDetails({ record }) {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <PunchColumn label="Punch In" punch={record.punchIn} emptyLabel="No selfie" />
      <PunchColumn label="Punch Out" punch={record.punchOut} emptyLabel="Not yet punched out" />
    </div>
  );
}
