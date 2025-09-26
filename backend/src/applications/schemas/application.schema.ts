import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ApplicationDocument = Application & Document;

export enum ApplicationStatus {
  APPLIED = 'APPLIED',
  REVIEWING = 'REVIEWING',
  PHONE_SCREEN = 'PHONE_SCREEN',
  INTERVIEW = 'INTERVIEW',
  OFFER = 'OFFER',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

@Schema({ timestamps: true })
export class Application {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Job', required: true })
  jobId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Resume' })
  resumeId?: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, enum: ApplicationStatus, default: ApplicationStatus.APPLIED })
  status: ApplicationStatus;

  @Prop()
  coverLetter?: string;

  @Prop()
  notes?: string;

  // Timeline tracking
  @Prop({ default: Date.now })
  appliedAt: Date;
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);

// Interview Schema
export enum InterviewType {
  PHONE = 'PHONE',
  VIDEO = 'VIDEO',
  ONSITE = 'ONSITE',
  TECHNICAL = 'TECHNICAL',
  BEHAVIORAL = 'BEHAVIORAL',
  FINAL = 'FINAL',
}

export enum InterviewStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  RESCHEDULED = 'RESCHEDULED',
}

@Schema({ timestamps: true })
export class Interview {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Application', required: true })
  applicationId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, enum: InterviewType })
  type: InterviewType;

  @Prop({ required: true })
  scheduledAt: Date;

  @Prop()
  duration?: number; // minutes

  @Prop()
  location?: string;

  @Prop()
  interviewerName?: string;

  @Prop()
  interviewerEmail?: string;

  @Prop({ required: true, enum: InterviewStatus, default: InterviewStatus.SCHEDULED })
  status: InterviewStatus;

  @Prop()
  notes?: string;

  @Prop()
  feedback?: string;
}

export type InterviewDocument = Interview & Document;
export const InterviewSchema = SchemaFactory.createForClass(Interview);
