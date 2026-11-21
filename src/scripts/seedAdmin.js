import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';

await connectDB();
const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 8) {
  throw new Error('Set ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD (at least 8 characters) in .env');
}
const email = ADMIN_EMAIL.toLowerCase().trim();
const existing = await User.findOne({ email });
if (existing) {
  console.log('An account with this email already exists; no changes made.');
} else {
  await User.create({
    name: ADMIN_NAME,
    email,
    password: await bcrypt.hash(ADMIN_PASSWORD, 12),
    role: 'admin'
  });
  console.log(`Admin created: ${email}`);
}
process.exit(0);
