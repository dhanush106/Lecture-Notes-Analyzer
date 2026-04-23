import { motion } from 'framer-motion';
import { FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function NoteCard({ note, onClick, onAnalyze, onDelete }) {
  const statusConfig = {
    pending: { color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800', icon: Clock },
    processing: { color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30', icon: Clock },
    completed: { color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30', icon: CheckCircle },
    failed: { color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30', icon: AlertCircle }
  };

  const status = statusConfig[note.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card hover:shadow-md transition-shadow cursor-pointer group"
      onClick={() => onClick?.(note._id)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText size={20} className="text-primary-600 dark:text-primary-400" />
          </div>
          
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {note.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {note.fileName} • {formatDate(note.createdAt)}
            </p>
            
            {note.analysis?.keywords?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {note.analysis.keywords.slice(0, 3).map((kw, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${status.bg} ${status.color}`}>
            <StatusIcon size={12} />
            {note.status}
          </span>

          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {note.status === 'pending' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAnalyze?.(note._id);
                }}
                className="px-3 py-1 text-xs font-medium bg-primary-600 text-white rounded hover:bg-primary-700"
              >
                Analyze
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(note._id);
              }}
              className="px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}