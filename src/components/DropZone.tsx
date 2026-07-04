import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { 
  UploadCloud, 
  Sparkles, 
  X, 
  RotateCw, 
  Scissors, 
  ArrowDownToLine, 
  HelpCircle,
  Play,
  FileText,
  AlertCircle,
  Bookmark,
  Hash,
  Download,
  Trash2,
  ExternalLink,
  Layers,
  Eye,
  Crop,
  PenTool,
  FormInput,
  Unlock,
  FileSignature,
  EyeOff,
  Languages
} from 'lucide-react';
import { ToolDefinition, FileItem, ProcessingOptions, normalizeDownloadUrl } from '../types';
import AIChatTool from './AIChatTool';
import AIStudyTool from './AIStudyTool';
import AIContractTool from './AIContractTool';
import VisualOrganizerTool from './VisualOrganizerTool';
import VisualEditorTool from './VisualEditorTool';
import BatchModeTool from './BatchModeTool';
import SecurityAuditTool from './SecurityAuditTool';

interface DropZoneProps {
  tool: ToolDefinition;
  files: FileItem[];
  options: ProcessingOptions;
  onFilesAdded: (files: File[]) => void;
  onRemoveFile: (id: string) => void;
  onUpdateOptions: (options: Partial<ProcessingOptions>) => void;
  onProcess: () => void;
  isProcessing: boolean;
  addToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export default function DropZone({
  tool,
  files,
  options,
  onFilesAdded,
  onRemoveFile,
  onUpdateOptions,
  onProcess,
  isProcessing,
  addToast
}: DropZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFiles = Array.from(e.dataTransfer.files) as File[];
      const filtered = filterFiles(droppedFiles);
      if (filtered.length > 0) {
        onFilesAdded(filtered);
      }
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const selectedFiles = Array.from(e.target.files) as File[];
      const filtered = filterFiles(selectedFiles);
      if (filtered.length > 0) {
        onFilesAdded(filtered);
      }
    }
  };

  const filterFiles = (fileList: File[]) => {
    // Only allow relevant extensions
    return fileList.filter(file => {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      const isAllowed = tool.allowedInputTypes.some(ext => {
        if (ext === 'image/*') {
          return file.type.startsWith('image/');
        }
        return ext.toLowerCase() === extension;
      });
      return isAllowed;
    });
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Determine if upload is multi-file (Merge, Image-to-PDF, Scan, and Compare support multi-files)
  const isMultiFile = ['merge', 'image-to-pdf', 'scan-to-pdf', 'compare-pdf'].includes(tool.id);

  // Toggle AI option
  const supportsAI = ['pdf-to-word', 'pdf-to-excel', 'pdf-to-ppt', 'pdf-to-html', 'ocr-pdf', 'scan-to-pdf', 'repair-pdf', 'ai-summarize', 'ai-translate'].includes(tool.id);

  const isCustomTool = ['ai-chat', 'ai-study', 'ai-contract', 'visual-organizer', 'visual-editor', 'batch-mode', 'security-audit'].includes(tool.id);

  return (
    <div className="bg-white dark:bg-[#12151C] rounded-3xl border border-slate-100 dark:border-white/5 p-6 md:p-8 shadow-xl transition-all duration-300">
      
      {/* Tool Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-white/5">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-rose-500 font-mono">
            Active Tool
          </span>
          <h2 className="font-display font-bold text-2xl text-slate-800 dark:text-slate-100 mt-1">
            {tool.title}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Input: <span className="font-mono bg-slate-50 dark:bg-[#0A0B0E] px-1.5 py-0.5 rounded text-xs">{tool.allowedInputTypes.join(', ')}</span> 
            {' '}• Output: <span className="font-mono bg-slate-50 dark:bg-[#0A0B0E] px-1.5 py-0.5 rounded text-xs text-rose-500 font-semibold">{tool.outputType}</span>
          </p>
        </div>

        {/* Info label */}
        <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50 dark:bg-[#0A0B0E]/60 border border-slate-100 dark:border-white/5 px-3 py-1.5 rounded-xl font-mono">
          Free Serverless Node Processing
        </div>
      </div>

      {/* Main Drag Drop Zone */}
      {(files.length === 0 || (files.length > 0 && isMultiFile)) && (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
          className={`relative border-2 border-dashed rounded-2xl py-12 px-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
            dragActive 
              ? 'border-red-500 bg-red-500/5' 
              : 'border-slate-200 dark:border-white/10 hover:border-red-500 dark:hover:border-red-500 hover:bg-slate-50/50 dark:hover:bg-[#161920]/40'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            multiple={isMultiFile}
            accept={tool.allowedInputTypes.join(',')}
            onChange={handleChange}
          />

          <div className="p-4 bg-red-500/10 text-red-500 rounded-full mb-4">
            <UploadCloud className="w-8 h-8" />
          </div>

          <p className="font-display text-slate-700 dark:text-slate-200 font-semibold">
            {isMultiFile ? 'Drag & drop multiple files here' : 'Drag & drop your file here'}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 max-w-sm">
            Or click to browse from your device. Supported format: {tool.allowedInputTypes.join('/')}.
          </p>

          <p className="text-[10px] uppercase font-mono tracking-widest text-slate-400 mt-6 flex items-center gap-1.5 bg-slate-50 dark:bg-[#0A0B0E]/40 px-2.5 py-1 rounded-md border border-slate-100 dark:border-white/5">
            🔒 Files encrypted & shredded automatically in 1h
          </p>
        </div>
      )}

      {/* Custom Recommended Tools rendering */}
      {files.length > 0 && tool.id === 'ai-chat' && (
        <AIChatTool fileItem={files[0]} onReset={() => onRemoveFile(files[0].id)} />
      )}
      {files.length > 0 && tool.id === 'ai-study' && (
        <AIStudyTool fileItem={files[0]} onReset={() => onRemoveFile(files[0].id)} />
      )}
      {files.length > 0 && tool.id === 'ai-contract' && (
        <AIContractTool fileItem={files[0]} onReset={() => onRemoveFile(files[0].id)} />
      )}
      {files.length > 0 && tool.id === 'visual-organizer' && (
        <VisualOrganizerTool 
          fileItem={files[0]} 
          onReset={() => onRemoveFile(files[0].id)} 
          onSave={(order) => { 
            onUpdateOptions({ pageOrder: order }); 
            setTimeout(onProcess, 50); 
          }} 
          isProcessing={isProcessing} 
        />
      )}
      {files.length > 0 && (tool.id === 'visual-editor' || tool.id === 'edit-pdf') && (
        <VisualEditorTool 
          fileItem={files[0]} 
          onReset={() => onRemoveFile(files[0].id)} 
          onSave={(editsJson) => { 
            onUpdateOptions({ edits: editsJson }); 
            setTimeout(onProcess, 50); 
          }} 
          isProcessing={isProcessing} 
        />
      )}
      {files.length > 0 && tool.id === 'batch-mode' && (
        <BatchModeTool 
          files={files} 
          onFilesAdded={onFilesAdded} 
          onRemoveFile={onRemoveFile} 
          onReset={() => onRemoveFile(files[0].id)} 
          addToast={(msg, type) => addToast?.(msg, type || 'success')} 
        />
      )}
      {files.length > 0 && tool.id === 'security-audit' && (
        <SecurityAuditTool 
          fileItem={files[0]} 
          onReset={() => onRemoveFile(files[0].id)} 
          onSave={(meta) => { 
            onUpdateOptions({ editText: JSON.stringify(meta) }); 
            setTimeout(onProcess, 50); 
          }} 
          isProcessing={isProcessing} 
        />
      )}

      {/* File List for Selected Files */}
      {files.length > 0 && !isCustomTool && (
        <div className="space-y-6 mt-4">
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
              Selected Document{files.length > 1 ? 's' : ''} ({files.length})
            </h3>
            
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {files.map(fileItem => (
                <div 
                  key={fileItem.id} 
                  className="p-3.5 bg-slate-50 dark:bg-[#0A0B0E]/40 border border-slate-100 dark:border-white/5 rounded-xl space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <div className="p-2 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-lg shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate pr-4">
                          {fileItem.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                            {formatBytes(fileItem.size)}
                          </span>
                          {fileItem.status === 'completed' && fileItem.resultSize && (
                            <>
                              <span className="text-slate-300 dark:text-slate-700 text-xs">•</span>
                              <span className="text-xs text-emerald-500 dark:text-emerald-400 font-semibold font-mono">
                                {formatBytes(fileItem.resultSize)} ({Math.round(Math.max(0, (1 - fileItem.resultSize / fileItem.size) * 100))}% compressed)
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {/* Progress Indicator */}
                      {fileItem.status === 'uploading' && (
                        <span className="text-xs font-mono font-medium text-blue-500">
                          Uploading ({fileItem.progress}%)
                        </span>
                      )}
                      {fileItem.status === 'processing' && (
                        <span className="text-xs font-mono font-medium text-amber-500 animate-pulse">
                          Converting...
                        </span>
                      )}
                      {fileItem.status === 'completed' && (
                        <a
                          href={normalizeDownloadUrl(fileItem.resultUrl)}
                          download={fileItem.resultName || 'document.pdf'}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer font-sans"
                          title="Download processed document"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download
                        </a>
                      )}
                      {fileItem.status === 'failed' && (
                        <span className="text-xs font-mono font-semibold text-rose-500" title={fileItem.error}>
                          Failed
                        </span>
                      )}

                      <button
                        onClick={() => onRemoveFile(fileItem.id)}
                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-[#161920] rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors shrink-0 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {fileItem.status === 'completed' && fileItem.aiAnalysis && (
                    <div className="mt-1 p-2.5 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/10 rounded-lg text-xs space-y-1.5 font-sans animate-fade-in">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 fill-current text-amber-500" />
                          AI Optimization Report
                        </span>
                        <span className="px-2 py-0.5 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase rounded tracking-wider">
                          Type: {fileItem.aiAnalysis.documentType} • Mode: {fileItem.aiAnalysis.compressLevel}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                        {fileItem.aiAnalysis.reasoning}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contextual Configurator Options based on selected Tool */}
          <div className="bg-slate-50 dark:bg-[#161920]/40 border border-slate-100 dark:border-white/5 p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-mono">
              ⚙️ Conversion Settings
            </h3>

            {/* Split PDF settings */}
            {tool.id === 'split' && (
              <div className="space-y-3">
                <div className="flex gap-4 border-b border-slate-100 dark:border-white/5 pb-2 mb-2">
                  <button
                    type="button"
                    onClick={() => onUpdateOptions({ splitRange: '' })}
                    className={`text-xs font-semibold pb-1 border-b-2 transition-all ${
                      !options.splitRange 
                        ? 'border-orange-500 text-orange-600 dark:text-orange-400' 
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    ✂️ Split All Pages
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!options.splitRange) {
                        onUpdateOptions({ splitRange: '1-2' });
                      }
                    }}
                    className={`text-xs font-semibold pb-1 border-b-2 transition-all ${
                      options.splitRange 
                        ? 'border-orange-500 text-orange-600 dark:text-orange-400' 
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    🛠️ Custom Page Range
                  </button>
                </div>

                {!options.splitRange ? (
                  <div className="p-3.5 bg-orange-500/5 border border-orange-500/10 rounded-xl">
                    <p className="text-xs text-orange-600 dark:text-orange-400 leading-relaxed font-medium">
                      Every page of your PDF will be extracted into its own separate PDF document. The files will be zipped and delivered together as a single ZIP package.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Scissors className="w-3.5 h-3.5 text-orange-500" />
                      Custom Split Range (Page Indices)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={options.splitRange || ''}
                        onChange={(e) => onUpdateOptions({ splitRange: e.target.value })}
                        placeholder="e.g. 1-3, 5"
                        className="flex-1 text-sm bg-white dark:bg-[#12151C] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-800 dark:text-slate-100 outline-none focus:border-red-500 transition-all font-mono"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal">
                      Specify pages or ranges. Hyphens denote bounds (e.g. <code className="font-mono bg-slate-100 dark:bg-[#12151C] px-1 py-0.5 rounded">2-5</code>). Commas divide steps (e.g. <code className="font-mono bg-slate-100 dark:bg-[#12151C] px-1 py-0.5 rounded">1-2,4</code>).
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Rotate PDF settings */}
            {tool.id === 'rotate' && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <RotateCw className="w-3.5 h-3.5 text-violet-500" />
                  Rotation Angle
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {([90, 180, 270] as const).map(angle => (
                    <button
                      key={angle}
                      type="button"
                      onClick={() => onUpdateOptions({ rotateAngle: angle })}
                      className={`py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                        options.rotateAngle === angle
                          ? 'bg-violet-500 text-white shadow-md shadow-violet-500/10'
                          : 'bg-white dark:bg-[#12151C] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-[#161920]'
                      }`}
                    >
                      {angle}° CW
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Compress PDF settings */}
            {tool.id === 'compress' && (
              <div className="space-y-4 font-sans">
                {/* Auto-Optimize Toggle */}
                <div className="flex items-start space-x-3.5 p-3.5 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl">
                  <input
                    type="checkbox"
                    id="auto-optimize-check"
                    checked={options.autoOptimize || false}
                    onChange={(e) => onUpdateOptions({ autoOptimize: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 border-slate-300 focus:ring-amber-400 mt-1 cursor-pointer accent-amber-500"
                  />
                  <div className="flex-1">
                    <label htmlFor="auto-optimize-check" className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 cursor-pointer select-none">
                      <Sparkles className="w-4 h-4 text-amber-500 fill-current" />
                      Auto-Optimize (AI Backend)
                    </label>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      Detects your document type (text vs. image-heavy) and structure using Proprietary AI Models to automatically select the optimal compression, encoding, and format settings.
                    </p>
                  </div>
                </div>

                {!options.autoOptimize && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <ArrowDownToLine className="w-3.5 h-3.5 text-amber-500" />
                      Manual Compression Ratio Level
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['low', 'medium', 'high'] as const).map(level => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => onUpdateOptions({ compressLevel: level })}
                          className={`py-2.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                            options.compressLevel === level
                              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/10'
                              : 'bg-white dark:bg-[#12151C] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-[#161920]'
                          }`}
                        >
                          {level === 'low' && 'Low (Best Quality)'}
                          {level === 'medium' && 'Medium (Balanced)'}
                          {level === 'high' && 'High (Max Compress)'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {options.autoOptimize && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 animate-pulse">
                    <Sparkles className="w-4 h-4 shrink-0 text-emerald-500 fill-current" />
                    <span className="text-xs font-semibold">AI-driven analysis and compression is active.</span>
                  </div>
                )}
              </div>
            )}

            {/* PDF to Text Options */}
            {tool.id === 'pdf-to-text' && (
              <div className="space-y-4 font-sans">
                <div className="flex items-start space-x-3.5 p-3.5 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl">
                  <input
                    type="checkbox"
                    id="enable-ocr-check"
                    checked={options.enableOcr || false}
                    onChange={(e) => onUpdateOptions({ enableOcr: e.target.checked })}
                    className="w-4 h-4 rounded text-cyan-500 border-slate-300 focus:ring-cyan-400 mt-1 cursor-pointer accent-cyan-500"
                  />
                  <div className="flex-1">
                    <label htmlFor="enable-ocr-check" className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 cursor-pointer select-none">
                      <Sparkles className="w-4 h-4 text-cyan-500 fill-current" />
                      Enable OCR Scanner
                    </label>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      Essential for scanned or image-based PDFs that don't contain selectable text. Uses advanced algorithms to accurately transcribe content.
                    </p>
                  </div>
                </div>

                {options.enableOcr && (
                  <div className="space-y-2.5 animate-fade-in">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      OCR Engine Optimization
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {([
                        { id: 'gemini', title: 'AI-Powered OCR', desc: 'Ultra-accurate (Layout-aware)' },
                        { id: 'standard', title: 'Standard OCR', desc: 'High-speed extraction' }
                      ] as const).map(engine => (
                        <button
                          key={engine.id}
                          type="button"
                          onClick={() => onUpdateOptions({ ocrEngine: engine.id })}
                          className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between h-20 ${
                            (options.ocrEngine || 'gemini') === engine.id
                              ? 'bg-cyan-500/5 border-cyan-500 text-cyan-900 dark:text-cyan-200'
                              : 'bg-white dark:bg-[#12151C] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#161920]'
                          }`}
                        >
                          <span className="text-xs font-bold block">{engine.title}</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block leading-tight">{engine.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Watermark Options */}
            {tool.id === 'watermark' && (
              <div className="space-y-4 border-t border-slate-100 dark:border-white/5 pt-4 font-sans">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Bookmark className="w-4 h-4 text-indigo-500" />
                    Watermark Text
                  </label>
                  <input
                    type="text"
                    value={options.watermarkText ?? 'CONFIDENTIAL'}
                    onChange={(e) => onUpdateOptions({ watermarkText: e.target.value })}
                    placeholder="CONFIDENTIAL"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-white/10 bg-white dark:bg-[#12151C] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Watermark Color
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {([
                      { id: 'red', name: 'Red', bg: 'bg-red-500' },
                      { id: 'slate', name: 'Slate', bg: 'bg-slate-500' },
                      { id: 'blue', name: 'Blue', bg: 'bg-blue-500' },
                      { id: 'emerald', name: 'Emerald', bg: 'bg-emerald-500' },
                      { id: 'amber', name: 'Amber', bg: 'bg-amber-500' }
                    ] as const).map(color => (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => onUpdateOptions({ watermarkColor: color.id })}
                        className={`py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer border ${
                          (options.watermarkColor || 'red') === color.id
                            ? 'bg-indigo-500 border-indigo-600 text-white shadow-md shadow-indigo-500/10'
                            : 'bg-white dark:bg-[#12151C] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#161920]'
                        }`}
                      >
                        <span className="flex items-center justify-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${color.bg}`} />
                          {color.id}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                      Font Size ({options.watermarkSize ?? 40}px)
                    </label>
                    <input
                      type="range"
                      min="12"
                      max="120"
                      value={options.watermarkSize ?? 40}
                      onChange={(e) => onUpdateOptions({ watermarkSize: parseInt(e.target.value) })}
                      className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                      Opacity ({(options.watermarkOpacity ?? 0.3).toFixed(1)})
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.1"
                      value={options.watermarkOpacity ?? 0.3}
                      onChange={(e) => onUpdateOptions({ watermarkOpacity: parseFloat(e.target.value) })}
                      className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                      Angle ({options.watermarkAngle ?? 45}°)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="15"
                      value={options.watermarkAngle ?? 45}
                      onChange={(e) => onUpdateOptions({ watermarkAngle: parseInt(e.target.value) })}
                      className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Remove Pages settings */}
            {tool.id === 'remove-pages' && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  Pages to Remove (1-based indices)
                </label>
                <input
                  type="text"
                  value={options.pagesToRemove || ''}
                  onChange={(e) => onUpdateOptions({ pagesToRemove: e.target.value })}
                  placeholder="e.g. 2, 4, 6 or 3-5"
                  className="w-full text-sm bg-white dark:bg-[#12151C] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-800 dark:text-slate-100 outline-none focus:border-red-500 transition-all font-mono"
                />
                <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal">
                  Specify page indices or ranges to delete from the PDF (e.g. <code className="font-mono bg-slate-100 dark:bg-[#12151C] px-1 py-0.5 rounded">2,4</code> or <code className="font-mono bg-slate-100 dark:bg-[#12151C] px-1 py-0.5 rounded">1-3</code>).
                </p>
              </div>
            )}

            {/* Extract Pages settings */}
            {tool.id === 'extract-pages' && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <ExternalLink className="w-3.5 h-3.5 text-amber-500" />
                  Pages to Extract (1-based indices)
                </label>
                <input
                  type="text"
                  value={options.pagesToExtract || ''}
                  onChange={(e) => onUpdateOptions({ pagesToExtract: e.target.value })}
                  placeholder="e.g. 1-3, 5"
                  className="w-full text-sm bg-white dark:bg-[#12151C] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-800 dark:text-slate-100 outline-none focus:border-red-500 transition-all font-mono"
                />
                <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal">
                  Specify page ranges to extract into a new PDF (e.g. <code className="font-mono bg-slate-100 dark:bg-[#12151C] px-1 py-0.5 rounded">1-3,5</code>).
                </p>
              </div>
            )}

            {/* Organize PDF settings */}
            {tool.id === 'organize-pages' && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-violet-500" />
                  Page Reorder Sequence
                </label>
                <input
                  type="text"
                  value={options.pageOrder || ''}
                  onChange={(e) => onUpdateOptions({ pageOrder: e.target.value })}
                  placeholder="e.g. 3,1,2,4 (leave empty for original order)"
                  className="w-full text-sm bg-white dark:bg-[#12151C] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-800 dark:text-slate-100 outline-none focus:border-red-500 transition-all font-mono"
                />
                <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal">
                  Re-arrange pages by specifying the new 1-based index sequence.
                </p>
              </div>
            )}

            {/* OCR PDF / scanner settings */}
            {tool.id === 'ocr-pdf' && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-indigo-500" />
                  Target Output Format
                </label>
                <div className="grid grid-cols-2 gap-2 font-sans">
                  {(['txt', 'docx'] as const).map(format => (
                    <button
                      key={format}
                      type="button"
                      onClick={() => onUpdateOptions({ ocrFormat: format })}
                      className={`py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        (options.ocrFormat || 'txt') === format
                          ? 'bg-indigo-500 text-white shadow-md'
                          : 'bg-white dark:bg-[#12151C] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-[#161920]'
                      }`}
                    >
                      {format === 'txt' ? 'Plain Text (.txt)' : 'Word Doc (.docx)'}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal mt-1">
                  Our advanced AI OCR engine reads scan lines, text blocks, and structured files, then converts them to your chosen editable format.
                </p>
              </div>
            )}

            {/* Crop PDF settings */}
            {tool.id === 'crop-pdf' && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Crop className="w-3.5 h-3.5 text-orange-500" />
                  Crop Margins
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as const).map(level => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => onUpdateOptions({ cropMargin: level })}
                      className={`py-2 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                        (options.cropMargin || 'medium') === level
                          ? 'bg-orange-500 text-white shadow-md'
                          : 'bg-white dark:bg-[#12151C] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-[#161920]'
                      }`}
                    >
                      {level === 'low' && 'Low (5%)'}
                      {level === 'medium' && 'Medium (15%)'}
                      {level === 'high' && 'High (25%)'}
                    </button>
                  ))}
                </div>
              </div>
            )}



            {/* PDF Forms settings */}
            {tool.id === 'pdf-forms' && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <FormInput className="w-3.5 h-3.5 text-blue-500" />
                  Form Fields to Fill
                </label>
                <textarea
                  value={options.formFields || ''}
                  onChange={(e) => onUpdateOptions({ formFields: e.target.value })}
                  placeholder="e.g. Name: John Doe, Email: john@example.com"
                  rows={2}
                  className="w-full text-sm bg-white dark:bg-[#12151C] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-slate-800 dark:text-slate-100 outline-none focus:border-red-500 transition-all font-mono"
                />
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  Fill fields matching key-value labels. Non-filled fields will be flattened.
                </p>
              </div>
            )}

            {/* Unlock / Protect PDF settings */}
            {(tool.id === 'unlock-pdf' || tool.id === 'protect-pdf') && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  {tool.id === 'unlock-pdf' ? <Unlock className="w-3.5 h-3.5 text-green-500" /> : <Lock className="w-3.5 h-3.5 text-blue-500" />}
                  PDF Security Password
                </label>
                <input
                  type="password"
                  value={options.pdfPassword || ''}
                  onChange={(e) => onUpdateOptions({ pdfPassword: e.target.value })}
                  placeholder="Enter security password"
                  className="w-full text-sm bg-white dark:bg-[#12151C] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-800 dark:text-slate-100 outline-none focus:border-red-500 transition-all font-mono"
                />
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  {tool.id === 'unlock-pdf' ? 'Provide the decryption password to strip PDF protection.' : 'Set an owner password to encrypt and secure the PDF.'}
                </p>
              </div>
            )}

            {/* Sign PDF settings */}
            {tool.id === 'sign-pdf' && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <FileSignature className="w-3.5 h-3.5 text-indigo-500" />
                  E-Signature Text
                </label>
                <input
                  type="text"
                  value={options.signatureText || ''}
                  onChange={(e) => onUpdateOptions({ signatureText: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full text-sm bg-white dark:bg-[#12151C] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-800 dark:text-slate-100 outline-none focus:border-red-500 transition-all font-serif italic font-bold"
                />
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  Draws an elegant italic signature onto the bottom of the last page of the PDF.
                </p>
              </div>
            )}

            {/* Redact PDF settings */}
            {tool.id === 'redact-pdf' && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <EyeOff className="w-3.5 h-3.5 text-red-500" />
                  Phrases to Blackout / Redact
                </label>
                <input
                  type="text"
                  value={options.redactPhrases || ''}
                  onChange={(e) => onUpdateOptions({ redactPhrases: e.target.value })}
                  placeholder="e.g. CONFIDENTIAL, SSN, 123-456"
                  className="w-full text-sm bg-white dark:bg-[#12151C] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-800 dark:text-slate-100 outline-none focus:border-red-500 transition-all font-mono"
                />
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  Matches occurrences in text and secure-blacks them out.
                </p>
              </div>
            )}

            {/* Translate PDF settings */}
            {tool.id === 'ai-translate' && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Languages className="w-3.5 h-3.5 text-purple-500" />
                  Target Language
                </label>
                <select
                  value={options.targetLanguage || 'Spanish'}
                  onChange={(e) => onUpdateOptions({ targetLanguage: e.target.value })}
                  className="w-full text-sm bg-white dark:bg-[#12151C] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-100 focus:border-red-500 outline-none transition-all cursor-pointer font-medium"
                >
                  {['Spanish', 'French', 'German', 'Italian', 'Hindi', 'Japanese', 'Chinese', 'Portuguese', 'Arabic', 'Russian'].map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  Translates extracted text into your target language using advanced AI translation models.
                </p>
              </div>
            )}

            {/* AI Enhanced Option for eligible converters */}
            {supportsAI && (
              <div className="flex items-start space-x-3.5 p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <input
                  type="checkbox"
                  id="ai-enhanced-check"
                  checked={options.aiEnhanced || false}
                  onChange={(e) => onUpdateOptions({ aiEnhanced: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500 border-slate-300 focus:ring-amber-400 mt-1 cursor-pointer accent-amber-500"
                />
                <div className="flex-1">
                  <label htmlFor="ai-enhanced-check" className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1 cursor-pointer select-none">
                    <Sparkles className="w-4 h-4 text-amber-500 fill-current" />
                    AI-Enhanced Preserved Layout
                  </label>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    Uses advanced AI models to analyze the document structure, preserving headings, bold weights, bullet points, and tabulations directly inside the output file.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Trigger button */}
          <button
            onClick={onProcess}
            disabled={isProcessing}
            className="w-full py-4 px-6 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 disabled:from-slate-300 disabled:to-slate-400 disabled:dark:from-slate-700 disabled:dark:to-slate-800 text-white font-display font-bold text-base rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-red-950/20 hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Processing Document...</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>Execute Conversion</span>
                <kbd className="hidden md:inline-flex items-center gap-0.5 px-2 py-0.5 ml-2 text-[10px] font-mono bg-white/20 border border-white/25 rounded text-white shadow-sm font-bold uppercase tracking-wide">
                  Ctrl+Enter
                </kbd>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
