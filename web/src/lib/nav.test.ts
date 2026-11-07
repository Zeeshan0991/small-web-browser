import { describe, expect, it } from 'vitest';
import {
  canBack,
  canForward,
  currentEntry,
  initialNav,
  isNavState,
  navReducer,
  withCurrentScroll,
  type NavState,
} from './nav';
import type { Page } from './types';

const page = (address: string): Page => ({ found: false, address });

const go = (s: NavState, address: string, leavingScrollY = 0) =>
  navReducer(s, {
    type: 'navigate',
    entry: { kind: 'page', page: page(address) },
    leavingScrollY,
  });

const back = (s: NavState, y = 0) =>
  navReducer(s, { type: 'back', leavingScrollY: y });

const forward = (s: NavState, y = 0) =>
  navReducer(s, { type: 'forward', leavingScrollY: y });

const at = (s: NavState) => {
  const e = currentEntry(s);
  return e && e.kind === 'page' ? e.page.address : null;
};

// A trail four deep: a -> b -> c -> d
const trail = () =>
  go(go(go(go(initialNav, 'a.zz'), 'b.zz'), 'c.zz'), 'd.zz');

describe('navigation', () => {
  it('starts empty and cannot go anywhere', () => {
    expect(currentEntry(initialNav)).toBeNull();
    expect(canBack(initialNav)).toBe(false);
    expect(canForward(initialNav)).toBe(false);
  });

  it('builds a trail four deep', () => {
    const s = trail();

    expect(s.entries).toHaveLength(4);
    expect(at(s)).toBe('d.zz');
    expect(canBack(s)).toBe(true);
    expect(canForward(s)).toBe(false);
  });

  it('back and forward only move along the trail', () => {
    let s = back(back(trail()));

    expect(at(s)).toBe('b.zz');
    expect(s.entries).toHaveLength(4);
    expect(canForward(s)).toBe(true);

    s = forward(s);

    expect(at(s)).toBe('c.zz');
  });

  it('does nothing at either end', () => {
    const start = go(initialNav, 'a.zz');

    expect(back(start)).toBe(start);

    const end = trail();

    expect(forward(end)).toBe(end);
  });

  it('loses Forward when you navigate from the middle', () => {
    let s = back(back(trail()));

    s = go(s, 'e.zz');

    expect(
      s.entries.map((e) =>
        e.kind === 'page' ? e.page.address : '',
      ),
    ).toEqual(['a.zz', 'b.zz', 'e.zz']);

    expect(canForward(s)).toBe(false);
    expect(at(back(s))).toBe('b.zz');
  });

  it('remembers where you were scrolled to', () => {
    let s = go(initialNav, 'a.zz');

    s = go(s, 'b.zz', 120);
    s = back(s, 40);

    expect(currentEntry(s)?.scrollY).toBe(120);

    s = forward(s, 0);

    expect(currentEntry(s)?.scrollY).toBe(40);
  });

  it('treats asking for the current address as a reload', () => {
    let s = go(go(initialNav, 'a.zz'), 'b.zz');

    s = back(s);

    const before = currentEntry(s)!.id;

    s = go(s, 'a.zz');

    expect(s.entries).toHaveLength(2);
    expect(canForward(s)).toBe(true);
    expect(currentEntry(s)!.id).not.toBe(before);
    expect(currentEntry(s)!.scrollY).toBe(0);
  });

  it('can start with a leaving scroll and no page yet', () => {
    expect(at(go(initialNav, 'a.zz', 300))).toBe('a.zz');
  });
});

describe('surviving a refresh', () => {
  it('a saved trail restores with Back, Forward and scroll intact', () => {
    let s = go(go(go(initialNav, 'a.zz'), 'b.zz'), 'c.zz');

    s = back(s); // Standing on b, c ahead

    const saved = JSON.parse(
      JSON.stringify(withCurrentScroll(s, 75)),
    );

    expect(isNavState(saved)).toBe(true);

    const restored = navReducer(initialNav, {
      type: 'restore',
      state: saved,
    });

    expect(at(restored)).toBe('b.zz');
    expect(currentEntry(restored)?.scrollY).toBe(75);
    expect(canBack(restored)).toBe(true);
    expect(canForward(restored)).toBe(true);
  });

  it('rejects damaged saved data', () => {
    expect(isNavState(null)).toBe(false);

    expect(
      isNavState({
        entries: [],
        index: 3,
        nextId: 1,
      }),
    ).toBe(false);

    expect(
      isNavState({
        entries: [{ id: 1, kind: 'evil', scrollY: 0 }],
        index: 0,
        nextId: 2,
      }),
    ).toBe(false);
  });
});