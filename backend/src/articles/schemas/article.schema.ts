import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type ArticleDocument = HydratedDocument<Article>;

@Schema({ collection: "pubmed_articles" })
export class Article {
  @Prop({ required: true })
  pmid: string;

  @Prop({ required: true })
  title: string;

  @Prop({ default: "" })
  abstract: string;

  @Prop({ default: "" })
  authors: string;

  @Prop({ default: "" })
  journal: string;

  @Prop()
  year: number;

  @Prop({ default: "" })
  doi: string;

  @Prop({ type: Number, default: null })
  sjr_quartile: number | null;

  @Prop({ type: Number, default: null })
  sjr_rank: number | null;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);
// Do NOT add a text index here — already created by load_data.py
