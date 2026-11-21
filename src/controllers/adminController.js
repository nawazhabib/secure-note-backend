import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Note from '../models/Note.js';
import Post from '../models/Post.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPagination, paginationMeta } from '../utils/pagination.js';

const safeFields = 'name email role interests createdAt updatedAt';

export const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const [data, total] = await Promise.all([
    User.find().select(safeFields).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments()
  ]);
  res.json({ data, pagination: paginationMeta(total, page, limit) });
});

export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role = 'user', interests = [] } = req.body;
  if (!name?.trim() || !email?.trim() || !password) return res.status(400).json({ message: 'Name, email and password are required' });
  if (!['user', 'admin'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
  if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });
  const user = await User.create({
    name: name.trim(), email: email.toLowerCase().trim(),
    password: await bcrypt.hash(password, 12), role,
    interests: Array.isArray(interests) ? interests : []
  });
  res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role, interests: user.interests } });
});

export const updateUser = asyncHandler(async (req, res) => {
  const updates = {};
  for (const key of ['name', 'email', 'role', 'interests']) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  if (updates.email) updates.email = updates.email.toLowerCase().trim();
  if (updates.role && !['user', 'admin'].includes(updates.role)) return res.status(400).json({ message: 'Invalid role' });
  if (req.body.password) {
    if (req.body.password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });
    updates.password = await bcrypt.hash(req.body.password, 12);
  }
  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select(safeFields);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ user });
});

export const deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) return res.status(400).json({ message: 'You cannot delete your own admin account' });
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  await Promise.all([
    Note.deleteMany({ userId: user._id }),
    Post.deleteMany({ userId: user._id })
  ]);
  res.json({ message: 'User and their content deleted successfully' });
});

export const listAllNotes = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const [data, total] = await Promise.all([
    Note.find().sort({ createdAt: -1 }).skip(skip).limit(limit).populate('userId', 'name email'),
    Note.countDocuments()
  ]);
  res.json({ data, pagination: paginationMeta(total, page, limit) });
});
