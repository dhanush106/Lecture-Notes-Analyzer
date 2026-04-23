import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FileText, Upload, BookOpen, Trophy, ArrowRight, Plus, Activity, Clock, Target } from 'lucide-react';
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
  const [history, setHistory] = useState([]);

  useEffect(() => {
    dispatch(getMe());
    dispatch(fetchNotes({ page: 1, limit: 5 }));
    // Load local history
    try {
      const local = JSON.parse(localStorage.getItem('quizHistory') || '[]');
      setHistory(local.sort((a,b) => new Date(b.date) - new Date(a.date)));
    } catch (e) { console.error(e); }
  }, [dispatch]);

  const recentNotes = notes.slice(0, 3);
  const analyzedNotes = notes.filter(n => n.status === 'completed');
  const avgScore = history.length > 0 
    ? Math.round(history.reduce((acc, h) => acc + h.percentage, 0) / history.length)
    : 0;

  const stats = [
    { label: 'Total Notes', value: notes.length, icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Analyzed', value: analyzedNotes.length, icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { label: 'Quizzes Taken', value: history.length, icon: Trophy, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
    { label: 'Avg Score', value: `${avgScore}%`, icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19]">
      <Navbar />
      <Sidebar />
      
      <main className="pt-28 pb-12 px-4 sm:px-6 lg:px-8 lg:pl-72 relative z-10">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <Activity size={14} /> Dashboard Overview
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                Welcome back, {user?.username || 'Student'}! 👋
              </h1>
              <p className="text-slate-400 mt-3 text-lg font-medium">
                Ready to transform your lecture notes into active knowledge?
              </p>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex gap-4">
              <Link to="/dashboard/upload" className="saas-btn-primary group">
                <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                <span>New Note</span>
              </Link>
            </motion.div>
          </div>

          {/* Stats Grid */}
          <motion.div 
            variants={containerVariants} initial="hidden" animate="show"
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {stats.map(({ label, value, icon: Icon, color, bg }) => (
              <motion.div key={label} variants={itemVariants} className="saas-card flex items-center justify-between group overflow-hidden relative">
                <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/[0.02] group-hover:scale-150 transition-transform duration-500 ease-out" />
                <div className="relative z-10">
                  <p className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">{label}</p>
                  <p className="text-4xl font-black text-white tracking-tight">{value}</p>
                </div>
                <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center relative z-10 border border-white/[0.05] shadow-inner`}>
                  <Icon size={28} className={color} strokeWidth={2.5} />
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Recent Notes */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white tracking-tight">Recent Notes</h2>
                <Link to="/dashboard/notes" className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
                  View Library <ArrowRight size={16} />
                </Link>
              </div>

              {recentNotes.length > 0 ? (
                <div className="grid gap-5">
                  {recentNotes.map(note => (
                    <NoteCard key={note._id} note={note} onClick={(id) => navigate(`/dashboard/notes/${id}`)} />
                  ))}
                </div>
              ) : (
                <div className="glass-panel rounded-2xl p-12 text-center">
                  <div className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-400">
                    <Upload size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No notes analyzed yet</h3>
                  <p className="text-slate-400 font-medium mb-6 max-w-sm mx-auto">Upload your first PDF or image to get started with AI summaries and auto-generated quizzes.</p>
                  <Link to="/dashboard/upload" className="saas-btn-primary">
                    <Upload size={18} /> Upload Now
                  </Link>
                </div>
              )}
            </motion.div>

            {/* Quiz History Sidebar */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-6">
              <h2 className="text-2xl font-bold text-white tracking-tight">Quiz History</h2>
              <div className="saas-card !p-0 overflow-hidden flex flex-col h-[400px]">
                <div className="p-5 border-b border-white/[0.05] bg-white/[0.01]">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Latest Attempts</p>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {history.length > 0 ? history.slice(0, 8).map((attempt, i) => (
                    <div key={i} className="p-4 rounded-xl hover:bg-white/[0.03] transition-colors border border-transparent hover:border-white/[0.05] group cursor-pointer" onClick={() => navigate(`/dashboard/notes/${attempt.noteId}/quiz`)}>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1 pr-4">{attempt.title}</span>
                        <span className={`text-xs font-black px-2 py-1 rounded-md ${
                          attempt.percentage >= 80 ? 'bg-emerald-500/10 text-emerald-400' :
                          attempt.percentage >= 60 ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
                        }`}>{attempt.percentage}%</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                        <Clock size={12} />
                        {new Date(attempt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  )) : (
                    <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                      <Trophy size={32} className="text-slate-600 mb-4" />
                      <p className="text-slate-400 text-sm font-medium">No quizzes taken yet.</p>
                      <p className="text-slate-500 text-xs mt-1">Complete a quiz to see your history here.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
            
          </div>
        </div>
      </main>
    </div>
  );
}