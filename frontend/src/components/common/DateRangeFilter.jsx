import Input from '../ui/Input';

export default function DateRangeFilter({ startDate, endDate, onChange }) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <Input
        type="date"
        label="From"
        value={startDate}
        onChange={(e) => onChange({ startDate: e.target.value, endDate })}
        className="max-w-[10rem]"
      />
      <Input
        type="date"
        label="To"
        value={endDate}
        onChange={(e) => onChange({ startDate, endDate: e.target.value })}
        className="max-w-[10rem]"
      />
    </div>
  );
}
