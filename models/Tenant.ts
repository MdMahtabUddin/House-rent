import mongoose from 'mongoose';

export interface ITenant extends mongoose.Document {
  name: string;
  phone: string;
  nid: string;
  entryDate: string;
  building: string;
  room: string;
  shopName?: string;
  tradeLicense?: string;
  rent: number;
  advance: number;
  gasCardNo?: string;
  electricityCardNo?: string;
  status: string;
  type: string;
  landlordId: mongoose.Types.ObjectId;
}

const TenantSchema = new mongoose.Schema<ITenant>({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  nid: { type: String, required: true },
  entryDate: { type: String, required: true },
  building: { type: String, required: true },
  room: { type: String, required: true },
  shopName: { type: String },
  tradeLicense: { type: String },
  rent: { type: Number, required: true },
  advance: { type: Number, required: true },
  gasCardNo: { type: String },
  electricityCardNo: { type: String },
  status: { type: String, required: true, default: 'Paid' },
  type: { type: String, required: true, default: 'House' },
  landlordId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.models.Tenant || mongoose.model<ITenant>('Tenant', TenantSchema);
