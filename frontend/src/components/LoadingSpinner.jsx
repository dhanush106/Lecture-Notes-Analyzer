import { motion } from 'framer-motion';

const LoaderAnimation = ({ size = 'md', text = 'Loading...' }) => {
  const sizes = {
    sm: { spinner: 'w-6 h-6', text: 'text-sm' },
    md: { spinner: 'w-10 h-10', text: 'text-base' },
    lg: { spinner: 'w-16 h-16', text: 'text-lg' }
  };

  const { spinner, text: textSize } = sizes[size];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center gap-4"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className={`${spinner} border-4 border-primary-200 dark:border-primary-800 border-t-primary-600 dark:border-t-primary-400 rounded-full`}
      />
      <p className={`${textSize} text-gray-600 dark:text-gray-400`}>{text}</p>
    </motion.div>
  );
};

export default function LoadingSpinner({ size, text }) {
  return <LoaderAnimation size={size} text={text} />;
}

export function UploadingAnimation() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="card"
    >
      <div className="flex flex-col items-center gap-4 py-8">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 0.6, repeat: Infinity }}
          className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center"
        >
          <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </motion.div>
        <p className="text-gray-600 dark:text-gray-400">Uploading...</p>
      </div>
    </motion.div>
  );
}

export function AnalyzingAnimation() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="card"
    >
      <div className="flex flex-col items-center gap-4 py-8">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -15, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.2
              }}
              className="w-3 h-3 bg-primary-600 rounded-full"
            />
          ))}
        </div>
        <p className="text-gray-600 dark:text-gray-400">Analyzing with NLP...</p>
      </div>
    </motion.div>
  );
}