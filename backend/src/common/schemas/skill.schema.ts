import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SkillDocument = Skill & Document;

export enum SkillCategory {
  TECHNICAL = 'TECHNICAL',
  SOFT = 'SOFT',
  LANGUAGE = 'LANGUAGE',
  CERTIFICATION = 'CERTIFICATION',
  TOOL = 'TOOL',
}

@Schema({ timestamps: true })
export class Skill {
  @Prop({ required: true, unique: true, trim: true })
  name: string;

  @Prop({ required: true, enum: SkillCategory })
  category: SkillCategory;

  @Prop()
  description?: string;

  // Skill metadata
  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: 0 })
  popularity: number;
}

export const SkillSchema = SchemaFactory.createForClass(Skill);
