import { createHash } from 'crypto';
import { Types } from 'mongoose';

/** Same key in, same ObjectId out. Always. */
export function idFor(key: string): Types.ObjectId {
  const hex = createHash('sha1').update(key).digest('hex').slice(0, 24);
  return new Types.ObjectId(hex);
}

// Every seeded timestamp is an offset from this one fixed moment.
export const BASE_TIME = new Date('2026-11-05T09:00:00.000Z');

export function minutesAfter(base: Date, minutes: number): Date {
  return new Date(base.getTime() + minutes * 60_000);
}