import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        trim: true,
        required: [true, 'email required'],
        unique: true,
        validate: {
            validator: function (v) {
                return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
            },
            message: (props) => `${props.value} is not a valid email`,
        },
    },
    password: {
        type: String,
        trim: true,
        required: [true, 'password required'],
    },
    solvedCtf: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'CTF',
        },
    ],
    numberOfSolvedCtf: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});
userSchema.pre('save', async function () {
    this.numberOfSolvedCtf = this.solvedCtf.length;
});
const User = mongoose.model('User', userSchema);
export default User;
//# sourceMappingURL=userModel.js.map