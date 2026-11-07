'use client';

interface Props {
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
}

export default function SearchBar({ value, disabled, onChange, onSubmit }: Props) {
  return (
    <form
      className="search"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(value);
      }}
    >
      <input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search every page…"
        aria-label="Search"
      />
      <button type="submit" disabled={disabled}>Search</button>
    </form>
  );
}