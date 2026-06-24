import mongoose from 'mongoose';

const TenantSchema = new mongoose.Schema({
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
}, { timestamps: true });

export default mongoose.models.Tenant || mongoose.model('Tenant', TenantSchema);
