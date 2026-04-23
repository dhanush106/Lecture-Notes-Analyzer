import Note from '../models/Note.js';
import User from '../models/User.js';
import pdfParse from 'pdf-parse';
import fs from 'fs';
import nlpService from '../services/nlpService.js';

export const uploadNote = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    let textContent = '';

    if (req.file.mimetype === 'text/plain') {
      textContent = fs.readFileSync(req.file.path, 'utf8');
    } else if (req.file.mimetype === 'application/pdf') {
      const dataBuffer = fs.readFileSync(req.file.path);
      const pdfData = await pdfParse(dataBuffer);
      textContent = pdfData.text;
    } else if (req.file.mimetype.startsWith('image/')) {
      // Use OCR for images
      const ocrResult = await nlpService.performOCR(req.file.path, req.body.ocrMode || 'auto');
      if (ocrResult.success) {
        textContent = ocrResult.data.text;
        console.log(`[OCR] Extracted ${textContent.length} characters from image`);
      } else {
        throw new Error(ocrResult.error || 'OCR failed');
      }
    }

    if (!textContent.trim()) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        error: 'Could not extract text from file'
      });
    }

    const title = req.body.title || req.file.originalname.replace(/\.[^/.]+$/, '');

    const note = await Note.create({
      user: req.user._id,
      title,
      originalContent: textContent,
      fileName: req.file.originalname,
      fileType: req.file.mimetype === 'application/pdf' ? 'pdf' : (req.file.mimetype.startsWith('image/') ? 'image' : 'txt'),
      fileSize: req.file.size
    });

    await User.findByIdAndUpdate(req.user._id, {
      $push: { notes: note._id }
    });

    res.status(201).json({
      success: true,
      data: {
        note: {
          id: note._id,
          title: note.title,
          fileName: note.fileName,
          fileType: note.fileType,
          status: note.status,
          createdAt: note.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Upload Error:', error);
    
    if (req.file?.path) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      error: 'Failed to upload note'
    });
  }
};

export const getNoteById = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { note }
    });
  } catch (error) {
    console.error('GetNote Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch note'
    });
  }
};

export const getUserNotes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [notes, total] = await Promise.all([
      Note.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-originalContent'),
      Note.countDocuments({ user: req.user._id })
    ]);

    res.status(200).json({
      success: true,
      data: {
        notes,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('GetUserNotes Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notes'
    });
  }
};

export const analyzeNote = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }

    if (!note.originalContent || !note.originalContent.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Note content is empty or invalid'
      });
    }

    console.log(`[DEBUG] Analyzing note ${req.params.id}. First 100 chars: ${note.originalContent.substring(0, 100)}`);

    if (note.status === 'processing') {
      return res.status(400).json({
        success: false,
        error: 'Note is already being processed'
      });
    }

    if (note.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Note has already been analyzed'
      });
    }

    note.status = 'processing';
    await note.save();

    const result = await nlpService.analyzeText(note.originalContent);
    
    console.log(`[DEBUG] FastAPI response success: ${result.success}`);

    if (!result.success) {
      note.status = 'failed';
      await note.save();
      
      console.error(`[DEBUG] Analysis failed: ${result.error}`);
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to analyze text'
      });
    }

    note.analysis = {
      summary: result.data.summary || '',
      keywords: result.data.keywords || [],
      questions: result.data.questions || [],
      wordCount: note.originalContent.split(/\s+/).length,
      processedAt: new Date()
    };
    note.status = 'completed';
    await note.save();

    res.status(200).json({
      success: true,
      data: { note }
    });
  } catch (error) {
    console.error('Analyze Error:', error);
    
    if (req.params.id) {
      try {
        await Note.findByIdAndUpdate(req.params.id, { status: 'failed' });
      } catch (e) {}
    }

    res.status(400).json({
      success: false,
      error: error.message || 'Failed to analyze note'
    });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { notes: note._id }
    });

    res.status(200).json({
      success: true,
      data: { message: 'Note deleted successfully' }
    });
  } catch (error) {
    console.error('Delete Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete note'
    });
  }
};

export const searchNote = async (req, res) => {
  try {
    const { q } = req.query;
    const { id } = req.params;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters'
      });
    }

    const note = await Note.findOne({
      _id: id,
      user: req.user._id
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }

    const searchQuery = q.trim().toLowerCase();
    const content = note.originalContent.toLowerCase();
    const matches = [];
    
    let index = content.indexOf(searchQuery);
    let totalMatches = 0;

    while (index !== -1) {
      totalMatches++;
      
      const startContext = Math.max(0, index - 50);
      const endContext = Math.min(content.length, index + searchQuery.length + 50);
      
      const segment = note.originalContent.slice(startContext, endContext);
      const segmentStart = content.lastIndexOf('. ', startContext) + 2;
      const sentenceStart = Math.max(startContext, 
        content.lastIndexOf('. ', startContext) !== -1 
          ? content.lastIndexOf('. ', startContext) + 2 
          : startContext
      );
      
      const beforeText = note.originalContent.slice(
        note.originalContent.indexOf(segment.slice(0, 3), sentenceStart > 0 ? sentenceStart : startContext),
        index
      );
      
      const matchText = note.originalContent.slice(index, index + searchQuery.length);
      const afterText = note.originalContent.slice(
        index + searchQuery.length,
        Math.min(note.originalContent.length, index + searchQuery.length + 100)
      );

      if (matches.length < 20) {
        matches.push({
          position: index,
          match: matchText,
          context: (beforeText + matchText + afterText).trim(),
          matchStart: index - sentenceStart,
          matchEnd: index - sentenceStart + searchQuery.length
        });
      }

      index = content.indexOf(searchQuery, index + 1);
    }

    res.status(200).json({
      success: true,
      data: {
        query: q,
        totalMatches,
        matches
      }
    });
  } catch (error) {
    console.error('Search Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search note'
    });
  }
};