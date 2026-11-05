import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SiteRevisionDocument = HydratedDocument<SiteRevision>;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class SiteRevision {
  @Prop({ type: Types.ObjectId, ref: 'Site', required: true, index: true })
  siteId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  // the SANITIZED html (we clean it before saving, see Step 4)
  @Prop({ required: true })
  html: string;

  // the plain words of the page, used only for search
  @Prop({ required: true })
  text: string;
}

export const SiteRevisionSchema = SchemaFactory.createForClass(SiteRevision);

// Full-text search over what is written in the page.
// A match in the title counts 5x more than a match in the body.
SiteRevisionSchema.index(
  { title: 'text', text: 'text' },
  { weights: { title: 5, text: 1 }, name: 'page_text_search' },
);