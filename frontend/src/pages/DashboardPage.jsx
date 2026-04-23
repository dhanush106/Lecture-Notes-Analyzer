import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FileText, Upload, BookOpen, TrendingUp, ArrowRight, Plus } from 'lucide-react';
import { getMe } from '../store/slices/authSlice';
import { fetchNotes } from '../store/slices/notesSlice';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import NoteCard from '../components/NoteCard';

export default function DashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const { notes } = useSelector(state => state.notes);

  useEffect(() => {
    dispatch(getMe());
    dispatch(fetchNotes({ page: 1, limit: 5 }));
  }, [dispatch]);

  const recentNotes = notes.slice(0, 3);
  const stats = [
    { label: 'Total Notes', value: notes.length, icon: BookOpen },
    { label: 'Analyzed', value: notes.filter(n => n.status === 'completed').length, icon: FileText },
    { label: 'This Week', value: 0, icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-[var(--clay-bg)] dark:bg-[var(--clay-bg-dark)]">
      <Navbar />
      <Sidebar />
      
      <main className="pt-28 pb-12 px-4 sm:px-6 lg:px-8 lg:pl-72">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white tracking-tight">
                Hey, {user?.username}! 👋
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
                Ready to transform your lecture notes today?
              </p>
            </div>
            <Link
              to="/dashboard/upload"
              className="clay-btn-primary hidden md:flex"
            >
              <Plus size={20} strokeWidth={3} />
              <span className="ml-2">New Note</span>
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {stats.map(({ label, value, icon: Icon }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="clay-card !p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">{label}</p>
                    <p className="text-4xl font-black text-slate-800 dark:text-white mt-2">{value}</p>
                  </div>
                  <div className="w-16 h-16 clay-card-inner !rounded-[20px] flex items-center justify-center text-indigo-500">
                    <Icon size={32} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="clay-card !p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                Recent Notes
              </h2>
              <Link
                to="/dashboard/notes"
                className="flex items-center gap-2 text-[var(--clay-primary)] text-sm font-bold hover:underline"
              >
                Explore Library
                <ArrowRight size={18} />
              </Link>
            </div>

            {recentNotes.length > 0 ? (
              <div className="grid gap-6">
                {recentNotes.map(note => (
                  <NoteCard
                    key={note._id}
                    note={note}
                    onClick={(id) => navigate(`/dashboard/notes/${id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 clay-card-inner !rounded-[32px]">
                <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <BookOpen size={48} className="text-slate-300 dark:text-slate-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No notes analyzed yet</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-8 font-medium">
                  Upload your first PDF or image to get started with AI summaries.
                </p>
                <Link
                  to="/dashboard/upload"
                  className="clay-btn-primary"
                >
                  <Upload size={20} className="mr-2" />
                  Upload Now
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}