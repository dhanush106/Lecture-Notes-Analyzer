import { createSlice } from '@reduxjs/toolkit';

const getInitialDarkMode = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return false;
};

const initialState = {
  darkMode: getInitialDarkMode(),
  sidebarOpen: false,
  searchQuery: '',
  quizMode: false,
  currentQuizIndex: 0,
  quizAnswers: {}
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('darkMode', state.darkMode);
      document.documentElement.classList.toggle('dark', state.darkMode);
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    startQuizMode: (state) => {
      state.quizMode = true;
      state.currentQuizIndex = 0;
      state.quizAnswers = {};
    },
    endQuizMode: (state) => {
      state.quizMode = false;
      state.currentQuizIndex = 0;
      state.quizAnswers = {};
    },
    nextQuizQuestion: (state) => {
      state.currentQuizIndex += 1;
    },
    prevQuizQuestion: (state) => {
      state.currentQuizIndex = Math.max(0, state.currentQuizIndex - 1);
    },
    setQuizAnswer: (state, action) => {
      const { questionIndex, answer } = action.payload;
      state.quizAnswers[questionIndex] = answer;
    }
  }
});

export const {
  toggleDarkMode,
  setSidebarOpen,
  toggleSidebar,
  setSearchQuery,
  startQuizMode,
  endQuizMode,
  nextQuizQuestion,
  prevQuizQuestion,
  setQuizAnswer
} = uiSlice.actions;

export default uiSlice.reducer;