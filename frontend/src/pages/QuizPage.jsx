import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Send, RotateCcw, ArrowLeft, Trophy, CheckCircle, XCircle, Clock, RefreshCw, AlertCircle } from 'lucide-react';
import { initQuiz, selectAnswer, nextQuestion, prevQuestion, goToQuestion, tick, endQuiz, resetQuiz } from '../store/slices/quizSlice';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const TIME_LIMIT = 300;

// ── Inline QuestionCard ──────────────────────────────────────
function QuestionCard({ question, index, total, onAnswer, selectedAnswer }) {
  if (!question) return null;

  const questionText = typeof question === 'string' ? question : (question.question || 'Missing question text');
  const options = Array.isArray(question.options) ? question.options : [];
  const correct_answer = question.answer || question.correct_answer || 'SHORT_ANSWER_ACKNOWLEDGED';
  const type = question.type || (options.length > 0 ? 'mcq' : 'short');
  const difficulty = question.difficulty || 'medium';

  const isMCQ = type === 'mcq' || options.length > 0;

  const getState = (i) => {
    const letter = String.fromCharCode(65 + i);
    return selectedAnswer === letter ? 'selected' : 'default';
  };

  const optionStyles = {
    default:  'bg-[#0B0F19] border border-white/[0.05] hover:border-indigo-500/50 text-slate-300 cursor-pointer',
    selected: 'bg-indigo-500/10 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.2)] cursor-pointer',
  };

  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.22 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 !rounded-[16px] flex items-center justify-center text-indigo-400">
            <span className="font-black text-lg">{index + 1}</span>
          </div>
          <span className="text-slate-500 font-bold tracking-widest text-sm uppercase">of {total}</span>
        </div>
        <div className="flex gap-2">
          {difficulty && (
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {difficulty}
            </span>
          )}
          <span className="saas-badge">
            {isMCQ ? 'MCQ' : 'Short'}
          </span>
        </div>
      </div>

      {/* Question */}
      <h2 className="text-2xl font-bold text-white leading-relaxed">{questionText}</h2>

      {/* Options */}
      <div className="space-y-4 pt-4">
        {isMCQ ? options.map((opt, i) => {
          const letter = String.fromCharCode(65 + i);
          const text = typeof opt === 'string' && opt.includes('. ') ? opt.split('. ').slice(1).join('. ').trim() : opt;
          const state = getState(i);
          return (
            <motion.button
              key={i}
              whileHover={{ scale: 1.015, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onAnswer(letter, correct_answer)}
              className={`w-full text-left px-6 py-5 rounded-2xl transition-all duration-300 flex items-center gap-4 ${optionStyles[state]}`}
            >
              <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 ${
                state === 'selected' ? 'bg-indigo-500 text-white' : 'bg-[#111827] text-slate-500 border border-white/[0.05]'
              }`}>{letter}</span>
              <span className="flex-1 font-semibold text-[15px] leading-snug">{text}</span>
              {state === 'selected' && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400">
                  <CheckCircle size={16} />
                </motion.span>
              )}
            </motion.button>
          );
        }) : (
          <div className="p-6 bg-[#0B0F19] border border-white/[0.05] rounded-2xl">
            <p className="text-sm text-indigo-400 font-bold mb-2 uppercase tracking-wide">
              📝 Short Answer
            </p>
            <p className="text-slate-400 text-sm font-medium">Write your answer on paper or think about it, then submit to see the answer key.</p>
            <button 
              onClick={() => onAnswer('SHORT_ANSWER_ACKNOWLEDGED', 'SHORT_ANSWER_ACKNOWLEDGED')}
              className={`mt-4 w-full py-4 rounded-xl font-bold text-sm transition-all duration-300 ${
                selectedAnswer === 'SHORT_ANSWER_ACKNOWLEDGED' 
                  ? 'bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]' 
                  : 'saas-btn-secondary'
              }`}
            >
              {selectedAnswer === 'SHORT_ANSWER_ACKNOWLEDGED' ? '✓ Marked as Answered' : 'Mark as Answered'}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Main QuizPage ────────────────────────────────────────────
export default function QuizPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id }   = useParams();

  const { currentNote } = useSelector(s => s.notes);
  const { quizQuestions, answers, currentIndex, status, timeRemaining, results } = useSelector(s => s.quiz);

  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [localLoading, setLocalLoading] = useState(true);
  const [localError, setLocalError] = useState(null);
  const [loadingText, setLoadingText] = useState("Loading quiz...");

  const fetchQuizData = useCallback(async () => {
    try {
      setLocalLoading(true);
      setLocalError(null);
      setLoadingText("Fetching note data...");
      
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };

      const res = await fetch(`http://localhost:5000/api/notes/${id}`, { headers });
      
      if (!res.ok) {
        throw new Error(`API failed to fetch note (Status: ${res.status})`);
      }
      
      let resJson = await res.json();
      let noteData = resJson.data?.note || resJson;
      let rawQuestions = noteData?.analysis?.questions || [];

      if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
         setLoadingText("Analyzing document to generate quiz questions...");
         console.warn("No questions found natively. Attempting to analyze...");
         
         const analyzeRes = await fetch(`http://localhost:5000/api/notes/${id}/analyze`, {
             method: 'POST',
             headers
         });
         
         if (!analyzeRes.ok) throw new Error("API failed during analysis");
         const analyzeJson = await analyzeRes.json();
         noteData = analyzeJson.data?.note || analyzeJson;
         rawQuestions = noteData?.analysis?.questions || [];
      }

      if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
         throw new Error("API returned no quiz data after analysis.");
      }

      const safeQuestions = rawQuestions.map(q => {
        if (typeof q === 'string') {
          return { question: q, options: [], correct_answer: "SHORT_ANSWER_ACKNOWLEDGED", type: "short" };
        }
        return {
          question: q.question || 'Missing question',
          options: q.options || [],
          correct_answer: q.answer || q.correct_answer || 'SHORT_ANSWER_ACKNOWLEDGED',
          type: q.type || (q.options?.length > 0 ? 'mcq' : 'short'),
          difficulty: q.difficulty || 'medium'
        };
      });
      
      dispatch(initQuiz({ questions: safeQuestions, timeLimit: TIME_LIMIT }));
    } catch (err) {
      console.error("Quiz API Error:", err);
      setLocalError(err.message || "Failed to load resource: 404 (Not Found)");
    } finally {
      setLocalLoading(false);
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (id) fetchQuizData();
  }, [id, fetchQuizData]);

  useEffect(() => {
    if (status !== 'active') return;
    const t = setInterval(() => dispatch(tick()), 1000);
    return () => clearInterval(t);
  }, [status, dispatch]);

  useEffect(() => {
    if (timeRemaining === 0 && status === 'active') dispatch(endQuiz());
  }, [timeRemaining, status, dispatch]);

  useEffect(() => {
    const fn = (e) => {
      if (status !== 'active') return;
      if (e.key === 'ArrowRight') dispatch(nextQuestion());
      if (e.key === 'ArrowLeft')  dispatch(prevQuestion());
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [status, dispatch]);

  const handleAnswer = useCallback((letter, correct_answer) => {
    if (status !== 'active') return;
    const safeIndex = Math.min(currentIndex, Math.max(0, quizQuestions.length - 1));
    const isCorrect = letter === correct_answer;
    dispatch(selectAnswer({ questionIndex: safeIndex, answer: letter, isCorrect }));
  }, [dispatch, currentIndex, status, quizQuestions.length]);

  const handleSubmit = () => { dispatch(endQuiz()); setConfirmSubmit(false); };
  
  const total = quizQuestions ? quizQuestions.length : 0;
  const safeIndex = total > 0 ? Math.min(currentIndex, total - 1) : 0;
  const currentQ = quizQuestions ? quizQuestions[safeIndex] : null;

  const answered   = Object.keys(answers).length;
  const isLast     = safeIndex === total - 1;
  const isFirst    = safeIndex === 0;
  const mins = Math.floor(timeRemaining / 60);
  const secs = timeRemaining % 60;
  const isLowTime  = timeRemaining < 60;
  
  const liveScore = quizQuestions.reduce((acc, q, i) => {
      const qOptions = q.options || [];
      const isMCQ = q.type === 'mcq' || qOptions.length > 0;
      if (!isMCQ && answers[i]) return acc + 1; 
      return acc + (answers[i]?.isCorrect ? 1 : 0);
  }, 0);

  if (localLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <Sidebar />
        <main className="pt-28 pb-12 px-4 lg:pl-72 flex flex-col items-center justify-center">
          <div className="saas-card text-center max-w-sm w-full space-y-6">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <h3 className="text-xl font-bold text-white tracking-tight">{loadingText}</h3>
            <div className="space-y-3 mt-6">
              <div className="h-4 bg-white/5 rounded w-3/4 mx-auto animate-pulse"></div>
              <div className="h-4 bg-white/5 rounded w-1/2 mx-auto animate-pulse"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (localError) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <Sidebar />
        <main className="pt-28 pb-12 px-4 lg:pl-72 flex justify-center">
          <div className="saas-card max-w-md w-full text-center space-y-6 border-red-500/20">
            <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto text-red-400 border border-red-500/20">
              <AlertCircle size={40} />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Failed to load quiz</h2>
            <p className="text-red-400 font-medium bg-red-500/5 border border-red-500/10 p-4 rounded-xl">{localError}</p>
            <div className="pt-4 flex gap-4">
              <button onClick={() => navigate(`/dashboard/notes/${id}`)} className="flex-1 saas-btn-secondary">
                Back
              </button>
              <button onClick={fetchQuizData} className="flex-1 saas-btn-primary !bg-red-500 hover:!bg-red-600 !shadow-[0_4px_14px_rgba(239,68,68,0.39)]">
                <RefreshCw size={18} /> Retry
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!quizQuestions || quizQuestions.length === 0) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <Sidebar />
        <main className="pt-28 pb-12 px-4 lg:pl-72 flex justify-center">
          <div className="saas-card max-w-md w-full text-center space-y-6">
            <div className="text-6xl">📚</div>
            <h2 className="text-3xl font-bold text-white tracking-tight">No questions available</h2>
            <p className="text-slate-400 font-medium">This note could not be analyzed for questions.</p>
            <button onClick={() => navigate(`/dashboard/notes/${id}`)} className="saas-btn-primary w-full py-4 mt-4">
              ← Back to Note
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (status === 'completed' || status === 'timeout') {
    const gradeColor = results.percentage >= 70 ? 'text-emerald-400' : 'text-amber-400';
    const gradeBg = results.percentage >= 70 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20';
    
    try {
      const hist = JSON.parse(localStorage.getItem('quizHistory') || '[]');
      const lastEntry = hist[hist.length - 1];
      if (!lastEntry || lastEntry.date < Date.now() - 5000) {
        hist.push({
          noteId: id,
          title: currentNote?.title || 'Lecture Note Quiz',
          percentage: results.percentage,
          correct: results.correct,
          total: results.total,
          date: new Date().toISOString()
        });
        localStorage.setItem('quizHistory', JSON.stringify(hist));
      }
    } catch (e) { console.error('Failed to save quiz history', e); }

    return (
      <div className="min-h-screen">
        <Navbar />
        <Sidebar />
        <main className="pt-28 pb-12 px-4 lg:pl-72">
           <div className="glass-panel rounded-3xl p-12 text-center max-w-2xl mx-auto space-y-8">
              <div className={`w-32 h-32 mx-auto rounded-full ${gradeBg} border flex items-center justify-center`}>
                <Trophy size={64} className={gradeColor} />
              </div>
              <div>
                <div className={`text-7xl font-black ${gradeColor} mb-2`}>{results.percentage}%</div>
                <p className="text-slate-400 font-bold text-xl uppercase tracking-widest">{results.correct} / {results.total} Correct</p>
              </div>
              <div className="pt-8 flex gap-4">
                <button onClick={() => navigate(`/dashboard/notes/${id}`)} className="flex-1 saas-btn-secondary py-4">Exit</button>
                <button onClick={fetchQuizData} className="flex-1 saas-btn-primary py-4"><RotateCcw size={18}/> Restart</button>
              </div>
           </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <Sidebar />

      <main className="pt-28 pb-12 px-4 sm:px-6 lg:px-8 lg:pl-72">
        <div className="max-w-6xl mx-auto h-full">

          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Quiz Session</h1>
              <button onClick={() => navigate(`/dashboard/notes/${id}`)} className="flex items-center gap-2 text-sm font-semibold uppercase text-slate-500 hover:text-indigo-400 transition-colors">
                <ArrowLeft size={16} /> Exit Quiz
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className={`glass-panel rounded-xl py-3 px-6 flex items-center gap-3 ${isLowTime ? 'animate-pulse border-red-500/50 bg-red-500/10' : ''}`}>
                <Clock size={20} className={isLowTime ? 'text-red-400' : 'text-slate-400'} />
                <span className={`text-xl font-bold tracking-widest ${isLowTime ? 'text-red-400' : 'text-white'}`}>
                  {String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}
                </span>
              </div>
              <button onClick={() => setConfirmSubmit(true)} className="saas-btn-primary !px-8">
                <Send size={18} /> Submit
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-1 min-w-0 w-full">
              <div className="saas-card mb-6">
                <AnimatePresence mode="wait">
                  {currentQ && (
                    <QuestionCard
                      key={safeIndex}
                      question={currentQ}
                      index={safeIndex}
                      total={total}
                      onAnswer={handleAnswer}
                      selectedAnswer={answers[safeIndex]?.answer}
                    />
                  )}
                </AnimatePresence>

                <div className="flex flex-wrap items-center justify-between mt-10 pt-8 border-t border-white/[0.05] gap-4">
                  <button onClick={() => dispatch(prevQuestion())} disabled={isFirst} className="saas-btn-secondary disabled:opacity-50 disabled:cursor-not-allowed">
                    <ChevronLeft size={20} /> Prev
                  </button>
                  <span className="text-[11px] uppercase tracking-widest font-bold text-slate-500 hidden sm:block">
                    {answers[safeIndex] ? <span className="text-indigo-400">✓ Saved</span> : 'Waiting...'}
                  </span>
                  {isLast ? (
                    <button onClick={() => setConfirmSubmit(true)} className="saas-btn-primary">
                      Finish <Send size={18} />
                    </button>
                  ) : (
                    <button onClick={() => dispatch(nextQuestion())} className="saas-btn-primary">
                      Next <ChevronRight size={20} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="w-full lg:w-72 flex-shrink-0">
              <div className="saas-card sticky top-28 space-y-6">
                <div className="bg-[#0B0F19] rounded-xl p-6 text-center border border-white/[0.05]">
                  <div className="text-xs font-bold uppercase text-slate-500 mb-2">Live Score</div>
                  <div className="text-4xl font-black text-indigo-400">{liveScore}/{total}</div>
                </div>
                <div>
                  <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-4 gap-3 mt-4">
                    {quizQuestions.map((_, i) => (
                      <button key={i} onClick={() => dispatch(goToQuestion(i))}
                        className={`aspect-square rounded-xl text-sm font-bold transition-all border ${
                          i === safeIndex ? 'bg-indigo-500 text-white border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.4)] scale-105' :
                          answers[i] ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-[#0B0F19] text-slate-500 border-white/[0.05] hover:border-white/[0.1]'
                        }`}>{i + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {confirmSubmit && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0B0F19]/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setConfirmSubmit(false)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="saas-card max-w-md w-full !p-8 space-y-8 text-center border-indigo-500/20 shadow-[0_0_50px_rgba(99,102,241,0.1)]">
              <h3 className="text-3xl font-bold text-white tracking-tight">Submit Quiz?</h3>
              <p className="text-slate-400 font-medium">You have answered {answered} out of {total} questions.</p>
              <div className="flex flex-col gap-4">
                <button onClick={handleSubmit} className="saas-btn-primary w-full py-4 text-lg">Yes, Submit Score</button>
                <button onClick={() => setConfirmSubmit(false)} className="saas-btn-secondary w-full py-4 text-lg">Keep Working</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}