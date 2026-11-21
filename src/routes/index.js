import { Router } from 'express';
import { register, login, me } from '../controllers/authController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { listNotes, getNote, createNote, updateNote, deleteNote } from '../controllers/noteController.js';
import { listUsers, createUser, updateUser, deleteUser, listAllNotes } from '../controllers/adminController.js';
import { groupByInterests, getUserPosts } from '../controllers/aggregationController.js';
import { listPosts, createPost } from '../controllers/postController.js';

const router = Router();

router.get('/health', (req, res) => res.json({ status: 'ok', service: 'secure-notes-api' }));

router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', protect, me);

router.route('/notes')
  .get(protect, listNotes)
  .post(protect, createNote);
router.route('/notes/:id')
  .get(protect, getNote)
  .put(protect, updateNote)
  .delete(protect, deleteNote);

router.get('/admin/users', protect, adminOnly, listUsers);
router.post('/admin/users', protect, adminOnly, createUser);
router.put('/admin/users/:id', protect, adminOnly, updateUser);
router.delete('/admin/users/:id', protect, adminOnly, deleteUser);
router.get('/admin/notes', protect, adminOnly, listAllNotes);

router.get('/users/group-by-interests', protect, adminOnly, groupByInterests);
router.get('/users/:id/posts', getUserPosts);

router.get('/posts', listPosts);
router.post('/posts', protect, createPost);

export default router;
