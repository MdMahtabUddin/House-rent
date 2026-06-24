import mongoose from 'mongoose';

const BuildingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  rooms: { type: Number, required: true },
  status: { type: String, required: true, default: 'Active' },
}, { timestamps: true });

export default mongoose.models.Building || mongoose.model('Building', BuildingSchema);
