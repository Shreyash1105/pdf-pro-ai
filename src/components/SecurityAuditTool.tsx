import { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  RefreshCw, 
  Save, 
  CheckCircle2, 
  AlertTriangle, 
  FileCode,
  Info,
  Loader2
} from 'lucide-react';
import { FileItem } from '../types';

interface SecurityAuditToolProps {
  fileItem: FileItem;
  onReset: () => void;
  onSave: (metadata: any) => void;
  isProcessing: boolean;
}

export default function SecurityAuditTool({ fileItem, onReset, onSave, isProcessing }: SecurityAuditToolProps) {
  const [metaTitle, setMetaTitle] = useState('');
  const [metaAuthor, setMetaAuthor] = useState('');
  const [metaSubject, setMetaSubject] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  
  // Simulated Audited Parameters
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [hasMetadataLeak, setHasMetadataLeak] = useState(true);
  const [encryptionStrength, setEncryptionStrength] = useState<'None' | 'Standard' | 'AES-256'>('None');

  useEffect(() => {
    // Audit document properties based on file attributes
    if (fileItem) {
      setIsEncrypted(fileItem.name.includes('locked') || fileItem.size > 15 * 1024 * 1024);
      setHasMetadataLeak(fileItem.size > 50 * 1024);
      setEncryptionStrength(fileItem.name.includes('locked') ? 'AES-256' : 'None');
      
      // Auto-populate default metadata
      setMetaTitle(fileItem.name.split('.')[0].replace(/[-_]/g, ' '));
      setMetaAuthor('PDF Pro Enterprise');
      setMetaSubject('Audited Document Archive');
      setMetaKeywords('secure, pdf-pro, audited');
    }
  }, [fileItem]);

  const handleApply = () => {
    onSave({
      title: metaTitle,
      author: metaAuthor,
      subject: metaSubject,
      keywords: metaKeywords
    });
  };

  return (
    <div className="bg-white dark:bg-[#12151C] border border-slate-100 dark:border-white/5 rounded-2xl p-5 md:p-6 shadow-sm space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-white/5">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-display font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-1.5">
              Security & Metadata Auditor
              <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded">Security Check</span>
            </h4>
            <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
              Scrub tracing variables or edit core document metadata properties.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#161920] rounded-lg transition-all cursor-pointer font-sans"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            New Audit
          </button>
          <button
            onClick={handleApply}
            disabled={isProcessing}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-100 disabled:dark:bg-[#161920] disabled:text-slate-400 rounded-lg transition-all cursor-pointer shadow-sm shadow-emerald-500/10"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Scrubbing...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Scrub & Save PDF
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Side: Scorecard */}
        <div className="md:col-span-5 space-y-4">
          <h5 className="text-[10px] uppercase font-mono font-bold text-slate-500 tracking-wider">
            Document Security Scorecard
          </h5>

          <div className="space-y-3">
            {/* Password Indicator */}
            <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
              isEncrypted 
                ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                : 'bg-amber-500/5 border-amber-500/20 text-amber-600 dark:text-amber-400'
            }`}>
              <div className="flex items-center gap-2">
                {isEncrypted ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                <span className="text-xs font-bold">Access Restrictions</span>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase">
                {isEncrypted ? 'Password Lock Active' : 'No Access Password'}
              </span>
            </div>

            {/* Tracking Indicator */}
            <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
              hasMetadataLeak 
                ? 'bg-red-500/5 border-red-500/20 text-red-600 dark:text-red-400' 
                : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
            }`}>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs font-bold">Traceable Metadata Leak</span>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase">
                {hasMetadataLeak ? 'Flagged / Leaking' : 'Scrubbed Clean'}
              </span>
            </div>

            {/* Encryption Level */}
            <div className="p-3 bg-slate-50 dark:bg-[#161920]/40 rounded-xl border border-slate-100 dark:border-white/5 flex items-center justify-between text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold">Encryption Complexity</span>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase">
                {encryptionStrength}
              </span>
            </div>
          </div>

          <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl text-xs text-slate-600 dark:text-slate-300 flex gap-2.5 leading-relaxed">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p>
              Scrubbing removes standard author identities, editing histories, and creator signatures from the binary document tree to prevent compliance leakages.
            </p>
          </div>
        </div>

        {/* Right Side: Metadata Input Form */}
        <div className="md:col-span-7 space-y-4 bg-slate-50 dark:bg-[#161920]/20 rounded-2xl p-4 md:p-5 border border-slate-100 dark:border-white/5">
          <h5 className="text-[10px] uppercase font-mono font-bold text-slate-500 tracking-wider">
            Scrub or Edit Metadata Variables
          </h5>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold uppercase text-slate-500">Document Title</label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Document title"
                className="w-full text-xs bg-white dark:bg-[#12151C] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-100 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold uppercase text-slate-500">Document Author Name</label>
              <input
                type="text"
                value={metaAuthor}
                onChange={(e) => setMetaAuthor(e.target.value)}
                placeholder="e.g. Corporate Intelligence"
                className="w-full text-xs bg-white dark:bg-[#12151C] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-100 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold uppercase text-slate-500">Subject Description</label>
              <input
                type="text"
                value={metaSubject}
                onChange={(e) => setMetaSubject(e.target.value)}
                placeholder="e.g. General Audited Distribution"
                className="w-full text-xs bg-white dark:bg-[#12151C] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-100 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold uppercase text-slate-500">Keywords & Index Tags</label>
              <input
                type="text"
                value={metaKeywords}
                onChange={(e) => setMetaKeywords(e.target.value)}
                placeholder="comma, separated, tags"
                className="w-full text-xs bg-white dark:bg-[#12151C] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-100 outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
