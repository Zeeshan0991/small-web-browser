import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SiteDocument = HydratedDocument<Site>;

@Schema({ timestamps: true })
export class Site {
  // unique index: only one site can live at an address
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  address: string;

  @Prop({ type: Types.ObjectId, ref: 'Person', required: true, index: true })
  authorId: Types.ObjectId;

  // points at the newest revision (what a fresh visitor sees)
  @Prop({ type: Types.ObjectId, ref: 'SiteRevision' })
  currentRevisionId?: Types.ObjectId;
}

export const SiteSchema = SchemaFactory.createForClass(Site);