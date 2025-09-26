import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type JobDocument = Job & Document;

export enum LocationType {
  REMOTE = 'REMOTE',
  ONSITE = 'ONSITE',
  HYBRID = 'HYBRID',
}

export enum ExperienceLevel {
  ENTRY = 'ENTRY',
  JUNIOR = 'JUNIOR',
  MID = 'MID',
  SENIOR = 'SENIOR',
  LEAD = 'LEAD',
  EXECUTIVE = 'EXECUTIVE',
}

export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERNSHIP = 'INTERNSHIP',
  FREELANCE = 'FREELANCE',
}

@Schema({ timestamps: true })
export class Job {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  company: string;

  @Prop({ required: true })
  description: string;

  @Prop([String])
  requirements: string[];

  @Prop({ required: true })
  location: string;

  @Prop({ required: true, enum: LocationType })
  locationType: LocationType;

  @Prop()
  salaryMin?: number;

  @Prop()
  salaryMax?: number;

  @Prop({ required: true, enum: ExperienceLevel })
  experienceLevel: ExperienceLevel;

  // Job details
  @Prop([String])
  skills: string[];

  @Prop([String])
  benefits?: string[];

  @Prop()
  department?: string;

  @Prop({ required: true, enum: EmploymentType })
  employmentType: EmploymentType;

  // Posting information
  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  externalUrl?: string;

  @Prop()
  source?: string; // e.g., "company_website", "job_board"

  // Relations
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdBy: MongooseSchema.Types.ObjectId;

  @Prop()
  expiresAt?: Date;
}

export const JobSchema = SchemaFactory.createForClass(Job);
