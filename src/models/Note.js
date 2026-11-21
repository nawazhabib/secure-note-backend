import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 160 },
  content: { type: String, required: true, maxlength: 20000 },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

noteSchema.index({ userId: 1, createdAt: -1 });
noteSchema.index({ createdAt: -1 });

export default mongoose.model('Note', noteSchema);
