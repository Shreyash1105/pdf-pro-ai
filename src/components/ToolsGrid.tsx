import { useState } from 'react';
import { 
  Combine, 
  Scissors, 
  ArrowDownToLine, 
  RotateCw, 
  FileText, 
  Presentation, 
  FileSpreadsheet, 
  Image as ImageIcon, 
  Type, 
  Code,
  FileUp,
  FileCheck,
  Briefcase,
  Eye,
  Hash,
  Bookmark,
  Trash2,
  ExternalLink,
  Layers,
  Camera,
  Wrench,
  FileSearch,
  FileArchive,
  Globe,
  Crop,
  PenTool,
  FormInput,
  Unlock,
  Lock,
  FileSignature,
  EyeOff,
  Scale,
  Sparkles,
  Languages,
  Search,
  ChevronRight,
  Compass,
  ListFilter,
  ArrowRight,
  MessageSquare,
  LayoutGrid,
  Paintbrush,
  Files,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';
import { ToolType, ToolDefinition } from '../types';

interface ToolsGridProps {
  onSelectTool: (toolId: ToolType) => void;
  activeToolId?: ToolType;
}

export const TOOLS: ToolDefinition[] = [
  // Organize PDF
  {
    id: 'merge',
    title: 'Merge PDF',
    description: 'Combine multiple PDF files into one single document easily.',
    category: 'organize',
    iconName: 'Combine',
    colorClass: 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/10',
    allowedInputTypes: ['.pdf'],
    outputType: '.pdf'
  },
  {
    id: 'split',
    title: 'Split PDF',
    description: 'Extract specific page ranges or split a PDF into separate files.',
    category: 'organize',
    iconName: 'Scissors',
    colorClass: 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/10',
    allowedInputTypes: ['.pdf'],
    outputType: '.pdf'
  },
  {
    id: 'remove-pages',
    title: 'Remove Pages',
    description: 'Delete unwanted or blank pages from your PDF file seamlessly.',
    category: 'organize',
    iconName: 'Trash2',
    colorClass: 'bg-red-500 hover:bg-red-600 shadow-red-500/10',
    allowedInputTypes: ['.pdf'],
    outputType: '.pdf'
  },
  {
    id: 'extract-pages',
    title: 'Extract Pages',
    description: 'Extract individual pages or ranges from your PDF into a separate file.',
    category: 'organize',
    iconName: 'ExternalLink',
    colorClass: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/10',
    allowedInputTypes: ['.pdf'],
    outputType: '.pdf'
  },
  {
    id: 'organize-pages',
    title: 'Organize PDF',
    description: 'Reorder, rotate, or re-arrange pages in your PDF document.',
    category: 'organize',
    iconName: 'Layers',
    colorClass: 'bg-violet-500 hover:bg-violet-600 shadow-violet-500/10',
    allowedInputTypes: ['.pdf'],
    outputType: '.pdf'
  },
  {
    id: 'scan-to-pdf',
    title: 'Scan to PDF',
    description: 'Convert raw image scans or camera pictures into clean, searchable PDFs.',
    category: 'organize',
    iconName: 'Camera',
    colorClass: 'bg-teal-500 hover:bg-teal-600 shadow-teal-500/10',
    allowedInputTypes: ['.jpg', '.jpeg', '.png'],
    outputType: '.pdf'
  },

  // Optimize PDF
  {
    id: 'compress',
    title: 'Compress PDF',
    description: 'Reduce file size while preserving ultimate document quality.',
    category: 'optimize',
    iconName: 'ArrowDownToLine',
    colorClass: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/10',
    allowedInputTypes: ['.pdf'],
    outputType: '.pdf'
  },
  {
    id: 'repair-pdf',
    title: 'Repair PDF',
    description: 'Fix corrupt, broken, or unreadable PDF files and recover data.',
    category: 'optimize',
    iconName: 'Wrench',
    colorClass: 'bg-slate-600 hover:bg-slate-700 shadow-slate-600/10',
    allowedInputTypes: ['.pdf'],
    outputType: '.pdf'
  },
  {
    id: 'ocr-pdf',
    title: 'OCR PDF',
    description: 'Convert scanned PDF or images into highly-accurate, searchable text.',
    category: 'optimize',
    iconName: 'FileSearch',
    colorClass: 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/10',
    allowedInputTypes: ['.pdf', '.jpg', '.jpeg', '.png'],
    outputType: '.pdf'
  },

  // Convert TO PDF
  {
    id: 'image-to-pdf',
    title: 'JPG to PDF',
    description: 'Convert JPG, JPEG, and PNG images into beautiful PDFs.',
    category: 'convert-to',
    iconName: 'Image',
    colorClass: 'bg-fuchsia-500 hover:bg-fuchsia-600 shadow-fuchsia-500/10',
    allowedInputTypes: ['.jpg', '.jpeg', '.png'],
    outputType: '.pdf'
  },
  {
    id: 'word-to-pdf',
    title: 'WORD to PDF',
    description: 'Convert DOCX files into beautiful, standardized PDF documents.',
    category: 'convert-to',
    iconName: 'FileUp',
    colorClass: 'bg-sky-500 hover:bg-sky-600 shadow-sky-500/10',
    allowedInputTypes: ['.docx', '.doc'],
    outputType: '.pdf'
  },
  {
    id: 'ppt-to-pdf',
    title: 'POWERPOINT to PDF',
    description: 'Convert presentation slides into compact print-ready PDF pages.',
    category: 'convert-to',
    iconName: 'Briefcase',
    colorClass: 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/10',
    allowedInputTypes: ['.pptx', '.ppt'],
    outputType: '.pdf'
  },
  {
    id: 'excel-to-pdf',
    title: 'EXCEL to PDF',
    description: 'Convert XLS/XLSX workbooks into formatted PDF tables.',
    category: 'convert-to',
    iconName: 'FileCheck',
    colorClass: 'bg-green-500 hover:bg-green-600 shadow-green-500/10',
    allowedInputTypes: ['.xlsx', '.xls'],
    outputType: '.pdf'
  },
  {
    id: 'html-to-pdf',
    title: 'HTML to PDF',
    description: 'Convert web pages or local HTML files into offline PDF files.',
    category: 'convert-to',
    iconName: 'Globe',
    colorClass: 'bg-cyan-500 hover:bg-cyan-600 shadow-cyan-500/10',
    allowedInputTypes: ['.html'],
    outputType: '.pdf'
  },

  // Convert FROM PDF
  {
    id: 'pdf-to-image',
    title: 'PDF to JPG',
    description: 'Extract embedded images or render PDF pages as high-quality JPGs.',
    category: 'convert-from',
    iconName: 'Image',
    colorClass: 'bg-teal-500 hover:bg-teal-600 shadow-teal-500/10',
    allowedInputTypes: ['.pdf'],
    outputType: '.jpg'
  },
  {
    id: 'pdf-to-word',
    title: 'PDF to WORD',
    description: 'Convert PDF to Word document with formatting preservation.',
    category: 'convert-from',
    iconName: 'FileText',
    colorClass: 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/10',
    allowedInputTypes: ['.pdf'],
    outputType: '.docx'
  },
  {
    id: 'pdf-to-ppt',
    title: 'PDF to POWERPOINT',
    description: 'Convert PDF pages directly into high-fidelity PowerPoint slides exactly as they look.',
    category: 'convert-from',
    iconName: 'Presentation',
    colorClass: 'bg-red-500 hover:bg-red-600 shadow-red-500/10',
    allowedInputTypes: ['.pdf'],
    outputType: '.pptx'
  },
  {
    id: 'pdf-to-excel',
    title: 'PDF to EXCEL',
    description: 'Extract tables and invoices from PDF straight to Excel sheets.',
    category: 'convert-from',
    iconName: 'FileSpreadsheet',
    colorClass: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/10',
    allowedInputTypes: ['.pdf'],
    outputType: '.xlsx'
  },
  {
    id: 'pdf-to-pdfa',
    title: 'PDF to PDF/A',
    description: 'Convert PDF files into standardized long-term archiving formats (PDF/A).',
    category: 'convert-from',
    iconName: 'FileArchive',
    colorClass: 'bg-slate-700 hover:bg-slate-800 shadow-slate-700/10',
    allowedInputTypes: ['.pdf'],
    outputType: '.pdf'
  },
  {
    id: 'pdf-to-text',
    title: 'PDF to Text',
    description: 'Extract plain, unformatted text lines from any PDF document.',
    category: 'convert-from',
    iconName: 'Type',
    colorClass: 'bg-cyan-500 hover:bg-cyan-600 shadow-cyan-500/10',
    allowedInputTypes: ['.pdf'],
    outputType: '.txt'
  },
  {
    id: 'pdf-to-html',
    title: 'PDF to HTML',
    description: 'Convert PDF content into structured web page template layouts.',
    category: 'convert-from',
    iconName: 'Code',
    colorClass: 'bg-purple-700 hover:bg-purple-800 shadow-purple-700/10',
    allowedInputTypes: ['.pdf'],
    outputType: '.html'
  },

  // Edit PDF
  {
    id: 'rotate',
    title: 'Rotate PDF',
    description: 'Rotate and turn your PDF pages 90, 180, or 270 degrees clockwise.',
    category: 'edit-pdf',
    iconName: 'RotateCw',
    colorClass: 'bg-violet-500 hover:bg-violet-600 shadow-violet-500/10',
    allowedInputTypes: ['.pdf'],
    outputType: '.pdf'
  },
  {
    id: 'page-numbers',
    title: 'Add page numbers',
    description: 'Automatically stamp page numbers to document headers or footers with precision styling.',
    category: 'edit-pdf',
    iconName: 'Hash',
    colorClass: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/15',
    allowedInputTypes: ['.pdf'],
    outputType: '.pdf'
  },
  {
    id: 'watermark',
    title: 'Add watermark',
    description: 'Add adjustable, high-security text watermarks to any PDF document.',
    category: 'edit-pdf',
    iconName: 'Bookmark',
    colorClass: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/15',
    allowedInputTypes: ['.pdf'],
    outputType: '.pdf'
  },
  {
    id: 'crop-pdf',
    title: 'Crop PDF',
    description: 'Crop and trim pages of your PDF document to specific aspect ratios or margins.',
    category: 'edit-pdf',
    iconName: 'Crop',
    colorClass: 'bg-orange-600 hover:bg-orange-700 shadow-orange-600/15',
    allowedInputTypes: ['.pdf'],
    outputType: '.pdf'
  },
  {
    id: 'edit-pdf',
    title: 'Edit PDF',
    description: 'Annotate, append custom text overlays, or draw objects directly onto PDF pages.',
    category: 'edit-pdf',
    iconName: 'PenTool',
    colorClass: 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/15',
    allowedInputTypes: ['.pdf'],
    outputType: '.pdf'
  },
  {
    id: 'pdf-forms',
    title: 'PDF Forms',
    description: 'Fill dynamic interactive form fields or flatten PDF forms securely.',
    category: 'edit-pdf',
    iconName: 'FormInput',
    colorClass: 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/15',
    allowedInputTypes: ['.pdf'],
    outputType: '.pdf'
  },

  // PDF Security
  {
    id: 'unlock-pdf',
    title: 'Unlock PDF',
    description: 'Remove password, security restrictions, and encryption protections from your PDF.',
    category: 'security',
    iconName: 'Unlock',
    colorClass: 'bg-green-600 hover:bg-green-700 shadow-green-600/15',
    allowedInputTypes: ['.pdf'],
    outputType: '.pdf'
  },
  {
    id: 'protect-pdf',
    title: 'Protect PDF',
    description: 'Encrypt your PDF with standard passwords to restrict access and editing.',
    category: 'security',
    iconName: 'Lock',
    colorClass: 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/15',
    allowedInputTypes: ['.pdf'],
    outputType: '.pdf'
  },
  {
    id: 'sign-pdf',
    title: 'Sign PDF',
    description: 'Stamp your secure signature or draw signature lines onto pages of your PDF.',
    category: 'security',
    iconName: 'FileSignature',
    colorClass: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/15',
    allowedInputTypes: ['.pdf'],
    outputType: '.pdf'
  },
  {
    id: 'redact-pdf',
    title: 'Redact PDF',
    description: 'Permanently blackout or redact confidential text and sensitive details from PDFs.',
    category: 'security',
    iconName: 'EyeOff',
    colorClass: 'bg-red-700 hover:bg-red-850 shadow-red-700/15',
    allowedInputTypes: ['.pdf'],
    outputType: '.pdf'
  },
  {
    id: 'compare-pdf',
    title: 'Compare PDF',
    description: 'Compare two different PDF versions to detect and show text or layout changes.',
    category: 'security',
    iconName: 'Scale',
    colorClass: 'bg-slate-700 hover:bg-slate-800 shadow-slate-700/15',
    allowedInputTypes: ['.pdf'],
    outputType: '.txt'
  },

  // PDF Intelligence
  {
    id: 'ai-summarize',
    title: 'AI Summarizer',
    description: 'Instantly summarize lengthy PDFs, books, or articles into key bullet points using Gemini.',
    category: 'intelligence',
    iconName: 'Sparkles',
    colorClass: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/15',
    allowedInputTypes: ['.pdf'],
    outputType: '.docx'
  },
  {
    id: 'ai-translate',
    title: 'Translate PDF',
    description: 'Automatically translate extracted PDF text into any target language using Gemini.',
    category: 'intelligence',
    iconName: 'Languages',
    colorClass: 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/15',
    allowedInputTypes: ['.pdf'],
    outputType: '.docx'
  },
  {
    id: 'ai-chat',
    title: 'AI Document Chat',
    description: 'Have an interactive, layout-aware conversation with your PDF document in real-time.',
    category: 'intelligence',
    iconName: 'MessageSquare',
    colorClass: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/15',
    allowedInputTypes: ['.pdf'],
    outputType: '.txt'
  },
  {
    id: 'ai-study',
    title: 'AI Study & Quiz Partner',
    description: 'Instantly generate interactive quizzes, study guide concepts, and active-recall flashcards from any PDF.',
    category: 'intelligence',
    iconName: 'GraduationCap',
    colorClass: 'bg-gradient-to-tr from-amber-500 via-red-500 to-rose-600 hover:from-amber-600 hover:via-red-600 hover:to-rose-700 shadow-rose-500/15',
    allowedInputTypes: ['.pdf'],
    outputType: '.txt'
  },
  {
    id: 'ai-contract',
    title: 'Contract Risk & Action Summarizer',
    description: 'Instantly extract core obligations, payment terms, key deadlines, and liability risk clauses from legal agreements.',
    category: 'intelligence',
    iconName: 'Briefcase',
    colorClass: 'bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-700 shadow-emerald-500/15',
    allowedInputTypes: ['.pdf'],
    outputType: '.txt'
  },
  {
    id: 'visual-organizer',
    title: 'Visual PDF Organizer',
    description: 'Preview, rotate, delete, or drag-and-drop pages on an interactive visual grid.',
    category: 'organize',
    iconName: 'LayoutGrid',
    colorClass: 'bg-pink-600 hover:bg-pink-700 shadow-pink-600/15',
    allowedInputTypes: ['.pdf'],
    outputType: '.pdf'
  },
  {
    id: 'visual-editor',
    title: 'Visual PDF Annotator',
    description: 'Draw, highlight, write comments, or stamp custom drawn signatures onto PDF pages.',
    category: 'edit-pdf',
    iconName: 'Paintbrush',
    colorClass: 'bg-fuchsia-600 hover:bg-fuchsia-700 shadow-fuchsia-600/15',
    allowedInputTypes: ['.pdf'],
    outputType: '.pdf'
  },
  {
    id: 'batch-mode',
    title: 'Batch Tool Queue',
    description: 'Upload dozens of documents, apply conversions in bulk, and download as a ZIP archive.',
    category: 'optimize',
    iconName: 'Files',
    colorClass: 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/15',
    allowedInputTypes: ['.pdf', '.jpg', '.jpeg', '.png'],
    outputType: '.zip'
  },
  {
    id: 'security-audit',
    title: 'Security & Metadata Auditor',
    description: 'Scan PDF security flags, inspect restrictions, and scrub or edit PDF metadata fields.',
    category: 'security',
    iconName: 'ShieldCheck',
    colorClass: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/15',
    allowedInputTypes: ['.pdf'],
    outputType: '.pdf'
  }
];

export const IconMapper: Record<string, any> = {
  Combine,
  Scissors,
  ArrowDownToLine,
  RotateCw,
  FileText,
  Presentation,
  FileSpreadsheet,
  Image: ImageIcon,
  Type,
  Code,
  FileUp,
  FileCheck,
  Briefcase,
  Eye,
  Hash,
  Bookmark,
  Trash2,
  ExternalLink,
  Layers,
  Camera,
  Wrench,
  FileSearch,
  FileArchive,
  Globe,
  Crop,
  PenTool,
  FormInput,
  Unlock,
  Lock,
  FileSignature,
  EyeOff,
  Scale,
  Sparkles,
  Languages,
  MessageSquare,
  LayoutGrid,
  Paintbrush,
  Files,
  ShieldCheck,
  GraduationCap
};

export default function ToolsGrid({ onSelectTool, activeToolId }: ToolsGridProps) {
  const getCategories = () => {
    return [
      { id: 'organize', title: 'Organize PDF', types: ['organize'] },
      { id: 'optimize', title: 'Optimize PDF', types: ['optimize'] },
      { id: 'convert-to', title: 'Convert To PDF', types: ['convert-to'] },
      { id: 'convert-from', title: 'Convert From PDF', types: ['convert-from'] },
      { id: 'edit-pdf', title: 'Edit PDF', types: ['edit-pdf'] },
      { id: 'security', title: 'PDF Security', types: ['security'] },
      { id: 'intelligence', title: 'PDF Intelligence', types: ['intelligence'] }
    ];
  };

  const getHoverBorderClass = (category: string) => {
    switch (category) {
      case 'organize':
        return 'hover:border-rose-500/40 dark:hover:border-rose-500/30 hover:shadow-lg hover:shadow-rose-500/5';
      case 'optimize':
        return 'hover:border-amber-500/40 dark:hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/5';
      case 'convert-to':
        return 'hover:border-emerald-500/40 dark:hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5';
      case 'convert-from':
        return 'hover:border-blue-500/40 dark:hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5';
      case 'edit-pdf':
        return 'hover:border-violet-500/40 dark:hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5';
      case 'security':
        return 'hover:border-indigo-500/40 dark:hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5';
      case 'intelligence':
        return 'hover:border-fuchsia-500/40 dark:hover:border-fuchsia-500/30 hover:shadow-lg hover:shadow-fuchsia-500/5';
      default:
        return 'hover:border-slate-200 dark:hover:border-slate-700';
    }
  };

  return (
    <div className="space-y-12">
      {/* RENDER CATEGORIES AS STANDARD GRID */}
      {getCategories().map(cat => {
        const filteredTools = TOOLS.filter(t => cat.types.includes(t.category));
        
        return (
          <div key={cat.id} className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1 font-mono">
              {cat.title}
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredTools.map(tool => {
                const IconComponent = IconMapper[tool.iconName] || FileText;
                const isActive = activeToolId === tool.id;
                const hoverClass = getHoverBorderClass(tool.category);

                return (
                  <div
                    key={tool.id}
                    onClick={() => onSelectTool(tool.id)}
                    className={`group relative p-5 bg-white dark:bg-[#161920] rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between hover:translate-y-[-2px] ${
                      isActive 
                        ? 'border-red-500 ring-2 ring-red-500/10 shadow-lg' 
                        : `border-slate-100 dark:border-white/5 ${hoverClass}`
                    }`}
                  >
                    <div>
                      {/* Icon container */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white mb-4 shadow-sm ${tool.colorClass}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>

                      {/* Tool titles */}
                      <h4 className="font-display font-bold text-slate-800 dark:text-slate-100 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors text-base">
                        {tool.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                        {tool.description}
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-5 pt-3 border-t border-slate-50 dark:border-white/5 text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                      <span>{tool.allowedInputTypes.join('/')}</span>
                      <span className="text-slate-500 font-semibold text-right">→ {tool.outputType}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
