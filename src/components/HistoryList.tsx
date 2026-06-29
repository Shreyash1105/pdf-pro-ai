import { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Trash2, 
  Download, 
  Clock, 
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  FileCheck2,
  Filter,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ConversionRecord, normalizeDownloadUrl } from '../types';
import { TOOLS } from './ToolsGrid';

interface HistoryListProps {
  userId: string;
  onSelectTool: (toolId: any) => void;
  addToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export default function HistoryList({ userId, onSelectTool, addToast }: HistoryListProps) {
  const [conversions, setConversions] = useState<ConversionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedToolId, setSelectedToolId] = useState<string>('all');
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Periodically update currentTime to keep expiration timers accurate
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Set up real-time listener for user's conversion history
  useEffect(() => {
    if (!userId) {
      setConversions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const conversionsRef = collection(db, 'conversions');
    const q = query(
      conversionsRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const records: ConversionRecord[] = [];
      snapshot.forEach((doc) => {
        records.push({ id: doc.id, ...doc.data() } as ConversionRecord);
      });
      setConversions(records);
      setIsLoading(false);
    }, (error) => {
      console.error('Error fetching conversions:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  // Delete record from history
  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'conversions', id));
      addToast('History record deleted.', 'info');
    } catch (error) {
      console.error('Error deleting record:', error);
      addToast('Failed to delete history record.', 'error');
    }
  };

  // Helper: format size
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Helper: format relative time
  const formatRelativeTime = (timestamp: number) => {
    const diff = currentTime - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // Helper: check if file is expired (server cleans processed directory after 1 hour)
  const getFileExpirationState = (timestamp: number) => {
    const oneHour = 60 * 60 * 1000;
    const elapsed = currentTime - timestamp;
    const isExpired = elapsed > oneHour;
    const timeLeft = oneHour - elapsed;

    if (isExpired) {
      return { expired: true, text: 'Expired (1h limit)' };
    } else {
      const minutesLeft = Math.ceil(timeLeft / 60000);
      return { expired: false, text: `${minutesLeft}m left` };
    }
  };

  // Filter conversions based on search and category
  const filteredConversions = conversions.filter(rec => {
    const matchesSearch = rec.originalName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          rec.resultName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          rec.toolTitle.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTool = selectedToolId === 'all' || rec.toolId === selectedToolId;
    
    return matchesSearch && matchesTool;
  });

  // Get list of unique tools that have been used by the user for filtering dropdown
  const uniqueToolsUsed = Array.from(new Set(conversions.map(c => c.toolId)))
    .map(id => {
      const toolDef = TOOLS.find(t => t.id === id);
      return {
        id,
        title: toolDef ? toolDef.title : id
      };
    });

  return (
    <div className="space-y-6">
      {/* Search and Filters panel */}
      <div className="bg-white dark:bg-[#161920] border border-slate-100 dark:border-white/5 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by file name or tool..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all outline-none text-slate-800 dark:text-white font-sans"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 shrink-0 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
              <Filter className="w-4 h-4" />
              <span>Tool:</span>
            </div>
            <select
              value={selectedToolId}
              onChange={(e) => setSelectedToolId(e.target.value)}
              className="w-full md:w-48 px-3.5 py-2.5 bg-slate-50 dark:bg-[#1C202B] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all outline-none cursor-pointer"
            >
              <option value="all">All Tools</option>
              {uniqueToolsUsed.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* History table list */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="w-10 h-10 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-mono animate-pulse">Loading conversion history...</p>
        </div>
      ) : filteredConversions.length === 0 ? (
        <div className="bg-white dark:bg-[#161920] border border-slate-100 dark:border-white/5 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-5 shadow-sm">
          <div className="w-16 h-16 bg-gradient-to-tr from-red-500/10 to-orange-500/10 rounded-2xl flex items-center justify-center border border-red-500/25 shadow-sm text-red-500 dark:text-red-400">
            <History className="w-8 h-8" />
          </div>
          
          <div className="space-y-1.5 max-w-md">
            <h3 className="font-display font-bold text-lg text-slate-800 dark:text-slate-100 tracking-tight">
              {conversions.length === 0 ? 'No conversion history' : 'No records match search'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {conversions.length === 0 
                ? 'Your converted files and modifications will be saved here dynamically. Convert a PDF now to see it in action!'
                : 'Try adjusting your filters or search query to find your file.'}
            </p>
          </div>

          {conversions.length === 0 && (
            <button
              onClick={() => onSelectTool(undefined as any)}
              className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl text-xs font-bold text-white shadow-md shadow-red-500/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center gap-2"
            >
              <FolderOpen className="w-4 h-4" />
              Explore Conversion Tools
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#161920] border border-slate-100 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
              Converted Files ({filteredConversions.length})
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5 font-mono">
              <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              Files strictly retained for 1 hour
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {filteredConversions.map((record) => {
              const fileState = getFileExpirationState(record.timestamp);
              const matchingTool = TOOLS.find(t => t.id === record.toolId);
              
              return (
                <div 
                  key={record.id} 
                  className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors"
                >
                  {/* Left Column: Tool Icon, Name and Info */}
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-white font-bold shadow-sm ${
                      matchingTool ? matchingTool.colorClass : 'bg-slate-500'
                    }`}>
                      <FileCheck2 className="w-5 h-5" />
                    </div>
                    
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded-md font-mono bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200/40 dark:border-white/5">
                          {record.toolTitle}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                          {formatRelativeTime(record.timestamp)}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate pr-4 font-sans" title={record.originalName}>
                        {record.originalName}
                      </h4>

                      <div className="flex items-center gap-2.5 text-xs text-slate-400 dark:text-slate-500 font-mono">
                        <span>{formatSize(record.resultSize)}</span>
                        <span>•</span>
                        {fileState.expired ? (
                          <span className="inline-flex items-center gap-1 text-rose-500 font-bold text-[10px] bg-rose-500/10 px-1.5 py-0.5 rounded-md border border-rose-500/20">
                            <AlertTriangle className="w-3 h-3" />
                            {fileState.text}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-500 font-bold text-[10px] bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20">
                            <Clock className="w-3 h-3" />
                            {fileState.text}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-white/5">
                    {/* Re-download Button */}
                    <a
                      href={normalizeDownloadUrl(record.resultUrl)}
                      download={record.resultName}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer shrink-0 font-sans ${
                        fileState.expired
                          ? 'bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 border border-slate-200/40 dark:border-white/10'
                          : 'bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white hover:scale-[1.02] active:scale-95'
                      }`}
                      title={fileState.expired ? 'File might be deleted from server' : 'Re-download processed file'}
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{fileState.expired ? 'Try Download' : 'Download'}</span>
                    </a>

                    {/* Delete from History */}
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer shrink-0 border border-transparent hover:border-rose-500/20"
                      title="Remove from history list"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
