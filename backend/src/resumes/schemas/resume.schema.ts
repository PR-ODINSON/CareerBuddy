import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ResumeDocument = Resume & Document;

@Schema({ timestamps: true })
export class Resume {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true })
  fileName: string;

  @Prop({ required: true })
  filePath: string;

  @Prop({ required: true })
  fileSize: number;

  @Prop({ required: true })
  mimeType: string;

  // Parsed content
  @Prop({ type: MongooseSchema.Types.Mixed })
  content?: any; // Raw parsed content from AI

  @Prop([String])
  skills?: string[]; // Extracted skills

  @Prop({ type: MongooseSchema.Types.Mixed })
  experience?: any; // Work experience data

  @Prop({ type: MongooseSchema.Types.Mixed })
  education?: any; // Education data

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 1 })
  version: number;
}

export const ResumeSchema = SchemaFactory.createForClass(Resume);

// Resume Feedback Schema
export enum FeedbackType {
  SUGGESTION = 'SUGGESTION',
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  INFO = 'INFO',
}

export enum FeedbackSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

@Schema({ timestamps: true })
export class ResumeFeedback {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Resume', required: true })
  resumeId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, enum: FeedbackType })
  type: FeedbackType;

  @Prop({ required: true })
  category: string; // e.g., "formatting", "content", "skills"

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, enum: FeedbackSeverity })
  severity: FeedbackSeverity;

  @Prop()
  suggestion?: string;

  // AI-generated or counselor feedback
  @Prop({ default: true })
  isAiGenerated: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  counselorId?: MongooseSchema.Types.ObjectId;

  // Position in resume (for specific feedback)
  @Prop()
  lineNumber?: number;

  @Prop()
  section?: string;

  @Prop({ default: false })
  isResolved: boolean;
}

export type ResumeFeedbackDocument = ResumeFeedback & Document;
export const ResumeFeedbackSchema = SchemaFactory.createForClass(ResumeFeedback);

// Resume Version Schema
@Schema({ timestamps: true })
export class ResumeVersion {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Resume', required: true })
  resumeId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  version: number;

  @Prop({ required: true })
  title: string;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  content: any;

  @Prop()
  changes?: string; // Description of changes made
}

export type ResumeVersionDocument = ResumeVersion & Document;
export const ResumeVersionSchema = SchemaFactory.createForClass(ResumeVersion);
