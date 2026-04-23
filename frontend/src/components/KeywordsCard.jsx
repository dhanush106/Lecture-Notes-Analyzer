import { motion } from 'framer-motion';
import { Hash } from 'lucide-react';

export default function KeywordsCard({ keywords }) {
  if (!keywords || keywords.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <Hash size={20} />
          <span>No keywords extracted</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="card"
    >
      <div className="flex items-center gap-2 mb-6">
        <Hash size={22} className="text-purple-500" />
        <h3 className="font-bold text-xl gradient-text">Keywords</h3>
      </div>

      <div className="flex flex-wrap gap-3">
        {keywords.map((kw, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="clay-badge bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400"
          >
            {kw}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}