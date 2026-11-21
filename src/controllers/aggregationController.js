import mongoose from 'mongoose';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPagination, paginationMeta } from '../utils/pagination.js';

export const groupByInterests = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const [result] = await User.aggregate([
    { $unwind: '$interests' },
    {
      $group: {
        _id: '$interests',
        users: { $push: { id: '$_id', name: '$name', email: '$email' } },
        userCount: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } },
    {
      $facet: {
        data: [
          { $skip: skip },
          { $limit: limit },
          { $project: { _id: 0, interest: '$_id', users: 1, userCount: 1 } }
        ],
        total: [{ $count: 'count' }]
      }
    }
  ]);
  const total = result.total[0]?.count || 0;
  res.json({ data: result.data, pagination: paginationMeta(total, page, limit) });
});

export const getUserPosts = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid user id' });
  const { page, limit, skip } = getPagination(req.query);
  const result = await User.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
    {
      $lookup: {
        from: 'posts',
        let: { userId: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$userId', '$$userId'] } } },
          { $sort: { createdAt: -1 } },
          {
            $facet: {
              data: [{ $skip: skip }, { $limit: limit }],
              total: [{ $count: 'count' }]
            }
          },
          { $project: { data: 1, count: { $ifNull: [{ $arrayElemAt: ['$total.count', 0] }, 0] } } }
        ],
        as: 'postPage'
      }
    },
    {
      $project: {
        name: 1,
        posts: { $ifNull: [{ $arrayElemAt: ['$postPage.data', 0] }, []] },
        postCount: { $ifNull: [{ $arrayElemAt: ['$postPage.count', 0] }, 0] }
      }
    }
  ]);
  if (!result.length) return res.status(404).json({ message: 'User not found' });
  const { posts, postCount, ...user } = result[0];
  res.json({ user: { ...user, posts }, pagination: paginationMeta(postCount, page, limit) });
});
