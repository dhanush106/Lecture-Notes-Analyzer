import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, FileText, Activity, Layers, Tag, HelpCircle, AlertCircle } from 'lucide-react';
import { fetchNoteById, clearCurrentNote } from '../store/slices/notesSlice';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function ResultsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentNote, loading } = useSelector(state => state.notes);

  useEffect(() => {
    dispatch(fetchNoteById(id));
    return () => dispatch(clearCurrentNote());
  }, [dispatch, id]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <Sidebar />
        <main className="pt-28 flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-400 font-bold tracking-widest uppercase">Loading Document...</p>
        </main>
      </div>
    );
  }

  if (!currentNote) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <Sidebar />
        <main className="pt-28 flex flex-col items-center justify-center">
           <AlertCircle size={64} className="text-slate-600 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Note Not Found</h2>
          <button onClick={() => navigate('/dashboard/notes')} className="saas-btn-secondary">Go Back</button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <Sidebar />
      
      <main className="pt-28 pb-12 px-4 sm:px-6 lg:px-8 lg:pl-72 relative z-10">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <button onClick={() => navigate('/dashboard/notes')} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-400 mb-4 transition-colors">
                <ArrowLeft size={16} /> Back to Library
              </button>
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${
                  currentNote.status === 'completed' 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                  {currentNote.status}
                </span>
                <span className="text-slate-500 text-sm font-medium">Uploaded {new Date(currentNote.createdAt).toLocaleDateString()}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                {currentNote.title}
              </h1>
            </motion.div>
            
            {currentNote.status === 'completed' && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <button onClick={() => navigate(`/dashboard/notes/${id}/quiz`)} className="saas-btn-primary">
                  <Play size={18} className="fill-white" /> Start Quiz Session
                </button>
              </motion.div>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Left Column - Content & Summary */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 space-y-6">
              
              {currentNote.status === 'completed' ? (
                <>
                  <div className="saas-card relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="flex items-center gap-3 mb-6 relative z-10">
                      <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400">
                        <Activity size={24} />
                      </div>
                      <h2 className="text-2xl font-bold text-white">AI Summary</h2>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-[15px] relative z-10 font-medium">
                      {currentNote.analysis?.summary || "No summary available."}
                    </p>
                  </div>

                  {currentNote.analysis?.questions?.length > 0 && (
                    <div className="saas-card">
                       <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-cyan-500/20 rounded-xl text-cyan-400">
                          <HelpCircle size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Generated Quiz Preview</h2>
                      </div>
                      <div className="space-y-4">
                        {currentNote.analysis.questions.slice(0, 3).map((q, i) => (
                          <div key={i} className="p-5 bg-[#0B0F19] border border-white/[0.05] rounded-xl flex items-start gap-4">
                            <span className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold flex-shrink-0 text-sm">Q{i+1}</span>
                            <p className="text-slate-300 font-medium pt-1 text-sm">{typeof q === 'string' ? q : q.question}</p>
                          </div>
                        ))}
                      </div>
                      {currentNote.analysis.questions.length > 3 && (
                        <div className="mt-4 pt-4 border-t border-white/[0.05] text-center">
                          <p className="text-slate-500 text-sm font-semibold">+ {currentNote.analysis.questions.length - 3} more questions in the full quiz.</p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="saas-card text-center py-20">
                  <div className="w-20 h-20 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-amber-500">
                    <Layers size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Analysis Pending</h3>
                  <p className="text-slate-400 mb-6">This document is currently in the processing queue.</p>
                </div>
              )}
            </motion.div>

            {/* Right Column - Metadata & Keywords */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-6">
              
              <div className="saas-card">
                <div className="flex items-center gap-2 mb-4 text-white">
                  <FileText size={20} className="text-indigo-400" />
                  <h3 className="font-bold">Document Details</h3>
                </div>
                <div className="space-y-4 mt-6 border-t border-white/[0.05] pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-sm font-medium">Filename</span>
                    <span className="text-slate-200 text-sm font-semibold truncate max-w-[150px]">{currentNote.fileName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-sm font-medium">Type</span>
                    <span className="text-slate-200 text-xs font-bold uppercase tracking-widest bg-white/5 px-2 py-1 rounded">{currentNote.fileType}</span>
                  </div>
                </div>
              </div>

              {currentNote.status === 'completed' && currentNote.analysis?.keywords?.length > 0 && (
                <div className="saas-card">
                  <div className="flex items-center gap-2 mb-6 text-white">
                    <Tag size={20} className="text-emerald-400" />
                    <h3 className="font-bold">Key Concepts</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentNote.analysis.keywords.map((kw, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-lg bg-[#0B0F19] border border-white/[0.05] text-emerald-400 text-xs font-bold shadow-sm hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-colors cursor-default">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}