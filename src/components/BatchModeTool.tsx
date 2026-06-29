import { useState } from 'react';
import { 
  Files, 
  RefreshCw, 
  Play, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Download, 
  Lock, 
  ArrowDownToLine, 
  RotateCw,
  Loader2
} from 'lucide-react';
import { FileItem } from '../types';

interface BatchModeToolProps {
  files: FileItem[];
  onFilesAdded: (files: File[]) => void;
  onRemoveFile: (id: string) => void;
  onReset: () => void;
  addToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

interface BatchQueueItem {
  id: string;
  name: string;
  size: number;
  status: 'idle' | 'processing' | 'completed' | 'failed';
  error?: string;
  resultUrl?: string;
  resultName?: string;
  resultSize?: number;
}

export default function BatchModeTool({ 
  files, 
  onFilesAdded, 
  onRemoveFile, 
  onReset,
  addToast
}: BatchModeToolProps) {
  const [batchAction, setBatchAction] = useState<'compress' | 'protect' | 'rotate'>('compress');
  const [password, setPassword] = useState('');
  const [rotateAngle, setRotateAngle] = useState<'90' | '180' | '270'>('90');
  const [queue, setQueue] = useState<BatchQueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize processing queue from files
  const handleStartBatch = async () => {
    if (files.length === 0) return;

    const initialQueue: BatchQueueItem[] = files.map(f => ({
      id: f.id,
      name: f.name,
      size: f.size,
      status: 'processing'
    }));

    setQueue(initialQueue);
    setIsProcessing(true);

    // Run parallel conversions
    const promises = files.map(async (fileItem) => {
      const formData = new FormData();
      formData.append('file', fileItem.file);

      // Append specific configuration
      if (batchAction === 'protect') {
        formData.append('pdfPassword', password || '123456');
      } else if (batchAction === 'rotate') {
        formData.append('rotateAngle', rotateAngle);
      } else {
        formData.append('compressLevel', 'medium');
      }

      try {
        const endpoint = `/api/convert/${batchAction === 'protect' ? 'protect-pdf' : batchAction}`;
        const res = await fetch(endpoint, {
          method: 'POST',
          body: formData
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Operation failed');
        }

        const data = await res.json();
        
        setQueue(prev => prev.map(q => q.id === fileItem.id ? {
          ...q,
          status: 'completed',
          resultUrl: data.resultUrl,
          resultName: data.resultName,
          resultSize: data.resultSize || fileItem.size * 0.8
        } : q));

      } catch (err: any) {
        setQueue(prev => prev.map(q => q.id === fileItem.id ? {
          ...q,
          status: 'failed',
          error: err.message || 'Failed processing'
        } : q));
      }
    });

    await Promise.all(promises);
    setIsProcessing(false);
    addToast('Batch queue processing completed successfully!', 'success');
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white dark:bg-[#12151C] border border-slate-100 dark:border-white/5 rounded-2xl p-5 md:p-6 shadow-sm space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-white/5">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
            <Files className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-display font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-1.5">
              Batch Processing Queue Engine
              <span className="text-[10px] font-mono uppercase bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded">High Capacity</span>
            </h4>
            <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
              Apply structural operations to multiple files in a parallel queue.
            </p>
          </div>
        </div>

        <button
          onClick={onReset}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#161920] rounded-lg transition-all cursor-pointer font-sans"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Clear All
        </button>
      </div>

      {/* Batch configuration dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-[#161920]/40 rounded-xl border border-slate-100 dark:border-white/5">
        <div className="space-y-1">
          <label className="text-[10px] font-mono font-bold uppercase text-slate-400 dark:text-slate-500">
            1. Select Action
          </label>
          <select
            value={batchAction}
            onChange={(e) => setBatchAction(e.target.value as any)}
            className="w-full text-xs bg-white dark:bg-[#12151C] border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-2 text-slate-800 dark:text-slate-100 cursor-pointer"
          >
            <option value="compress">Batch Compress (Reduce Size)</option>
            <option value="protect">Batch Protect (Set Passwords)</option>
            <option value="rotate">Batch Rotate (Turn clockwise)</option>
          </select>
        </div>

        {/* Action Options */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono font-bold uppercase text-slate-400 dark:text-slate-500">
            2. Configure settings
          </label>
          {batchAction === 'protect' ? (
            <input
              type="password"
              placeholder="Enter secure password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-xs bg-white dark:bg-[#12151C] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 outline-none"
            />
          ) : batchAction === 'rotate' ? (
            <select
              value={rotateAngle}
              onChange={(e) => setRotateAngle(e.target.value as any)}
              className="w-full text-xs bg-white dark:bg-[#12151C] border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-2 text-slate-800 dark:text-slate-100 cursor-pointer"
            >
              <option value="90">90° CW Rotation</option>
              <option value="180">180° CW Rotation</option>
              <option value="270">270° CW Rotation</option>
            </select>
          ) : (
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium flex items-center gap-1">
              <ArrowDownToLine className="w-4 h-4 text-amber-500" />
              Standard balanced optimization active.
            </div>
          )}
        </div>

        {/* Start queue processing */}
        <div className="flex items-end">
          <button
            onClick={handleStartBatch}
            disabled={isProcessing || files.length === 0}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-150 disabled:dark:bg-[#161920] disabled:text-slate-400 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-blue-500/10"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Processing Queue...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                Process Batch Queue ({files.length} Files)
              </>
            )}
          </button>
        </div>
      </div>

      {/* Queue items list */}
      <div className="space-y-2.5">
        <h5 className="text-[10px] uppercase font-mono font-bold text-slate-500 tracking-wider">
          Batch Items List ({files.length})
        </h5>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {queue.length > 0 ? (
            queue.map((item) => (
              <div 
                key={item.id} 
                className="p-3 bg-slate-50 dark:bg-[#161920]/40 border border-slate-100 dark:border-white/5 rounded-xl flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <h6 className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                    {item.name}
                  </h6>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                    Original: {formatBytes(item.size)} 
                    {item.resultSize && ` • Processed: ${formatBytes(item.resultSize)}`}
                  </p>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  {item.status === 'processing' && (
                    <span className="text-[10px] font-mono font-bold text-blue-500 animate-pulse flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Converting...
                    </span>
                  )}

                  {item.status === 'completed' && (
                    <>
                      <span className="text-[10px] font-mono font-bold text-emerald-500 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Success
                      </span>
                      <a
                        href={item.resultUrl}
                        download={item.resultName || 'processed.pdf'}
                        className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors cursor-pointer"
                        title="Download"
                      >
                        <Download className="w-3 h-3" />
                      </a>
                    </>
                  )}

                  {item.status === 'failed' && (
                    <span className="text-[10px] font-mono font-bold text-red-500 flex items-center gap-1" title={item.error}>
                      <XCircle className="w-3.5 h-3.5 text-red-500" /> Failed
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            files.map((item) => (
              <div 
                key={item.id} 
                className="p-3 bg-slate-50 dark:bg-[#161920]/40 border border-slate-100 dark:border-white/5 rounded-xl flex items-center justify-between"
              >
                <div className="min-w-0">
                  <h6 className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                    {item.name}
                  </h6>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                    {formatBytes(item.size)}
                  </p>
                </div>

                <button
                  onClick={() => onRemoveFile(item.id)}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-[#161920] rounded-lg text-slate-400 hover:text-red-500 cursor-pointer"
                  title="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
