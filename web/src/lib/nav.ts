import type { Page, SearchResult } from './types';

// One stop in the trail. Each stores a SNAPSHOT of what was shown,
// plus how far down the reader had scrolled when they left.
export interface PageEntry {
  id: number;
  kind: 'page';
  page: Page;
  scrollY: number;
}

export interface SearchEntry {
  id: number;
  kind: 'search';
  query: string;
  results: SearchResult[];
  scrollY: number;
}

export type Entry = PageEntry | SearchEntry;

// What callers hand us: no id, no scroll (we assign those).
export type NewEntry =
  | { kind: 'page'; page: Page }
  | { kind: 'search'; query: string; results: SearchResult[] };

export interface NavState {
  entries: Entry[];
  index: number; // which entry is showing (-1 = nothing yet)
  nextId: number;
}

export const initialNav: NavState = { entries: [], index: -1, nextId: 1 };

export type NavAction =
  | { type: 'navigate'; entry: NewEntry; leavingScrollY: number }
  | { type: 'back'; leavingScrollY: number }
  | { type: 'forward'; leavingScrollY: number }
  | { type: 'restore'; state: NavState }
  | { type: 'reset' };

function withScroll(entries: Entry[], index: number, y: number): Entry[] {
  if (index < 0 || index >= entries.length) return entries;
  return entries.map((e, i) => (i === index ? { ...e, scrollY: y } : e));
}

function sameAddress(current: Entry | undefined, next: NewEntry): boolean {
  return (
    current?.kind === 'page' &&
    next.kind === 'page' &&
    current.page.address === next.page.address
  );
}

export function navReducer(state: NavState, action: NavAction): NavState {
  switch (action.type) {
    case 'navigate': {
      // 1. Remember where the reader was on the page they are leaving.
      const saved = withScroll(state.entries, state.index, action.leavingScrollY);
      const entry = { ...action.entry, id: state.nextId, scrollY: 0 } as Entry;

      // 2. Asking again for the page you are already on is a reload:
      // replace it in place and keep Forward, like a real browser.
      if (sameAddress(saved[state.index], action.entry)) {
        const entries = saved.slice();
        entries[state.index] = entry;
        return { entries, index: state.index, nextId: state.nextId + 1 };
      }

      // 3. Anything ahead of us is thrown away.
      const entries = [...saved.slice(0, state.index + 1), entry];
      return { entries, index: entries.length - 1, nextId: state.nextId + 1 };
    }

    case 'back': {
      if (state.index <= 0) return state;
      return {
        ...state,
        entries: withScroll(state.entries, state.index, action.leavingScrollY),
        index: state.index - 1,
      };
    }

    case 'forward': {
      if (state.index >= state.entries.length - 1) return state;
      return {
        ...state,
        entries: withScroll(state.entries, state.index, action.leavingScrollY),
        index: state.index + 1,
      };
    }

    case 'restore':
      return action.state;

    case 'reset':
      return initialNav;
  }
}

export const currentEntry = (s: NavState): Entry | null =>
  s.entries[s.index] ?? null;

export const canBack = (s: NavState): boolean => s.index > 0;

export const canForward = (s: NavState): boolean =>
  s.index < s.entries.length - 1;

/** Apply the live scroll position to the current entry (used when saving). */
export function withCurrentScroll(state: NavState, y: number): NavState {
  return {
    ...state,
    entries: withScroll(state.entries, state.index, y),
  };
}

/** Check saved data before trusting it. Anything odd is ignored, never crashed on. */
export function isNavState(x: unknown): x is NavState {
  const s = x as NavState;

  return (
    !!s &&
    Array.isArray(s.entries) &&
    typeof s.index === 'number' &&
    typeof s.nextId === 'number' &&
    s.index >= -1 &&
    s.index < s.entries.length &&
    s.entries.every(
      (e) =>
        !!e &&
        typeof e.id === 'number' &&
        typeof e.scrollY === 'number' &&
        (e.kind === 'page' || e.kind === 'search'),
    )
  );
}