import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
  username: string;
  password?: string;
  role: 'admin' | 'landlord';
  plan: 'free' | 'premium';
  access: {
    house: boolean;
    shop: boolean;
    noticeBoard: boolean;
    staff: boolean;
    maintenance: boolean;
    mess: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String }, // Optional for dummy or if using simple auth
    role: { type: String, enum: ['admin', 'landlord'], default: 'landlord' },
    plan: { type: String, enum: ['free', 'premium'], default: 'free' },
    access: {
      house: { type: Boolean, default: true },
      shop: { type: Boolean, default: true },
      noticeBoard: { type: Boolean, default: false },
      staff: { type: Boolean, default: false },
      maintenance: { type: Boolean, default: false },
      mess: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
