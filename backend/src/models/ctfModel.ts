import { Schema, model } from 'mongoose';
import type { Ictf } from '../types/ctfTypes.js';

const ctfSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'name required'],
      unique: true,
    },

    type: {
      type: String,
      trim: true,
      required: [true, 'type required'],
      enum: ['WEB_EXPLOIT', 'BE', 'OTHER'],
    },

    withSite: {
      type: Boolean,
      default: false,
    },
    resources: [
      {
        type: String,
        trim: true,
      },
    ],
    difficulty: {
      type: String,
      trim: true,
      required: [true, 'difficulty required'],
      enum: ['ESAY', 'MID', 'HARD'],
    },
    hints: [
      {
        type: String,
        trim: true,
      },
    ],
    description: {
      type: String,
      trim: true,
    },
    flag: {
      type: String,
      trim: true,
      required: [true, 'flag required'],
      unique: true,
    },
    containersConfig: [
      {
        image: {
          type: String,
          trim: true,
          required: [true, 'Image required'],
        },
        type: {
          type: String,
          trim: true,
          required: [true, 'Type of service required'],
          enum: ['FRONTEND', 'DB', 'BACKEND'],
        },

        name: {
          type: String,
          trim: true,
          required: [true, 'name required'],
        },
        exposedPort: {
          type: Number,
        },
        internalPort: {
          type: Number,
          required: [true, 'internalPort required'],
        },
        exposed: {
          type: Boolean,
          default: false,
        },
        env: {
          type: Map,
          of: String,
        },
        labels: {
          type: Map,
          of: String,
        },
        networkMode: {
          type: String,
          trim: true,
          required: [true, 'network required'],
          unique: true,
        },
      },
    ],
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);
const Ctf = model<Ictf>('Ctf', ctfSchema);
export default Ctf;
