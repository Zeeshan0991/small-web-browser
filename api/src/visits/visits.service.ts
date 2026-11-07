
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { normalizeAddress } from '../common/address';
import { isObjectId } from '../common/object-id';
import { Person, PersonDocument } from '../people/person.schema';
import { SiteRevision, SiteRevisionDocument } from '../sites/site-revision.schema';
import { SitesService } from '../sites/sites.service';
import { VISIT_VIA, Visit, VisitDocument } from './visit.schema';

export interface RecordVisitInput {
  personId?: string;
  address?: string;
  via?: string;
  revisionId?: string;
}

@Injectable()
export class VisitsService {
  constructor(
    @InjectModel(Visit.name) private visits: Model<VisitDocument>,
    @InjectModel(Person.name) private people: Model<PersonDocument>,
    @InjectModel(SiteRevision.name) private revisions: Model<SiteRevisionDocument>,
    private readonly sites: SitesService,
  ) {}

  async record(input: RecordVisitInput) {
    if (
      !isObjectId(input.personId) ||
      !(await this.people.exists({ _id: input.personId }))
    ) {
      throw new BadRequestException('Unknown person.');
    }

    if (!(VISIT_VIA as readonly string[]).includes(input.via ?? '')) {
      throw new BadRequestException(`via must be one of: ${VISIT_VIA.join(', ')}`);
    }

    const address = normalizeAddress(input.address ?? '');

    if (!address || address.length > 200) {
      throw new BadRequestException('Address is required (max 200 characters).');
    }

    // The SERVER decides whether the address exists.
    // The client cannot claim it.
    const page = await this.sites.resolve(address, input.revisionId);

    const visit = await this.visits.create({
      personId: new Types.ObjectId(input.personId),
      address: page.address,
      found: page.found,
      via: input.via as (typeof VISIT_VIA)[number],
      at: new Date(),
      ...(page.found
        ? {
            siteId: new Types.ObjectId(page.siteId),
            revisionId: new Types.ObjectId(page.revisionId),
          }
        : {}),
    });

    return {
      id: String(visit._id),
      address: page.address,
      found: page.found,
      revisionId: page.found ? page.revisionId : null,
    };
  }

  async history(personId: string, limitRaw?: string, before?: string) {
    if (!isObjectId(personId)) {
      throw new BadRequestException('personId is required.');
    }

    const limit = Math.min(
      Math.max(parseInt(limitRaw ?? '', 10) || 30, 1),
      100,
    );

    const filter: Record<string, unknown> = {
      personId: new Types.ObjectId(personId),
    };

    if (before) {
      const date = new Date(before);

      if (isNaN(date.getTime())) {
        throw new BadRequestException('before must be a date.');
      }

      filter.at = { $lt: date };
    }

    // Fetch one extra row to learn whether there is another page.
    const rows = await this.visits
      .find(filter)
      .sort({ at: -1, _id: -1 })
      .limit(limit + 1)
      .lean();

    const hasMore = rows.length > limit;
    const page = rows.slice(0, limit);

    // Keep only valid revision ObjectIds.
    // This also tells TypeScript the resulting array contains ObjectIds only.
    const revisionIds = page
      .map((r) => r.revisionId)
      .filter(
        (id): id is Types.ObjectId =>
          id !== undefined && id !== null,
      );

    const revs = await this.revisions
      .find(
        { _id: { $in: revisionIds } },
        { title: 1 },
      )
      .lean();

    const titles = new Map(
      revs.map((r) => [String(r._id), r.title]),
    );

    return {
      items: page.map((r) => ({
        id: String(r._id),
        address: r.address,
        found: r.found,
        via: r.via,
        at: r.at,
        revisionId: r.revisionId ? String(r.revisionId) : null,
        title: r.revisionId
          ? (titles.get(String(r.revisionId)) ?? null)
          : null,
      })),

      nextCursor: hasMore
        ? page[page.length - 1].at.toISOString()
        : null,
    };
  }
}
