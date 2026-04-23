import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, HelpCircle, Lightbulb } from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// OptionItem — single answer option button
// ─────────────────────────────────────────────────────────────
export const OptionItem = memo(({ letter, text, state, onClick, disabled }) => {
  const styles = {
    default:   'bg-white dark:bg-[#1e2130] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-indigo-400 hover:shadow-indigo-100 dark:hover:shadow-indigo-900/30 hover:shadow-lg',
    selected:  'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40',
    correct:   'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/40',
    incorrect: 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-200 dark:shadow-red-900/40',
    missed:    'bg-emerald-100 dark:bg-emerald-900/30 border-2 border-emerald-500 text-emerald-800 dark:text-emerald-300',
  };

  const Icon = state === 'correct' || state === 'missed' ? Check : state === 'incorrect' ? X : null;

  const letterBg = {
    default:   'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
    selected:  'bg-white/20 text-white',
    correct:   'bg-white/20 text-white',
    incorrect: 'bg-white/20 text-white',
    missed:    'bg-emerald-200 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-200',
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.015, translateX: 4 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-left px-5 py-4 rounded-2xl border transition-all duration-200 flex items-center gap-4 cursor-pointer ${styles[state]} ${disabled && state === 'default' ? 'opacity-50' : ''}`}
    >
      <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors ${letterBg[state]}`}>
        {letter}
      </span>
      <span className="flex-1 font-medium text-sm leading-snug">{text}</span>
      <AnimatePresence>
        {Icon && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0 }}
            className="flex-shrink-0"
          >
            <Icon size={20} />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
});

// ─────────────────────────────────────────────────────────────
// QuestionCard — full question display with options
// ─────────────────────────────────────────────────────────────
export const QuestionCard = memo(({
  question, index, total, onAnswer, selectedAnswer, showResult,
}) => {
  const { question: q, options, answer, difficulty, type } = question;
  const isMCQ = type === 'mcq' || (options && options.length > 0);

  const getState = (optIndex) => {
    const letter = String.fromCharCode(65 + optIndex);
    if (!showResult) return selectedAnswer === letter ? 'selected' : 'default';
    if (letter === answer) return selectedAnswer === letter ? 'correct' : 'missed';
    if (selectedAnswer === letter) return 'incorrect';
    return 'default';
  };

  const difficultyConfig = {
    easy:   { cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', label: 'Easy' },
    medium: { cls: 'bg-amber-100   text-amber-700   dark:bg-amber-900/30   dark:text-amber-300',   label: 'Medium' },
    hard:   { cls: 'bg-red-100     text-red-700     dark:bg-red-900/30     dark:text-red-300',     label: 'Hard' },
  };
  const diff = difficultyConfig[difficulty] || difficultyConfig.medium;

  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">{index + 1}</span>
          </div>
          <span className="text-slate-400 dark:text-slate-500 font-semibold text-sm">
            of {total}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${diff.cls}`}>
            {diff.label}
          </span>
          <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
            {type === 'mcq' ? 'MCQ' : type === 'viva' ? 'Viva' : 'Short'}
          </span>
        </div>
      </div>

      {/* Question text */}
      <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
        {q}
      </h2>

      {/* Options */}
      <div className="space-y-3">
        {isMCQ ? (
          options.map((opt, i) => {
            const letter = String.fromCharCode(65 + i);
            const text = opt.includes('. ') ? opt.split('. ').slice(1).join('. ').trim() : opt;
            return (
              <OptionItem
                key={i}
                letter={letter}
                text={text}
                state={getState(i)}
                onClick={() => !showResult && onAnswer && onAnswer(letter)}
                disabled={showResult}
              />
            );
          })
        ) : (
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center gap-2">
              <HelpCircle size={16} className="text-indigo-500" />
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                {type === 'viva' ? 'Viva Question' : 'Short Answer'}
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 italic text-sm leading-relaxed">
              Think through your answer before revealing the solution below.
            </p>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb size={16} className="text-emerald-500" />
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Answer:</span>
                </div>
                <p className="text-slate-900 dark:text-white text-sm leading-relaxed">{answer}</p>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
});

// ─────────────────────────────────────────────────────────────
// QuizTimer
// ─────────────────────────────────────────────────────────────
export const QuizTimer = memo(({ timeRemaining, totalTime }) => {
  const mins = Math.floor(timeRemaining / 60);
  const secs = timeRemaining % 60;
  const pct  = (timeRemaining / totalTime) * 100;
  const isLow = timeRemaining < 60;
  const isCritical = timeRemaining < 30;

  return (
    <div className="flex items-center gap-3">
      <div className={`relative flex flex-col items-center justify-center w-16 h-16 rounded-2xl font-bold text-sm transition-colors ${
        isCritical ? 'bg-red-100 dark:bg-red-900/30 text-red-600' :
        isLow      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' :
                     'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
      }`}>
        <span className="text-lg leading-none">{String(mins).padStart(2,'0')}</span>
        <span className="text-xs leading-none opacity-60">:{String(secs).padStart(2,'0')}</span>
      </div>
      <div className="hidden sm:flex flex-col gap-1 w-20">
        <span className="text-[10px] text-slate-400 font-semibold uppercase">Time</span>
        <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5 }}
            className={`h-full rounded-full ${isCritical ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-indigo-500'}`}
          />
        </div>
      </div>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────
// QuizNavGrid — right-panel question number grid
// ─────────────────────────────────────────────────────────────
export const QuizNavGrid = memo(({ questions, answers, currentIndex, onGoto }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Questions</h3>
      <div className="grid grid-cols-5 gap-2">
        {questions.map((_, i) => {
          const isActive   = i === currentIndex;
          const isAnswered = !!answers[i];
          return (
            <motion.button
              key={i}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onGoto(i)}
              className={`w-full aspect-square rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50'
                  : isAnswered
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {i + 1}
            </motion.button>
          );
        })}
      </div>
      {/* Legend */}
      <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-700">
        {[
          { color: 'bg-indigo-600', label: 'Current' },
          { color: 'bg-emerald-500', label: 'Answered' },
          { color: 'bg-slate-200 dark:bg-slate-700', label: 'Unanswered' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded ${color}`} />
            <span className="text-[11px] text-slate-500 dark:text-slate-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────
// QuizProgressBar — top linear progress
// ─────────────────────────────────────────────────────────────
export const QuizProgressBar = memo(({ current, total, answered }) => {
  const pct = Math.round(((current + 1) / total) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-slate-400 font-semibold">
        <span>Q{current + 1} / {total}</span>
        <span>{answered} answered</span>
      </div>
      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
        />
      </div>
    </div>
  );
});