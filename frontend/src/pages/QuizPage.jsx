import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, ChevronLeft, ChevronRight,
  Shuffle, Send, Clock, BookOpen, X,
} from 'lucide-react';

import {
  initQuiz, selectAnswer, nextQuestion, prevQuestion,
  goToQuestion, tick, endQuiz, shuffleQuestions, resetQuiz,
} from '../store/slices/quizSlice';
import { fetchNoteById } from '../store/slices/notesSlice';

import Navbar from '../components/Navbar';
import { QuestionCard, QuizTimer, QuizNavGrid, QuizProgressBar } from '../components/QuizComponents';
import { ResultScreen } from '../components/ResultScreen';

const TIME_LIMIT = 300; // 5 minutes default

export default function QuizPage() {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { id }     = useParams();

  const { currentNote, loading } = useSelector(s => s.notes);
  const {
    quizQuestions, answers, currentIndex,
    status, timeRemaining, score, results,
  } = useSelector(s => s.quiz);

  const [navOpen, setNavOpen] = useState(false);    // mobile nav drawer
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  // ── Fetch note if needed ──────────────────────────────────────
  useEffect(() => {
    if (currentNote?._id !== id && id) {
      dispatch(fetchNoteById(id));
    }
  }, [dispatch, id, currentNote?._id]);

  // ── Initialize quiz when questions are available ──────────────
  useEffect(() => {
    const qs = currentNote?.analysis?.questions;
    if (qs && qs.length > 0 && status === 'idle') {
      dispatch(initQuiz({ questions: qs, timeLimit: TIME_LIMIT }));
    }
  }, [currentNote, dispatch, status]);

  // ── Countdown timer ───────────────────────────────────────────
  useEffect(() => {
    if (status !== 'active') return;
    const timer = setInterval(() => dispatch(tick()), 1000);
    if (timeRemaining === 0) dispatch(endQuiz());
    return () => clearInterval(timer);
  }, [status, timeRemaining, dispatch]);

  // ── Keyboard shortcuts ────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (status !== 'active') return;
      if (e.key === 'ArrowRight') dispatch(nextQuestion());
      if (e.key === 'ArrowLeft')  dispatch(prevQuestion());
      if (e.key >= '1' && e.key <= '4') {
        const letter = String.fromCharCode(64 + parseInt(e.key));
        handleAnswer(letter);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [status, currentIndex]);

  // ── Handlers ──────────────────────────────────────────────────
  const handleAnswer = useCallback((letter) => {
    if (status !== 'active') return;
    const question    = quizQuestions[currentIndex];
    const correctLetter = question?.answer;
    const isCorrect   = letter === correctLetter;
    dispatch(selectAnswer({ questionIndex: currentIndex, answer: letter, isCorrect }));
  }, [dispatch, quizQuestions, currentIndex, status]);

  const handleSubmit = () => {
    dispatch(endQuiz());
    setConfirmSubmit(false);
  };

  const handleRestart = () => {
    dispatch(resetQuiz());
    const qs = currentNote?.analysis?.questions;
    if (qs) dispatch(initQuiz({ questions: qs, timeLimit: TIME_LIMIT }));
  };

  const handleShuffle = () => dispatch(shuffleQuestions());

  // ── Derived values ────────────────────────────────────────────
  const totalQuestions  = quizQuestions.length;
  const answeredCount   = useMemo(() => Object.keys(answers).length, [answers]);
  const isFinished      = status === 'completed' || status === 'timeout';
  const currentQuestion = quizQuestions[currentIndex];
  const isLastQuestion  = currentIndex === totalQuestions - 1;
  const isFirstQuestion = currentIndex === 0;

  // ── Empty state ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0f1115] flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center pt-20">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-500 font-medium">Loading quiz…</p>
          </div>
        </main>
      </div>
    );
  }

  if (!loading && (!currentNote?.analysis?.questions || currentNote.analysis.questions.length === 0)) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0f1115] flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center pt-20">
          <div className="text-center space-y-4 p-8">
            <BookOpen size={48} className="mx-auto text-slate-300" />
            <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">No Questions Available</h2>
            <p className="text-slate-500 text-sm">Analyze your note first to generate quiz questions.</p>
            <button
              onClick={() => navigate(`/dashboard/notes/${id}`)}
              className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors"
            >
              ← Back to Note
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ── Result screen ─────────────────────────────────────────────
  if (isFinished && results) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0f1115] flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 pb-12 px-4">
          <ResultScreen
            results={results}
            questions={quizQuestions}
            answers={answers}
            status={status}
            onRestart={handleRestart}
            onBack={() => navigate(`/dashboard/notes/${id}`)}
          />
        </main>
      </div>
    );
  }

  // ── Main quiz layout ──────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1115] flex flex-col">
      <Navbar />

      <main className="flex-1 pt-20 pb-8 px-4">
        <div className="max-w-6xl mx-auto h-full">

          {/* ── Top bar ── */}
          <div className="flex items-center justify-between mb-5 gap-4">
            <button
              onClick={() => navigate(`/dashboard/notes/${id}`)}
              className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Exit Quiz</span>
            </button>

            <div className="flex-1 max-w-sm">
              <QuizProgressBar
                current={currentIndex}
                total={totalQuestions}
                answered={answeredCount}
              />
            </div>

            <div className="flex items-center gap-3">
              <QuizTimer timeRemaining={timeRemaining} totalTime={TIME_LIMIT} />

              {/* Shuffle (desktop) */}
              <button
                onClick={handleShuffle}
                title="Shuffle Questions"
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all hover:shadow"
              >
                <Shuffle size={14} />
                Shuffle
              </button>

              {/* Submit */}
              <button
                onClick={() => setConfirmSubmit(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40"
              >
                <Send size={14} />
                <span className="hidden sm:inline">Submit</span>
              </button>
            </div>
          </div>

          {/* ── Two-panel layout ── */}
          <div className="flex gap-6 items-start">

            {/* Left: Question Panel */}
            <div className="flex-1 min-w-0">
              <div className="bg-white dark:bg-[#1a1d23] rounded-3xl border border-slate-200 dark:border-slate-700/60 p-6 sm:p-8 shadow-sm">
                <AnimatePresence mode="wait">
                  <QuestionCard
                    key={currentIndex}
                    question={currentQuestion}
                    index={currentIndex}
                    total={totalQuestions}
                    onAnswer={handleAnswer}
                    selectedAnswer={answers[currentIndex]?.answer}
                    showResult={false}
                  />
                </AnimatePresence>

                {/* Navigation buttons */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100 dark:border-slate-700/50">
                  <motion.button
                    whileHover={!isFirstQuestion ? { scale: 1.03 } : {}}
                    whileTap={!isFirstQuestion ? { scale: 0.97 } : {}}
                    onClick={() => dispatch(prevQuestion())}
                    disabled={isFirstQuestion}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={18} />
                    Previous
                  </motion.button>

                  <div className="text-xs text-slate-400 font-semibold hidden sm:block">
                    {answeredCount}/{totalQuestions} answered
                    {answers[currentIndex] && (
                      <span className="ml-2 text-emerald-500">• Answered</span>
                    )}
                  </div>

                  {isLastQuestion ? (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setConfirmSubmit(true)}
                      className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 dark:shadow-indigo-900/40"
                    >
                      Finish
                      <Send size={16} />
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => dispatch(nextQuestion())}
                      className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                    >
                      Next
                      <ChevronRight size={18} />
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Mobile: show nav grid below question */}
              <div className="block lg:hidden mt-4 bg-white dark:bg-[#1a1d23] rounded-3xl border border-slate-200 dark:border-slate-700/60 p-5 shadow-sm">
                <QuizNavGrid
                  questions={quizQuestions}
                  answers={answers}
                  currentIndex={currentIndex}
                  onGoto={(i) => dispatch(goToQuestion(i))}
                />
              </div>
            </div>

            {/* Right: Navigation Sidebar (desktop only) */}
            <div className="hidden lg:block w-56 flex-shrink-0">
              <div className="sticky top-28 bg-white dark:bg-[#1a1d23] rounded-3xl border border-slate-200 dark:border-slate-700/60 p-5 shadow-sm space-y-5">
                <QuizNavGrid
                  questions={quizQuestions}
                  answers={answers}
                  currentIndex={currentIndex}
                  onGoto={(i) => dispatch(goToQuestion(i))}
                />

                <div className="pt-3 border-t border-slate-100 dark:border-slate-700 space-y-2">
                  <button
                    onClick={handleShuffle}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Shuffle size={13} />
                    Shuffle
                  </button>
                  <button
                    onClick={() => setConfirmSubmit(true)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                  >
                    <Send size={13} />
                    Submit Quiz
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Confirm Submit Modal ── */}
      <AnimatePresence>
        {confirmSubmit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setConfirmSubmit(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-[#1a1d23] rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-700 space-y-5"
            >
              <button
                onClick={() => setConfirmSubmit(false)}
                className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>

              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mx-auto">
                  <Send size={24} className="text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Submit Quiz?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  You've answered <strong className="text-slate-700 dark:text-slate-200">{answeredCount}</strong> of{' '}
                  <strong className="text-slate-700 dark:text-slate-200">{totalQuestions}</strong> questions.
                  {answeredCount < totalQuestions && (
                    <> Unanswered questions will be marked as skipped.</>
                  )}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setConfirmSubmit(false)}
                  className="py-3 rounded-2xl font-bold text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Keep Going
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  className="py-3 rounded-2xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40"
                >
                  Submit Now
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}