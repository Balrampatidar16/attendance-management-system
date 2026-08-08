import Input from '../ui/Input';

export default function DateRangeFilter({ startDate, endDate, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:flex sm:items-end sm:w-auto">
      <Input
        type="date"
        label="From"
        value={startDate}
        onChange={(e) => onChange({ startDate: e.target.value, endDate })}
        className="sm:max-w-[10rem]"
      />
      <Input
        type="date"
        label="To"
        value={endDate}
        onChange={(e) => onChange({ startDate, endDate: e.target.value })}
        className="sm:max-w-[10rem]"
      />
    </div>
  );
}
