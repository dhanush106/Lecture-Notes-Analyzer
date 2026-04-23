import { motion } from 'framer-motion';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export const QuizTimer = ({ timeRemaining, totalTime }) => {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const isLow = timeRemaining < 60;
  const percentage = (timeRemaining / totalTime) * 100;

  return (
    <motion.div
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      className="flex items-center gap-3"
    >
      <div className={`relative w-16 h-16 rounded-full flex items-center justify-center ${
        isLow
          ? 'bg-red-100 dark:bg-red-900/30'
          : 'bg-gray-100 dark:bg-gray-800'
      }`}>
        <Clock size={20} className={isLow ? 'text-red-600' : 'text-gray-500'} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-lg font-bold ${isLow ? 'text-red-600' : 'text-gray-700 dark:text-gray-200'}`}>
            {minutes}:{seconds.toString().padStart(2, '0')}
          </span>
        </div>
      </div>
      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: `${percentage}%` }}
          className={`h-full rounded-full ${
            isLow ? 'bg-red-500' : 'bg-primary-500'
          }`}
        />
      </div>
    </motion.div>
  );
};

export const QuizProgress = ({ current, total, answered }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">
          Question {current + 1} of {total}
        </span>
        <span className="text-gray-500 dark:text-gray-500">
          {answered.length} answered
        </span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            className={`flex-1 h-2 rounded-full transition-colors ${
              i === current
                ? 'bg-primary-500'
                : i < current
                ? 'bg-primary-500/50'
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export const QuizStatus = ({ score, total, status }) => {
  const percentage = Math.round((score / total) * 100);
  let grade = 'F';
  let color = 'text-red-600';
  let bg = 'bg-red-100 dark:bg-red-900/30';
  
  if (percentage >= 90) { grade = 'A'; color = 'text-green-600'; bg = 'bg-green-100 dark:bg-green-900/30'; }
  else if (percentage >= 80) { grade = 'B'; color = 'text-green-600'; bg = 'bg-green-100 dark:bg-green-900/30'; }
  else if (percentage >= 70) { grade = 'C'; color = 'text-yellow-600'; bg = 'bg-yellow-100 dark:bg-yellow-900/30'; }
  else if (percentage >= 60) { grade = 'D'; color = 'text-orange-600'; bg = 'bg-orange-100 dark:bg-orange-900/30'; }

  const StatusIcon = status === 'completed' ? CheckCircle : 
                   status === 'timeout' ? AlertCircle : XCircle;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`${bg} rounded-2xl p-8 text-center`}
    >
      <StatusIcon size={48} className={`mx-auto mb-4 ${color}`} />
      <p className="text-sm uppercase tracking-wide mb-2">
        {status === 'completed' ? 'Quiz Complete!' : 'Time Up!'}
      </p>
      <div className={`text-5xl font-bold ${color} mb-2`}>
        {score}/{total}
      </div>
      <p className="text-lg font-semibold">{percentage}%</p>
      <div className={`inline-block px-4 py-1 rounded-full ${bg} ${color} font-bold text-xl mt-4`}>
        Grade: {grade}
      </div>
    </motion.div>
  );
};