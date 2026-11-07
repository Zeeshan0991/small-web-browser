'use client';
import { useLayoutEffect, useRef } from 'react';
import type { SearchResult } from '@/lib/types';

interface Props {
  query: string;
  results: SearchResult[];
  scrollY: number;
  onScroll: (y: number) => void;
  onOpen: (address: string) => void;
}

export default function SearchResults({ query, results, scrollY, onScroll, onOpen }: Props) {
  const box = useRef<HTMLDivElement>(null);

  // RESTORE ON RETURN: put the list back where the reader left it.
  useLayoutEffect(() => {
    if (box.current) box.current.scrollTop = scrollY;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="results" ref={box} onScroll={(e) => onScroll(e.currentTarget.scrollTop)}>
      <h1>Results for “{query}”</h1>
      {results.length === 0 && <p>No page mentions that.</p>}
      {results.map((r) => (
        <article key={r.revisionId} className="result">
          <button className="linkish result-title" onClick={() => onOpen(r.address)}>
            {r.title}
          </button>
          <div className="result-address">{r.address}</div>
          {/* React escapes this, so it is always shown as plain text */}
          <p>{r.snippet}</p>
        </article>
      ))}
    </div>
  );
}