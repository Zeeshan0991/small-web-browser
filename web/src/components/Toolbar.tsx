'use client';
import type { ReactNode } from 'react';

interface Props {
  canBack: boolean;
  canForward: boolean;
  onBack: () => void;
  onForward: () => void;
  children: ReactNode; // the address bar
}

export default function Toolbar({ canBack, canForward, onBack, onForward, children }: Props) {
  return (
    <div className="toolbar">
      <button onClick={onBack} disabled={!canBack} aria-label="Back" title="Back">
        ←
      </button>
      <button onClick={onForward} disabled={!canForward} aria-label="Forward" title="Forward">
        →
      </button>
      {children}
    </div>
  );
}