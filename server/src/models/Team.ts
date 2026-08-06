import { Schema, model, Document, Model, Types } from 'mongoose';

export type TeamStatus = 'Pending' | 'Approved' | 'Eliminated' | 'Safe' | 'Danger' | 'Qualified';

export interface ITeamLeader {
  name: string;
  email: string;
  phone?: string;
  userId?: Types.ObjectId;
}

export interface ITeamMember {
  name: string;
  email: string;
  role?: string;
  userId?: Types.ObjectId;
}

export interface IAdvantageItem {
  advantage: string;
  quantity: number;
  grantedAt?: Date;
}

export interface ITeam {
  teamName: string;
  leader: ITeamLeader;
  members: ITeamMember[];
  themeColor: string;
  logoUrl?: string;
  status: TeamStatus;
  residenceType?: 'Hosteller' | 'Day Scholar';
  advantages: IAdvantageItem[];
  immunity: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITeamDocument extends ITeam, Document {}

export type ITeamModel = Model<ITeamDocument>;

const advantageSchema = new Schema<IAdvantageItem>(
  {
    advantage: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1, min: 0 },
    grantedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const leaderSchema = new Schema<ITeamLeader>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false }
);

const memberSchema = new Schema<ITeamMember>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    role: { type: String, trim: true, default: 'Member' },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false }
);

const teamSchema = new Schema<ITeamDocument>(
  {
    teamName: {
      type: String,
      required: [true, 'Team name is required'],
      unique: true,
      trim: true,
    },
    leader: {
      type: leaderSchema,
      required: [true, 'Leader details are required'],
    },
    members: {
      type: [memberSchema],
      default: [],
    },
    themeColor: {
      type: String,
      default: '#FF0055', // Vibrant Carnival default color
      trim: true,
    },
    logoUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Eliminated', 'Safe', 'Danger', 'Qualified'],
      default: 'Pending',
      required: true,
    },
    residenceType: {
      type: String,
      enum: ['Hosteller', 'Day Scholar'],
      default: 'Hosteller',
    },
    advantages: {
      type: [advantageSchema],
      default: [],
    },
    immunity: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Team = model<ITeamDocument, ITeamModel>('Team', teamSchema);
export default Team;
