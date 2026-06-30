import mongoose from 'mongoose';

const AdditionalBillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true }
}, { _id: false });

const PaymentSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  tenantName: { type: String, required: true },
  room: { type: String, required: true },
  building: { type: String, required: true },
  type: { type: String, enum: ['House', 'Shop'], required: true },
  month: { type: String, required: true }, // e.g. "January"
  year: { type: Number, required: true }, // e.g. 2026
  rentAmount: { type: Number, default: 0 },
  gasAmount: { type: Number, default: 0 },
  electricityAmount: { type: Number, default: 0 },
  additionalBills: { type: [AdditionalBillSchema], default: [] },
  paidAmount: { type: Number, default: 0 },
  dueAmount: { type: Number, default: 0 },
  paymentDate: { type: String }, // e.g. "2026-05-02"
  status: { type: String, enum: ['Paid', 'Partial', 'Due', 'Pending', 'Rejected'], default: 'Due' },
  paymentMethod: { type: String, enum: ['Cash', 'bKash', 'Nagad', 'Upay', 'Visa', 'Mastercard', 'Bank', 'Other'], default: 'Cash' },
  paidTo: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
