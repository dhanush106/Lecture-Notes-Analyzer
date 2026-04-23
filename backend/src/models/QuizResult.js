import mongoose from 'mongoose';

const quizResultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  note: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Note',
    required: true,
    index: true
  },
  score: {
    type: Number,
    required: true,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 1
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  timeTaken: {
    type: Number,
    default: 0
  },
  answers: [{
    questionIndex: Number,
    selectedAnswer: String,
    isCorrect: Boolean
  }],
  status: {
    type: String,
    enum: ['completed', 'timeout', 'abandoned'],
    default: 'completed'
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
});

quizResultSchema.index({ user: 1, note: 1 });
quizResultSchema.index({ user: 1, completedAt: -1 });

export default mongoose.model('QuizResult', quizResultSchema);