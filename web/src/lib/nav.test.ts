import { describe, expect, it } from 'vitest';
import { canBack, canForward, currentEntry, initialNav, navReducer, type NavState } from './nav';
import type { Page } from './types';

const page = (address: string): Page => ({ found: false, address });
const go = (s: NavState, address: string, leavingScrollY = 0) =>
  navReducer(s, { type: 'navigate', entry: { kind: 'page', page: page(address) }, leavingScrollY });
const back = (s: NavState, y = 0) => navReducer(s, { type: 'back', leavingScrollY: y });
const forward = (s: NavState, y = 0) => navReducer(s, { type: 'forward', leavingScrollY: y });
const at = (s: NavState) => {
  const e = currentEntry(s);
  return e && e.kind === 'page' ? e.page.address : null;
};

// a trail four deep: a -> b -> c -> d
const trail = () => go(go(go(go(initialNav, 'a.zz'), 'b.zz'), 'c.zz'), 'd.zz');

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
    expect(s.entries).toHaveLength(4); // nothing was added or lost
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
    let s = back(back(trail())); // standing on b, c and d still ahead
    s = go(s, 'e.zz');
    expect(s.entries.map((e) => (e.kind === 'page' ? e.page.address : ''))).toEqual([
      'a.zz', 'b.zz', 'e.zz',
    ]);
    expect(canForward(s)).toBe(false);
    expect(at(back(s))).toBe('b.zz');
  });

  it('remembers where you were scrolled to', () => {
    let s = go(initialNav, 'a.zz');
    s = go(s, 'b.zz', 120); // left a at 120
    s = back(s, 40); // left b at 40
    expect(currentEntry(s)?.scrollY).toBe(120); // back on a: restored
    s = forward(s, 0);
    expect(currentEntry(s)?.scrollY).toBe(40); // back on b: restored
  });

  it('treats asking for the current address as a reload', () => {
    let s = go(go(initialNav, 'a.zz'), 'b.zz');
    s = back(s); // on a, b ahead
    const before = currentEntry(s)!.id;
    s = go(s, 'a.zz');
    expect(s.entries).toHaveLength(2); // no duplicate entry
    expect(canForward(s)).toBe(true); // Forward survives a reload
    expect(currentEntry(s)!.id).not.toBe(before); // fresh content
    expect(currentEntry(s)!.scrollY).toBe(0);
  });

  it('can start with a leaving scroll and no page yet', () => {
    expect(at(go(initialNav, 'a.zz', 300))).toBe('a.zz');
  });
});