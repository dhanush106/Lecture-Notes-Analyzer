import { motion } from 'framer-motion';
import { Check, X, Circle } from 'lucide-react';

export const QuestionCard = ({ question, index, total, onAnswer, selectedAnswer, showResult }) => {
  const { question: q, options, answer, difficulty, type } = question;

  const isMCQ = type === 'mcq' || (options && options.length > 0);

  const getOptionState = (opt, optionIndex) => {
    const optionLetter = String.fromCharCode(65 + optionIndex);
    if (!showResult) {
      return selectedAnswer === optionLetter ? 'selected' : 'default';
    }
    if (optionLetter === answer) {
      return 'correct';
    }
    if (selectedAnswer === optionLetter && selectedAnswer !== answer) {
      return 'incorrect';
    }
    return 'default';
  };

  const stateStyles = {
    default: 'clay-btn-secondary hover:translate-y-[-2px] border-transparent',
    selected: 'bg-[var(--clay-primary)] text-white shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1)] border-transparent',
    correct: 'bg-green-500 text-white shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1)] border-transparent',
    incorrect: 'bg-red-500 text-white shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1)] border-transparent'
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 bg-[var(--clay-primary)] text-white text-sm rounded-full flex items-center justify-center font-bold">
            {index + 1}
          </span>
          <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
            OF {total}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`clay-badge ${
            difficulty === 'easy'
              ? 'bg-green-100 text-green-700'
              : difficulty === 'medium'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {difficulty || 'medium'}
          </span>
          <span className="clay-badge bg-blue-100 text-blue-700">
            {type || 'MCQ'}
          </span>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
        {q}
      </h2>

      <div className="space-y-4">
        {isMCQ ? (
          options.map((opt, i) => {
            const optionLetter = String.fromCharCode(65 + i);
            const optionText = opt.includes('.') ? opt.split('.').slice(1).join('.').trim() : opt;
            const state = getOptionState(opt, i);
            const Icon = state === 'correct' ? Check : 
                      state === 'incorrect' ? X : Circle;

            return (
              <motion.button
                key={i}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => !showResult && onAnswer && onAnswer(optionLetter)}
                disabled={showResult}
                className={`w-full text-left px-6 py-5 rounded-[24px] transition-all flex items-center gap-4 ${stateStyles[state]}`}
              >
                <span className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                  state === 'correct' || state === 'incorrect' || state === 'selected'
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}>
                  {optionLetter}
                </span>
                <span className="flex-1 font-medium">
                  {optionText}
                </span>
                {showResult && state !== 'default' && (
                  <Icon size={24} />
                )}
              </motion.button>
            );
          })
        ) : (
          <div className="p-6 clay-card-inner">
            <p className="text-sm font-bold text-[var(--clay-primary)] mb-2 uppercase">Short Answer / Viva Question</p>
            <p className="text-gray-700 dark:text-gray-300 italic">
              Think about the answer before checking the solution.
            </p>
            {showResult && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
              >
                <p className="font-bold text-green-600 dark:text-green-400">Answer Hint:</p>
                <p className="text-gray-900 dark:text-white mt-1">{answer}</p>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const QuestionsList = ({ questions }) => {
  if (!questions || questions.length === 0) return null;
  
  return (
    <div className="clay-card space-y-6">
      <h3 className="font-bold text-xl gradient-text">Practice Questions</h3>
      <div className="space-y-4">
        {questions.map((q, i) => (
          <div key={i} className="p-6 clay-card-inner">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[var(--clay-primary)] uppercase">{q.type || 'MCQ'}</span>
              <span className="text-xs text-gray-500 font-bold">#{i + 1}</span>
            </div>
            <p className="font-bold text-gray-900 dark:text-white mb-3">{q.question}</p>
            {q.type === 'mcq' && q.options && (
              <div className="pl-4 space-y-1 mb-3 text-sm text-gray-600 dark:text-gray-400">
                {q.options.map((opt, j) => (
                  <p key={j}>{opt}</p>
                ))}
              </div>
            )}
            <p className="text-sm font-bold text-green-600 dark:text-green-400">Answer: {q.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
};