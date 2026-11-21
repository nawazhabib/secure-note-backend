import Note from '../models/Note.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPagination, paginationMeta } from '../utils/pagination.js';

export const listNotes = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { userId: req.user._id };
  const [items, total] = await Promise.all([
    Note.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('userId', 'name email'),
    Note.countDocuments(filter)
  ]);
  res.json({ data: items, pagination: paginationMeta(total, page, limit) });
});

export const getNote = asyncHandler(async (req, res) => {
  const filter = { _id: req.params.id, userId: req.user._id };
  const note = await Note.findOne(filter).populate('userId', 'name email');
  if (!note) return res.status(404).json({ message: 'Note not found' });
  res.json({ note });
});

export const createNote = asyncHandler(async (req, res) => {
  const { title, content } = req.body;
  if (!title?.trim() || typeof content !== 'string' || !content.trim()) {
    return res.status(400).json({ message: 'Title and content are required' });
  }
  const note = await Note.create({ title: title.trim(), content, userId: req.user._id });
  res.status(201).json({ note });
});

export const updateNote = asyncHandler(async (req, res) => {
  const filter = { _id: req.params.id, userId: req.user._id };
  const updates = {};
  if (typeof req.body.title === 'string') updates.title = req.body.title.trim();
  if (typeof req.body.content === 'string') updates.content = req.body.content;
  const note = await Note.findOneAndUpdate(filter, updates, { new: true, runValidators: true });
  if (!note) return res.status(404).json({ message: 'Note not found' });
  res.json({ note });
});

export const deleteNote = asyncHandler(async (req, res) => {
  const filter = { _id: req.params.id, userId: req.user._id };
  const note = await Note.findOneAndDelete(filter);
  if (!note) return res.status(404).json({ message: 'Note not found' });
  res.json({ message: 'Note deleted successfully' });
});
