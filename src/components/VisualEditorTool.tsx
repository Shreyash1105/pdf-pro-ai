import { useState, useRef, useEffect, MouseEvent, useCallback, memo, useMemo } from 'react';
import { 
  Paintbrush, 
  RefreshCw, 
  Save, 
  Trash2, 
  Type, 
  PenTool, 
  Loader2,
  Plus,
  Sparkles,
  MousePointerClick,
  Info,
  Check,
  Undo2,
  Layers,
  Sparkle,
  Eraser,
  Highlighter,
  ChevronDown,
  Copy,
  FolderOpen,
  Maximize2,
  Minimize2,
  Download
} from 'lucide-react';
import { FileItem } from '../types';

interface VisualEditorToolProps {
  fileItem: FileItem;
  onReset: () => void;
  onSave: (editsJson: string) => void;
  isProcessing: boolean;
}

interface TextBlock {
  id: string;
  text: string;
  originalText?: string; // Cache of the original extracted PDF text
  x: number; // 0 - 100% of container width
  y: number; // 0 - 100% of container height
  width?: number; // 0 - 100% of container width
  height?: number; // 0 - 100% of container height
  fontFamily: string; // 'Helvetica' | 'Helvetica-Bold' | 'Times-Roman' | 'Times-Bold' | 'Courier' | 'Courier-Bold'
  fontSize: number;
  color: string;
  whiteout: boolean;
  highlight?: boolean;
  pageIndex: number;
}

interface RenderedPage {
  index: number;
  imageUrl: string;
  width: number;
  height: number;
}

