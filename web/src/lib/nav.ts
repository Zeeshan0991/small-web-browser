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
      //    replace it in place and keep Forward, like a real browser.
      if (sameAddress(saved[state.index], action.entry)) {
        const entries = saved.slice();
        entries[state.index] = entry;
        return { entries, index: state.index, nextId: state.nextId + 1 };
      }

      // 3. Anything else: everything ahead of us is thrown away ("forward
      //    can be lost"), then the new entry is added.
      const entries = [...saved.slice(0, state.index + 1), entry];
      return { entries, index: entries.length - 1, nextId: state.nextId + 1 };
    }

    case 'back': {
      if (state.index <= 0) return state; // nothing behind us
      return {
        ...state,
        entries: withScroll(state.entries, state.index, action.leavingScrollY),
        index: state.index - 1,
      };
    }

    case 'forward': {
      if (state.index >= state.entries.length - 1) return state; // nothing ahead
      return {
        ...state,
        entries: withScroll(state.entries, state.index, action.leavingScrollY),
        index: state.index + 1,
      };
    }

    case 'reset':
      return initialNav;
  }
}

export const currentEntry = (s: NavState): Entry | null => s.entries[s.index] ?? null;
export const canBack = (s: NavState): boolean => s.index > 0;
export const canForward = (s: NavState): boolean => s.index < s.entries.length - 1;