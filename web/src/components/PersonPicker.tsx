'use client';
import type { Person } from '@/lib/types';

interface Props {
  people: Person[];
  value: string;
  onChange: (personId: string) => void;
}

export default function PersonPicker({ people, value, onChange }: Props) {
  return (
    <label className="picker">
      Browsing as{' '}
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Choose a name…</option>
        {people.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </label>
  );
}