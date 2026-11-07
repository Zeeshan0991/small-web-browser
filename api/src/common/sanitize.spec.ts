import { extractText, sanitizePage } from './sanitize';

describe('sanitizePage (containing HTML we did not write)', () => {
  it('removes scripts and everything inside them', () => {
    const out = sanitizePage('<h1>Hi</h1><script>alert(1)</script>');
    expect(out).toContain('<h1>Hi</h1>');
    expect(out).not.toContain('script');
    expect(out).not.toContain('alert');
  });

  it('removes images, iframes, forms, styles and event handlers', () => {
    const out = sanitizePage(
      '<p onclick="x()">a</p><img src=x onerror=alert(1)><iframe src="http://evil.com"></iframe>' +
        '<form action="http://evil.com"><input></form><style>body{display:none}</style>',
    );
    for (const bad of ['<img', 'iframe', '<form', '<input', '<style', 'onclick', 'onerror']) {
      expect(out).not.toContain(bad);
    }
  });

  it('turns non-address links into plain text', () => {
    for (const href of ['javascript:alert(1)', 'http://evil.com', 'data:text/html,x', '//evil.com']) {
      const out = sanitizePage(`<a href="${href}">click</a>`);
      expect(out).toBe('<span>click</span>');
    }
  });

  it('rewrites a valid address link and keeps dead addresses linkable', () => {
    const out = sanitizePage('<a href=" TidePool.ZZ ">tides</a> <a href="never-existed.zz">x</a>');
    expect(out).toContain('data-address="tidepool.zz"');
    expect(out).toContain('data-address="never-existed.zz"');
    expect(out).toContain('href="#"');
  });

  it('never lets a link carry a target, class or style', () => {
    const out = sanitizePage('<a href="a.zz" target="_top" style="x:y" class="z">a</a>');
    expect(out).not.toMatch(/target|style|class/);
  });
});

describe('extractText', () => {
  it('returns readable words with spaces between blocks', () => {
    expect(extractText('<p>Hello</p><p>World</p>')).toBe('Hello World');
  });
});