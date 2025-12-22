import { Schema, model, Document } from 'mongoose';

interface ICTF extends Document {
  type: 'WEB_EXPLOIT' | 'BE' | 'OTHER';
  withShell: boolean;
  resources: string[];
  webSite?: string;
  difficulty: 'ESSAY' | 'MID' | 'HARD';
  hints: string[];
  flag: string;
  created_at: Date;
  updated_at: Date;
}

const ctfSchema = new Schema(
  {
    type: {
      type: String,
      trim: true,
      required: [true, 'type required'],
      enum: ['WEB_EXPLOIT', 'BE', 'OTHER'],
    },

    withShell: {
      type: Boolean,
      default: false,
    },
    resources: [
      {
        type: String,
        trim: true,
      },
    ],
    webSite: {
      type: String,
      trim: true,
    },
    difficulty: {
      type: String,
      trim: true,
      required: [true, 'difficulty required'],
      enum: ['ESSAY', 'MID', 'HARD'],
    },
    hints: [
      {
        type: String,
        trim: true,
      },
    ],
    flag: {
      type: String,
      trim: true,
      required: [true, 'flag required'],
      unique: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);
const Ctf = model<ICTF>('Ctf', ctfSchema);
export default Ctf;
