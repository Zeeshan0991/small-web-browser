import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { isValidAddress, normalizeAddress } from '../common/address';
import { isObjectId } from '../common/object-id';
import { extractText, sanitizePage } from '../common/sanitize';
import { Person, PersonDocument } from '../people/person.schema';
import { Site, SiteDocument } from './site.schema';
import { SiteRevision, SiteRevisionDocument } from './site-revision.schema';

const MAX_HTML = 50_000;
const MAX_TITLE = 120;

export type ResolveResult =
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

export interface PublishInput {
  authorId?: string;
  address?: string;
  title?: string;
  html?: string;
}

@Injectable()
export class SitesService {
  constructor(
    @InjectModel(Site.name) private sites: Model<SiteDocument>,
    @InjectModel(SiteRevision.name) private revisions: Model<SiteRevisionDocument>,
    @InjectModel(Person.name) private people: Model<PersonDocument>,
  ) {}

  /**
   * Ask for an address. If revisionId is given (and belongs to that site),
   * return exactly that version. Otherwise return the newest one.
   */
  async resolve(rawAddress: string, revisionId?: string): Promise<ResolveResult> {
    const address = normalizeAddress(rawAddress);
    const site = await this.sites.findOne({ address }).lean();
    if (!site) return { found: false, address };

    let revision = null;
    if (isObjectId(revisionId)) {
      revision = await this.revisions.findOne({ _id: revisionId, siteId: site._id }).lean();
    }
    if (!revision) {
      revision = await this.revisions.findById(site.currentRevisionId).lean();
    }
    if (!revision) return { found: false, address };

    const author = await this.people.findById(site.authorId).lean();
    return {
      found: true,
      address,
      siteId: String(site._id),
      revisionId: String(revision._id),
      isLatest: String(revision._id) === String(site.currentRevisionId),
      title: revision.title,
      html: revision.html,
      author: author?.name ?? 'unknown',
    };
  }

  async publish(input: PublishInput) {
    // 1. Validate everything before touching the database.
    const address = normalizeAddress(input.address ?? '');
    if (!isValidAddress(address)) {
      throw new BadRequestException('Address must look like name.zz (letters, digits, hyphens).');
    }
    const title = (input.title ?? '').trim();
    if (!title || title.length > MAX_TITLE) {
      throw new BadRequestException(`Title is required (max ${MAX_TITLE} characters).`);
    }
    const rawHtml = input.html ?? '';
    if (!rawHtml.trim() || rawHtml.length > MAX_HTML) {
      throw new BadRequestException(`HTML is required (max ${MAX_HTML} characters).`);
    }
    if (!isObjectId(input.authorId)) {
      throw new BadRequestException('authorId is required.');
    }
    const author = await this.people.findById(input.authorId).lean();
    if (!author) throw new BadRequestException('Unknown author.');

    // 2. Clean the HTML. We store (and index for search) the CLEAN version only.
    const html = sanitizePage(rawHtml);
    const text = extractText(html);
    if (!text) {
      throw new BadRequestException('After cleaning, the page has no readable text.');
    }

    // 3a. Address already taken: same author adds a revision, anyone else is refused.
    const existing = await this.sites.findOne({ address });
    if (existing) {
      if (!existing.authorId.equals(author._id)) {
        throw new ConflictException(`${address} already belongs to another author.`);
      }
      const rev = await this.revisions.create({ siteId: existing._id, title, html, text });
      existing.currentRevisionId = rev._id;
      await existing.save();
      return { address, revisionId: String(rev._id), created: false };
    }

    // 3b. New address. The unique index decides races between two publishers.
    const siteId = new Types.ObjectId();
    const revisionId = new Types.ObjectId();
    try {
      await this.sites.create({
        _id: siteId,
        address,
        authorId: author._id,
        currentRevisionId: revisionId,
      });
    } catch (err: any) {
      if (err?.code === 11000) {
        throw new ConflictException(`${address} was just taken.`);
      }
      throw err;
    }
    await this.revisions.create({ _id: revisionId, siteId, title, html, text });
    return { address, revisionId: String(revisionId), created: true };
  }
}