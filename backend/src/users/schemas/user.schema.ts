import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  STUDENT = 'STUDENT',
  COUNSELOR = 'COUNSELOR',
  ADMIN = 'ADMIN',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ required: true, enum: UserRole, default: UserRole.STUDENT })
  role: UserRole;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop()
  avatar?: string;

  @Prop()
  phone?: string;

  @Prop()
  bio?: string;

  @Prop()
  emailVerificationToken?: string;

  @Prop()
  passwordResetToken?: string;

  @Prop()
  passwordResetExpires?: Date;

  @Prop()
  lastLogin?: Date;

  // Student-specific fields embedded
  @Prop()
  university?: string;

  @Prop()
  major?: string;

  @Prop()
  graduationYear?: number;

  @Prop({ type: Number, min: 0, max: 4.0 })
  gpa?: number;

  @Prop()
  linkedinUrl?: string;

  @Prop()
  githubUrl?: string;

  @Prop()
  portfolioUrl?: string;

  @Prop([String])
  targetRoles?: string[];

  @Prop([String])
  preferredIndustries?: string[];

  @Prop([String])
  locationPreferences?: string[];

  @Prop()
  salaryExpectation?: number;

  // Counselor-specific fields embedded
  @Prop([String])
  specialization?: string[];

  @Prop()
  experience?: number; // years of experience

  @Prop()
  certification?: string;

  @Prop({ default: 0 })
  rating?: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
