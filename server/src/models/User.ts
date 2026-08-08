import { Schema, model, Document, Model } from 'mongoose';

export type UserRole = 'admin' | 'student' | 'superadmin';

export interface IUser {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isFirstLogin?: boolean;
  isBlocked?: boolean;
  sessionVersion?: number;
  avatarUrl?: string;
  themePreference?: 'light' | 'dark';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserDocument extends IUser, Document {}

export type IUserModel = Model<IUserDocument>;

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
    },
    role: {
      type: String,
      enum: ['student', 'admin', 'superadmin'],
      default: 'student',
      required: true,
    },
    themePreference: {
      type: String,
      enum: ['light', 'dark'],
      default: 'dark',
    },
    isFirstLogin: {
      type: Boolean,
      default: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    sessionVersion: {
      type: Number,
      default: 0,
    },
    avatarUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent passwordHash from being returned in JSON by default
userSchema.set('toJSON', {
  transform: (_doc: Document, ret: Record<string, any>) => {
    delete ret.passwordHash;
    return ret;
  },
});

export const User = model<IUserDocument, IUserModel>('User', userSchema);
export default User;
