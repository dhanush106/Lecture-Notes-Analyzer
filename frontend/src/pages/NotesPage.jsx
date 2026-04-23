import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Plus } from 'lucide-react';
import { fetchNotes, deleteNote, analyzeNote } from '../store/slices/notesSlice';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import NoteCard from '../components/NoteCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function NotesPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notes, loading, analyzing } = useSelector(state => state.notes);
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchNotes({ page }));
  }, [dispatch, page]);

  const handleAnalyze = (id) => {
    dispatch(analyzeNote(id));
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this note?')) {
      dispatch(deleteNote(id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <Sidebar />
      
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 lg:pl-72">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                My Notes
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {notes.length} notes in total
              </p>
            </div>
            <Link
              to="/dashboard/upload"
              className="flex items-center gap-2 btn-primary"
            >
              <Plus size={18} />
              Upload
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner text="Loading notes..." />
            </div>
          ) : notes.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {notes.map(note => (
                <NoteCard
                  key={note._id}
                  note={note}
                  onClick={(id) => navigate(`/dashboard/notes/${id}`)}
                  onAnalyze={handleAnalyze}
                  onDelete={handleDelete}
                />
              ))}
            </motion.div>
          ) : (
            <div className="card text-center py-16">
              <BookOpen size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No notes yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Upload your first lecture note to get started
              </p>
              <Link
                to="/dashboard/upload"
                className="inline-flex items-center gap-2 btn-primary"
              >
                <Plus size={18} />
                Upload Notes
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}