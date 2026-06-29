import { Download, CheckCircle, Trash2, ShieldCheck, RefreshCw } from 'lucide-react';
import { FileItem, normalizeDownloadUrl } from '../types';

interface ProcessedFilesListProps {
  files: FileItem[];
  onClear: () => void;
}

export default function ProcessedFilesList({ files, onClear }: ProcessedFilesListProps) {
  const completedFiles = files.filter(f => f.status === 'completed');

  if (completedFiles.length === 0) return null;

  const formatBytes = (bytes?: number) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const calculateReduction = (orig: number, result?: number) => {
    if (!result) return null;
    const diff = orig - result;
    if (diff <= 0) return null;
    const percentage = Math.round((diff / orig) * 100);
    return `-${percentage}%`;
  };

  return (
    <div className="bg-white dark:bg-[#12151C] rounded-3xl border border-slate-100 dark:border-white/5 p-6 md:p-8 shadow-xl transition-all duration-300 space-y-6">
      
      {/* List Header */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-white/5">
        <div>
          <h3 className="font-display font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            Processed Documents
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            Conversions completed successfully. One-click instant downloads.
          </p>
        </div>
        
        <button
          onClick={onClear}
          className="text-xs text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 flex items-center gap-1.5 transition-colors cursor-pointer bg-slate-50 dark:bg-[#0A0B0E]/60 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-white/5 font-medium"
        >
          <Trash2 className="w-4 h-4" />
          Clear All
        </button>
      </div>

      {/* Files list */}
      <div className="space-y-3.5">
        {completedFiles.map(file => {
          const reduction = calculateReduction(file.size, file.resultSize);
          
          return (
            <div 
              key={file.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gradient-to-br from-emerald-50/20 to-teal-50/20 dark:from-emerald-950/10 dark:to-teal-950/10 border border-emerald-500/20 rounded-2xl gap-4"
            >
              <div className="flex items-start space-x-3.5 min-w-0">
                <div className="p-3 bg-emerald-500 text-white rounded-xl shadow-md shadow-emerald-500/10 shrink-0">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate pr-4">
                    {file.resultName || file.name}
                  </h4>
                  <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                      Original: {formatBytes(file.size)}
                    </span>
                    <span className="text-xs text-slate-300 dark:text-slate-600">•</span>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      Processed: {formatBytes(file.resultSize || file.size)}
                    </span>
                    {reduction && (
                      <>
                        <span className="text-xs text-slate-300 dark:text-slate-600">•</span>
                        <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded font-mono">
                          {reduction} smaller
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Download Action */}
              <div className="flex items-center sm:self-center gap-3 self-end shrink-0">
                {/* Auto Delete Badge */}
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1 uppercase tracking-wider bg-white dark:bg-[#0A0B0E] border border-slate-100 dark:border-white/5 px-2.5 py-1.5 rounded-lg font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Auto-delete in 1h
                </span>

                <a
                  href={normalizeDownloadUrl(file.resultUrl)}
                  download={file.resultName || 'document.pdf'}
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-500/15 hover:shadow-lg hover:shadow-emerald-500/25 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
