import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import quizService from '../../services/quizService';

const initialState = {
  quizQuestions: [],
  answers: {},
  score: 0,
  currentIndex: 0,
  status: 'idle',
  timeRemaining: 300,
  results: null,
  loading: false,
  error: null
};

export const submitQuiz = createAsyncThunk(
  'quiz/submitQuiz',
  async ({ noteId, answers }, { rejectWithValue }) => {
    try {
      const response = await quizService.submitQuiz(noteId, answers);
      return response.data.data.quizResult;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to submit quiz');
    }
  }
);

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    initQuiz: (state, action) => {
      state.quizQuestions = action.payload.questions;
      state.answers = {};
      state.score = 0;
      state.currentIndex = 0;
      state.status = 'active';
      state.timeRemaining = action.payload.timeLimit || 300;
      state.results = null;
      state.error = null;
    },
    selectAnswer: (state, action) => {
      const { questionIndex, answer, isCorrect } = action.payload;
      state.answers[questionIndex] = {
        answer,
        isCorrect,
        selectedAt: Date.now()
      };
    },
    nextQuestion: (state) => {
      if (state.currentIndex < state.quizQuestions.length - 1) {
        state.currentIndex += 1;
      }
    },
    prevQuestion: (state) => {
      if (state.currentIndex > 0) {
        state.currentIndex -= 1;
      }
    },
    goToQuestion: (state, action) => {
      state.currentIndex = action.payload;
    },
    tick: (state) => {
      if (state.timeRemaining > 0 && state.status === 'active') {
        state.timeRemaining -= 1;
      }
      if (state.timeRemaining === 0) {
        state.status = 'timeout';
      }
    },
    endQuiz: (state) => {
      state.status = 'completed';
      let correctCount = 0;
      state.quizQuestions.forEach((q, i) => {
        if (state.answers[i]?.isCorrect) {
          correctCount++;
        }
      });
      state.score = correctCount;
      state.results = {
        total: state.quizQuestions.length,
        correct: correctCount,
        percentage: Math.round((correctCount / state.quizQuestions.length) * 100),
        timeTaken: 300 - state.timeRemaining
      };
    },
    resetQuiz: (state) => {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitQuiz.pending, (state) => {
        state.loading = true;
      })
      .addCase(submitQuiz.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload;
      })
      .addCase(submitQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  initQuiz,
  selectAnswer,
  nextQuestion,
  prevQuestion,
  goToQuestion,
  tick,
  endQuiz,
  resetQuiz
} = quizSlice.actions;

export default quizSlice.reducer;