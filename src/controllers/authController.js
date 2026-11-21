import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function issueToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
}

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role, interests: user.interests };
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, interests = [] } = req.body;
  if (!name?.trim() || !email?.trim() || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }
  if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });
  const normalizedEmail = email.toLowerCase().trim();
  if (await User.exists({ email: normalizedEmail })) {
    return res.status(409).json({ message: 'Email is already registered' });
  }
  const hashed = await bcrypt.hash(password, 12);
  const user = await User.create({
    name: name.trim(), email: normalizedEmail, password: hashed,
    interests: Array.isArray(interests) ? interests.filter(x => typeof x === 'string').slice(0, 30) : []
  });
  res.status(201).json({ token: issueToken(user), user: publicUser(user) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  res.json({ token: issueToken(user), user: publicUser(user) });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: publicUser(req.user) });
});
