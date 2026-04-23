import QuizResult from '../models/QuizResult.js';

export const submitQuiz = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { answers, score, timeTaken } = req.body;

    const quizResult = await QuizResult.create({
      user: req.user._id,
      note: noteId,
      score,
      total: answers.length,
      percentage: Math.round((score / answers.length) * 100),
      timeTaken,
      answers,
      status: 'completed'
    });

    res.status(201).json({
      success: true,
      data: { quizResult }
    });
  } catch (error) {
    console.error('Submit Quiz Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit quiz'
    });
  }
};

export const getQuizHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [results, total] = await Promise.all([
      QuizResult.find({ user: req.user._id })
        .sort({ completedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('note', 'title'),
      QuizResult.countDocuments({ user: req.user._id })
    ]);

    res.status(200).json({
      success: true,
      data: {
        results,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      }
    });
  } catch (error) {
    console.error('Get Quiz History Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quiz history'
    });
  }
};

export const getQuizzesByNote = async (req, res) => {
  try {
    const { noteId } = req.params;

    const results = await QuizResult.find({
      user: req.user._id,
      note: noteId
    }).sort({ completedAt: -1 });

    res.status(200).json({
      success: true,
      data: { results }
    });
  } catch (error) {
    console.error('Get Quizzes By Note Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quizzes'
    });
  }
};