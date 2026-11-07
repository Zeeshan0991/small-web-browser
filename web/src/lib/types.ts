export type Via = 'typed' | 'link' | 'search' | 'history';

export interface Person {
  id: string;
  name: string;
}

export type Page =
  | { found: false; address: string }
  | {
      found: true;
      address: string;
      siteId: string;
      revisionId: string;
      isLatest: boolean;
      title: string;
      html: string;
      author: string;
    };

export interface SearchResult {
  address: string;
  title: string;
  snippet: string;
  revisionId: string;
  score: number;
}