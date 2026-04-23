import { memo } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle, XCircle, AlertCircle, Clock,
  RotateCcw, Trophy, Target, Zap, SkipForward,
} from 'lucide-react';

const getGrade = (pct) => {
  if (pct >= 90) return { grade: 'A+', label: 'Outstanding!',   color: 'text-emerald-600', bg: 'from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20', ring: 'border-emerald-400' };
  if (pct >= 80) return { grade: 'A',  label: 'Excellent!',     color: 'text-emerald-600', bg: 'from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20', ring: 'border-emerald-400' };
  if (pct >= 70) return { grade: 'B',  label: 'Good Job!',      color: 'text-blue-600',    bg: 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',   ring: 'border-blue-400' };
  if (pct >= 60) return { grade: 'C',  label: 'Keep Going!',    color: 'text-amber-600',   bg: 'from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20', ring: 'border-amber-400' };
  if (pct >= 50) return { grade: 'D',  label: 'Keep Trying!',   color: 'text-orange-600',  bg: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20',     ring: 'border-orange-400' };
  return             { grade: 'F',  label: 'Don\'t Give Up!', color: 'text-red-600',     bg: 'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20',         ring: 'border-red-400' };
};

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="flex flex-col items-center gap-1 p-4 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
    <Icon size={20} className={color} />
    <span className="text-2xl font-black text-slate-900 dark:text-white">{value}</span>
    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
  </div>
);

export const ResultScreen = memo(({ results, questions, answers, status, onRestart, onBack }) => {
  const { total, correct, skipped, percentage, timeTaken } = results;
  const { grade, label, color, bg, ring } = getGrade(percentage);
  const StatusIcon = status === 'timeout' ? AlertCircle : Trophy;
  const mins = Math.floor(timeTaken / 60);
  const secs = timeTaken % 60;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6 max-w-2xl mx-auto"
    >
      {/* Score hero */}
      <div className={`rounded-3xl bg-gradient-to-br ${bg} border ${ring} p-8 text-center space-y-4`}>
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
          className="inline-flex"
        >
          <StatusIcon size={52} className={color} />
        </motion.div>

        {status === 'timeout' && (
          <p className="text-sm font-bold text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300 px-4 py-1.5 rounded-full inline-block">
            ⏰ Time's Up — Auto Submitted
          </p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-1"
        >
          <div className={`text-7xl font-black ${color}`}>{percentage}%</div>
          <div className="text-2xl font-bold text-slate-700 dark:text-slate-200">{label}</div>
          <div className={`text-5xl font-black ${color} mt-2`}>Grade: {grade}</div>
        </motion.div>

        <div className={`inline-block text-xl font-bold text-slate-600 dark:text-slate-300`}>
          {correct} / {total} Correct
        </div>
      </div>

      {/* Stat cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        <StatCard icon={CheckCircle} label="Correct"    value={correct}          color="text-emerald-500" />
        <StatCard icon={XCircle}     label="Incorrect"  value={total - correct - (skipped||0)} color="text-red-500" />
        <StatCard icon={SkipForward} label="Skipped"    value={skipped || 0}     color="text-amber-500" />
        <StatCard icon={Clock}       label="Time Taken" value={`${mins}:${String(secs).padStart(2,'0')}`} color="text-blue-500" />
      </motion.div>

      {/* Review section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-3xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-6 space-y-4"
      >
        <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
          <Target size={18} className="text-indigo-500" />
          Answer Review
        </h3>
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {questions.map((q, i) => {
            const userAns  = answers[i];
            const correct  = userAns?.isCorrect;
            const skipped  = !userAns;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                className={`p-4 rounded-2xl border flex items-start gap-3 ${
                  skipped  ? 'bg-amber-50  dark:bg-amber-900/10  border-amber-200  dark:border-amber-800' :
                  correct  ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800' :
                             'bg-red-50    dark:bg-red-900/10    border-red-200    dark:border-red-800'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold ${
                  skipped ? 'bg-amber-400' : correct ? 'bg-emerald-500' : 'bg-red-500'
                }`}>
                  {skipped ? '–' : correct ? '✓' : '✗'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-900 dark:text-white mb-1 leading-snug">
                    Q{i+1}. {q.question}
                  </p>
                  {skipped ? (
                    <p className="text-xs text-amber-600 dark:text-amber-400">Not answered</p>
                  ) : (
                    <div className="text-xs space-y-0.5">
                      <p className={correct ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                        Your answer: <strong>{userAns.answer}</strong>
                      </p>
                      {!correct && (
                        <p className="text-emerald-600 dark:text-emerald-400">
                          Correct: <strong>{q.answer}</strong>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-4 rounded-2xl font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          ← Back to Note
        </button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onRestart}
          className="flex-1 py-4 rounded-2xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40"
        >
          <RotateCcw size={18} />
          Try Again
        </motion.button>
      </div>
    </motion.div>
  );
});

export default ResultScreen;
