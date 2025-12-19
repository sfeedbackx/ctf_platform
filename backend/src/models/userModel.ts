import mongoose from 'mongoose';

interface IUser extends mongoose.Document {
  solvedCtf: mongoose.Types.ObjectId[];
  numberOfSolvedCtf: number;
  email: string;
  password: string;
  created_at: Date;
  updated_at: Date;
}
const userSchema = new mongoose.Schema(
  {
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
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);
userSchema.pre<IUser>('save', async function () {
  this.numberOfSolvedCtf = this.solvedCtf.length;
});
const User = mongoose.model<IUser>('User', userSchema);
export default User;