export default function VisualEditorTool({ fileItem, onReset, onSave, isProcessing }: VisualEditorToolProps) {
  const [blocks, setBlocks] = useState<TextBlock[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [renderedPages, setRenderedPages] = useState<RenderedPage[]>([]);
  
  // Clean, high-fidelity interactive state:
  const [detectedSegments, setDetectedSegments] = useState<TextBlock[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(true); // Default to full-page workspace
  
  // Loading & Progress feedback
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTool, setActiveTool] = useState<'text' | 'whiteout' | 'highlight' | 'signature'>('text');

  // Success Modal for download of edited PDF
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (fileItem.status === 'completed' && fileItem.resultUrl) {
      setShowSuccessModal(true);
    } else {
      setShowSuccessModal(false);
    }
  }, [fileItem.status, fileItem.resultUrl]);

  // History for Undo
  const [history, setHistory] = useState<TextBlock[][]>([]);

  // Drag states
  const [isDraggingBlock, setIsDraggingBlock] = useState(false);
  const dragStartOffset = useRef({ x: 0, y: 0 });
  const activePageRef = useRef<number>(0);

  // Signature States
  const [sigName, setSigName] = useState('Shreyash Suresh Rakshe');
  const [sigFont, setSigFont] = useState('Courier-Bold');
  const [sigColor, setSigColor] = useState('#1D4ED8'); // Classic blue ink

  // Push state to history before edits
  const saveToHistory = useCallback((currentBlocks: TextBlock[]) => {
    setHistory(prev => [...prev.slice(-15), JSON.parse(JSON.stringify(currentBlocks))]);
  }, []);

  const triggerUndo = useCallback(() => {
    setHistory(prevHistory => {
      if (prevHistory.length > 0) {
        const prev = prevHistory[prevHistory.length - 1];
        setBlocks(prev);
        return prevHistory.slice(0, -1);
      }
      return prevHistory;
    });
  }, []);

  // Extract PDF structures & render page backgrounds with pdfjsLib
  useEffect(() => {
    let active = true;

    const parseAndRenderPDF = async () => {
      setIsLoading(true);
      setLoadingStep('Initializing PDF parser engine...');
      try {
        const pdfjsLib = (window as any).pdfjsLib;
        if (!pdfjsLib) {
          throw new Error('PDF render libraries are loading. Please wait 1-2 seconds.');
        }

        const arrayBuffer = await fileItem.file.arrayBuffer();
        setLoadingStep('Loading document pages...');
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const totalPages = pdf.numPages;
        
        const pagesData: RenderedPage[] = [];
        const extractedBlocks: TextBlock[] = [];

        for (let i = 1; i <= totalPages; i++) {
          if (!active) return;
          setLoadingStep(`Processing and rendering page ${i} of ${totalPages}...`);
          
          const page = await pdf.getPage(i);
          // High-fidelity standard scale
          const viewport = page.getViewport({ scale: 1.5 });
          
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (!context) continue;
          
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          
          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise;

          // Convert high-res page canvas to jpeg to bypass memory pressure
          const imageUrl = canvas.toDataURL('image/jpeg', 0.9);
          
          pagesData.push({
            index: i - 1,
            imageUrl,
            width: viewport.width,
            height: viewport.height
          });

          // Extract text content details for layout mapping
          const textContent = await page.getTextContent();
          if (textContent && textContent.items.length > 0) {
            // Run our smart text row merging algorithm to group separate words into lines
            const pageViewport = page.getViewport({ scale: 1.0 }); // standard points
            const mergedPageBlocks = groupAndMergeTextItems(
              textContent.items, 
              pageViewport, 
              i - 1
            );
            extractedBlocks.push(...mergedPageBlocks);
          }
        }

        if (active) {
          setRenderedPages(pagesData);
          setDetectedSegments([]);
          setBlocks(extractedBlocks);
          setLoadingStep('');
        }
      } catch (err: any) {
        console.error('[PDF Pro Editor] Visual loading failed:', err);
        setLoadingStep(`Error: ${err.message || 'Failed to parse PDF contents.'}`);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    parseAndRenderPDF();

    return () => {
      active = false;
    };
  }, [fileItem]);

  // Activate a detected segment to make it editable in-place on demand
  const activateSegment = (seg: TextBlock) => {
    saveToHistory(blocks);
    setBlocks(prev => {
      if (prev.some(b => b.id === seg.id)) return prev;
      return [...prev, { ...seg, whiteout: true }]; // Cover background text by default to overwrite cleanly
    });
    setSelectedBlockId(seg.id);
  };

  // Merge adjacent horizontal words belonging to similar line heights
  const groupAndMergeTextItems = (items: any[], viewport: { width: number; height: number }, pageIndex: number): TextBlock[] => {
    const { width, height } = viewport;
    
    // Convert raw item array to coordinate layout maps
    const mapped = items.map((item, idx) => {
      const tx = item.transform[4]; // translateX
      const ty = item.transform[5]; // translateY
      const fontSize = Math.abs(item.transform[3]) || item.height || 12;
      return {
        id: `raw-${pageIndex}-${idx}`,
        text: item.str,
        tx,
        ty,
        fontSize,
        width: item.width || (item.str.length * fontSize * 0.55),
        height: item.height || fontSize,
      };
    });

    // Group items vertically by 'ty' coordinate with a tolerance of 4 PDF points (about half line height)
    const rows: any[][] = [];
    mapped.forEach(item => {
      if (!item.text || item.text.trim() === '') return;
      
      let grouped = false;
      for (const r of rows) {
        if (Math.abs(r[0].ty - item.ty) < 4) {
          r.push(item);
          grouped = true;
          break;
        }
      }
      if (!grouped) {
        rows.push([item]);
      }
    });

    const pageBlocks: TextBlock[] = [];

    // Process each group line
    rows.forEach((row, rowIdx) => {
      // Sort items horizontally
      row.sort((a, b) => a.tx - b.tx);

      let current: any = null;

      row.forEach((item) => {
        if (!current) {
          current = { ...item };
        } else {
          const currentEnd = current.tx + current.width;
          const gap = item.tx - currentEnd;

          // If gap is small (word spaces or close blocks), merge them
          if (gap < Math.max(12, current.fontSize * 1.6)) {
            const spaceSeparator = gap > 1 ? ' ' : '';
            current.text += spaceSeparator + item.text;
            current.width = (item.tx + item.width) - current.tx;
            current.fontSize = Math.max(current.fontSize, item.fontSize);
          } else {
            pageBlocks.push(convertMappedToBlock(current, width, height, pageIndex, pageBlocks.length));
            current = { ...item };
          }
        }
      });

      if (current) {
        pageBlocks.push(convertMappedToBlock(current, width, height, pageIndex, pageBlocks.length));
      }
    });

    return pageBlocks;
  };

  const convertMappedToBlock = (item: any, pageWidth: number, pageHeight: number, pageIndex: number, idx: number): TextBlock => {
    const xPercent = (item.tx / pageWidth) * 100;
    // Map from PDF bottom-origin to HTML top-origin
    const yPercent = (1 - (item.ty / pageHeight)) * 100;
    const widthPercent = (item.width / pageWidth) * 100;
    const heightPercent = (item.height / pageHeight) * 100;

    let fontFamily = 'Helvetica';
    if (item.fontSize > 16) {
      fontFamily = 'Helvetica-Bold';
    }

    return {
      id: `extracted-${pageIndex}-${idx}-${Date.now()}`,
      text: item.text,
      originalText: item.text, // Cache the pristine, original extracted text
      x: Math.max(0.1, Math.min(99.9, Math.round(xPercent * 100) / 100)),
      y: Math.max(0.1, Math.min(99.9, Math.round(yPercent * 100) / 100)),
      width: Math.max(0.5, Math.min(99.9, Math.round(widthPercent * 100) / 100)),
      height: Math.max(0.2, Math.min(99.9, Math.round(heightPercent * 100) / 100)),
      fontFamily,
      fontSize: Math.round(item.fontSize) || 12,
      color: '#000000',
      whiteout: false, // Default to false so unedited text doesn't display white boxes
      pageIndex
    };
  };

  // Add block from scratch upon clicking the PDF Page canvas
  const handlePageClick = (e: MouseEvent<HTMLDivElement>, pageIndex: number) => {
    // If clicking on an existing active block, don't generate duplicate boxes
    if ((e.target as HTMLElement).closest('.editor-block-item') || (e.target as HTMLElement).closest('.block-controller') || (e.target as HTMLElement).closest('.inactive-segment-item')) {
      return;
    }

    saveToHistory(blocks);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    let newBlock: TextBlock;

    if (activeTool === 'signature') {
      newBlock = {
        id: `sig-${Date.now()}`,
        text: sigName,
        x: Math.round(x * 100) / 100,
        y: Math.round(y * 100) / 100,
        fontFamily: sigFont,
        fontSize: 22,
        color: sigColor,
        whiteout: false,
        pageIndex
      };
    } else if (activeTool === 'highlight') {
      newBlock = {
        id: `hl-${Date.now()}`,
        text: 'Highlighted Segment',
        x: Math.round(x * 100) / 100,
        y: Math.round(y * 100) / 100,
        fontFamily: 'Helvetica-Bold',
        fontSize: 14,
        color: '#854D0E', // Dark yellow/bronze font
        whiteout: false,
        highlight: true,
        pageIndex
      };
    } else if (activeTool === 'whiteout') {
      newBlock = {
        id: `wh-${Date.now()}`,
        text: '          ', // empty spacing acts as cover
        x: Math.round(x * 100) / 100,
        y: Math.round(y * 100) / 100,
        fontFamily: 'Helvetica',
        fontSize: 14,
        color: '#FFFFFF',
        whiteout: true,
        pageIndex
      };
    } else {
      // Standard Text override
      newBlock = {
        id: `custom-txt-${Date.now()}`,
        text: 'Type text here',
        x: Math.round(x * 100) / 100,
        y: Math.round(y * 100) / 100,
        fontFamily: 'Helvetica',
        fontSize: 14,
        color: '#000000',
        whiteout: true,
        pageIndex
      };
    }

    setBlocks([...blocks, newBlock]);
    setSelectedBlockId(newBlock.id);
  };

  // Drag and drop block layout adjustments
  const handleBlockMouseDown = useCallback((e: MouseEvent<HTMLDivElement>, blockId: string, currentXPercent: number, currentYPercent: number) => {
    if ((e.target as HTMLElement).closest('.block-controller') || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement || e.target instanceof HTMLButtonElement) {
      return;
    }
    
    e.stopPropagation();
    setSelectedBlockId(blockId);
    setIsDraggingBlock(true);
    
    const parentContainer = (e.currentTarget.parentNode as HTMLElement);
    if (!parentContainer) return;
    
    const rect = parentContainer.getBoundingClientRect();
    
    dragStartOffset.current = {
      x: ((e.clientX - rect.left) / rect.width) * 100 - currentXPercent,
      y: ((e.clientY - rect.top) / rect.height) * 100 - currentYPercent,
    };
  }, []);

  const handlePageMouseMove = (e: MouseEvent<HTMLDivElement>, pageIndex: number) => {
    if (!isDraggingBlock || !selectedBlockId) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect) return;
    
    let newX = ((e.clientX - rect.left) / rect.width) * 100 - dragStartOffset.current.x;
    let newY = ((e.clientY - rect.top) / rect.height) * 100 - dragStartOffset.current.y;
    
    newX = Math.max(0.1, Math.min(99.9, newX));
    newY = Math.max(0.1, Math.min(99.9, newY));
    
    setBlocks(prev => prev.map(b => b.id === selectedBlockId ? { 
      ...b, 
      x: Math.round(newX * 100) / 100, 
      y: Math.round(newY * 100) / 100 
    } : b));
  };

  const handleMouseUp = () => {
    setIsDraggingBlock(false);
  };

  const updateBlock = useCallback((id: string, fields: Partial<TextBlock>) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...fields } : b));
  }, []);

  const duplicateBlock = useCallback((block: TextBlock) => {
    setBlocks(prev => {
      saveToHistory(prev);
      const dup: TextBlock = {
        ...block,
        id: `dup-${Date.now()}`,
        x: Math.min(95, block.x + 4),
        y: Math.min(95, block.y + 4)
      };
      setSelectedBlockId(dup.id);
      return [...prev, dup];
    });
  }, [saveToHistory]);

  const removeBlock = useCallback((id: string) => {
    setBlocks(prev => {
      saveToHistory(prev);
      return prev.filter(b => b.id !== id);
    });
    setSelectedBlockId(prevId => prevId === id ? null : prevId);
  }, [saveToHistory]);

  const handleSaveAll = () => {
    // Only compile and submit blocks that are modified, highlighted, covered with whiteout, or newly created/duplicated
    const modifiedBlocks = blocks.filter(b => {
      const isExtracted = b.id.startsWith('extracted-');
      const isEdited = b.text !== b.originalText;
      const isWhiteout = b.whiteout;
      const isHighlight = b.highlight;
      return !isExtracted || isEdited || isWhiteout || isHighlight;
    });
    onSave(JSON.stringify(modifiedBlocks));
  };

  const blocksByPage = useMemo(() => {
    const map: { [key: number]: TextBlock[] } = {};
    for (const b of blocks) {
      if (!map[b.pageIndex]) map[b.pageIndex] = [];
      map[b.pageIndex].push(b);
    }
    return map;
  }, [blocks]);

  const activeBlock = blocks.find(b => b.id === selectedBlockId);

  return (
    <div className={isFullscreen 
      ? "fixed inset-0 bg-slate-50 dark:bg-[#0A0B0E] z-[99999] p-4 md:p-6 overflow-y-auto flex flex-col space-y-4 font-sans w-screen h-screen" 
      : "bg-white dark:bg-[#12151C] border border-slate-150 dark:border-white/5 rounded-2xl p-4 md:p-6 shadow-sm space-y-6 font-sans"
    }>
      
      {/* Visual Editor Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-white/5">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl">
            <Paintbrush className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-display font-bold text-slate-800 dark:text-slate-100 text-base">
              PDF Pro Editor
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Edit original PDF text lines, black out segments, stamp signatures, or highlight content in-place dynamically!
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end">
          {history.length > 0 && (
            <button
              onClick={triggerUndo}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#161920] border border-slate-200 dark:border-white/10 rounded-xl cursor-pointer"
              title="Undo last change"
            >
              <Undo2 className="w-4 h-4" />
              Undo
            </button>
          )}
          
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#161920] border border-slate-200 dark:border-white/10 rounded-xl cursor-pointer transition-all"
            title={isFullscreen ? "Exit full-screen workspace" : "Expand to full-screen workspace"}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-4 h-4 text-rose-500 animate-pulse" />
                <span>Normal Page</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4 text-rose-500" />
                <span>Full Page</span>
              </>
            )}
          </button>

          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#161920] rounded-xl transition-all cursor-pointer font-sans"
          >
            <RefreshCw className="w-4 h-4" />
            Clear File
          </button>
          <button
            onClick={handleSaveAll}
            disabled={isProcessing || isLoading || blocks.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:bg-slate-100 disabled:dark:bg-[#161920] disabled:text-slate-400 rounded-xl transition-all cursor-pointer shadow-md shadow-rose-600/15"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Compiling PDF...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Apply & Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor Tool-Bar (Just like Sejda layout) */}
      <div className="flex flex-wrap items-center gap-2 p-2.5 bg-slate-900 text-white rounded-xl shadow-lg border border-white/5 select-none">
        
        <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-slate-400 px-2 shrink-0">
          Editing Tools:
        </span>

        {/* Text Tool */}
        <button
          onClick={() => setActiveTool('text')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTool === 'text' 
              ? 'bg-rose-500 text-white shadow-sm' 
              : 'hover:bg-white/10 text-slate-300'
          }`}
        >
          <Type className="w-4 h-4" />
          Edit & Add Text
        </button>

        {/* Whiteout / Cover background Tool */}
        <button
          onClick={() => setActiveTool('whiteout')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTool === 'whiteout' 
              ? 'bg-rose-500 text-white shadow-sm' 
              : 'hover:bg-white/10 text-slate-300'
          }`}
          title="Conceal or cover background text segments"
        >
          <Eraser className="w-4 h-4" />
          Whiteout Block
        </button>

        {/* Highlighter Tool */}
        <button
          onClick={() => setActiveTool('highlight')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTool === 'highlight' 
              ? 'bg-rose-500 text-white shadow-sm' 
              : 'hover:bg-white/10 text-slate-300'
          }`}
        >
          <Highlighter className="w-4 h-4" />
          Highlight Text
        </button>

        {/* Signature Stamp Tool */}
        <button
          onClick={() => setActiveTool('signature')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTool === 'signature' 
              ? 'bg-rose-500 text-white shadow-sm' 
              : 'hover:bg-white/10 text-slate-300'
          }`}
        >
          <PenTool className="w-4 h-4" />
          Sign Document
        </button>

        {/* Digital Signature Customization Tray */}
        {activeTool === 'signature' && (
          <div className="flex items-center gap-2.5 bg-slate-800 px-3 py-1 rounded-lg border border-white/10 ml-auto animate-fade-in flex-wrap">
            <input
              type="text"
              value={sigName}
              onChange={(e) => setSigName(e.target.value)}
              placeholder="Signature..."
              className="bg-slate-950 text-white text-xs border border-white/10 rounded px-2 py-0.5 outline-none font-bold"
            />
            <select
              value={sigFont}
              onChange={(e) => setSigFont(e.target.value)}
              className="bg-transparent border-0 text-[11px] font-bold text-slate-300 cursor-pointer outline-none"
            >
              <option value="Courier-Bold">Stamp Mono</option>
              <option value="Times-Bold">Serif Stamp</option>
              <option value="Helvetica-Bold">Sans Stamp</option>
            </select>
            <div className="flex gap-1">
              {['#1D4ED8', '#B91C1C', '#000000'].map((col) => (
                <button
                  key={col}
                  onClick={() => setSigColor(col)}
                  className={`w-3.5 h-3.5 rounded-full border border-white/20 ${sigColor === col ? 'ring-2 ring-rose-500' : ''}`}
                  style={{ backgroundColor: col }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Loading sequence overlay / inline loader */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-[#161920]/40 border border-dashed border-slate-200 dark:border-white/5 rounded-2xl space-y-4">
          <Loader2 className="w-10 h-10 text-rose-500 animate-spin" />
          <div className="text-center">
            <h5 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Parsing PDF Document Layout</h5>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{loadingStep}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          
          {/* Main vertical scrollable canvas stack (exactly like Sejda) */}
          <div className="xl:col-span-9 flex flex-col items-center">
            
            <div className="w-full bg-slate-50 dark:bg-[#161920]/20 p-3 rounded-xl border border-slate-100 dark:border-white/5 flex items-center justify-between gap-3 text-xs mb-4">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Info className="w-4 h-4 text-rose-500" />
                <span>
                  {activeTool === 'text' && "🔍 Click on any text box to edit it, or click blank space to write new text."}
                  {activeTool === 'whiteout' && "🧹 Click anywhere on the document sheet to drop a Whiteout Conceal segment."}
                  {activeTool === 'highlight' && "✍️ Click anywhere on the sheet to place a highlighter yellow cover."}
                  {activeTool === 'signature' && "✒️ Click anywhere to stamp your signature: '" + sigName + "'"}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 font-bold shrink-0">
                {renderedPages.length} Pages Loaded
              </span>
            </div>

            {/* Scrollable sheets stack */}
            <div 
              onMouseUp={handleMouseUp}
              className="w-full max-h-[850px] overflow-y-auto space-y-10 py-8 px-4 flex flex-col items-center bg-slate-150 dark:bg-black/30 rounded-2xl border border-slate-200 dark:border-white/5 shadow-inner"
            >
              {renderedPages.map((page) => {
                const pageId = page.index;
                const pageBlocks = blocksByPage[pageId] || [];

                return (
                  <div key={pageId} className="flex flex-col items-center w-full">
                    {/* Page Label Indicator */}
                    <div className="flex justify-between w-full max-w-[660px] mb-2 px-1 text-[11px] font-bold text-slate-400 uppercase font-mono tracking-wider">
                      <span>{fileItem.name}</span>
                      <span>Page {pageId + 1} of {renderedPages.length}</span>
                    </div>

                    {/* Interactive Page Sheet Container */}
                    <div
                      onMouseMove={(e) => handlePageMouseMove(e, pageId)}
                      onClick={(e) => handlePageClick(e, pageId)}
                      className="relative w-full max-w-[660px] bg-white border border-slate-300 dark:border-white/10 shadow-2xl rounded-sm overflow-hidden select-none cursor-crosshair shrink-0 transition-shadow duration-150 hover:shadow-rose-600/5 hover:border-slate-400"
                      style={{ 
                        aspectRatio: `${page.width} / ${page.height}`,
                        minHeight: '400px'
                      }}
                    >
                      {/* High Resolution Page Image Background */}
                      <img 
                        src={page.imageUrl} 
                        alt={`Page ${pageId + 1}`}
                        className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                        referrerPolicy="no-referrer"
                      />

                      {/* Dynamic overlays Layer (All segments are immediately active, editable text lines) */}
                      {pageBlocks.map((block) => {
                        const isSelected = block.id === selectedBlockId;
                        const hasHighlight = block.highlight;
                        const isEdited = block.text !== block.originalText;
                        const isUnmodified = block.originalText !== undefined && !isEdited;

                        return (
                          <EditorBlockItem
                            key={block.id}
                            block={block}
                            isSelected={isSelected}
                            isUnmodified={isUnmodified}
                            hasHighlight={hasHighlight}
                            isEdited={isEdited}
                            onBlockMouseDown={handleBlockMouseDown}
                            onUpdateBlock={updateBlock}
                            onDuplicateBlock={duplicateBlock}
                            onRemoveBlock={removeBlock}
                            onSelectBlock={setSelectedBlockId}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Right Column Layout Panel */}
          <div className="xl:col-span-3 space-y-4">
            
            {/* Properties overview panel */}
            <div className="bg-slate-50 dark:bg-[#161920]/40 p-4 border border-slate-100 dark:border-white/5 rounded-2xl space-y-3.5">
              <h5 className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-rose-500" />
                Workspace Details
              </h5>

              <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Click any existing text line inside the document to edit. If you need to cover-up the original text behind it, ensure <strong>Cover bg</strong> is enabled on the block.
              </div>

              <div className="pt-2.5 border-t border-slate-200/50 dark:border-white/5 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Lines Loaded:</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{blocks.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">File Type:</span>
                  <span className="font-mono font-bold text-rose-500 uppercase">PDF</span>
                </div>
              </div>
            </div>

            {/* Quick action buttons list */}
            <div className="bg-slate-50 dark:bg-[#161920]/40 p-4 border border-slate-100 dark:border-white/5 rounded-2xl space-y-2.5">
              <h5 className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Interactive Help
              </h5>
              <ul className="text-xs text-slate-500 space-y-1.5 list-disc list-inside">
                <li>Choose a tool from the black menu.</li>
                <li>Drag boxes to align precisely.</li>
                <li>Fills act as real-time redact blocks.</li>
                <li>Duplicates save time.</li>
              </ul>
            </div>

          </div>

        </div>
      )}

      {/* SUCCESS ACTION DOWNLOAD OVERLAY MODAL */}
      {showSuccessModal && fileItem.resultUrl && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[100000] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#12151C] border border-slate-150 dark:border-white/5 max-w-md w-full rounded-2xl p-6 shadow-2xl text-center space-y-5 animate-scale-in">
            <div className="mx-auto w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center text-2xl font-bold border border-emerald-500/20">
              ✓
            </div>
            
            <div className="space-y-1.5">
              <h4 className="font-display font-bold text-lg text-slate-800 dark:text-slate-100">
                Changes Applied Successfully!
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Your edited PDF document has been compiled and is fully optimized for download.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-[#0A0B0E]/60 p-4 rounded-xl text-left border border-slate-100 dark:border-white/5 space-y-2 font-sans">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-400">Pristine Source:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{fileItem.name}</span>
              </div>
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-400">Compiled PDF Name:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{fileItem.resultName || 'document_edited.pdf'}</span>
              </div>
              {fileItem.resultSize && (
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-400">File Size:</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                    {fileItem.resultSize > 1024 * 1024 
                      ? `${(fileItem.resultSize / (1024 * 1024)).toFixed(2)} MB`
                      : `${(fileItem.resultSize / 1024).toFixed(1)} KB`
                    }
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <a
                href={normalizeDownloadUrl(fileItem.resultUrl)}
                download={fileItem.resultName || 'document_edited.pdf'}
                className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg shadow-rose-600/10 transition-all cursor-pointer text-sm"
              >
                <Download className="w-4 h-4" />
                <span>Download Edited PDF</span>
              </a>
              
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-2.5 px-6 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                Continue Editing
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Helper to sanitize/normalize download URLs
const normalizeDownloadUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) {
    return url;
  }
  return `/${url}`;
};

interface EditorBlockItemProps {
  block: TextBlock;
  isSelected: boolean;
  isUnmodified: boolean;
  hasHighlight: boolean | undefined;
  isEdited: boolean;
  onBlockMouseDown: (e: MouseEvent<HTMLDivElement>, id: string, x: number, y: number) => void;
  onUpdateBlock: (id: string, fields: Partial<TextBlock>) => void;
  onDuplicateBlock: (block: TextBlock) => void;
  onRemoveBlock: (id: string) => void;
  onSelectBlock: (id: string | null) => void;
}

const EditorBlockItem = memo(function EditorBlockItem({
  block,
  isSelected,
  isUnmodified,
  hasHighlight,
  isEdited,
  onBlockMouseDown,
  onUpdateBlock,
  onDuplicateBlock,
  onRemoveBlock,
  onSelectBlock,
}: EditorBlockItemProps) {
  return (
    <div
      onMouseDown={(e) => onBlockMouseDown(e, block.id, block.x, block.y)}
      className={`absolute rounded border transition-all duration-100 group editor-block-item ${
        isSelected 
          ? 'border-sky-500 border-solid bg-sky-500/[0.01] shadow-sm z-40' 
          : isUnmodified
          ? 'border-dashed border-sky-400/15 hover:border-sky-400 hover:bg-sky-500/[0.02] z-20'
          : 'border-transparent hover:border-sky-400 hover:bg-sky-500/[0.02] hover:shadow-[0_0_6px_rgba(56,189,248,0.2)] z-20'
      }`}
      style={{
        left: `${block.x}%`,
        top: `${block.y}%`,
        width: block.width ? `${block.width + 1.2}%` : 'auto',
        height: block.height ? `${block.height + 0.3}%` : 'auto',
        minWidth: '35px',
        backgroundColor: hasHighlight 
          ? 'rgba(254, 240, 138, 0.45)' // Yellow highlight
          : (block.whiteout || isSelected || isEdited) 
          ? '#FFFFFF' 
          : 'transparent',
        color: (isUnmodified && !isSelected) ? 'transparent' : block.color,
        fontFamily: block.fontFamily.includes('Courier') 
          ? 'monospace' 
          : block.fontFamily.includes('Times') 
          ? 'serif' 
          : 'sans-serif',
        fontWeight: block.fontFamily.toLowerCase().includes('bold') ? 'bold' : 'normal',
        fontSize: `${block.fontSize}px`,
        lineHeight: '1.2',
        padding: '1px 2px',
      }}
    >
      
      {/* FLOATING INLINE TOOLBAR */}
      {isSelected && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center bg-slate-950 text-white rounded-lg shadow-xl px-2.5 py-1 gap-1.5 z-50 text-[10px] block-controller border border-white/10 shrink-0 whitespace-nowrap select-none">
          
          {/* Font Dropdown */}
          <select
            value={block.fontFamily}
            onChange={(e) => onUpdateBlock(block.id, { fontFamily: e.target.value })}
            className="bg-transparent border-0 text-[10px] font-bold outline-none text-white cursor-pointer pr-1"
          >
            <option value="Helvetica" className="text-black">Sans Regular</option>
            <option value="Helvetica-Bold" className="text-black">Sans Bold</option>
            <option value="Times-Roman" className="text-black">Serif Regular</option>
            <option value="Times-Bold" className="text-black">Serif Bold</option>
            <option value="Courier" className="text-black">Mono Regular</option>
            <option value="Courier-Bold" className="text-black">Mono Bold</option>
          </select>

          <div className="h-3 w-[1px] bg-white/20" />
          
          {/* Size Controller */}
          <button
            onClick={() => onUpdateBlock(block.id, { fontSize: Math.max(8, block.fontSize - 1) })}
            className="p-1 hover:bg-white/10 rounded font-bold cursor-pointer"
            title="Decrease text font size"
          >
            A-
          </button>
          <span className="font-mono font-bold">{block.fontSize}px</span>
          <button
            onClick={() => onUpdateBlock(block.id, { fontSize: Math.min(64, block.fontSize + 1) })}
            className="p-1 hover:bg-white/10 rounded font-bold cursor-pointer"
            title="Increase text font size"
          >
            A+
          </button>

          <div className="h-3 w-[1px] bg-white/20" />

          {/* Color Dots */}
          <div className="flex gap-1 items-center">
            {['#000000', '#B91C1C', '#1D4ED8', '#FFFFFF'].map((hex) => (
              <button
                key={hex}
                onClick={() => onUpdateBlock(block.id, { color: hex })}
                className={`w-3.5 h-3.5 rounded-full border border-white/30 transition-transform hover:scale-110 ${
                  block.color === hex ? 'ring-2 ring-rose-500 scale-105' : ''
                }`}
                style={{ backgroundColor: hex }}
              />
            ))}
          </div>

          <div className="h-3 w-[1px] bg-white/20" />

          {/* Background Whiteout toggle */}
          <button
            onClick={() => onUpdateBlock(block.id, { whiteout: !block.whiteout })}
            className={`px-2 py-0.5 rounded text-[9px] font-bold ${
              block.whiteout ? 'bg-rose-600 text-white' : 'hover:bg-white/10 text-slate-300'
            }`}
            title="Fills block background white to overwrite and hide original text"
          >
            Cover bg
          </button>

          <div className="h-3 w-[1px] bg-white/20" />

          {/* Duplicate */}
          <button
            onClick={() => onDuplicateBlock(block)}
            className="p-1 hover:bg-white/10 rounded text-slate-300 hover:text-white cursor-pointer"
            title="Duplicate block"
          >
            <Copy className="w-3 h-3" />
          </button>

          {/* Delete */}
          <button
            onClick={() => onRemoveBlock(block.id)}
            className="p-1 hover:bg-red-500 text-red-300 hover:text-white rounded transition-colors cursor-pointer"
            title="Delete text block"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Live editable Input/Textarea */}
      <textarea
        value={block.text}
        onChange={(e) => onUpdateBlock(block.id, { text: e.target.value })}
        onFocus={() => onSelectBlock(block.id)}
        className="bg-transparent border-0 outline-none focus:ring-0 p-0 m-0 resize-none overflow-hidden text-left w-full h-full block min-w-[20px]"
        style={{
          fontSize: `${block.fontSize}px`,
          fontFamily: block.fontFamily.includes('Courier') 
            ? 'monospace' 
            : block.fontFamily.includes('Times') 
            ? 'serif' 
            : 'sans-serif',
          fontWeight: block.fontFamily.toLowerCase().includes('bold') ? 'bold' : 'normal',
          color: (isUnmodified && !isSelected) ? 'transparent' : block.color,
          lineHeight: '1.2',
        }}
        rows={Math.max(1, block.text.split('\n').length)}
        placeholder="Type in-place override..."
      />

      {/* Outside Delete helper */}
      {!isSelected && (
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => onRemoveBlock(block.id)}
          className="absolute -top-2.5 -right-2.5 bg-rose-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 hover:scale-115 shadow-sm transition-all cursor-pointer z-15"
          title="Remove segment"
        >
          <Trash2 className="w-2.5 h-2.5" />
        </button>
      )}
    </div>
  );
});
