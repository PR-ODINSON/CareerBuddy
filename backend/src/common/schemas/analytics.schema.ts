import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type UserAnalyticsDocument = UserAnalytics & Document;

@Schema({ timestamps: true })
export class UserAnalytics {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  // Activity tracking
  @Prop({ required: true })
  action: string; // e.g., "resume_upload", "job_apply", "session_book"

  @Prop({ type: MongooseSchema.Types.Mixed })
  metadata?: any; // Additional data about the action

  @Prop()
  ipAddress?: string;

  @Prop()
  userAgent?: string;
}

export const UserAnalyticsSchema = SchemaFactory.createForClass(UserAnalytics);

// Counseling Session Schema
export enum SessionType {
  RESUME_REVIEW = 'RESUME_REVIEW',
  CAREER_PLANNING = 'CAREER_PLANNING',
  INTERVIEW_PREP = 'INTERVIEW_PREP',
  JOB_SEARCH = 'JOB_SEARCH',
  GENERAL = 'GENERAL',
}

export enum SessionStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

@Schema({ timestamps: true })
export class CounselingSession {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  studentId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  counselorId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ required: true, enum: SessionType })
  type: SessionType;

  @Prop({ required: true, enum: SessionStatus, default: SessionStatus.SCHEDULED })
  status: SessionStatus;

  @Prop({ required: true })
  scheduledAt: Date;

  @Prop({ required: true })
  duration: number; // minutes

  @Prop()
  notes?: string;

  @Prop()
  feedback?: string;

  @Prop({ min: 1, max: 5 })
  rating?: number; // 1-5 rating from student
}

export type CounselingSessionDocument = CounselingSession & Document;
export const CounselingSessionSchema = SchemaFactory.createForClass(CounselingSession);
