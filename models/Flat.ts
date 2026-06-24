import mongoose from 'mongoose';

export interface IFlat extends mongoose.Document {
  name: string;
  building: string;
  rent: number;
  status: string;
  landlordId: mongoose.Types.ObjectId;
}

const FlatSchema = new mongoose.Schema<IFlat>({
  name: { type: String, required: true },
  building: { type: String, required: true },
  rent: { type: Number, required: true },
  status: { type: String, required: true, default: 'Empty' },
  landlordId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.models.Flat || mongoose.model<IFlat>('Flat', FlatSchema);
