
'use client';

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { normalizeAddress } from '@/lib/address';
import {
  canBack,
  canForward,
  currentEntry,
  initialNav,
  navReducer,
  type Entry,
} from '@/lib/nav';
import type { Person, Via } from '@/lib/types';
import AddressBar from './AddressBar';
import HistoryPanel from './HistoryPanel';
import Nowhere from './Nowhere';
import PageView from './PageView';
import PersonPicker from './PersonPicker';
import PublishForm from './PublishForm';
import SearchBar from './SearchBar';
import SearchResults from './SearchResults';
import Toolbar from './Toolbar';

type Panel = 'none' | 'history' | 'publish';

// A search results page has no address, so the address bar is empty on it.
const addressOf = (e: Entry): string =>
  e.kind === 'page' ? e.page.address : '';

export default function Browser() {
  const [people, setPeople] = useState<Person[]>([]);
  const [personId, setPersonId] = useState('');
  const [nav, dispatch] = useReducer(navReducer, initialNav);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Draft values are used only while the user is typing.
  const [addressDraft, setAddressDraft] = useState<string | null>(null);
  const [searchDraft, setSearchDraft] = useState<string | null>(null);

  const [panel, setPanel] = useState<Panel>('none');
  const [visitTick, setVisitTick] = useState(0);

  const ticket = useRef(0);
  const scrollY = useRef(0);

  const entry = currentEntry(nav);
  const entryId = entry?.id ?? 0;
  const entryScroll = entry?.scrollY ?? 0;
  const entryAddress = entry ? addressOf(entry) : '';
  const entryQuery = entry?.kind === 'search' ? entry.query : '';

  // Display the current navigation value unless the user is typing.
  const addressText = addressDraft ?? entryAddress;
  const searchText = searchDraft ?? entryQuery;

  const personName =
    people.find((p) => p.id === personId)?.name ?? '';

  useEffect(() => {
    api
      .people()
      .then(setPeople)
      .catch(() =>
        setError('Cannot reach the API. Is it running on port 4000?'),
      );
  }, []);

  // Entries without an iframe never report scrolling; don't carry a stale number.
  useEffect(() => {
    scrollY.current = entryScroll;
  }, [entryId, entryScroll]);

  // Typed, a followed link, a search result, or a history jump:
  // ask for a page, show it, record the visit.
  const go = useCallback(
    async (rawAddress: string, via: Via) => {
      const address = normalizeAddress(rawAddress);
      if (!address || !personId) return;

      const mine = ++ticket.current;
      setLoading(true);
      setError(null);

      try {
        const page = await api.resolve(address);

        if (mine !== ticket.current) return;

        dispatch({
          type: 'navigate',
          entry: { kind: 'page', page },
          leavingScrollY: scrollY.current,
        });

        setAddressDraft(null);
        setSearchDraft(null);

        api
          .recordVisit(personId, address, via)
          .then(() => setVisitTick((t) => t + 1))
          .catch(() => {});
      } catch (e) {
        if (mine === ticket.current) {
          setError((e as Error).message);
        }
      } finally {
        if (mine === ticket.current) {
          setLoading(false);
        }
      }
    },
    [personId],
  );

  // A search is a navigation too: the results become an entry in the trail.
  const runSearch = useCallback(
    async (raw: string) => {
      const q = raw.trim();
      if (!q || !personId) return;

      const mine = ++ticket.current;
      setLoading(true);
      setError(null);

      try {
        const res = await api.search(q);

        if (mine !== ticket.current) return;

        dispatch({
          type: 'navigate',
          entry: {
            kind: 'search',
            query: res.query,
            results: res.results,
          },
          leavingScrollY: scrollY.current,
        });

        setAddressDraft(null);
        setSearchDraft(null);
      } catch (e) {
        if (mine === ticket.current) {
          setError((e as Error).message);
        }
      } finally {
        if (mine === ticket.current) {
          setLoading(false);
        }
      }
    },
    [personId],
  );

  // Back and Forward cancel anything still loading and record NO visit.
  const back = () => {
    ticket.current++;
    setLoading(false);
    setAddressDraft(null);
    setSearchDraft(null);

    dispatch({
      type: 'back',
      leavingScrollY: scrollY.current,
    });
  };

  const forward = () => {
    ticket.current++;
    setLoading(false);
    setAddressDraft(null);
    setSearchDraft(null);

    dispatch({
      type: 'forward',
      leavingScrollY: scrollY.current,
    });
  };

  const changePerson = (id: string) => {
    ticket.current++;
    setLoading(false);
    setError(null);
    setAddressDraft(null);
    setSearchDraft(null);

    dispatch({ type: 'reset' });
    setPersonId(id);
  };

  const togglePanel = (p: Exclude<Panel, 'none'>) =>
    setPanel((cur) => (cur === p ? 'none' : p));

  let content;

  if (!personId) {
    content = (
      <div className="notice">
        <h1>Welcome</h1>
        <p>Pick who is browsing to begin.</p>
      </div>
    );
  } else if (!entry) {
    content = (
      <div className="notice">
        <h1>New page</h1>
        <p>
          Type an address above, or start at{' '}
          <button
            className="linkish"
            onClick={() => go('front-page.zz', 'typed')}
          >
            front-page.zz
          </button>.
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
        onScroll={(y) => {
          scrollY.current = y;
        }}
        onNavigate={(address) => go(address, 'link')}
      />
    ) : (
      <Nowhere address={p.address} />
    );
  } else {
    content = (
      <SearchResults
        key={entry.id}
        query={entry.query}
        results={entry.results}
        scrollY={entry.scrollY}
        onScroll={(y) => {
          scrollY.current = y;
        }}
        onOpen={(address) => go(address, 'search')}
      />
    );
  }

  return (
    <div className="app">
      <header className="topbar">
        <strong className="brand">Small Web</strong>

        <PersonPicker
          people={people}
          value={personId}
          onChange={changePerson}
        />
      </header>

      <Toolbar
        canBack={canBack(nav)}
        canForward={canForward(nav)}
        onBack={back}
        onForward={forward}
      >
        <AddressBar
          value={addressText}
          disabled={!personId}
          loading={loading}
          onChange={setAddressDraft}
          onSubmit={(v) => go(v, 'typed')}
        />

        <SearchBar
          value={searchText}
          disabled={!personId}
          onChange={setSearchDraft}
          onSubmit={runSearch}
        />

        <button
          className="text"
          disabled={!personId}
          aria-pressed={panel === 'history'}
          onClick={() => togglePanel('history')}
        >
          History
        </button>

        <button
          className="text"
          disabled={!personId}
          aria-pressed={panel === 'publish'}
          onClick={() => togglePanel('publish')}
        >
          Publish
        </button>
      </Toolbar>

      {loading && <div className="loading-bar" />}

      {error && <div className="banner">{error}</div>}

      <main className="viewport">
        <div className="content">{content}</div>

        {personId && panel === 'history' && (
          <aside className="panel">
            <HistoryPanel
              personId={personId}
              refreshKey={visitTick}
              onJump={(address) => go(address, 'history')}
            />
          </aside>
        )}

        {personId && panel === 'publish' && (
          <aside className="panel">
            <PublishForm
              personId={personId}
              personName={personName}
              onOpen={(address) => {
                setPanel('none');
                go(address, 'typed');
              }}
            />
          </aside>
        )}
      </main>
    </div>
  );
}
