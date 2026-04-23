import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FileText, Sparkles, Zap, BookOpen, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'Upload Notes',
    description: 'Upload PDF or TXT lecture notes for instant analysis'
  },
  {
    icon: Sparkles,
    title: 'AI Summary',
    description: 'Get concise summaries powered by advanced NLP'
  },
  {
    icon: Zap,
    title: 'Extract Keywords',
    description: 'Automatically identify key terms and concepts'
  },
  {
    icon: BookOpen,
    title: 'Generate Questions',
    description: 'Create quiz questions for better retention'
  }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--clay-bg)] dark:bg-[var(--clay-bg-dark)] overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/40 dark:bg-indigo-900/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200/40 dark:bg-purple-900/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl">
        <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl rounded-[24px] px-8 py-4 flex items-center justify-between border border-white/20 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 clay-btn-primary !rounded-[12px] flex items-center justify-center">
              <FileText size={20} className="text-white" />
            </div>
            <span className="font-black text-xl tracking-tight text-slate-800 dark:text-white">
              LECTURE<span className="gradient-text">NOTES</span>
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              to="/login"
              className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="clay-btn-primary !px-6 !py-2.5 !text-sm"
            >
              Join Now
            </Link>
          </div>
        </div>
      </header>

      <section className="pt-48 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 clay-card-inner !rounded-full mb-8 border border-white/50">
              <Sparkles size={16} className="text-indigo-500" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">AI-Powered Note Intelligence</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black text-slate-800 dark:text-white mb-8 tracking-tighter leading-[0.9]">
              Revolutionize How <br />
              <span className="gradient-text">You Learn.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 max-w-3xl mx-auto mb-12 font-medium leading-relaxed">
              Transform messy lecture notes into organized summaries, 
              interactive quizzes, and key insights in a single click.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                to="/register"
                className="clay-btn-primary !px-12 !py-5 !text-xl group"
              >
                Get Started for Free
                <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="clay-btn-secondary !px-12 !py-5 !text-xl"
              >
                Live Demo
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            {features.map(({ icon: Icon, title, description }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="clay-card hover:-translate-y-2 transition-all duration-500"
              >
                <div className="w-16 h-16 clay-card-inner !rounded-[20px] flex items-center justify-center mb-6 text-indigo-500">
                  <Icon size={32} />
                </div>
                <h3 className="font-black text-xl text-slate-800 dark:text-white mb-3 tracking-tight">{title}</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-20 px-6 text-center border-t border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center gap-3 justify-center mb-6 opacity-50 grayscale hover:grayscale-0 transition-all">
          <div className="w-8 h-8 clay-btn-primary !rounded-[8px] flex items-center justify-center">
            <FileText size={16} className="text-white" />
          </div>
          <span className="font-black text-sm tracking-tight text-slate-800 dark:text-white uppercase">
            LectureNotes
          </span>
        </div>
        <p className="text-slate-400 dark:text-slate-600 text-sm font-bold tracking-widest uppercase">
          © 2026 Crafted for the curious minds.
        </p>
      </footer>
    </div>
  );
}