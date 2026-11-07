import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SiteRevision, SiteRevisionDocument } from '../sites/site-revision.schema';

/** A short excerpt around the first matching word. */
function makeSnippet(text: string, query: string): string {
  const terms = query.toLowerCase().replace(/["-]/g, ' ').split(/\s+/).filter(Boolean);
  const lower = text.toLowerCase();
  let at = -1;
  for (const term of terms) {
    const i = lower.indexOf(term);
    if (i !== -1 && (at === -1 || i < at)) at = i;
  }
  if (at === -1) return text.slice(0, 160) + (text.length > 160 ? '…' : '');
  const start = Math.max(0, at - 60);
  const end = Math.min(text.length, at + 140);
  return (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '');
}

@Injectable()
export class SearchService {
  constructor(@InjectModel(SiteRevision.name) private revisions: Model<SiteRevisionDocument>) {}

  async search(raw?: string) {
    const query = (raw ?? '').trim();
    if (!query) return { query: '', results: [] };
    if (query.length > 200) throw new BadRequestException('Query too long.');

    const rows = await this.revisions.aggregate([
      { $match: { $text: { $search: query } } },
      { $addFields: { score: { $meta: 'textScore' } } },
      { $sort: { score: -1 } },
      { $lookup: { from: 'sites', localField: 'siteId', foreignField: '_id', as: 'site' } },
      { $unwind: '$site' },
      // Old revisions must not show up: only a site's CURRENT revision is searchable.
      { $match: { $expr: { $eq: ['$site.currentRevisionId', '$_id'] } } },
      { $limit: 20 },
      { $project: { title: 1, text: 1, score: 1, address: '$site.address' } },
    ]);

    return {
      query,
      results: rows.map((r) => ({
        address: r.address as string,
        title: r.title as string,
        snippet: makeSnippet(r.text as string, query),
        revisionId: String(r._id),
        score: r.score as number,
      })),
    };
  }
}