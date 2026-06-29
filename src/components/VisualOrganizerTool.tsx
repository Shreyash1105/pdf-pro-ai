import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Trash2, 
  RotateCw, 
  Sparkles, 
  FileText, 
  LayoutGrid, 
  RefreshCw,
  Save,
  Loader2
} from 'lucide-react';
import { FileItem } from '../types';

interface VisualOrganizerToolProps {
  fileItem: FileItem;
  onReset: () => void;
  onSave: (pageOrder: string) => void;
  isProcessing: boolean;
}

interface VisualPage {
  id: string;
  originalIndex: number; // 1-indexed
  imageUrl: string;
  rotation: number; // 0, 90, 180, 270
}

export default function VisualOrganizerTool({ fileItem, onReset, onSave, isProcessing }: VisualOrganizerToolProps) {
  const [pages, setPages] = useState<VisualPage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load pages using client-side PDF renderer
  useEffect(() => {
    let active = true;

    async function loadPdfPages() {
      setIsLoading(true);
      setError(null);
      try {
        const pdfjsLib = (window as any).pdfjsLib;
        if (!pdfjsLib) {
          throw new Error("PDF renderer is not fully loaded. Please wait a moment.");
        }

        const arrayBuffer = await fileItem.file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const numPages = pdf.numPages;
        const loadedPages: VisualPage[] = [];

        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.5 }); // low scale for thumbnails is 5x faster

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (!context) continue;

          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise;

          const imageUrl = canvas.toDataURL('image/jpeg', 0.8);
          
          if (active) {
            loadedPages.push({
              id: `page-${i}-${Math.random().toString(36).substring(2, 5)}`,
              originalIndex: i,
              imageUrl,
              rotation: 0
            });
          }
        }

        if (active) {
          setPages(loadedPages);
        }
      } catch (err: any) {
        console.error("Visual organizer rendering failed:", err);
        setError("Could not render page previews. You can still use the text-based order field.");
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadPdfPages();

    return () => {
      active = false;
    };
  }, [fileItem]);

  // Rotate page locally (visual preview)
  const handleRotate = (index: number) => {
    setPages(prev => prev.map((p, idx) => {
      if (idx === index) {
        return { ...p, rotation: (p.rotation + 90) % 360 };
      }
      return p;
    }));
  };

  // Delete page locally
  const handleDelete = (index: number) => {
    setPages(prev => prev.filter((_, idx) => idx !== index));
  };

  // Swap pages
  const handleMove = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= pages.length) return;

    setPages(prev => {
      const newList = [...prev];
      const temp = newList[index];
      newList[index] = newList[targetIndex];
      newList[targetIndex] = temp;
      return newList;
    });
  };

  const handleSave = () => {
    if (pages.length === 0) {
      setError("Please preserve at least 1 page inside the document.");
      return;
    }
    // Compile comma-separated page indices
    const pageOrder = pages.map(p => p.originalIndex).join(',');
    onSave(pageOrder);
  };

  return (
    <div className="bg-white dark:bg-[#12151C] border border-slate-100 dark:border-white/5 rounded-2xl p-5 md:p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-white/5">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-pink-500/10 text-pink-500 rounded-lg">
            <LayoutGrid className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-display font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-1.5">
              Visual Page Organizer Canvas
              <span className="text-[10px] font-mono uppercase bg-pink-500/10 text-pink-500 px-1.5 py-0.5 rounded">Interactive</span>
            </h4>
            <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
              Arrange, rotate, or prune document pages below.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#161920] rounded-lg transition-all cursor-pointer font-sans"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Upload New
          </button>
          <button
            onClick={handleSave}
            disabled={isProcessing || isLoading || pages.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-pink-500 hover:bg-pink-600 disabled:bg-slate-100 disabled:dark:bg-[#161920] disabled:text-slate-400 rounded-lg transition-all cursor-pointer shadow-sm shadow-pink-500/10"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Compiling...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Save PDF Changes
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl text-xs text-red-500 leading-normal">
          {error}
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center text-center space-y-3">
          <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium animate-pulse font-sans">
            Extracting pages and compiling layout thumbnails...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[420px] overflow-y-auto p-1">
          {pages.map((page, idx) => (
            <div 
              key={page.id} 
              className="group relative bg-slate-50 dark:bg-[#161920]/40 border border-slate-100 dark:border-white/5 rounded-xl overflow-hidden p-2.5 flex flex-col justify-between space-y-3 hover:shadow-md transition-all duration-300"
            >
              {/* Thumbnail representation */}
              <div className="relative aspect-[3/4] bg-white dark:bg-[#0A0B0E] rounded-lg border border-slate-100 dark:border-white/10 overflow-hidden flex items-center justify-center">
                <img 
                  src={page.imageUrl} 
                  alt={`Page ${page.originalIndex}`} 
                  className="max-h-full max-w-full object-contain transition-transform duration-200"
                  style={{ transform: `rotate(${page.rotation}deg)` }}
                />
                
                {/* Visual badges */}
                <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono font-bold rounded-md">
                  Page {page.originalIndex}
                </div>

                <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-pink-500 text-white text-[9px] font-bold rounded">
                  Seq #{idx + 1}
                </div>
              </div>

              {/* Grid item Controls */}
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-2 text-slate-400 dark:text-slate-500">
                <div className="flex gap-1">
                  <button
                    onClick={() => handleMove(idx, 'left')}
                    disabled={idx === 0}
                    className="p-1 hover:bg-slate-200 dark:hover:bg-[#161920] rounded-lg disabled:opacity-30 cursor-pointer"
                    title="Move Left"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMove(idx, 'right')}
                    disabled={idx === pages.length - 1}
                    className="p-1 hover:bg-slate-200 dark:hover:bg-[#161920] rounded-lg disabled:opacity-30 cursor-pointer"
                    title="Move Right"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => handleRotate(idx)}
                    className="p-1 hover:bg-slate-200 dark:hover:bg-[#161920] rounded-lg cursor-pointer text-slate-400 hover:text-pink-500"
                    title="Rotate 90°"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(idx)}
                    className="p-1 hover:bg-slate-200 dark:hover:bg-[#161920] rounded-lg cursor-pointer text-slate-400 hover:text-red-500"
                    title="Delete Page"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
