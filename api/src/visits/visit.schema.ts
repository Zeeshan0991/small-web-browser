import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export const VISIT_VIA = ['typed', 'link', 'search', 'history'] as const;
export type VisitVia = (typeof VISIT_VIA)[number];

export type VisitDocument = HydratedDocument<Visit>;

@Schema()
export class Visit {
  @Prop({ type: Types.ObjectId, ref: 'Person', required: true })
  personId: Types.ObjectId;

  // exactly what was asked for, even if nothing lives there
  @Prop({ required: true })
  address: string;

  // only present when the address existed
  @Prop({ type: Types.ObjectId, ref: 'Site' })
  siteId?: Types.ObjectId;

  // the exact version they saw
  @Prop({ type: Types.ObjectId, ref: 'SiteRevision' })
  revisionId?: Types.ObjectId;

  // false = "Nowhere" (no such address)
  @Prop({ required: true })
  found: boolean;

  @Prop({ required: true, enum: VISIT_VIA })
  via: VisitVia;

  @Prop({ required: true })
  at: Date;
}

export const VisitSchema = SchemaFactory.createForClass(Visit);

// History is always "this person's visits, newest first".
VisitSchema.index({ personId: 1, at: -1 });