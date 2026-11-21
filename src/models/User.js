
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  interests: { type: [String], default: [] }
}, { timestamps: true });

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ createdAt: -1 });

export default mongoose.model('User', userSchema);