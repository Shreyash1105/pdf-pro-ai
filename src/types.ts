export type ToolType =
  | 'merge'
  | 'split'
  | 'rotate'
  | 'remove-pages'
  | 'extract-pages'
  | 'organize-pages'
  | 'scan-to-pdf'
  | 'compress'
  | 'repair-pdf'
  | 'ocr-pdf'
  | 'pdf-to-word'
  | 'pdf-to-ppt'
  | 'pdf-to-excel'
  | 'pdf-to-image'
  | 'pdf-to-pdfa'
  | 'word-to-pdf'
  | 'ppt-to-pdf'
  | 'excel-to-pdf'
  | 'image-to-pdf'
  | 'html-to-pdf'
  | 'pdf-to-text'
  | 'pdf-to-html'
  | 'watermark'
  | 'page-numbers'
  | 'crop-pdf'
  | 'edit-pdf'
  | 'pdf-forms'
  | 'unlock-pdf'
  | 'protect-pdf'
  | 'sign-pdf'
  | 'redact-pdf'
  | 'compare-pdf'
  | 'ai-summarize'
  | 'ai-translate'
  | 'ai-chat'
  | 'ai-study'
  | 'ai-contract'
  | 'visual-organizer'
  | 'visual-editor'
  | 'batch-mode'
  | 'security-audit';

export interface ToolDefinition {
  id: ToolType;
  title: string;
  description: string;
  category: 'organize' | 'optimize' | 'convert-to' | 'convert-from' | 'edit-pdf' | 'security' | 'intelligence';
  iconName: string;
  colorClass: string;
  allowedInputTypes: string[]; // e.g. ['.pdf'], ['.docx', '.doc'], etc.
  outputType: string; // e.g. '.pdf', '.docx', '.zip', etc.
}

export interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
  progress: number;
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'failed';
  error?: string;
  resultUrl?: string;
  resultName?: string;
  resultSize?: number;
  aiAnalysis?: {
    documentType: string;
    reasoning: string;
    compressLevel: string;
    originalSize: number;
    targetSizeRatio: number;
  };
}

export interface ProcessingOptions {
  rotateAngle?: 90 | 180 | 270;
  splitRange?: string; // e.g., "1-3, 5"
  compressLevel?: 'low' | 'medium' | 'high';
  autoOptimize?: boolean; // uses AI backend to automatically detect best compression settings
  aiEnhanced?: boolean; // toggle for Gemini-powered layout parsing
  ocrFormat?: 'txt' | 'docx'; // output format for OCR scanner
  enableOcr?: boolean; // toggle for OCR mode in PDF-to-Text
  ocrEngine?: 'gemini' | 'standard'; // standard or AI-powered OCR
  watermarkText?: string;
  watermarkColor?: 'red' | 'slate' | 'blue' | 'emerald' | 'amber';
  watermarkSize?: number;
  watermarkOpacity?: number;
  watermarkAngle?: number;
  numberPosition?: 'bottom-center' | 'bottom-right' | 'top-right';
  numberFormat?: 'page-x-of-y' | 'page-x' | 'x';
  numberSize?: number;
  numberColor?: 'slate' | 'red' | 'blue' | 'emerald';
  // New tool options
  pagesToRemove?: string;
  pagesToExtract?: string;
  pageOrder?: string;
  cropMargin?: 'low' | 'medium' | 'high';
  editText?: string;
  editX?: number;
  editY?: number;
  formFields?: string;
  pdfPassword?: string;
  signatureText?: string;
  redactPhrases?: string;
  targetLanguage?: string;
}

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  fileName?: string;
  downloadUrl?: string;
}

export interface ConversionRecord {
  id: string;
  userId: string;
  toolId: string;
  toolTitle: string;
  originalName: string;
  resultName: string;
  resultUrl: string;
  resultSize: number;
  timestamp: number; // UTC timestamp of conversion
}

export function normalizeDownloadUrl(url?: string): string {
  if (!url) return '#';
  
  // If the URL is an absolute localhost URL, convert it to a relative path
  // so the browser resolves it relative to the correct current hosting domain.
  if (
    url.startsWith('http://localhost:') || 
    url.startsWith('https://localhost:') || 
    url.includes('localhost:3000') || 
    url.includes('localhost:8080')
  ) {
    const index = url.indexOf('/processed/');
    if (index !== -1) {
      return url.substring(index);
    }
  }
  return url;
}

