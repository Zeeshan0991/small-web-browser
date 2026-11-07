'use client';
import { useState } from 'react';
import { api } from '@/lib/api';

interface Props {
  personId: string;
  personName: string;
  onOpen: (address: string) => void;
}

const EXAMPLE = `<h1>Rock Pools After Dark</h1>
<p>Notes from a night walk along the shore. The pools look different with a
torch: the anemones glow and the crabs come out to feed.</p>
<p>Read the daytime version at <a href="tidepool.zz">tidepool.zz</a>, or follow
a rumour to <a href="deep-water.zz">deep-water.zz</a>.</p>`;

export default function PublishForm({ personId, personName, onOpen }: Props) {
  const [address, setAddress] = useState('');
  const [title, setTitle] = useState('');
  const [html, setHtml] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ address: string; created: boolean } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setDone(null);
    try {
      const res = await api.publish({ authorId: personId, address, title, html });
      setDone({ address: res.address, created: res.created });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="panel-body publish" onSubmit={submit}>
      <h2>Publish a site</h2>
      <p className="hint">Publishing as <strong>{personName}</strong>. Scripts, images, forms and styles are removed.</p>

      <label>Address
        <input value={address} onChange={(e) => setAddress(e.target.value)}
          placeholder="mysite.zz" spellCheck={false} />
      </label>
      <label>Title
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="My Site" />
      </label>
      <label>HTML
        <textarea value={html} onChange={(e) => setHtml(e.target.value)} rows={10}
          placeholder="<h1>Hello</h1><p>…</p>" spellCheck={false} />
      </label>

      <div className="row">
        <button type="submit" disabled={busy}>{busy ? 'Publishing…' : 'Publish'}</button>
        <button type="button" onClick={() => setHtml(EXAMPLE)}>Fill example</button>
      </div>

      {error && <div className="banner">{error}</div>}
      {done && (
        <div className="ok">
          {done.created ? 'Published' : 'New version published'}: <code>{done.address}</code>{' '}
          <button type="button" className="linkish" onClick={() => onOpen(done.address)}>Open it</button>
        </div>
      )}
    </form>
  );
}