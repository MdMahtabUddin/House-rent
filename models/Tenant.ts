import mongoose from 'mongoose';

export interface ITenant extends mongoose.Document {
  name: string;
  phone: string;
  nid: string;
  entryDate?: string;
  contractStartDate?: string;
  contractEndDate?: string;
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
  loginId?: string;
  password?: string;
  landlordId: mongoose.Types.ObjectId;
}

const TenantSchema = new mongoose.Schema<ITenant>({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  nid: { type: String, required: true },
  entryDate: { type: String },
  contractStartDate: { type: String },
  contractEndDate: { type: String },
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
  loginId: { type: String, unique: true, sparse: true },
  password: { type: String },
  landlordId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.models.Tenant || mongoose.model<ITenant>('Tenant', TenantSchema);
