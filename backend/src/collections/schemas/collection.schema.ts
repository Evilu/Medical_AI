import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type CollectionDocument = HydratedDocument<Collection>;

@Schema({ timestamps: true, collection: "collections" })
export class Collection {
  @Prop({ required: true })
  name: string;

  @Prop({ default: "" })
  description: string;

  @Prop({ type: [String], default: [] })
  articlePmids: string[];
}

export const CollectionSchema = SchemaFactory.createForClass(Collection);
