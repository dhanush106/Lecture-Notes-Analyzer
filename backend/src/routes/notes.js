import express from 'express';
import {
  uploadNote,
  getNoteById,
  getUserNotes,
  analyzeNote,
  deleteNote,
  searchNote
} from '../controllers/noteController.js';
import { protect } from '../middleware/auth.js';
import upload, { handleUploadError } from '../middleware/upload.js';

const router = express.Router();

router.use(protect);

router.post('/upload', upload.single('file'), handleUploadError, uploadNote);
router.get('/', getUserNotes);
router.get('/:id', getNoteById);
router.get('/:id/search', searchNote);
router.post('/:id/analyze', analyzeNote);
router.delete('/:id', deleteNote);

export default router;