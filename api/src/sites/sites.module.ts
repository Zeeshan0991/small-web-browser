import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Site, SiteSchema } from './site.schema';
import { SiteRevision, SiteRevisionSchema } from './site-revision.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Site.name, schema: SiteSchema },
      { name: SiteRevision.name, schema: SiteRevisionSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class SitesModule {}