import Post from '../models/Post.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPagination, paginationMeta } from '../utils/pagination.js';

export const listPosts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const [data, total] = await Promise.all([
    Post.find().sort({ createdAt: -1 }).skip(skip).limit(limit).populate('userId', 'name'),
    Post.countDocuments()
  ]);
  res.json({ data, pagination: paginationMeta(total, page, limit) });
});

export const createPost = asyncHandler(async (req, res) => {
  const { title, content } = req.body;
  if (!title?.trim() || typeof content !== 'string' || !content.trim()) {
    return res.status(400).json({ message: 'Title and content are required' });
  }
  const post = await Post.create({ title: title.trim(), content, userId: req.user._id });
  res.status(201).json({ post });
});
