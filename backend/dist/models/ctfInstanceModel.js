import mongoose, { Schema, model } from 'mongoose';
const ctfInstanceSchema = new Schema({
    ctfId: {
        type: mongoose.Types.ObjectId,
        ref: 'CTF',
    },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 2 * 60 * 60 * 1000),
    },
    url: {
        type: String,
        trim: true,
    },
    status: {
        type: String,
        trim: true,
        required: [true, 'status required'],
        enum: ['RUNNING', 'STOPPED', 'PENDING', 'FAILED', 'TERMINATED'],
        default: 'PENDING',
    },
    containers: [
        {
            name: {
                type: String,
                trim: true,
            },
            port: {
                type: Number,
            },
        },
    ],
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});
const CtfInstance = model('CtfInstance', ctfInstanceSchema);
export default CtfInstance;
//# sourceMappingURL=ctfInstanceModel.js.map