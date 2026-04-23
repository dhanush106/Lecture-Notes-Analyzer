import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import notesService from '../../services/notesService';

const initialState = {
  notes: [],
  currentNote: null,
  pagination: { page: 1, limit: 10, total: 0, pages: 0 },
  loading: false,
  uploading: false,
  analyzing: false,
  error: null
};

export const fetchNotes = createAsyncThunk(
  'notes/fetchNotes',
  async (params, { rejectWithValue }) => {
    try {
      const response = await notesService.getNotes(params);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch notes');
    }
  }
);

export const fetchNoteById = createAsyncThunk(
  'notes/fetchNoteById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await notesService.getNoteById(id);
      return response.data.data.note;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch note');
    }
  }
);

export const uploadNote = createAsyncThunk(
  'notes/uploadNote',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await notesService.uploadNote(formData);
      return response.data.data.note;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to upload note');
    }
  }
);

export const analyzeNote = createAsyncThunk(
  'notes/analyzeNote',
  async (id, { rejectWithValue }) => {
    try {
      const response = await notesService.analyzeNote(id);
      return response.data.data.note;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to analyze note');
    }
  }
);

export const deleteNote = createAsyncThunk(
  'notes/deleteNote',
  async (id, { rejectWithValue }) => {
    try {
      await notesService.deleteNote(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete note');
    }
  }
);

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    clearCurrentNote: (state) => {
      state.currentNote = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setCurrentNote: (state, action) => {
      state.currentNote = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.loading = false;
        state.notes = action.payload.notes;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchNoteById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNoteById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentNote = action.payload;
      })
      .addCase(fetchNoteById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(uploadNote.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(uploadNote.fulfilled, (state, action) => {
        state.uploading = false;
        state.notes.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(uploadNote.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload;
      })
      .addCase(analyzeNote.pending, (state) => {
        state.analyzing = true;
        state.error = null;
      })
      .addCase(analyzeNote.fulfilled, (state, action) => {
        state.analyzing = false;
        const index = state.notes.findIndex(n => n._id === action.payload._id);
        if (index !== -1) {
          state.notes[index] = action.payload;
        }
        if (state.currentNote?._id === action.payload._id) {
          state.currentNote = action.payload;
        }
      })
      .addCase(analyzeNote.rejected, (state, action) => {
        state.analyzing = false;
        state.error = action.payload;
      })
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.notes = state.notes.filter(n => n._id !== action.payload);
        if (state.currentNote?._id === action.payload) {
          state.currentNote = null;
        }
        state.pagination.total -= 1;
      });
  }
});

export const { clearCurrentNote, clearError, setCurrentNote } = notesSlice.actions;
export default notesSlice.reducer;