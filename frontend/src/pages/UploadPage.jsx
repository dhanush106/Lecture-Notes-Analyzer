import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Upload, FileText, X, Check } from 'lucide-react';
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

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (isValidFile(droppedFile)) {
        setFile(droppedFile);
        if (!title) {
          setTitle(droppedFile.name.replace(/\.[^/.]+$/, ''));
        }
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const isValidFile = (file) => {
    const validTypes = ['application/pdf', 'text/plain', 'image/jpeg', 'image/png', 'image/jpg'];
    return validTypes.includes(file.type);
  };

  const [ocrMode, setOcrMode] = useState('auto');

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <Sidebar />
      
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 lg:pl-72">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Upload Lecture Notes
          </h1>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="card"
          >
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative rounded-[24px] p-12 text-center transition-all duration-300 ${
                dragActive
                  ? 'shadow-[inset_6px_6px_10px_rgba(0,0,0,0.06),inset_-6px_-6px_10px_rgba(255,255,255,0.7)] border-2 border-dashed border-[#6c9cff] bg-[#e0e5ec] dark:bg-[#2f3b52] dark:shadow-[inset_6px_6px_10px_rgba(0,0,0,0.3),inset_-6px_-6px_10px_rgba(255,255,255,0.05)]'
                  : 'clay-card border-2 border-dashed border-transparent hover:border-[#6c9cff]/30 hover:-translate-y-1'
              }`}
            >
              <input
                type="file"
                accept=".pdf,.txt,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploading}
              />
              
              {file ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 clay-btn-secondary !rounded-full flex items-center justify-center mx-auto text-green-500">
                    <Check size={32} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{file.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  {file.type.startsWith('image/') && (
                    <div className="mt-4 p-4 clay-card-inner">
                      <label className="block text-xs font-bold uppercase text-[var(--clay-primary)] mb-2">
                        OCR Enhancement Mode
                      </label>
                      <select 
                        value={ocrMode}
                        onChange={(e) => setOcrMode(e.target.value)}
                        className="w-full bg-transparent outline-none text-sm font-medium"
                      >
                        <option value="auto">Auto-Detect Quality</option>
                        <option value="blur_enhancement">Blur Enhancement</option>
                        <option value="noise_removal">Noise Removal</option>
                        <option value="basic">Basic OCR</option>
                      </select>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setFile(null);
                    }}
                    className="text-[var(--clay-error)] text-sm font-bold hover:underline"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 clay-btn-secondary !rounded-full flex items-center justify-center mx-auto text-[var(--clay-primary)]">
                    <Upload size={32} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">
                      Drop your file here
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Supports PDF, TXT, JPG, PNG
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">
                Note Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Physics Lecture 1"
                className="input-field"
                disabled={uploading}
              />
            </div>

            <button
              type="submit"
              disabled={!file || uploading}
              className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  Uploading...
                </>
              ) : (
                <>
                  <FileText size={18} />
                  Upload Notes
                </>
              )}
            </button>
          </motion.form>
        </div>
      </main>
    </div>
  );
}