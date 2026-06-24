import mongoose from 'mongoose';

const FlatSchema = new mongoose.Schema({
  name: { type: String, required: true },
  building: { type: String, required: true },
  rent: { type: Number, required: true },
  status: { type: String, required: true, default: 'Empty' },
}, { timestamps: true });

export default mongoose.models.Flat || mongoose.model('Flat', FlatSchema);
