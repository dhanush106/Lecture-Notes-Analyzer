import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  originalContent: {
    type: String,
    required: [true, 'Content is required']
  },
  fileName: {
    type: String,
    required: [true, 'File name is required']
  },
  fileType: {
    type: String,
    enum: {
      values: ['pdf', 'txt', 'image'],
      message: 'File type must be pdf, txt, or image'
    },
    required: true
  },
  fileSize: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'processing', 'completed', 'failed'],
      message: 'Invalid status'
    },
    default: 'pending'
  },
  analysis: {
    summary: {
      type: String,
      default: ''
    },
    keywords: [{
      type: String
    }],
    questions: [{
      type: mongoose.Schema.Types.Mixed
    }],
    wordCount: {
      type: Number,
      default: 0
    },
    processedAt: {
      type: Date
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

noteSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

noteSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Note', noteSchema);