import type { HistoryPage, Page, Person, PublishResult, SearchResult, Via } from './types';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.message) message = Array.isArray(body.message) ? body.message.join(', ') : body.message;
    } catch {
      /* keep the default message */
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export const api = {
  people: () => request<Person[]>('/people'),

  resolve: (address: string) =>
    request<Page>(`/resolve?address=${encodeURIComponent(address)}`),

  recordVisit: (personId: string, address: string, via: Via) =>
    request<{ id: string; found: boolean }>('/visits', {
      method: 'POST',
      body: JSON.stringify({ personId, address, via }),
    }),

  history: (personId: string, before?: string) =>
    request<HistoryPage>(
      `/history?personId=${personId}&limit=30` +
        (before ? `&before=${encodeURIComponent(before)}` : ''),
    ),

  search: (q: string) =>
    request<{ query: string; results: SearchResult[] }>(`/search?q=${encodeURIComponent(q)}`),

  publish: (body: { authorId: string; address: string; title: string; html: string }) =>
    request<PublishResult>('/sites', { method: 'POST', body: JSON.stringify(body) }),
};