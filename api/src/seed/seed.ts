import mongoose, { Types } from 'mongoose';
import { Person, PersonSchema } from '../people/person.schema';
import { Site, SiteSchema } from '../sites/site.schema';
import { SiteRevision, SiteRevisionSchema } from '../sites/site-revision.schema';
import { Visit, VisitSchema } from '../visits/visit.schema';
import { extractText, sanitizePage } from '../common/sanitize';
import { normalizeAddress } from '../common/address';
import { BASE_TIME, idFor, minutesAfter } from './ids';
import { PEOPLE } from './data/people';
import { SITES } from './data/sites';
import { STEP_SECONDS, TRAILS } from './data/trails';

async function main() {
  const uri = process.env.MONGO_URI ?? 'mongodb://localhost:27017/smallweb';
  await mongoose.connect(uri);

  const PersonModel = mongoose.model(Person.name, PersonSchema);
  const SiteModel = mongoose.model(Site.name, SiteSchema);
  const RevisionModel = mongoose.model(SiteRevision.name, SiteRevisionSchema);
  const VisitModel = mongoose.model(Visit.name, VisitSchema);

  // Make sure unique + text indexes exist before we write.
  await Promise.all([
    PersonModel.createIndexes(), SiteModel.createIndexes(),
    RevisionModel.createIndexes(), VisitModel.createIndexes(),
  ]);

  // timestamps:false => we control createdAt ourselves, so data is deterministic
  const opts = { timestamps: false } as const;

  // ---- People ------------------------------------------------------------
  await PersonModel.bulkWrite(
    PEOPLE.map((name) => ({
      replaceOne: {
        filter: { _id: idFor(`person:${name}`) },
        replacement: { name },
        upsert: true,
      },
    })),
    opts,
  );

  // ---- Sites + their first revision --------------------------------------
  const siteInfo = new Map<string, { siteId: Types.ObjectId; revisionId: Types.ObjectId }>();
  const siteOps: any[] = [];
  const revisionOps: any[] = [];

  SITES.forEach((s, i) => {
    const address = normalizeAddress(s.address);
    const siteId = idFor(`site:${address}`);
    const revisionId = idFor(`revision:${address}:1`);
    const createdAt = minutesAfter(BASE_TIME, -600 + i); // published "yesterday"
    siteInfo.set(address, { siteId, revisionId });

    revisionOps.push({
      replaceOne: {
        filter: { _id: revisionId },
        replacement: {
          siteId,
          title: s.title,
          html: sanitizePage(s.html), // stored clean
          text: extractText(s.html),  // for search
          createdAt,
        },
        upsert: true,
      },
    });

    siteOps.push({
      replaceOne: {
        filter: { _id: siteId },
        replacement: {
          address,
          authorId: idFor(`person:${s.author}`),
          currentRevisionId: revisionId,
          createdAt,
          updatedAt: createdAt,
        },
        upsert: true,
      },
    });
  });

  await RevisionModel.bulkWrite(revisionOps, opts);
  await SiteModel.bulkWrite(siteOps, opts);

  // ---- Visits (the history) ----------------------------------------------
  const visitOps: any[] = [];
  TRAILS.forEach((trail, t) => {
    trail.steps.forEach(([rawAddress, via], n) => {
      const address = normalizeAddress(rawAddress);
      const info = siteInfo.get(address); // undefined => nowhere
      const at = new Date(
        minutesAfter(BASE_TIME, trail.startMinute).getTime() + n * STEP_SECONDS * 1000,
      );
      visitOps.push({
        replaceOne: {
          filter: { _id: idFor(`visit:${trail.person}:${t}:${n}`) },
          replacement: {
            personId: idFor(`person:${trail.person}`),
            address,
            found: !!info,
            via,
            at,
            ...(info ? { siteId: info.siteId, revisionId: info.revisionId } : {}),
          },
          upsert: true,
        },
      });
    });
  });
  await VisitModel.bulkWrite(visitOps, opts);

  // ---- Report ------------------------------------------------------------
  console.log('Seed complete:');
  console.log('  people  ', await PersonModel.countDocuments());
  console.log('  sites   ', await SiteModel.countDocuments());
  console.log('  visits  ', await VisitModel.countDocuments());

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});