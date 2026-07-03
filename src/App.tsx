import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  Trash2, 
  ShieldAlert, 
  Zap, 
  HelpCircle,
  FileText
} from 'lucide-react';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { initAnalyticsTracking } from './lib/analytics';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ToolsGrid, { TOOLS } from './components/ToolsGrid';
import DropZone from './components/DropZone';
import ProcessedFilesList from './components/ProcessedFilesList';
import ToastContainer from './components/Toast';
import AuthModal from './components/AuthModal';
import HistoryList from './components/HistoryList';
import PortalModal from './components/PortalModal';
import LegalModal from './components/LegalModal';
import WorkYourWay from './components/WorkYourWay';
import { translations } from './lib/translations';
import { ToolType, FileItem, ProcessingOptions, ToastItem } from './types';

async function renderPdfPagesToImages(file: File): Promise<{ blob: Blob; width: number; height: number }[]> {
  const pdfjsLib = (window as any).pdfjsLib;
  if (!pdfjsLib) {
    throw new Error("PDF renderer is not loaded yet. Please wait a moment and try again.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;
  const pages: { blob: Blob; width: number; height: number }[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    // Render at 1.2x scale for a fantastic balance of high resolution and lightning-fast file upload
    const viewport = page.getViewport({ scale: 1.2 });
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error("Canvas context is not supported.");
    }
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;

    // Use image/jpeg at 0.85 quality instead of heavy image/png. This is 10x smaller in size with identical visual quality!
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.85);
    });

    if (blob) {
      pages.push({
        blob,
        width: viewport.width,
        height: viewport.height
      });
    }
  }

  return pages;
}

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [isPortalOpen, setIsPortalOpen] = useState<boolean>(false);
  const [isLegalOpen, setIsLegalOpen] = useState<boolean>(false);
  const [legalTab, setLegalTab] = useState<'privacy' | 'terms' | 'security'>('privacy');
  const [activeLanguage, setActiveLanguage] = useState<string>(() => {
    return localStorage.getItem('activeLanguage') || 'en';
  });
  const [selectedToolId, setSelectedToolId] = useState<ToolType | undefined>(undefined);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [options, setOptions] = useState<ProcessingOptions>({
    rotateAngle: 90,
    compressLevel: 'medium',
    autoOptimize: false,
    aiEnhanced: false,
    splitRange: '',
    enableOcr: false,
    ocrEngine: 'gemini'
  });
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Auth and History State
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success', fileName?: string, downloadUrl?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type, fileName, downloadUrl }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Listen for Firebase Auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      initAnalyticsTracking(user?.uid || undefined, user?.email || undefined);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setShowHistory(false);
      addToast('Signed out successfully.', 'info');
    } catch (error) {
      console.error('Sign out error:', error);
      addToast('Failed to sign out. Please try again.', 'error');
    }
  };

  // Initialize theme
  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Register global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Esc key -> return to landing page (only if in workspace/tool is selected)
      if (e.key === 'Escape') {
        if (selectedToolId) {
          handleReset();
          addToast('Returned to landing page', 'info');
        }
      }
      
      // 2. Ctrl+Enter or Cmd+Enter -> trigger current tool's conversion process
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (selectedToolId && files.length > 0 && !isProcessing) {
          e.preventDefault();
          handleProcess();
          addToast('Processing started via keyboard shortcut', 'info');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedToolId, files, isProcessing, options]);

  // Toggle Dark Mode
  const handleToggleDarkMode = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    localStorage.setItem('theme', nextDark ? 'dark' : 'light');
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSelectTool = (toolId: ToolType) => {
    setSelectedToolId(toolId);
    setFiles([]); // clear files when changing tool
    setErrorMessage(null);
  };

  const handleReset = () => {
    setSelectedToolId(undefined);
    setFiles([]);
    setErrorMessage(null);
  };

  // Files management
  const handleFilesAdded = (rawFiles: File[]) => {
    setErrorMessage(null);
    const isMulti = selectedToolId === 'merge' || selectedToolId === 'image-to-pdf';
    
    const newItems: FileItem[] = rawFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
      progress: 0,
      status: 'idle'
    }));

    if (isMulti) {
      setFiles(prev => [...prev, ...newItems]);
    } else {
      setFiles(newItems.slice(0, 1)); // only allow single file
    }
  };

  const handleRemoveFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleUpdateOptions = (newOptions: Partial<ProcessingOptions>) => {
    setOptions(prev => ({ ...prev, ...newOptions }));
  };

  // Core execution flow: Connects Frontend to Express endpoints
  const handleProcess = async () => {
    if (files.length === 0 || !selectedToolId) return;

    setIsProcessing(true);
    setErrorMessage(null);

    // 1. Simulate File Upload Progress
    setFiles(prev => prev.map(f => ({ ...f, status: 'uploading', progress: 10 })));

    try {
      const uploadIntervals = files.map(fileItem => {
        return new Promise<void>((resolve) => {
          let currentProgress = 10;
          const interval = setInterval(() => {
            currentProgress += 15;
            if (currentProgress >= 100) {
              currentProgress = 100;
              clearInterval(interval);
              setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: 'processing', progress: 100 } : f));
              resolve();
            } else {
              setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, progress: currentProgress } : f));
            }
          }, 100);
        });
      });

      await Promise.all(uploadIntervals);

      // 2. Fire Request to Express conversion backend
      const formData = new FormData();
      
      if (selectedToolId === 'pdf-to-ppt' || selectedToolId === 'pdf-to-image') {
        const pdfFile = files[0].file;
        // Always append original PDF under 'file' so that the server can fall back
        formData.append('file', pdfFile);
        formData.append('originalName', pdfFile.name);

        try {
          const pageImages = await renderPdfPagesToImages(pdfFile);
          pageImages.forEach((img, index) => {
            const padIndex = String(index).padStart(4, '0');
            formData.append('files', img.blob, `page-${padIndex}.jpg`);
          });
          if (selectedToolId === 'pdf-to-ppt') {
            formData.append('pageDimensions', JSON.stringify(pageImages.map(p => ({ width: p.width, height: p.height }))));
          }
        } catch (renderError) {
          console.warn("Client-side PDF page image rendering failed:", renderError);
        }
      } else {
        // Determine multi-file vs single-file endpoint parameters
        const isMulti = selectedToolId === 'merge' || selectedToolId === 'image-to-pdf' || selectedToolId === 'scan-to-pdf' || selectedToolId === 'compare-pdf';
        if (isMulti) {
          files.forEach(f => {
            formData.append('files', f.file);
          });
        } else {
          formData.append('file', files[0].file);
        }
      }

      // Append conversion options
      if (options.rotateAngle) formData.append('rotateAngle', options.rotateAngle.toString());
      if (options.splitRange) formData.append('splitRange', options.splitRange);
      if (options.compressLevel) formData.append('compressLevel', options.compressLevel);
      if (options.autoOptimize !== undefined) formData.append('autoOptimize', options.autoOptimize.toString());
      if (options.aiEnhanced) formData.append('aiEnhanced', options.aiEnhanced.toString());
      if (options.ocrFormat) formData.append('ocrFormat', options.ocrFormat);
      if (options.enableOcr !== undefined) formData.append('enableOcr', options.enableOcr.toString());
      if (options.ocrEngine) formData.append('ocrEngine', options.ocrEngine);
      
      // Watermark & Page numbering options
      if (options.watermarkText) formData.append('watermarkText', options.watermarkText);
      if (options.watermarkColor) formData.append('watermarkColor', options.watermarkColor);
      if (options.watermarkSize) formData.append('watermarkSize', options.watermarkSize.toString());
      if (options.watermarkOpacity) formData.append('watermarkOpacity', options.watermarkOpacity.toString());
      if (options.watermarkAngle) formData.append('watermarkAngle', options.watermarkAngle.toString());
      if (options.numberPosition) formData.append('numberPosition', options.numberPosition);
      if (options.numberFormat) formData.append('numberFormat', options.numberFormat);
      if (options.numberSize) formData.append('numberSize', options.numberSize.toString());
      if (options.numberColor) formData.append('numberColor', options.numberColor);

      // Page manipulation and utility options
      if (options.pagesToRemove) formData.append('pagesToRemove', options.pagesToRemove);
      if (options.pagesToExtract) formData.append('pagesToExtract', options.pagesToExtract);
      if (options.pageOrder) formData.append('pageOrder', options.pageOrder);
      if (options.cropMargin) formData.append('cropMargin', options.cropMargin);
      if (options.editText) formData.append('editText', options.editText);
      if (options.editX !== undefined) formData.append('editX', options.editX.toString());
      if (options.editY !== undefined) formData.append('editY', options.editY.toString());
      if (options.formFields) formData.append('formFields', options.formFields);
      if (options.pdfPassword) formData.append('pdfPassword', options.pdfPassword);
      if (options.signatureText) formData.append('signatureText', options.signatureText);
      if (options.redactPhrases) formData.append('redactPhrases', options.redactPhrases);
      if (options.targetLanguage) formData.append('targetLanguage', options.targetLanguage);

      const response = await fetch(`/api/convert/${selectedToolId}`, {
        method: 'POST',
        body: formData,
      });

      const responseText = await response.text();
      let result: any;
      let isJson = false;

      try {
        result = JSON.parse(responseText);
        isJson = true;
      } catch (e) {
        isJson = false;
      }

      if (!response.ok) {
        let errMsg = `Server responded with status ${response.status}`;
        if (isJson && result && result.error) {
          errMsg = result.error;
        } else if (responseText) {
          // Extract cleaner message from HTML or text error
          const htmlMatch = responseText.match(/<pre>([\s\S]*?)<\/pre>/i) || responseText.match(/<h1>([\s\S]*?)<\/h1>/i) || responseText.match(/<title>([\s\S]*?)<\/title>/i);
          if (htmlMatch && htmlMatch[1]) {
            errMsg = htmlMatch[1].trim();
          } else if (responseText.length < 200) {
            errMsg = responseText.trim();
          }
        }
        throw new Error(errMsg);
      }

      if (!isJson) {
        let errMsg = 'Received unexpected non-JSON response from server.';
        if (responseText) {
          const htmlMatch = responseText.match(/<pre>([\s\S]*?)<\/pre>/i) || responseText.match(/<h1>([\s\S]*?)<\/h1>/i) || responseText.match(/<title>([\s\S]*?)<\/title>/i);
          if (htmlMatch && htmlMatch[1]) {
            errMsg += ` Details: ${htmlMatch[1].trim()}`;
          } else if (responseText.length < 200) {
            errMsg += ` Response: ${responseText.trim()}`;
          }
        }
        throw new Error(errMsg);
      }

      // 3. Mark complete immediately so user doesn't wait for history logging
      setFiles(prev => prev.map(f => ({
        ...f,
        status: 'completed',
        resultUrl: result.resultUrl,
        resultName: result.resultName,
        resultSize: result.resultSize,
        aiAnalysis: result.aiAnalysis,
      })));

      addToast(
        'Document processed successfully! Your file is ready for download.',
        'success',
        result.resultName,
        result.resultUrl
      );

      // Save conversion to Firestore asynchronously in background (non-blocking)
      if (currentUser) {
        addDoc(collection(db, 'conversions'), {
          userId: currentUser.uid,
          toolId: selectedToolId,
          toolTitle: currentTool?.title || selectedToolId,
          originalName: files.map(f => f.name).join(', '),
          resultName: result.resultName,
          resultUrl: result.resultUrl,
          resultSize: result.resultSize,
          timestamp: Date.now()
        }).catch((dbError) => {
          console.error('Error saving conversion to history:', dbError);
        });
      }

    } catch (error: any) {
      console.error('Processing error:', error);
      const errMsg = error.message || "Error: We couldn't process your file right now. Please try again shortly.";
      setErrorMessage(errMsg);
      addToast(errMsg, 'error');
      setFiles(prev => prev.map(f => ({
        ...f,
        status: 'failed',
        error: errMsg
      })));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearCompleted = () => {
    setFiles([]);
  };

  const handleSelectLanguage = (code: string) => {
    setActiveLanguage(code);
    localStorage.setItem('activeLanguage', code);
  };

  const handleOpenLegal = (tab: 'privacy' | 'terms' | 'security') => {
    setLegalTab(tab);
    setIsLegalOpen(true);
  };

  const currentTool = TOOLS.find(t => t.id === selectedToolId);
  const t = translations[activeLanguage] || translations['en'];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0B0E] text-slate-800 dark:text-slate-200 flex flex-col font-sans transition-colors duration-300">
      
      {/* Dynamic Header */}
      <Navbar 
        darkMode={darkMode} 
        onToggleDarkMode={handleToggleDarkMode} 
        onReset={handleReset} 
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
        showHistory={showHistory}
        onToggleHistory={(show) => setShowHistory(show)}
        onOpenPortal={() => setIsPortalOpen(true)}
        onSelectTool={(toolId) => {
          setShowHistory(false);
          setSelectedToolId(toolId);
        }}
      />

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        
        {showHistory && currentUser ? (
          /* HISTORY VIEW */
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <h2 className="font-display font-light text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
                  My Conversion <span className="italic font-serif">History</span>
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  Manage, filter, and re-download your past conversions.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowHistory(false);
                  setSelectedToolId(undefined);
                }}
                className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span>Back to all tools</span>
              </button>
            </div>

            <HistoryList
              userId={currentUser.uid}
              onSelectTool={(toolId) => {
                setShowHistory(false);
                setSelectedToolId(toolId);
              }}
              addToast={addToast}
            />
          </div>
        ) : !selectedToolId ? (
          <div className="space-y-16">
            
            {/* Hero Section */}
            <div className="relative text-center max-w-3xl mx-auto space-y-8 py-4">

              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-red-500/5 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-500/25 dark:border-red-900/40 shadow-inner">
                <Sparkles className="w-3 h-3 fill-current text-red-500" />
                {t.tagline}
              </span>
              
              <h1 className="font-serif font-bold text-5xl sm:text-7xl text-slate-900 dark:text-white tracking-tight leading-[1.12]">
                {t.heroTitle1} <br />
                <span className="italic font-serif font-medium text-slate-800 dark:text-slate-100">{t.heroTitle2}</span>
              </h1>
              
              <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                {t.heroSubtitle}
              </p>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                <span className="bg-white dark:bg-[#12151C] px-3.5 py-2 rounded-xl border border-slate-100 dark:border-white/5 shadow-sm hover:scale-102 transition-transform cursor-default">
                  ⚡ {t.zeroPageLimits}
                </span>
                <span className="bg-white dark:bg-[#12151C] px-3.5 py-2 rounded-xl border border-slate-100 dark:border-white/5 shadow-sm hover:scale-102 transition-transform cursor-default">
                  📁 {t.freeBatchProcessing}
                </span>
                <span className="bg-white dark:bg-[#12151C] px-3.5 py-2 rounded-xl border border-slate-100 dark:border-white/5 shadow-sm hover:scale-102 transition-transform cursor-default">
                  🤖 {t.geminiEnhanced}
                </span>
              </div>
            </div>

            {/* Grid of Conversion Tools */}
            <ToolsGrid onSelectTool={handleSelectTool} />
            
            {/* Fully functional "Work your way" interactive offline & mobile simulator section */}
            <WorkYourWay darkMode={darkMode} />
          </div>
        ) : (
          /* WORKSPACE VIEW: Single Tool Workspace */
          <div className="space-y-8">
            
            {/* Navigation back and quick switcher */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <button
                onClick={handleReset}
                className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span>{t.backToAllTools}</span>
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 ml-1 text-[10px] font-mono bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded text-slate-400 dark:text-slate-500 shadow-sm uppercase font-normal">Esc</kbd>
              </button>

              {/* Mini switcher */}
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <label className="text-xs font-bold font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0">
                  {t.quickSwap}
                </label>
                <select
                  value={selectedToolId}
                  onChange={(e) => handleSelectTool(e.target.value as ToolType)}
                  className="w-full sm:w-56 text-sm bg-white dark:bg-[#12151C] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-200 focus:border-red-500 outline-none transition-all cursor-pointer font-medium"
                >
                  {TOOLS.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Error notifications */}
            {errorMessage && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-start space-x-3.5">
                  <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold">Execution Failed</h4>
                    <p className="mt-0.5 text-xs opacity-90 leading-relaxed">{errorMessage}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                  <button
                    onClick={() => {
                      setErrorMessage(null);
                      setFiles(prev => prev.map(f => f.status === 'failed' ? { ...f, status: 'idle', error: undefined } : f));
                    }}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white dark:bg-rose-500 dark:hover:bg-rose-600 font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer font-sans"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer font-sans"
                  >
                    Refresh Page
                  </button>
                </div>
              </div>
            )}

            {/* Grid for main container work and outputs */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Primary file stage: occupies full width or col, centering focus */}
              <div className="lg:col-span-8 space-y-8">
                {currentTool && (
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-red-500/10 to-blue-500/10 rounded-3xl blur-xl opacity-0 dark:opacity-100 transition-opacity"></div>
                    <div className="relative">
                      <DropZone
                        tool={currentTool}
                        files={files}
                        options={options}
                        onFilesAdded={handleFilesAdded}
                        onRemoveFile={handleRemoveFile}
                        onUpdateOptions={handleUpdateOptions}
                        onProcess={handleProcess}
                        isProcessing={isProcessing}
                        addToast={addToast}
                      />
                    </div>
                  </div>
                )}

                <ProcessedFilesList 
                  files={files} 
                  onClear={handleClearCompleted} 
                />
              </div>

              {/* Sidebar Quick-Tips & Visual guide */}
              <div className="lg:col-span-4 bg-white dark:bg-[#12151C] border border-slate-100 dark:border-white/5 p-6 rounded-3xl shadow-md space-y-6">
                <div>
                  <h3 className="font-display font-bold text-slate-800 dark:text-slate-100 text-base">
                    {t.howItWorks}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Convert and format documents locally inside secure, temporary sandboxes.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <span className="w-5 h-5 bg-red-50 dark:bg-red-950/20 text-red-500 text-xs font-bold flex items-center justify-center rounded-full shrink-0 mt-0.5">
                      1
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-normal">
                      {t.step1}
                    </p>
                  </div>

                  <div className="flex items-start space-x-3">
                    <span className="w-5 h-5 bg-red-50 dark:bg-red-950/20 text-red-500 text-xs font-bold flex items-center justify-center rounded-full shrink-0 mt-0.5">
                      2
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-normal">
                      {t.step2}
                    </p>
                  </div>

                  <div className="flex items-start space-x-3">
                    <span className="w-5 h-5 bg-red-50 dark:bg-red-950/20 text-red-500 text-xs font-bold flex items-center justify-center rounded-full shrink-0 mt-0.5">
                      3
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-normal">
                      {t.step3}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-50 dark:border-white/5 text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5 leading-normal">
                  <Zap className="w-4 h-4 text-red-500 fill-current shrink-0" />
                  <span>{t.freeBatchActive}</span>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* Corporate Standard Trust Footer */}
      <Footer onOpenLegal={handleOpenLegal} />

      {/* Elegant Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Authentication & Registration Modal Overlay */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(msg) => addToast(msg, 'success')}
      />

      {/* Languages, Q&A & Contact Support Portal Overlay */}
      <PortalModal
        isOpen={isPortalOpen}
        onClose={() => setIsPortalOpen(false)}
        activeLanguage={activeLanguage}
        onSelectLanguage={handleSelectLanguage}
        darkMode={darkMode}
        addToast={addToast}
        onSelectTool={handleSelectTool}
        currentUser={currentUser}
      />

      {/* Legal documents overlay modal (Privacy, Terms, Security Audit) */}
      <LegalModal
        isOpen={isLegalOpen}
        onClose={() => setIsLegalOpen(false)}
        initialTab={legalTab}
      />
    </div>
  );
}
