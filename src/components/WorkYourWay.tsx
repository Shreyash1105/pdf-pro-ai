import React, { useState, useRef, useEffect } from 'react';
import { 
  motion, 
  AnimatePresence 
} from 'motion/react';
import { 
  Monitor, 
  Smartphone, 
  Download, 
  Wifi, 
  WifiOff, 
  FileText, 
  Settings, 
  History, 
  Grid, 
  Trash2, 
  PenTool, 
  Type, 
  Highlighter, 
  CheckSquare, 
  Save, 
  Plus, 
  ArrowUpRight, 
  Check,
  RotateCcw,
  BookOpen,
  MousePointer,
  Sparkles,
  Search,
  ChevronRight,
  UserCheck
} from 'lucide-react';

interface WorkYourWayProps {
  darkMode?: boolean;
}

export default function WorkYourWay({ darkMode = false }: WorkYourWayProps) {
  // Simulator states
  const [activeSimulator, setActiveSimulator] = useState<'desktop' | 'mobile' | null>(null);

  // --- DESKTOP STATE ---
  const [offlineMode, setOfflineMode] = useState(true);
  const [desktopDocText, setDesktopDocText] = useState(
    "Exclusivity Agreement\n\nThis agreement is made between the parties to ensure mutual exclusivity regarding product development, digital conversion pipelines, and workflow integration.\n\nAll documents processed through the offline node are secured locally without cloud transmission."
  );
  const [highlightColor, setHighlightColor] = useState<'amber' | 'green' | 'blue' | 'none'>('amber');
  const [highlightedText, setHighlightedText] = useState('agreement');
  const [desktopTab, setDesktopTab] = useState<'editor' | 'history' | 'settings'>('editor');
  const [desktopHistory, setDesktopHistory] = useState<string[]>([
    "exclusivity_agreement_v2.pdf",
    "partnership_proposal_draft.pdf",
    "non_disclosure_signed.pdf"
  ]);
  const [searchQuery, setSearchQuery] = useState("");

  // --- MOBILE STATE ---
  const [mobileAnnotator, setMobileAnnotator] = useState<'text' | 'draw' | 'stamp'>('text');
  const [mobileText, setMobileText] = useState("Modern architecture");
  const [mobileTextColor, setMobileTextColor] = useState("#000000");
  const [mobileTextX, setMobileTextX] = useState(30);
  const [mobileTextY, setMobileTextY] = useState(80);
  const [stamps, setStamps] = useState<{ id: string; type: string; x: number; y: number }[]>([
    { id: '1', type: 'APPROVED', x: 45, y: 15 }
  ]);
  const [strokes, setStrokes] = useState<{ x: number; y: number }[][]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const mobileCanvasRef = useRef<HTMLCanvasElement>(null);

  // Drawing Logic on Mobile Simulator Canvas
  useEffect(() => {
    if (activeSimulator === 'mobile' && mobileCanvasRef.current) {
      const canvas = mobileCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Render simple placeholder PDF page mockup
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw structural document guides
        ctx.fillStyle = "#f8fafc"; // background shading for section
        ctx.fillRect(10, 10, canvas.width - 20, 45);

        // Draw an "Image Placeholder" grid box (matching the Modern architecture image in mockup)
        ctx.fillStyle = "#E2E8F0";
        ctx.fillRect(canvas.width / 2 + 10, 65, canvas.width / 2 - 20, canvas.height - 85);
        ctx.strokeStyle = "#CBD5E1";
        ctx.strokeRect(canvas.width / 2 + 10, 65, canvas.width / 2 - 20, canvas.height - 85);
        
        // Draw miniature building lines in the image placeholder
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 + 20, canvas.height - 20);
        ctx.lineTo(canvas.width / 2 + 20, 100);
        ctx.lineTo(canvas.width - 30, 75);
        ctx.lineTo(canvas.width - 30, canvas.height - 20);
        ctx.fillStyle = "#94A3B8";
        ctx.fill();

        // Draw document lines
        ctx.fillStyle = "#94A3B8";
        ctx.fillRect(15, 20, 100, 4);
        ctx.fillRect(15, 28, 60, 4);
        ctx.fillRect(15, 36, 80, 4);

        // Mock multi-paragraph guidelines
        ctx.fillStyle = "#CBD5E1";
        ctx.fillRect(15, 120, 80, 3);
        ctx.fillRect(15, 128, 90, 3);
        ctx.fillRect(15, 136, 70, 3);
        ctx.fillRect(15, 144, 85, 3);

        // Draw current user custom strokes (draw tool)
        ctx.strokeStyle = "#EF4444";
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        
        strokes.forEach(stroke => {
          if (stroke.length < 2) return;
          ctx.beginPath();
          ctx.moveTo(stroke[0].x, stroke[0].y);
          for (let i = 1; i < stroke.length; i++) {
            ctx.lineTo(stroke[i].x, stroke[i].y);
          }
          ctx.stroke();
        });
      }
    }
  }, [strokes, activeSimulator, stamps]);

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mobileAnnotator !== 'draw' || !mobileCanvasRef.current) return;
    const rect = mobileCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setIsDrawing(true);
    setStrokes(prev => [...prev, [{ x, y }]]);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || mobileAnnotator !== 'draw' || !mobileCanvasRef.current) return;
    const rect = mobileCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setStrokes(prev => {
      const next = [...prev];
      if (next.length > 0) {
        next[next.length - 1] = [...next[next.length - 1], { x, y }];
      }
      return next;
    });
  };

  const handleCanvasMouseUp = () => {
    setIsDrawing(false);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!mobileCanvasRef.current) return;
    const rect = mobileCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (mobileAnnotator === 'stamp') {
      // Add custom approval/audit stamp where clicked
      const newStamp = {
        id: Date.now().toString(),
        type: 'APPROVED',
        x: (x / mobileCanvasRef.current.width) * 100,
        y: (y / mobileCanvasRef.current.height) * 100
      };
      setStamps(prev => [...prev, newStamp]);
    } else if (mobileAnnotator === 'text') {
      // Update text location to where clicked
      setMobileTextX((x / mobileCanvasRef.current.width) * 100);
      setMobileTextY((y / mobileCanvasRef.current.height) * 100);
    }
  };

  // Helper trigger downloads in simulated editor
  const handleExportDesktopPDF = () => {
    const header = offlineMode ? "SECURE OFFLINE COMPILATION - NO DATA SENT TO SERVER\n" : "STANDARD ONLINE BUILD\n";
    const blob = new Blob([header + "======================================\n\n" + desktopDocText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "exclusivity_agreement_offline.txt";
    link.click();
    URL.revokeObjectURL(url);
    
    // Add to simulated local history log
    setDesktopHistory(prev => ["exclusivity_agreement_offline.pdf", ...prev]);
  };

  return (
    <div id="work-your-way-section" className="space-y-12 py-16 border-t border-slate-100 dark:border-white/5 mt-16 text-center">
      {/* SECTION HEADER */}
      <div className="max-w-xl mx-auto space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 text-red-600 dark:text-red-400 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border border-red-500/20">
          <BookOpen className="w-3.5 h-3.5" /> Omnipresent Infrastructure
        </span>
        <h2 className="font-display font-black text-4xl sm:text-5xl text-slate-900 dark:text-white tracking-tight leading-tight">
          Work your way
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Switch seamlessly between standalone offline desktops and real-time mobile compilers. Select a layout below to test drive the live browser integrations.
        </p>
      </div>

      {/* DUAL MODE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        
        {/* CARD 1: DESKTOP CARD */}
        <motion.div 
          onClick={() => setActiveSimulator(activeSimulator === 'desktop' ? null : 'desktop')}
          whileHover={{ y: -6, scale: 1.01 }}
          className={`group flex flex-col justify-between rounded-3xl overflow-hidden shadow-lg border text-left cursor-pointer transition-all bg-white dark:bg-[#12151C] ${
            activeSimulator === 'desktop' 
              ? 'ring-2 ring-red-500/55 border-red-500' 
              : 'border-slate-100 dark:border-white/5'
          }`}
        >
          {/* Header Visual mock (Faded Peach/Pink color matching the screenshot exactly) */}
          <div className="h-64 bg-[#FFEFEA] dark:bg-[#251A18] p-6 relative flex items-end overflow-hidden">
            {/* Ambient glows inside mock top bar */}
            <div className="absolute top-4 left-6 flex gap-1.5 z-10">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            </div>

            {/* Simulated Desktop window matching screenshot */}
            <div className="w-full bg-white dark:bg-[#10121A] rounded-t-xl shadow-xl border border-slate-200/60 dark:border-white/10 h-48 mt-auto flex translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              {/* Sidebar list layout */}
              <div className="w-20 sm:w-28 border-r border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-[#12141D] p-2 space-y-1">
                <div className="h-3 w-8 bg-slate-200 dark:bg-white/10 rounded-sm mb-3 ml-1" />
                <div className="flex items-center gap-1.5 px-1.5 py-1 bg-red-500/10 rounded-md text-red-500">
                  <Monitor className="w-3 h-3" />
                  <span className="text-[8px] font-bold font-mono uppercase">Tools</span>
                </div>
                <div className="flex items-center gap-1.5 px-1.5 py-1 text-slate-400">
                  <History className="w-3 h-3" />
                  <span className="text-[8px] font-mono">History</span>
                </div>
                <div className="flex items-center gap-1.5 px-1.5 py-1 text-slate-400">
                  <Settings className="w-3 h-3" />
                  <span className="text-[8px] font-mono">Settings</span>
                </div>
              </div>

              {/* Main Workspace mockup */}
              <div className="flex-1 p-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="h-3 w-16 bg-slate-200 dark:bg-white/10 rounded-sm" />
                    <div className="h-3.5 px-1.5 bg-red-500/10 text-red-500 text-[8px] rounded flex items-center gap-1">
                      <WifiOff className="w-2.5 h-2.5" /> Offline Sandbox
                    </div>
                  </div>
                  
                  {/* Styled Exclusivity Agreement mockup text */}
                  <div className="border border-slate-100 dark:border-white/5 rounded p-2 bg-slate-50/50 dark:bg-white/[0.02]">
                    <span className="text-[10px] font-serif font-bold text-slate-700 dark:text-slate-300">Exclusivity agree</span>
                    <span className="inline-block bg-[#FDE68A] dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 text-[10px] px-1 rounded font-serif font-bold animate-pulse">
                      ment
                    </span>
                    <div className="h-1 w-full bg-slate-200 dark:bg-white/10 rounded-sm mt-2" />
                    <div className="h-1 w-4/5 bg-slate-200 dark:bg-white/10 rounded-sm mt-1" />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-white/5">
                  <div className="h-3 w-12 bg-slate-200 dark:bg-white/10 rounded-sm" />
                  <div className="h-4 w-4 bg-slate-900 dark:bg-white rounded-full flex items-center justify-center">
                    <ArrowUpRight className="w-2.5 h-2.5 text-white dark:text-slate-900" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card Label & Description */}
          <div className="p-6 md:p-8 space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-2">
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white group-hover:text-red-500 transition-colors">
                Work offline with Desktop
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Batch edit and manage documents locally, with no internet and no limits. Run operations in zero-knowledge space with high security.
              </p>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5 text-xs font-mono font-bold uppercase tracking-wider text-slate-400 group-hover:text-red-500 transition-colors">
              <span>{activeSimulator === 'desktop' ? 'Active Simulator' : 'Click to Launch Desktop Simulator'}</span>
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </div>
          </div>
        </motion.div>

        {/* CARD 2: MOBILE CARD */}
        <motion.div 
          onClick={() => setActiveSimulator(activeSimulator === 'mobile' ? null : 'mobile')}
          whileHover={{ y: -6, scale: 1.01 }}
          className={`group flex flex-col justify-between rounded-3xl overflow-hidden shadow-lg border text-left cursor-pointer transition-all bg-white dark:bg-[#12151C] ${
            activeSimulator === 'mobile' 
              ? 'ring-2 ring-indigo-500/55 border-indigo-500' 
              : 'border-slate-100 dark:border-white/5'
          }`}
        >
          {/* Header Visual mock (Faded Peach/Pink color matching the screenshot exactly) */}
          <div className="h-64 bg-[#FFEFEA] dark:bg-[#251A18] p-6 relative flex justify-center items-end overflow-hidden">
            
            {/* Phone Simulator Frame */}
            <div className="w-48 bg-slate-900 dark:bg-[#181A20] rounded-t-3xl border-4 border-b-0 border-slate-800 dark:border-white/10 shadow-2xl h-48 flex flex-col overflow-hidden translate-y-2 group-hover:translate-y-0 transition-transform duration-300 relative">
              
              {/* Ear speaker / notch */}
              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-16 h-3 bg-slate-800 rounded-full z-20 flex justify-center items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
              </div>

              {/* Status bar */}
              <div className="h-6 bg-white dark:bg-[#1E202A] px-3 pt-1.5 flex justify-between items-center text-[7px] text-slate-400 select-none">
                <span>9:41</span>
                <div className="flex items-center gap-1">
                  <span>📶</span>
                  <span>🔋</span>
                </div>
              </div>

              {/* Mobile Content (Mock Page matching the layout block in screenshot) */}
              <div className="flex-1 bg-slate-50 dark:bg-[#101217] p-2 relative flex flex-col justify-between">
                
                {/* Floating controls on the right (screenshot layout) */}
                <div className="absolute right-2 top-6 bg-white dark:bg-[#1E202A] border border-slate-100 dark:border-white/10 p-1 rounded-lg shadow-md flex flex-col gap-1.5 z-10">
                  <div className="w-3.5 h-3.5 bg-indigo-500 text-white flex items-center justify-center text-[7px] rounded-md font-bold">A</div>
                  <div className="w-3.5 h-3.5 text-slate-400 text-[8px] flex items-center justify-center">✒️</div>
                  <div className="w-3.5 h-3.5 text-slate-400 text-[8px] flex items-center justify-center">🎯</div>
                </div>

                {/* Page body */}
                <div className="bg-white dark:bg-[#181A22] border border-slate-200/50 dark:border-white/5 rounded-lg flex-1 p-2 flex flex-col justify-between relative overflow-hidden">
                  
                  {/* Headline item */}
                  <div className="space-y-1">
                    <span className="block text-[8px] font-bold font-serif text-slate-800 dark:text-slate-300">Modern</span>
                    <span className="block text-[8px] font-bold font-serif text-slate-800 dark:text-slate-300 -mt-1">architecture</span>
                  </div>

                  {/* Lines block */}
                  <div className="space-y-1 my-2 opacity-60">
                    <div className="h-1 w-12 bg-slate-200 dark:bg-white/10 rounded" />
                    <div className="h-1 w-8 bg-slate-200 dark:bg-white/10 rounded" />
                  </div>

                  {/* Vertical placeholder building */}
                  <div className="absolute right-8 bottom-2 w-10 h-20 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded p-1 flex items-end">
                    <div className="w-full h-1/2 bg-indigo-500/20 rounded" />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Card Label & Description */}
          <div className="p-6 md:p-8 space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-2">
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">
                On-the-go with Mobile
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Your favorite tools, right in your pocket. Keep working on your projects anytime, anywhere. Experience lightning speed layout adjustment.
              </p>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5 text-xs font-mono font-bold uppercase tracking-wider text-slate-400 group-hover:text-indigo-500 transition-colors">
              <span>{activeSimulator === 'mobile' ? 'Active Simulator' : 'Click to Launch Mobile Simulator'}</span>
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </div>
          </div>
        </motion.div>

      </div>

      {/* EXPANDABLE INTERACTIVE PANEL */}
      <AnimatePresence mode="wait">
        {activeSimulator && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full max-w-5xl mx-auto overflow-hidden bg-slate-50 dark:bg-[#10131B] rounded-3xl border border-slate-200/60 dark:border-white/5"
          >
            <div className="p-6 md:p-8 space-y-6">
              
              {/* TOP HEADER CONTROLS OF SIMULATOR PANEL */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200/60 dark:border-white/10">
                <div className="text-left">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-red-500 font-bold bg-red-500/10 px-2.5 py-1 rounded">
                    {activeSimulator === 'desktop' ? 'DESKTOP APP INSTANCE' : 'MOBILE SIMULATION SANDBOX'}
                  </span>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mt-1">
                    {activeSimulator === 'desktop' ? 'Exclusivity Agreement Compiler (Offline Node)' : 'Annotation & Stamp Mobile Editor'}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  {activeSimulator === 'desktop' ? (
                    <button 
                      onClick={() => setOfflineMode(!offlineMode)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                        offlineMode 
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' 
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      {offlineMode ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
                      {offlineMode ? 'OFFLINE (ZERO CLOUD TRAFFIC)' : 'ONLINE STREAMING'}
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        setStrokes([]);
                        setStamps([{ id: '1', type: 'APPROVED', x: 45, y: 15 }]);
                        setMobileText("Modern architecture");
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-white/10 bg-white dark:bg-[#12141D] text-slate-600 dark:text-slate-300"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Reset Board
                    </button>
                  )}
                  <button 
                    onClick={() => setActiveSimulator(null)}
                    className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                  >
                    Close Simulator
                  </button>
                </div>
              </div>

              {/* SIMULATOR RENDERS */}
              {activeSimulator === 'desktop' ? (
                /* --- DESKTOP RENDER VIEW --- */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  
                  {/* Desktop App Simulated Sidebar */}
                  <div className="lg:col-span-3 bg-white dark:bg-[#12151D] rounded-2xl p-4 border border-slate-200/50 dark:border-white/5 space-y-4 flex flex-col justify-between text-left">
                    <div className="space-y-4">
                      {/* Search box */}
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                        <input 
                          type="text" 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search offline files..."
                          className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-[#0E1017] border border-slate-200 dark:border-white/10 rounded-lg text-xs outline-none focus:border-red-500 text-slate-800 dark:text-white"
                        />
                      </div>

                      {/* Side navigation buttons */}
                      <nav className="space-y-1">
                        <button 
                          onClick={() => setDesktopTab('editor')}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold font-mono uppercase transition-all cursor-pointer ${
                            desktopTab === 'editor' 
                              ? 'bg-red-500 text-white' 
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                          }`}
                        >
                          <span className="flex items-center gap-2"><FileText className="w-3.5 h-3.5" /> Document Editor</span>
                          <span className="px-1.5 py-0.2 text-[8px] bg-white/20 rounded">v1.0</span>
                        </button>
                        <button 
                          onClick={() => setDesktopTab('history')}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold font-mono uppercase transition-all cursor-pointer ${
                            desktopTab === 'history' 
                              ? 'bg-red-500 text-white' 
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                          }`}
                        >
                          <History className="w-3.5 h-3.5" /> Saved Offline Docs ({desktopHistory.length})
                        </button>
                        <button 
                          onClick={() => setDesktopTab('settings')}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold font-mono uppercase transition-all cursor-pointer ${
                            desktopTab === 'settings' 
                              ? 'bg-red-500 text-white' 
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                          }`}
                        >
                          <Settings className="w-3.5 h-3.5" /> Local Node Config
                        </button>
                      </nav>
                    </div>

                    {/* Quick highlight toggler */}
                    <div className="pt-4 border-t border-slate-100 dark:border-white/10 space-y-2">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Highlight Key Term</label>
                      <div className="grid grid-cols-4 gap-1">
                        <button 
                          onClick={() => setHighlightColor('amber')}
                          className={`h-6 rounded border transition-all flex items-center justify-center text-[10px] font-bold ${
                            highlightColor === 'amber' ? 'bg-[#FEF3C7] text-amber-800 border-amber-500' : 'bg-amber-50 text-amber-700 border-transparent hover:border-amber-300'
                          }`}
                        >
                          Amber
                        </button>
                        <button 
                          onClick={() => setHighlightColor('green')}
                          className={`h-6 rounded border transition-all flex items-center justify-center text-[10px] font-bold ${
                            highlightColor === 'green' ? 'bg-[#D1FAE5] text-emerald-800 border-emerald-500' : 'bg-emerald-50 text-emerald-700 border-transparent hover:border-emerald-300'
                          }`}
                        >
                          Green
                        </button>
                        <button 
                          onClick={() => setHighlightColor('blue')}
                          className={`h-6 rounded border transition-all flex items-center justify-center text-[10px] font-bold ${
                            highlightColor === 'blue' ? 'bg-[#DBEAFE] text-blue-800 border-blue-500' : 'bg-blue-50 text-blue-700 border-transparent hover:border-blue-300'
                          }`}
                        >
                          Blue
                        </button>
                        <button 
                          onClick={() => setHighlightColor('none')}
                          className={`h-6 rounded border transition-all flex items-center justify-center text-[10px] font-bold ${
                            highlightColor === 'none' ? 'bg-slate-200 text-slate-700 border-slate-400' : 'bg-slate-50 text-slate-600 border-transparent hover:border-slate-300'
                          }`}
                        >
                          None
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Desktop App Main Content Area */}
                  <div className="lg:col-span-9 bg-white dark:bg-[#12151D] rounded-2xl border border-slate-200/50 dark:border-white/5 flex flex-col justify-between overflow-hidden relative">
                    
                    <AnimatePresence mode="wait">
                      {desktopTab === 'editor' && (
                        <motion.div 
                          key="editor"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="p-6 space-y-4 text-left flex-grow flex flex-col"
                        >
                          {/* Live interactive rich text mockup */}
                          <div className="flex items-center justify-between bg-slate-50 dark:bg-[#0E1017] p-2 rounded-xl border border-slate-100 dark:border-white/5">
                            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse" /> Live Word Checker & Compiler Ready
                            </span>
                            <div className="flex gap-2">
                              <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-white/5 text-[9px] font-mono text-slate-500">UTF-8</span>
                              <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-white/5 text-[9px] font-mono text-slate-500">{desktopDocText.split(" ").length} words</span>
                            </div>
                          </div>

                          <div className="space-y-1.5 flex-grow">
                            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Document Content</label>
                            <textarea 
                              value={desktopDocText}
                              onChange={(e) => setDesktopDocText(e.target.value)}
                              rows={6}
                              className="w-full bg-slate-50 dark:bg-[#0E1017] border border-slate-200 dark:border-white/10 rounded-xl p-4 text-sm font-serif leading-relaxed text-slate-800 dark:text-slate-200 focus:outline-none focus:border-red-500/80"
                            />
                          </div>

                          {/* Interactive live rendering previews of edited content */}
                          <div className="bg-[#FFFDF9] dark:bg-[#161412] rounded-xl border border-amber-100 dark:border-amber-950/20 p-4 space-y-2">
                            <h4 className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Live Parsed Layout preview (Editable highlighter)</h4>
                            <p className="text-sm font-serif leading-relaxed text-slate-700 dark:text-slate-300">
                              {/* Splitting text to demonstrate highlight overlay */}
                              {desktopDocText.split("\n")[0].includes("Agreement") ? (
                                <>
                                  <span className="font-bold text-lg text-slate-900 dark:text-white block mb-2">
                                    {desktopDocText.split("\n")[0].replace("Agreement", "")} 
                                    <span className={`px-1.5 py-0.5 rounded font-bold ${
                                      highlightColor === 'amber' ? 'bg-[#FDE68A] text-amber-900' :
                                      highlightColor === 'green' ? 'bg-[#A7F3D0] text-emerald-900' :
                                      highlightColor === 'blue' ? 'bg-[#BFDBFE] text-blue-900' : 'bg-transparent text-slate-900 dark:text-white'
                                    }`}>
                                      agreement
                                    </span>
                                  </span>
                                  {desktopDocText.split("\n").slice(1).join("\n")}
                                </>
                              ) : (
                                desktopDocText
                              )}
                            </p>
                          </div>
                        </motion.div>
                      )}

                      {desktopTab === 'history' && (
                        <motion.div 
                          key="history"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="p-6 space-y-4 text-left flex-grow"
                        >
                          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Offline document file system</h4>
                          <div className="space-y-2.5">
                            {desktopHistory.map((file, idx) => (
                              <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                                <div className="flex items-center gap-2.5">
                                  <FileText className="w-5 h-5 text-red-500" />
                                  <div>
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{file}</span>
                                    <span className="block text-[10px] text-slate-400 font-mono">15.4 KB • Modified 1 min ago • LOCAL STORE</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">READY</span>
                                  <button 
                                    onClick={() => setDesktopHistory(prev => prev.filter((_, i) => i !== idx))}
                                    className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {desktopTab === 'settings' && (
                        <motion.div 
                          key="settings"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="p-6 space-y-4 text-left flex-grow"
                        >
                          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Isolated Node Node settings</h4>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01]">
                              <div>
                                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">Zero-knowledge local purging</h5>
                                <p className="text-[10px] text-slate-400">Purge files from memory cache continuously after 1 hour.</p>
                              </div>
                              <input type="checkbox" defaultChecked className="accent-red-500" />
                            </div>
                            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01]">
                              <div>
                                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">Secure Web Assembly pipeline</h5>
                                <p className="text-[10px] text-slate-400">Run compilation in browser sandboxes using WebAssembly modules.</p>
                              </div>
                              <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 text-[9px] font-mono font-bold border border-indigo-500/20">ACTIVE</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Desktop Toolbar footer */}
                    <div className="h-14 bg-slate-50 dark:bg-[#0E1017] border-t border-slate-200/50 dark:border-white/5 px-6 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-red-500" /> Auto-sync with local node database
                      </span>
                      <button 
                        onClick={handleExportDesktopPDF}
                        className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-mono font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-red-500/15"
                      >
                        <Download className="w-3.5 h-3.5" /> EXPORT PDF (LOCAL DOWNLOAD)
                      </button>
                    </div>

                  </div>

                </div>
              ) : (
                /* --- MOBILE RENDER VIEW --- */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  
                  {/* Left Side: Mobile annotation controllers */}
                  <div className="lg:col-span-4 bg-white dark:bg-[#12151D] rounded-2xl p-4 border border-slate-200/50 dark:border-white/5 space-y-5 text-left flex flex-col justify-between">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Mobile Layout tools</h4>
                        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">Select a tool and click on the preview page screen to write text, stamps or doodles directly.</p>
                      </div>

                      {/* Tool selector buttons */}
                      <div className="space-y-1.5">
                        <button 
                          onClick={() => setMobileAnnotator('text')}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            mobileAnnotator === 'text' 
                              ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/15' 
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent hover:border-slate-100 dark:hover:border-white/5'
                          }`}
                        >
                          <Type className="w-4 h-4" />
                          <div className="text-left">
                            <span>Overlay Text tool</span>
                            <span className="block text-[9px] font-normal opacity-70">Place &quot;Modern architecture&quot; text blocks</span>
                          </div>
                        </button>

                        <button 
                          onClick={() => setMobileAnnotator('draw')}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            mobileAnnotator === 'draw' 
                              ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/15' 
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent hover:border-slate-100 dark:hover:border-white/5'
                          }`}
                        >
                          <PenTool className="w-4 h-4" />
                          <div className="text-left">
                            <span>Freehand signing brush</span>
                            <span className="block text-[9px] font-normal opacity-70">Click & drag mouse directly on canvas</span>
                          </div>
                        </button>

                        <button 
                          onClick={() => setMobileAnnotator('stamp')}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            mobileAnnotator === 'stamp' 
                              ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/15' 
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent hover:border-slate-100 dark:hover:border-white/5'
                          }`}
                        >
                          <CheckSquare className="w-4 h-4" />
                          <div className="text-left">
                            <span>Instant APPROVED Stamp</span>
                            <span className="block text-[9px] font-normal opacity-70">Tap document to stamp co-sign audit</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Text field update box */}
                    {mobileAnnotator === 'text' && (
                      <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-white/5">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Custom Text content</label>
                        <input 
                          type="text" 
                          value={mobileText}
                          onChange={(e) => setMobileText(e.target.value)}
                          placeholder="e.g. Modern Architecture"
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0E1017] border border-slate-200 dark:border-white/10 rounded-lg text-xs outline-none focus:border-indigo-500 text-slate-800 dark:text-white"
                        />
                        <div className="flex gap-1">
                          {["#000000", "#10B981", "#3B82F6", "#EF4444"].map((col) => (
                            <button 
                              key={col}
                              onClick={() => setMobileTextColor(col)}
                              className={`w-5 h-5 rounded-full border ${mobileTextColor === col ? 'border-indigo-500 scale-110' : 'border-transparent'}`}
                              style={{ backgroundColor: col }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Side: Smartphone frame simulation */}
                  <div className="lg:col-span-8 flex justify-center items-center py-4 bg-white dark:bg-[#12151D] rounded-2xl border border-slate-200/50 dark:border-white/5 relative overflow-hidden">
                    
                    {/* Glowing background decor */}
                    <div className="absolute -top-16 -right-16 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl" />

                    {/* Smartphone container */}
                    <div className="w-64 bg-slate-900 dark:bg-[#181A22] rounded-[36px] border-[6px] border-slate-800 dark:border-white/10 shadow-2xl flex flex-col overflow-hidden relative">
                      
                      {/* Notch ear speaker */}
                      <div className="absolute top-1 left-1/2 -translate-x-1/2 w-20 h-3.5 bg-slate-800 rounded-full z-20 flex items-center justify-center">
                        <div className="w-2 h-1.5 rounded-full bg-slate-900" />
                      </div>

                      {/* Simulated status bar */}
                      <div className="h-6 bg-white dark:bg-[#1C1E26] px-4 pt-1 flex justify-between items-center text-[8px] text-slate-400 select-none z-10">
                        <span>9:41</span>
                        <div className="flex items-center gap-1.5">
                          <span>📶</span>
                          <span>🔋</span>
                        </div>
                      </div>

                      {/* Smartphone screen with canvas page markup drawing */}
                      <div className="relative aspect-[9/16] w-full bg-slate-100 p-3 flex flex-col justify-between overflow-hidden">
                        
                        {/* Canvas drawing layer */}
                        <canvas 
                          ref={mobileCanvasRef}
                          width={232}
                          height={310}
                          onMouseDown={handleCanvasMouseDown}
                          onMouseMove={handleCanvasMouseMove}
                          onMouseUp={handleCanvasMouseUp}
                          onMouseLeave={handleCanvasMouseUp}
                          onClick={handleCanvasClick}
                          className={`absolute inset-0 z-0 ${mobileAnnotator === 'draw' ? 'cursor-crosshair' : 'cursor-pointer'}`}
                        />

                        {/* Interactive dynamic overlays on top of canvas */}
                        {/* Mobile Text tool overlay */}
                        <div className="relative z-10 pointer-events-none h-full w-full">
                          
                          {/* Live overlay text block */}
                          <motion.div 
                            style={{ 
                              left: `${mobileTextX}%`, 
                              top: `${mobileTextY}%`,
                              color: mobileTextColor
                            }}
                            animate={mobileAnnotator === 'text' ? { scale: [1, 1.04, 1] } : {}}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 select-none"
                          >
                            <span className="px-1.5 py-0.5 rounded text-[11px] font-serif font-black tracking-wide bg-amber-500/10 backdrop-blur-[1px] border border-amber-500/20">
                              {mobileText}
                            </span>
                          </motion.div>

                          {/* Live stamps overlay */}
                          {stamps.map((stamp) => (
                            <div 
                              key={stamp.id}
                              style={{ left: `${stamp.x}%`, top: `${stamp.y}%` }}
                              className="absolute transform -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-[7px] font-mono font-bold px-1.5 py-0.5 rounded border border-red-400 shadow-md select-none flex items-center gap-0.5 rotate-[-12deg]"
                            >
                              <Check className="w-2.5 h-2.5" /> {stamp.type}
                            </div>
                          ))}
                        </div>

                        {/* Mobile action bar overlay (bottom inside screen) */}
                        <div className="relative z-10 h-7 w-full bg-white/80 dark:bg-[#1E202A]/80 backdrop-blur-md border-t border-slate-100 dark:border-white/5 rounded-t-lg px-2 flex justify-between items-center text-[7px] font-mono font-bold text-slate-500 select-none">
                          <span className="flex items-center gap-1 text-indigo-500"><Sparkles className="w-2.5 h-2.5" /> Dynamic sync</span>
                          <span className="text-[6px] bg-indigo-500/10 px-1 py-0.2 rounded text-indigo-500">iOS 19.4</span>
                        </div>

                      </div>

                    </div>
                  </div>

                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
