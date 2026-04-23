import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  quizQuestions: [],
  answers: {},        // { [index]: { answer, isCorrect, selectedAt } }
  currentIndex: 0,
  status: 'idle',     // idle | active | completed | timeout
  timeRemaining: 300,
  score: 0,
  results: null,
  shuffled: false,
  loading: false,
  error: null,
};

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    initQuiz: (state, action) => {
      state.quizQuestions = action.payload.questions;
      state.answers      = {};
      state.score        = 0;
      state.currentIndex = 0;
      state.status       = 'active';
      state.timeRemaining = action.payload.timeLimit || 300;
      state.results      = null;
      state.error        = null;
      state.shuffled     = false;
    },

    selectAnswer: (state, action) => {
      const { questionIndex, answer, isCorrect } = action.payload;
      // Only record — never overwrite if already answered (allows review nav)
      state.answers[questionIndex] = { answer, isCorrect, selectedAt: Date.now() };
    },

    clearAnswer: (state, action) => {
      delete state.answers[action.payload];
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
      const idx = action.payload;
      if (idx >= 0 && idx < state.quizQuestions.length) {
        state.currentIndex = idx;
      }
    },

    tick: (state) => {
      if (state.status === 'active' && state.timeRemaining > 0) {
        state.timeRemaining -= 1;
      }
      if (state.timeRemaining === 0 && state.status === 'active') {
        state.status = 'timeout';
      }
    },

    endQuiz: (state) => {
      state.status = 'completed';
      let correct = 0;
      state.quizQuestions.forEach((_, i) => {
        if (state.answers[i]?.isCorrect) correct++;
      });
      state.score = correct;
      state.results = {
        total:      state.quizQuestions.length,
        correct,
        skipped:    state.quizQuestions.length - Object.keys(state.answers).length,
        percentage: Math.round((correct / state.quizQuestions.length) * 100),
        timeTaken:  300 - state.timeRemaining,
      };
    },

    shuffleQuestions: (state) => {
      const shuffled = [...state.quizQuestions].sort(() => Math.random() - 0.5);
      state.quizQuestions = shuffled;
      state.answers       = {};
      state.currentIndex  = 0;
      state.shuffled      = true;
    },

    resetQuiz: () => initialState,
  },
});

export const {
  initQuiz, selectAnswer, clearAnswer,
  nextQuestion, prevQuestion, goToQuestion,
  tick, endQuiz, shuffleQuestions, resetQuiz,
} = quizSlice.actions;

export default quizSlice.reducer;