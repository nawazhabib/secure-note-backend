import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 160 },
  content: { type: String, required: true, maxlength: 20000 },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

postSchema.index({ userId: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });

export default mongoose.model('Post', postSchema);
