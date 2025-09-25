import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

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

  @Prop({ required: true, enum: ['STUDENT', 'ADMIN'], default: 'STUDENT' })
  role: string;

  @Prop({ required: true, trim: true })
  university: string;

  @Prop({ required: true, trim: true })
  major: string;

  @Prop({ required: true })
  graduationYear: number;

  @Prop({ trim: true })
  currentYear?: string;

  @Prop({ type: Number, min: 0, max: 4.0 })
  gpa?: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop()
  emailVerificationToken?: string;

  @Prop()
  passwordResetToken?: string;

  @Prop()
  passwordResetExpires?: Date;

  @Prop()
  lastLogin?: Date;

  @Prop()
  profilePicture?: string;

  @Prop()
  bio?: string;

  @Prop([String])
  skills?: string[];

  @Prop([String])
  interests?: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
