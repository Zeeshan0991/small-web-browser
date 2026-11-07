'use client';

interface Props {
  value: string;
  disabled: boolean;
  loading: boolean;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
}

export default function AddressBar({ value, disabled, loading, onChange, onSubmit }: Props) {
  return (
    <form
      className="address"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(value);
      }}
    >
      <input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type an address, like front-page.zz"
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        aria-label="Address"
      />
      <button type="submit" disabled={disabled || loading}>
        Go
      </button>
    </form>
  );
}