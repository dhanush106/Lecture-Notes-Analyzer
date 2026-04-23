import { motion } from 'framer-motion';
import { FileText, Sparkles } from 'lucide-react';

export default function SummaryCard({ summary }) {
  if (!summary) {
    return (
      <div className="card">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <FileText size={20} />
          <span>No summary available</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="card"
    >
      <div className="flex items-center gap-2 mb-6">
        <Sparkles size={22} className="text-indigo-500" />
        <h3 className="font-bold text-xl gradient-text">Smart Summary</h3>
      </div>
      
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {summary}
        </p>
      </div>
    </motion.div>
  );
}