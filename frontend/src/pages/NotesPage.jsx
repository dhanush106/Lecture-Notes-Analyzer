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
  const { notes, loading } = useSelector(state => state.notes);
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
    <div className="min-h-screen">
      <Navbar />
      <Sidebar />
      
      <main className="pt-28 pb-12 px-4 sm:px-6 lg:px-8 lg:pl-72 relative z-10">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                My Notes Library
              </h1>
              <p className="text-slate-400 mt-3 text-lg font-medium">
                {notes.length} documents analyzed and ready for review
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <Link
                to="/dashboard/upload"
                className="saas-btn-primary group"
              >
                <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                <span>Upload New</span>
              </Link>
            </motion.div>
          </div>

          {loading ? (
            <div className="flex justify-center py-32">
              <LoadingSpinner text="Loading your library..." />
            </div>
          ) : notes.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
            >
              {notes.map((note, i) => (
                <motion.div key={note._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <NoteCard
                    note={note}
                    onClick={(id) => navigate(`/dashboard/notes/${id}`)}
                    onAnalyze={handleAnalyze}
                    onDelete={handleDelete}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel text-center py-24 rounded-3xl">
              <div className="w-24 h-24 bg-indigo-500/10 border border-indigo-500/20 rounded-[24px] flex items-center justify-center mx-auto mb-6 text-indigo-400">
                <BookOpen size={40} strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight mb-3">
                Library is empty
              </h3>
              <p className="text-slate-400 font-medium max-w-sm mx-auto mb-8 text-lg">
                You haven't uploaded any lecture notes yet. Add your first PDF to generate AI study materials.
              </p>
              <Link
                to="/dashboard/upload"
                className="saas-btn-primary"
              >
                <Plus size={20} />
                <span>Upload Note</span>
              </Link>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}