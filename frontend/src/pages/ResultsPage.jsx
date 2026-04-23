import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Search } from 'lucide-react';
import { fetchNoteById, analyzeNote, clearCurrentNote } from '../store/slices/notesSlice';
import { startQuizMode, toggleDarkMode } from '../store/slices/uiSlice';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import SummaryCard from '../components/SummaryCard';
import KeywordsCard from '../components/KeywordsCard';
import { QuestionsList, QuestionCard } from '../components/QuestionCard';
import SearchHighlight from '../components/SearchHighlight';
import LoadingSpinner from '../components/LoadingSpinner';
import AnalyzingAnimation from '../components/LoadingSpinner';

export default function ResultsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentNote, loading, analyzing } = useSelector(state => state.notes);
  const { quizMode, currentQuizIndex, quizAnswers } = useSelector(state => state.ui);

  useEffect(() => {
    dispatch(fetchNoteById(id));
    return () => dispatch(clearCurrentNote());
  }, [dispatch, id]);

  const handleAnalyze = () => {
    dispatch(analyzeNote(id));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <main className="pt-24 flex items-center justify-center">
          <LoadingSpinner text="Loading note..." />
        </main>
      </div>
    );
  }

  if (!currentNote) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <main className="pt-24 flex items-center justify-center">
          <p className="text-gray-500">Note not found</p>
        </main>
      </div>
    );
  }

  if (analyzing || currentNote.status === 'processing') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <main className="pt-24 flex items-center justify-center">
          <AnalyzingAnimation />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--clay-bg)] dark:bg-[var(--clay-bg-dark)]">
      <Navbar />
      <Sidebar />
      
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 lg:pl-72">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
            <div>
              <button
                onClick={() => navigate('/dashboard/notes')}
                className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[var(--clay-primary)] transition-colors uppercase tracking-wider mb-2"
              >
                <ArrowLeft size={16} />
                Back to Library
              </button>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {currentNote.title}
              </h1>
            </div>

            <div className="flex gap-3">
              {currentNote.status === 'pending' && (
                <button
                  onClick={handleAnalyze}
                  className="btn-primary flex items-center gap-2"
                >
                  Analyze Content
                </button>
              )}
              {currentNote.analysis?.questions?.length > 0 && (
                <button
                  onClick={() => dispatch(startQuizMode())}
                  className="btn-secondary flex items-center gap-2 border-2 border-[var(--clay-primary)]/20"
                >
                  <Play size={18} fill="currentColor" />
                  Start Quiz
                </button>
              )}
            </div>
          </div>

          {quizMode ? (
            <div className="max-w-3xl mx-auto">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-2xl font-bold gradient-text">Quiz Session</h2>
                <div className="clay-badge bg-white dark:bg-gray-800 text-[var(--clay-primary)]">
                  Question {currentQuizIndex + 1} of {currentNote.analysis.questions.length}
                </div>
              </div>
              
              <div className="clay-card">
                <QuestionCard
                  question={currentNote.analysis.questions[currentQuizIndex]}
                  index={currentQuizIndex}
                  total={currentNote.analysis.questions.length}
                />
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid gap-8 lg:grid-cols-3"
            >
              <div className="lg:col-span-2 space-y-8">
                {currentNote.status === 'completed' ? (
                  <>
                    <SummaryCard summary={currentNote.analysis.summary} />
                    <div className="clay-card">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-xl gradient-text">Note Content</h3>
                        <div className="text-xs font-bold text-gray-400 uppercase">
                          {currentNote.analysis.wordCount} Words
                        </div>
                      </div>
                      <SearchHighlight
                        content={currentNote.originalContent}
                        noteId={currentNote._id}
                      />
                    </div>
                  </>
                ) : (
                  <div className="clay-card text-center py-20">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Search className="text-gray-400" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Ready to Analyze</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-8">
                      We'll extract key concepts, generate a summary, and create practice questions for you.
                    </p>
                    <button onClick={handleAnalyze} className="btn-primary">
                      Begin Analysis
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-8">
                <div className="clay-card">
                  <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Note Metadata</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">File Name</span>
                      <span className="font-medium text-gray-900 dark:text-white">{currentNote.fileName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type</span>
                      <span className="clay-badge bg-blue-50 text-blue-600">{currentNote.fileType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Uploaded</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {new Date(currentNote.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {currentNote.status === 'completed' && (
                  <>
                    <KeywordsCard keywords={currentNote.analysis.keywords} />
                    <QuestionsList questions={currentNote.analysis.questions} />
                  </>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}