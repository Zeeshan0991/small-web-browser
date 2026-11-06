
import sanitizeHtml, { Transformer } from 'sanitize-html';
import { isValidAddress, normalizeAddress } from './address';

// LAYER 1 of containing HTML we did not write: an allowlist.
// Anything not listed here is removed. There is no blocklist to forget to update.
const ALLOWED_TAGS = [
  'h1', 'h2', 'h3', 'h4', 'p', 'a', 'ul', 'ol', 'li',
  'em', 'strong', 'blockquote', 'pre', 'code', 'br', 'hr', 'span',
];

export function sanitizePage(rawHtml: string): string {
  return sanitizeHtml(rawHtml, {
    allowedTags: ALLOWED_TAGS,

    // Only <a> may carry attributes, and only these two.
    allowedAttributes: { a: ['href', 'data-address'] },

    // No schemes at all: we never allow http:, javascript:, data:, etc.
    allowedSchemes: [],
    allowProtocolRelative: false,

    transformTags: {
      // Rewrite every link. A link is either a valid "name.zz" address
      // or it stops being a link and becomes plain text.
      a: (_tag, attribs): ReturnType<Transformer> => {
        const address = normalizeAddress(attribs.href ?? '');

        if (isValidAddress(address)) {
          return {
            tagName: 'a',
            attribs: {
              href: '#',
              'data-address': address,
            },
          };
        }

        return {
          tagName: 'span',
          attribs: {},
        };
      },
    },

    // Dangerous tags lose their contents too, not just the tags.
    disallowedTagsMode: 'discard',
  });
}

/** Plain words of a page, used only for search. */
export function extractText(rawHtml: string): string {
  const spaced = rawHtml.replace(
    /<\/(p|h[1-6]|li|blockquote|pre|ul|ol)>/gi,
    '$& ',
  );

  const stripped = sanitizeHtml(spaced, {
    allowedTags: [],
    allowedAttributes: {},
  });

  return stripped
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}
