import { useEffect, useState } from 'react';
import Input from '../ui/Input';
import { useDebounce } from '../../hooks/useDebounce';

export default function SearchBar({ value, onChange, placeholder = 'Search…' }) {
  const [text, setText] = useState(value ?? '');
  const debounced = useDebounce(text, 400);

  useEffect(() => {
    onChange(debounced);
    // Only fire when the debounced value actually settles, not on every parent re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <Input
      type="search"
      placeholder={placeholder}
      value={text}
      onChange={(e) => setText(e.target.value)}
      className="max-w-xs"
    />
  );
}
