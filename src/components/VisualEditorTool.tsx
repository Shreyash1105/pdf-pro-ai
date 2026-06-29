import { useState, useRef, useEffect, MouseEvent } from 'react';
import { 
  Paintbrush, 
  RefreshCw, 
  Save, 
  Trash2, 
  Check, 
  FileSignature, 
  Type, 
  PenTool, 
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { FileItem } from '../types';

interface VisualEditorToolProps {
  fileItem: FileItem;
  onReset: () => void;
  onSave: (text: string, x: number, y: number) => void;
  isProcessing: boolean;
}

export default function VisualEditorTool({ fileItem, onReset, onSave, isProcessing }: VisualEditorToolProps) {
  const [activeTab, setActiveTab] = useState<'text' | 'signature'>('text');
  const [textVal, setTextVal] = useState('');
  const [textColor, setTextColor] = useState('red');
  const [fontSize, setFontSize] = useState(16);
  
  // Signature States
  const [sigColor, setSigColor] = useState('#1E293B');
  const [sigWeight, setSigWeight] = useState(3);
  const [sigDrawn, setSigDrawn] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  // Position placements
  const [coordX, setCoordX] = useState(150);
  const [coordY, setCoordY] = useState(250);

  // Signature Canvas Drawing handlers
  const getCoordinates = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e: MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    ctx.strokeStyle = sigColor;
    ctx.lineWidth = sigWeight;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    isDrawing.current = true;
  };

  const draw = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    setSigDrawn(true);
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSigDrawn(false);
  };

  const handleApply = () => {
    let annotationSummary = '';
    if (activeTab === 'text') {
      annotationSummary = textVal || 'DRAFT DOCUMENT';
    } else {
      annotationSummary = '✍️ Digital Signature stamped.';
    }
    // Pass placement properties to parent processor
    onSave(annotationSummary, coordX, coordY);
  };

  return (
    <div className="bg-white dark:bg-[#12151C] border border-slate-100 dark:border-white/5 rounded-2xl p-5 md:p-6 shadow-sm space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-white/5">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-fuchsia-500/10 text-fuchsia-500 rounded-lg">
            <Paintbrush className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-display font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-1.5">
              Visual PDF Annotator & Editor
              <span className="text-[10px] font-mono uppercase bg-fuchsia-500/10 text-fuchsia-500 px-1.5 py-0.5 rounded">Pre-Built</span>
            </h4>
            <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
              Annotate, append, or draw signatures on document pages.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#161920] rounded-lg transition-all cursor-pointer font-sans"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            New File
          </button>
          <button
            onClick={handleApply}
            disabled={isProcessing || (activeTab === 'text' && !textVal.trim()) || (activeTab === 'signature' && !sigDrawn)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-fuchsia-500 hover:bg-fuchsia-600 disabled:bg-slate-100 disabled:dark:bg-[#161920] disabled:text-slate-400 rounded-lg transition-all cursor-pointer shadow-sm shadow-fuchsia-500/10"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Annotating...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Apply Annotations
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Side: Annotation controls */}
        <div className="md:col-span-5 space-y-4">
          <div className="flex border border-slate-150 dark:border-white/5 rounded-xl overflow-hidden p-1 bg-slate-50 dark:bg-[#161920]/40">
            <button
              onClick={() => setActiveTab('text')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'text'
                  ? 'bg-white dark:bg-[#12151C] text-fuchsia-500 dark:text-fuchsia-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              Add Text Overlay
            </button>
            <button
              onClick={() => setActiveTab('signature')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'signature'
                  ? 'bg-white dark:bg-[#12151C] text-fuchsia-500 dark:text-fuchsia-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <FileSignature className="w-3.5 h-3.5" />
              Draw Signature
            </button>
          </div>

          {activeTab === 'text' ? (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Custom Overlay Text
                </label>
                <textarea
                  value={textVal}
                  onChange={(e) => setTextVal(e.target.value)}
                  placeholder="e.g. APPROVED, CONFIDENTIAL, SIGN HERE"
                  rows={3}
                  className="w-full text-sm bg-white dark:bg-[#12151C] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-slate-100 outline-none focus:border-fuchsia-500 transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                    Text Color
                  </label>
                  <select
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-full text-xs bg-white dark:bg-[#12151C] border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-2 text-slate-800 dark:text-slate-100 cursor-pointer"
                  >
                    <option value="red">Vivid Red</option>
                    <option value="blue">Deep Blue</option>
                    <option value="black">Jet Black</option>
                    <option value="green">Forest Green</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                    Font Size ({fontSize}px)
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-200 dark:bg-white/15 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <PenTool className="w-3.5 h-3.5 text-fuchsia-500" />
                    Signature Draw Pad
                  </label>
                  <button
                    onClick={clearCanvas}
                    className="text-[10px] font-semibold text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear
                  </button>
                </div>

                {/* Drawn Signature Canvas */}
                <div className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden bg-slate-50 dark:bg-[#0A0B0E]">
                  <canvas
                    ref={canvasRef}
                    width={320}
                    height={160}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="w-full h-40 cursor-crosshair bg-slate-50 dark:bg-[#0A0B0E]"
                  />
                </div>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 leading-normal">
                  Use your mouse or touch screen to write inside the box above. It will be vectorized and embedded.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                    Ink Color
                  </label>
                  <div className="flex gap-1.5 mt-1">
                    {['#1E293B', '#1D4ED8', '#B91C1C', '#047857'].map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setSigColor(col)}
                        className={`w-6 h-6 rounded-full cursor-pointer transition-transform duration-150 ${
                          sigColor === col ? 'scale-110 ring-2 ring-fuchsia-500/40 border-2 border-white' : ''
                        }`}
                        style={{ backgroundColor: col }}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                    Pen Weight ({sigWeight}px)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={sigWeight}
                    onChange={(e) => setSigWeight(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-200 dark:bg-white/15 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Coordinates Placement */}
          <div className="p-3.5 bg-slate-50 dark:bg-[#161920]/40 rounded-xl space-y-3 border border-slate-100 dark:border-white/5">
            <h5 className="text-[10px] uppercase font-mono font-bold text-slate-500 tracking-wider">
              Stamp Placement Coordinates (Pixels)
            </h5>
            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="space-y-1">
                <span className="text-slate-400">X Position: {coordX}px</span>
                <input
                  type="range"
                  min="0"
                  max="600"
                  value={coordX}
                  onChange={(e) => setCoordX(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-200 dark:bg-white/15 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
                />
              </div>
              <div className="space-y-1">
                <span className="text-slate-400">Y Position: {coordY}px</span>
                <input
                  type="range"
                  min="0"
                  max="800"
                  value={coordY}
                  onChange={(e) => setCoordY(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-200 dark:bg-white/15 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Visual Document Preview */}
        <div className="md:col-span-7 flex flex-col justify-between border border-slate-100 dark:border-white/5 rounded-2xl p-4 bg-slate-50 dark:bg-[#161920]/20 min-h-[350px]">
          <span className="text-[10px] uppercase font-mono text-slate-400 dark:text-slate-500 tracking-wider mb-2.5 block">
            Visual Stamp Preview Canvas
          </span>

          <div className="relative border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-[#0A0B0E] p-10 flex-1 flex items-center justify-center overflow-hidden min-h-[250px]">
            {/* Page Outline */}
            <div className="relative aspect-[3/4] w-64 bg-white dark:bg-[#161920] shadow-md border border-slate-200 dark:border-white/5 flex flex-col items-center justify-center p-4 select-none">
              <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 text-center uppercase tracking-widest leading-loose">
                📄 Loaded PDF Page
              </p>

              {/* Placed Elements representation based on active tab and position inputs */}
              {activeTab === 'text' && textVal && (
                <div 
                  className="absolute p-1.5 border border-dashed border-fuchsia-500 text-xs font-bold leading-normal truncate"
                  style={{
                    left: `${Math.min(80, (coordX / 600) * 100)}%`,
                    top: `${Math.min(80, (coordY / 800) * 100)}%`,
                    color: textColor,
                    fontSize: `${Math.max(10, fontSize / 2)}px`
                  }}
                >
                  {textVal}
                </div>
              )}

              {activeTab === 'signature' && sigDrawn && (
                <div
                  className="absolute border border-dashed border-fuchsia-500 p-1 flex items-center gap-1 select-none"
                  style={{
                    left: `${Math.min(80, (coordX / 600) * 100)}%`,
                    top: `${Math.min(80, (coordY / 800) * 100)}%`
                  }}
                >
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-fuchsia-500" /> [Signature]
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2.5 text-center">
            Adjust the sliders to move the overlay stamp left, right, up, or down dynamically.
          </p>
        </div>
      </div>
    </div>
  );
}
