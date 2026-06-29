import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertCircle, Info, X, Download } from 'lucide-react';
import { ToastItem, normalizeDownloadUrl } from '../types';

interface ToastProps {
  key?: string;
  toast: ToastItem;
  onClose: (id: string) => void;
}

function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 6000); // Keep it visible for 6 seconds
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-indigo-500 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-500/20 bg-emerald-50/95 dark:bg-[#121E19]/95 text-emerald-900 dark:text-emerald-200 shadow-emerald-500/5',
    error: 'border-rose-500/20 bg-rose-50/95 dark:bg-[#201315]/95 text-rose-900 dark:text-rose-200 shadow-rose-500/5',
    info: 'border-indigo-500/20 bg-indigo-50/95 dark:bg-[#131520]/95 text-indigo-900 dark:text-indigo-200 shadow-indigo-500/5',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={`flex items-start gap-3.5 p-4 rounded-2xl border w-full sm:max-w-md shadow-lg backdrop-blur-md transition-all duration-300 pointer-events-auto ${borders[toast.type]}`}
    >
      <div className="mt-0.5">{icons[toast.type]}</div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-normal break-words">
          {toast.message}
        </p>
        
        {/* Optional Context Action for success conversions */}
        {toast.type === 'success' && toast.fileName && toast.downloadUrl && (
          <div className="mt-2.5 flex items-center gap-2">
            <span className="text-[10px] font-mono opacity-80 truncate block max-w-[200px]">
              {toast.fileName}
            </span>
            <span className="text-[10px] opacity-40">•</span>
            <a
              href={normalizeDownloadUrl(toast.downloadUrl)}
              download={toast.fileName}
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download now
            </a>
          </div>
        )}
      </div>

      <button
        onClick={() => onClose(toast.id)}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer shrink-0 p-0.5 rounded-lg hover:bg-slate-500/10"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onClose: (id: string) => void;
}

export default function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 w-full max-w-[calc(100vw-3rem)] sm:w-auto pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  );
}
