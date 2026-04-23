import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Check, AlertCircle } from 'lucide-react';
import { uploadNote } from '../store/slices/notesSlice';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function UploadPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { uploading } = useSelector(state => state.notes);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [ocrMode, setOcrMode] = useState('auto');

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const isValidFile = (file) => {
    const validTypes = ['application/pdf', 'text/plain', 'image/jpeg', 'image/png', 'image/jpg'];
    return validTypes.includes(file.type);
  };

  const processFile = (droppedFile) => {
    if (isValidFile(droppedFile)) {
      setFile(droppedFile);
      if (!title) {
        setTitle(droppedFile.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);
    if (file.type.startsWith('image/')) {
      formData.append('ocrMode', ocrMode);
    }

    const result = await dispatch(uploadNote(formData));
    if (result.meta.requestStatus === 'fulfilled') {
      navigate('/dashboard/notes');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <Sidebar />
      
      <main className="pt-28 pb-12 px-4 sm:px-6 lg:px-8 lg:pl-72 relative z-10">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Upload Notes
            </h1>
            <p className="text-slate-400 mt-2">Add a new document to your library for AI analysis.</p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="saas-card"
          >
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative rounded-2xl p-12 text-center transition-all duration-300 border-2 border-dashed ${
                dragActive
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : file 
                    ? 'border-emerald-500/30 bg-emerald-500/5' 
                    : 'border-white/[0.1] bg-[#0B0F19] hover:border-indigo-500/50 hover:bg-white/[0.02]'
              }`}
            >
              <input
                type="file"
                accept=".pdf,.txt,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploading}
              />
              
              <AnimatePresence mode="wait">
                {file ? (
                  <motion.div 
                    key="file-selected"
                    initial={{ scale: 0.9, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="space-y-4 relative z-10"
                  >
                    <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                      <Check size={32} />
                    </div>
                    <div>
                      <p className="font-bold text-white text-lg">{file.name}</p>
                      <p className="text-sm font-medium text-emerald-400/80 mt-1">
                        {formatFileSize(file.size)} • Ready to upload
                      </p>
                    </div>
                    {file.type.startsWith('image/') && (
                      <div className="mt-6 p-5 bg-[#0B0F19] border border-white/[0.05] rounded-xl text-left">
                        <label className="block text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3">
                          Image OCR Quality
                        </label>
                        <select 
                          value={ocrMode}
                          onChange={(e) => setOcrMode(e.target.value)}
                          className="w-full bg-[#111827] border border-white/[0.1] rounded-lg px-4 py-3 text-white outline-none focus:border-indigo-500 transition-colors"
                        >
                          <option value="auto">Auto-Detect Quality</option>
                          <option value="blur_enhancement">Enhance Blurry Image</option>
                          <option value="noise_removal">Remove Noise / Artifacts</option>
                          <option value="basic">Standard Fast OCR</option>
                        </select>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setFile(null);
                        setTitle('');
                      }}
                      className="text-red-400 text-sm font-semibold hover:text-red-300 transition-colors relative z-20 mt-4"
                    >
                      Remove file
                    </button>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="no-file"
                    initial={{ scale: 0.9, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto transition-colors duration-300 ${dragActive ? 'bg-indigo-500 text-white shadow-[0_0_30px_rgba(99,102,241,0.5)]' : 'bg-white/[0.03] text-slate-400 border border-white/[0.05]'}`}>
                      <Upload size={36} strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-white mb-2">
                        Drag & Drop your file
                      </p>
                      <p className="text-sm text-slate-500 font-medium">
                        or click to browse from your computer
                      </p>
                      <div className="flex items-center justify-center gap-2 mt-4 text-xs font-bold uppercase tracking-widest text-slate-600">
                        <span>PDF</span> • <span>Images</span> • <span>TXT</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-8">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                Document Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Intro to Machine Learning"
                className="saas-input"
                disabled={uploading}
              />
            </div>

            <button
              type="submit"
              disabled={!file || uploading}
              className={`saas-btn-primary w-full mt-8 py-4 ${(!file || uploading) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {uploading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                  Processing Document...
                </>
              ) : (
                <>
                  <FileText size={20} />
                  Analyze Document
                </>
              )}
            </button>
          </motion.form>
        </div>
      </main>
    </div>
  );
}