import express from 'express';
import { submitQuiz, getQuizHistory, getQuizzesByNote } from '../controllers/quizController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/notes/:noteId/submit', submitQuiz);
router.get('/history', getQuizHistory);
router.get('/notes/:noteId', getQuizzesByNote);

export default router;