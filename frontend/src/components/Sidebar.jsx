import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, Upload, X, Settings } from 'lucide-react';
import { setSidebarOpen } from '../store/slices/uiSlice';

export default function Sidebar() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { sidebarOpen } = useSelector(state => state.ui);

  const links = [
    { to: '/dashboard', icon: Home, label: 'Dashboard', exact: true },
    { to: '/dashboard/notes', icon: FileText, label: 'My Notes' },
    { to: '/dashboard/upload', icon: Upload, label: 'Upload' }
  ];

  const isActive = (path, exact) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch(setSidebarOpen(false))}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
          
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed left-0 top-0 bottom-0 w-64 clay-container shadow-[8px_0_15px_rgba(0,0,0,0.05)] dark:shadow-[8px_0_15px_rgba(0,0,0,0.2)] z-50 lg:hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-transparent">
              <span className="font-bold text-lg text-[#2d3748] dark:text-white">Menu</span>
              <button
                onClick={() => dispatch(setSidebarOpen(false))}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="p-4 space-y-2">
              {links.map(({ to, icon: Icon, label, exact }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => dispatch(setSidebarOpen(false))}
                  className={`flex items-center gap-3 px-4 py-3 rounded-[15px] font-medium transition-all ${
                    isActive(to, exact)
                      ? 'clay-btn-secondary shadow-[inset_4px_4px_8px_rgba(0,0,0,0.06),inset_-4px_-4px_8px_rgba(255,255,255,0.7)] text-[#6c9cff]'
                      : 'text-[#718096] dark:text-gray-300 hover:text-[#2d3748] dark:hover:text-white hover:clay-card-hover'
                  }`}
                >
                  <Icon size={20} />
                  {label}
                </Link>
              ))}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}