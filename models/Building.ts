import mongoose from 'mongoose';

export interface IBuilding extends mongoose.Document {
  name: string;
  type: string;
  propertyType: string;
  rooms: number;
  status: string;
  landlordId: mongoose.Types.ObjectId;
}

const BuildingSchema = new mongoose.Schema<IBuilding>({
  name: { type: String, required: true },
  type: { type: String, required: true },
  propertyType: { type: String, required: true, default: 'House' },
  rooms: { type: Number, required: true },
  status: { type: String, required: true, default: 'Active' },
  landlordId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.models.Building || mongoose.model<IBuilding>('Building', BuildingSchema);
