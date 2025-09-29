import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type CounselorAssignmentDocument = CounselorAssignment & Document;

@Schema({ timestamps: true })
export class CounselorAssignment {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  counselorId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  studentId: MongooseSchema.Types.ObjectId;

  @Prop()
  notes?: string;

  @Prop()
  expiresAt?: Date;
}

export const CounselorAssignmentSchema = SchemaFactory.createForClass(CounselorAssignment);

// Create compound index for unique constraint
CounselorAssignmentSchema.index({ counselorId: 1, studentId: 1 }, { unique: true });
