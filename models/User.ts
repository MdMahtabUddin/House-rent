import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
  username: string;
  password?: string;
  role: 'admin' | 'landlord';
  plan: 'free' | 'premium';
  access: {
    house: boolean;
    shop: boolean;
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
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
