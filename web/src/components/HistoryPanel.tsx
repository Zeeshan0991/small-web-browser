
'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { HistoryItem } from '@/lib/types';

interface Props {
  personId: string;
  refreshKey: number;
  onJump: (address: string) => void;
}

const when = (iso: string) =>
  new Date(iso).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function HistoryPanel({
  personId,
  refreshKey,
  onJump,
}: Props) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [completedKey, setCompletedKey] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<{
    key: string;
    message: string;
  } | null>(null);

  const requestKey = `${personId}:${refreshKey}`;
  const isInitialLoading = completedKey !== requestKey;

  const error =
    requestError?.key === requestKey ? requestError.message : null;

  // Load the newest page whenever the person changes or a visit is recorded.
  useEffect(() => {
    let ignore = false;

    api
      .history(personId)
      .then((p) => {
        if (ignore) return;

        setItems(p.items);
        setCursor(p.nextCursor);
        setRequestError(null);
        setCompletedKey(requestKey);
      })
      .catch((e) => {
        if (ignore) return;

        setRequestError({
          key: requestKey,
          message: (e as Error).message,
        });
        setCompletedKey(requestKey);
      });

    return () => {
      ignore = true;
    };
  }, [personId, refreshKey, requestKey]);

  async function loadMore() {
    if (!cursor || busy || isInitialLoading) return;

    setBusy(true);

    try {
      const p = await api.history(personId, cursor);
      setItems((prev) => [...prev, ...p.items]);
      setCursor(p.nextCursor);
    } catch (e) {
      setRequestError({
        key: requestKey,
        message: (e as Error).message,
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="panel-body">
      <h2>History</h2>

      {error && <div className="banner">{error}</div>}

      {!isInitialLoading && !busy && items.length === 0 && (
        <p>No history yet.</p>
      )}

      <ul className="history">
        {items.map((v) => (
          <li key={v.id}>
            <button onClick={() => onJump(v.address)}>
              <span className="h-title">
                {v.found ? (v.title ?? v.address) : 'Nowhere'}
              </span>

              <span className="h-address">{v.address}</span>

              <span className="h-meta">
                {when(v.at)} · {v.via}
                {!v.found && ' · no such address'}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {cursor && (
        <button
          className="more"
          onClick={loadMore}
          disabled={busy || isInitialLoading}
        >
          {busy || isInitialLoading ? 'Loading…' : 'Load older'}
        </button>
      )}
    </div>
  );
}
