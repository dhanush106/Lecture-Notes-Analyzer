import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FileText, Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import { login, register, clearError } from '../store/slices/authSlice';

export default function AuthPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector(state => state.auth);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin) {
      dispatch(login(formData));
    } else {
      dispatch(register(formData));
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[var(--clay-bg)] dark:bg-[var(--clay-bg-dark)]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-3 justify-center mb-6">
            <div className="w-14 h-14 clay-btn-primary !rounded-[18px] flex items-center justify-center">
              <FileText size={28} className="text-white" />
            </div>
          </Link>
          <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">
            {isLogin ? 'Welcome Back' : 'Get Started'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-3 font-medium">
            {isLogin
              ? 'Your personalized learning assistant awaits.'
              : 'Join the next generation of smart note-taking.'}
          </p>
        </div>

        <div className="clay-card">
          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6 p-4 clay-card-inner border border-red-200 dark:border-red-900/30 flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-bold"
            >
              <AlertCircle size={20} />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 dark:text-slate-500 mb-2 ml-1 tracking-widest">
                  Username
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="clay-input pl-12"
                    placeholder="student_pro"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-black uppercase text-slate-400 dark:text-slate-500 mb-2 ml-1 tracking-widest">
                Email Address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="clay-input pl-12"
                  placeholder="name@university.edu"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-slate-400 dark:text-slate-500 mb-2 ml-1 tracking-widest">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="clay-input pl-12"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="clay-btn-primary w-full py-4 text-lg"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={20} />
                </span>
              )}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              {isLogin ? "New here?" : 'Already a member?'}{' '}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  dispatch(clearError());
                }}
                className="text-[var(--clay-primary)] font-bold hover:underline"
              >
                {isLogin ? 'Create an account' : 'Sign in to access'}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}