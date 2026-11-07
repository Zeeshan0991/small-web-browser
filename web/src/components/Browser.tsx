'use client';

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { normalizeAddress } from '@/lib/address';
import { canBack, canForward, currentEntry, initialNav, navReducer, type Entry } from '@/lib/nav';
import type { Person, Via } from '@/lib/types';
import AddressBar from './AddressBar';
import Nowhere from './Nowhere';
import PageView from './PageView';
import PersonPicker from './PersonPicker';
import Toolbar from './Toolbar';

const addressOf = (e: Entry): string => (e.kind === 'page' ? e.page.address : e.query);

export default function Browser() {
  const [people, setPeople] = useState<Person[]>([]);
  const [personId, setPersonId] = useState('');
  const [nav, dispatch] = useReducer(navReducer, initialNav);
  const [loading, setLoading] = useState(false); // the "Loading" state, derived, never stored
  const [error, setError] = useState<string | null>(null);
  const [addressDraft, setAddressDraft] = useState<string | null>(null);

  const ticket = useRef(0); // identifies the newest navigation
  const scrollY = useRef(0); // how far the current page is scrolled

  const entry = currentEntry(nav);
  const entryId = entry?.id ?? 0;
  const entryScroll = entry?.scrollY ?? 0;
  const entryAddress = entry ? addressOf(entry) : '';
  const addressText = addressDraft ?? entryAddress;

  useEffect(() => {
    api
      .people()
      .then(setPeople)
      .catch(() => setError('Cannot reach the API. Is it running on port 4000?'));
  }, []);

  // Entries that have no iframe (like "Nowhere") never report scrolling,
  // so make sure we are not carrying a stale number from the previous page.
  useEffect(() => {
    scrollY.current = entryScroll;
  }, [entryId, entryScroll]);

  // Typed, or a followed link: ask for a page, show it, record the visit.
  const go = useCallback(
    async (rawAddress: string, via: Via) => {
      const address = normalizeAddress(rawAddress);
      if (!address || !personId) return;

      const mine = ++ticket.current;
      setLoading(true);
      setError(null);
      try {
        const page = await api.resolve(address);
        if (mine !== ticket.current) return; // a newer navigation won the race

        setAddressDraft(null);

        dispatch({
          type: 'navigate',
          entry: { kind: 'page', page },
          leavingScrollY: scrollY.current,
        });
        api.recordVisit(personId, address, via).catch(() => {});
      } catch (e) {
        if (mine === ticket.current) setError((e as Error).message);
      } finally {
        if (mine === ticket.current) setLoading(false);
      }
    },
    [personId],
  );

  // Back and Forward cancel anything still loading and record NO visit:
  // they revisit entries we already have.
  const back = () => {
    ticket.current++;
    setLoading(false);

    if (canBack(nav)) {
      setAddressDraft(null);
    }

    dispatch({ type: 'back', leavingScrollY: scrollY.current });
  };

  const forward = () => {
    ticket.current++;
    setLoading(false);

    if (canForward(nav)) {
      setAddressDraft(null);
    }

    dispatch({ type: 'forward', leavingScrollY: scrollY.current });
  };

  const changePerson = (id: string) => {
    ticket.current++; // drop anything in flight
    setLoading(false);
    setError(null);
    setAddressDraft(null);
    dispatch({ type: 'reset' }); // each person starts with a clean trail
    setPersonId(id);
  };

  let content;
  if (!personId) {
    content = <div className="notice"><h1>Welcome</h1><p>Pick who is browsing to begin.</p></div>;
  } else if (!entry) {
    content = (
      <div className="notice">
        <h1>New page</h1>
        <p>Type an address above, or start at{' '}
          <button className="linkish" onClick={() => go('front-page.zz', 'typed')}>front-page.zz</button>.
        </p>
      </div>
    );
  } else if (entry.kind === 'page') {
    const p = entry.page;
    content = p.found ? (
      <PageView
        key={entry.id}
        title={p.title}
        author={p.author}
        html={p.html}
        scrollY={entry.scrollY}
        onScroll={(y) => { scrollY.current = y; }}
        onNavigate={(address) => go(address, 'link')}
      />
    ) : (
      <Nowhere address={p.address} />
    );
  } else {
    content = null; // search results arrive in Step 6
  }

  return (
    <div className="app">
      <header className="topbar">
        <strong className="brand">Small Web</strong>
        <PersonPicker people={people} value={personId} onChange={changePerson} />
      </header>

      <Toolbar canBack={canBack(nav)} canForward={canForward(nav)} onBack={back} onForward={forward}>
        <AddressBar
          value={addressText}
          disabled={!personId}
          loading={loading}
          onChange={setAddressDraft}
          onSubmit={(v) => go(v, 'typed')}
        />
      </Toolbar>

      {loading && <div className="loading-bar" />}
      {error && <div className="banner">{error}</div>}
      <main className="viewport">{content}</main>
    </div>
  );
}
