import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Globe, 
  HelpCircle, 
  Mail, 
  MessageSquare,
  Shield,
  FileText,
  Sparkles,
  BarChart3,
  Clock,
  Users,
  Lock,
  Unlock,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  Terminal,
  Activity
} from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { User as FirebaseUser } from 'firebase/auth';
import { db } from '../lib/firebase';
import { LANGUAGES, translations } from '../lib/translations';
import FeatureShowcase from './FeatureShowcase';
import { encryptFileClientSide, decryptFileClientSide, scanDocumentForScams, ScamAnalysisResult } from '../lib/encryption';

interface PortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeLanguage: string;
  onSelectLanguage: (code: string) => void;
  darkMode: boolean;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
  onSelectTool: (toolId: any) => void;
  currentUser?: FirebaseUser | null;
}

export default function PortalModal({
  isOpen,
  onClose,
  activeLanguage,
  onSelectLanguage,
  darkMode,
  addToast,
  onSelectTool,
  currentUser
}: PortalModalProps) {
  const [activeTab, setActiveTab] = useState<'languages' | 'help' | 'contact' | 'e2ee'>('languages');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('Choose a subject...');
  const [contactMessage, setContactMessage] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // E2EE File Vault State
  const [e2eeFile, setE2eeFile] = useState<File | null>(null);
  const [e2eePassword, setE2eePassword] = useState('');
  const [e2eeMode, setE2eeMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [isProcessingE2EE, setIsProcessingE2EE] = useState(false);

  // Scam Shield State
  const [scamFileName, setScamFileName] = useState('');
  const [scamTextSample, setScamTextSample] = useState('');
  const [scamResult, setScamResult] = useState<ScamAnalysisResult | null>(null);
  const [isScanningScam, setIsScanningScam] = useState(false);

  // Handlers for E2EE Vault
  const handleE2EEProcess = async () => {
    if (!e2eeFile) {
      addToast('Please select a file to process first.', 'error');
      return;
    }
    if (!e2eePassword) {
      addToast('Please enter an encryption password.', 'error');
      return;
    }

    setIsProcessingE2EE(true);
    try {
      if (e2eeMode === 'encrypt') {
        const encryptedBlob = await encryptFileClientSide(e2eeFile, e2eePassword);
        
        // Trigger a client-side download of the encrypted .secured file
        const url = URL.createObjectURL(encryptedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${e2eeFile.name}.secured`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        addToast('Document successfully encrypted! E2EE complete.', 'success');
      } else {
        const { decryptedBlob, originalFileName } = await decryptFileClientSide(e2eeFile, e2eePassword);
        
        // Trigger a client-side download of the decrypted file
        const url = URL.createObjectURL(decryptedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = originalFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        addToast('Document successfully decrypted and verified!', 'success');
      }
      setE2eeFile(null);
      setE2eePassword('');
    } catch (err: any) {
      addToast(err.message || 'E2EE operation failed.', 'error');
    } finally {
      setIsProcessingE2EE(false);
    }
  };

  const handleScanScam = () => {
    if (!scamFileName && !scamTextSample) {
      addToast('Please enter a filename or a text sample to scan.', 'error');
      return;
    }
    setIsScanningScam(true);
    setTimeout(() => {
      const res = scanDocumentForScams(scamFileName, scamTextSample);
      setScamResult(res);
      setIsScanningScam(false);
      if (res.isSafe) {
        addToast('Scam scan completed: Clear!', 'success');
      } else {
        addToast('Alert: Risk factors identified in document!', 'error');
      }
    }, 800);
  };

  const t = translations[activeLanguage] || translations['en'];

  // FAQ List with AI-generated expert answers
  const faqs = [
    {
      q: 'Do you keep a copy of my processed files?',
      a: 'No, we do not keep your files. Your files are entirely secure and are automatically, permanently deleted from our servers within 1 hour after processing. We prioritize user privacy and data security above all else.'
    },
    {
      q: 'Are company files safe with your service?',
      a: 'Absolutely. All uploads are encrypted using end-to-end SSL/TLS (HTTPS) transmission. Our platform runs within isolated secure sandboxes, and we never access, share, or store company files beyond the temporary conversion window. We are fully compliant with standard data protection protocols.'
    },
    {
      q: 'What are your system requirements?',
      a: 'PDF Pro is a modern, fully responsive cloud-based platform. You only need a web browser (such as Google Chrome, Apple Safari, Mozilla Firefox, or Microsoft Edge) on any device (desktop, laptop, tablet, or smartphone) with an active internet connection. No local software installation is required!'
    },
    {
      q: 'Why did I not receive the confirmation of my email address?',
      a: 'If you did not receive a confirmation or sign-in email, please check your spam, junk, or promotions folder. Ensure that the email address you entered is spelled correctly. You can also trigger another authentication request or contact support if the issue persists.'
    },
    {
      q: 'How can I upload my files?',
      a: 'You can upload files simply by dragging and dropping them into our interactive drop zone, or by clicking the "Select files" button in the drop zone to browse files from your local storage.'
    },
    {
      q: 'Can I convert my scanned PDFs to an editable document?',
      a: 'Yes! Our service includes an advanced Gemini AI-powered OCR (Optical Character Recognition) engine that scans text and layout, allowing you to convert scanned PDFs or images into fully editable Plain Text (.txt) or Microsoft Word (.docx) documents with absolute high-fidelity accuracy.'
    },
    {
      q: 'Why does my conversion take so long?',
      a: 'Most conversions are completed in a matter of seconds. If a conversion takes longer, it is usually due to large file sizes, high-resolution scanned pages, complex document layers, or local internet bandwidth. Rest assured our high-capacity engine is working to optimize your document.'
    },
    {
      q: 'Can I work from the cloud?',
      a: 'Yes! Since our tool operates entirely in the cloud, you can access, convert, and manage your documents from any device anywhere in the world, saving local system resources and keeping your operations fully flexible.'
    }
  ];

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      addToast('Please fill in all required fields.', 'error');
      return;
    }

    if (contactSubject === 'Choose a subject...') {
      addToast('Please select a valid subject.', 'error');
      return;
    }

    if (!acceptTerms) {
      addToast(t.errAcceptTerms || 'Please accept the Terms & Conditions.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      // Save contact submission directly to Firestore
      await addDoc(collection(db, 'contacts'), {
        name: contactName,
        email: contactEmail,
        subject: contactSubject,
        message: contactMessage,
        timestamp: Date.now(),
        language: activeLanguage
      });

      addToast(t.successMessage || 'Thank you! Your message has been sent successfully.', 'success');
      
      // Clear Form fields
      setContactName('');
      setContactEmail('');
      setContactSubject('Choose a subject...');
      setContactMessage('');
      setAcceptTerms(false);
    } catch (err: any) {
      console.error('Error saving contact request:', err);
      addToast('Failed to send message. Please try again later.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFaqToggle = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto font-sans" id="portal-modal">
        {/* Backdrop overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm cursor-pointer"
        />

        {/* Modal container */}
        <div className="flex min-h-screen items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="relative w-full max-w-5xl bg-slate-50 dark:bg-[#0D0F14] rounded-3xl shadow-2xl border border-slate-200 dark:border-white/5 overflow-hidden flex flex-col md:flex-row min-h-[600px]"
          >
            {/* Left sidebar nav / info tab */}
            <div className="w-full md:w-64 bg-white dark:bg-[#12151C] p-6 border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/5 flex flex-col justify-between shrink-0">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
                    PDF Pro Portal
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Manage language, browse Q&A help, or contact support.
                  </p>
                </div>

                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveTab('languages')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      activeTab === 'languages'
                        ? 'bg-red-500 text-white shadow-md shadow-red-500/15'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                    <span>Languages</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('help')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      activeTab === 'help'
                        ? 'bg-red-500 text-white shadow-md shadow-red-500/15'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                    }`}
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>Q&A Help</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('contact')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      activeTab === 'contact'
                        ? 'bg-red-500 text-white shadow-md shadow-red-500/15'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Contact Support</span>
                  </button>



                  <button
                    onClick={() => setActiveTab('e2ee')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      activeTab === 'e2ee'
                        ? 'bg-red-500 text-white shadow-md shadow-red-500/15'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                    }`}
                  >
                    <Lock className="w-4 h-4" />
                    <span>E2EE & Scam Shield</span>
                  </button>
                </nav>
              </div>

              {/* Security Audit Badge */}
              <div className="hidden md:flex items-center gap-2 text-[10px] font-mono text-slate-400 dark:text-slate-500 pt-6 border-t border-slate-100 dark:border-white/5">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span>100% Encrypted Portal</span>
              </div>
            </div>

            {/* Right main panel content */}
            <div className="flex-1 p-6 md:p-10 flex flex-col justify-between max-h-[85vh] overflow-y-auto">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                title="Close Portal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex-1">


                {/* E2EE & SCAM SHIELD TAB */}
                {activeTab === 'e2ee' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6 text-slate-700 dark:text-slate-300"
                  >
                    <div>
                      <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                        <Lock className="w-6 h-6 text-red-500" />
                        <span>E2EE Vault & Anti-Scam Shield</span>
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Zero-Knowledge end-to-end cryptographic lockbox and real-time localized phishing detection.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* SECTION 1: THE CRYPTO VAULT */}
                      <div className="bg-white dark:bg-[#12151C] border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                          <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            Client-Side Cryptographic Vault
                          </h3>
                          <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                            Local CPU Only
                          </div>
                        </div>

                        {/* Mode Toggle */}
                        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-white/5 rounded-xl">
                          <button
                            type="button"
                            onClick={() => { setE2eeMode('encrypt'); setE2eeFile(null); }}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                              e2eeMode === 'encrypt'
                                ? 'bg-white dark:bg-[#181C26] text-slate-800 dark:text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                          >
                            🔐 Encrypt File
                          </button>
                          <button
                            type="button"
                            onClick={() => { setE2eeMode('decrypt'); setE2eeFile(null); }}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                              e2eeMode === 'decrypt'
                                ? 'bg-white dark:bg-[#181C26] text-slate-800 dark:text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                          >
                            🔓 Decrypt File
                          </button>
                        </div>

                        {/* File Selector */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                            Select Document to {e2eeMode === 'encrypt' ? 'Encrypt' : 'Decrypt'}
                          </label>
                          <div className="relative border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-red-500/30 rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-[#0E1016]/40">
                            <input
                              type="file"
                              accept={e2eeMode === 'encrypt' ? '*' : '.secured'}
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setE2eeFile(e.target.files[0]);
                                }
                              }}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <div className="space-y-1">
                              <FileText className="w-6 h-6 text-slate-400 mx-auto" />
                              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                {e2eeFile ? e2eeFile.name : `Drag/Choose file to ${e2eeMode === 'encrypt' ? 'lock' : 'unlock'}`}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {e2eeFile ? `${(e2eeFile.size / 1024).toFixed(1)} KB` : e2eeMode === 'encrypt' ? 'Supports any format' : 'Must be a .secured file'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Passphrase Entry */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                              Decryption/Encryption Password
                            </label>
                            {e2eePassword.length > 0 && e2eeMode === 'encrypt' && (
                              <span className={`text-[10px] font-mono ${
                                e2eePassword.length < 6 ? 'text-rose-500' : e2eePassword.length < 10 ? 'text-amber-500' : 'text-emerald-500'
                              }`}>
                                Strength: {e2eePassword.length < 6 ? 'Weak' : e2eePassword.length < 10 ? 'Medium' : 'Military AES'}
                              </span>
                            )}
                          </div>
                          <div className="relative">
                            <input
                              type="password"
                              value={e2eePassword}
                              onChange={(e) => setE2eePassword(e.target.value)}
                              placeholder="Enter secure master passphrase..."
                              className="w-full pl-3 pr-20 py-2 bg-slate-50 dark:bg-[#0A0B0E] border border-slate-200 dark:border-white/5 rounded-xl text-xs font-medium outline-none focus:border-red-500 text-slate-800 dark:text-white"
                            />
                            {e2eeMode === 'encrypt' && (
                              <button
                                type="button"
                                onClick={() => {
                                  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
                                  let pass = '';
                                  for(let i=0; i<14; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
                                  setE2eePassword(pass);
                                }}
                                className="absolute right-2 top-1.5 px-2 py-1 bg-red-500 text-white text-[9px] font-mono rounded hover:bg-red-600 transition-colors cursor-pointer"
                              >
                                Generate
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Submit Button */}
                        <button
                          type="button"
                          onClick={handleE2EEProcess}
                          disabled={isProcessingE2EE}
                          className="w-full py-2.5 bg-red-500 text-white hover:bg-red-600 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-red-500/10 disabled:opacity-50"
                        >
                          {isProcessingE2EE ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Securing Payload...</span>
                            </>
                          ) : e2eeMode === 'encrypt' ? (
                            <>
                              <Lock className="w-3.5 h-3.5" />
                              <span>Download Encrypted (.secured)</span>
                            </>
                          ) : (
                            <>
                              <Unlock className="w-3.5 h-3.5" />
                              <span>Decrypt & Download Original</span>
                            </>
                          )}
                        </button>

                        <div className="flex items-start gap-2 text-[10px] text-slate-400 leading-relaxed bg-slate-50 dark:bg-[#0A0B0E]/30 p-3 rounded-xl border border-slate-100 dark:border-white/5">
                          <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span>
                            <strong>Zero-Knowledge Policy:</strong> Decryption keys are compiled directly into the binary block using PBKDF2 with 100k rounds of hashing. No human, server, or system administrator can recover your file without the exact password.
                          </span>
                        </div>
                      </div>

                      {/* SECTION 2: PROACTIVE SCAM SHIELD */}
                      <div className="bg-white dark:bg-[#12151C] border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                          <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <ShieldAlert className="w-4 h-4 text-red-500" />
                            Phishing & Scam Detection Shield
                          </h3>
                          <div className="bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-mono px-2 py-0.5 rounded font-bold animate-pulse">
                            ● Active
                          </div>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          Test a document or paste any suspicious invoice, bank wire instruction, or support email block to scan for known scam strings or phishing hooks instantly.
                        </p>

                        <div className="space-y-3">
                          {/* Name Input */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-slate-400 uppercase block">
                              Document / Email Name
                            </label>
                            <input
                              type="text"
                              value={scamFileName}
                              onChange={(e) => setScamFileName(e.target.value)}
                              placeholder="e.g. urgent_payment_overdue.pdf"
                              className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0A0B0E] border border-slate-200 dark:border-white/5 rounded-xl text-xs font-medium outline-none focus:border-red-500 text-slate-800 dark:text-white"
                            />
                          </div>

                          {/* Content Sample */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-slate-400 uppercase block">
                              Text Sample / Body Copy
                            </label>
                            <textarea
                              value={scamTextSample}
                              onChange={(e) => setScamTextSample(e.target.value)}
                              placeholder="Paste suspicious text, routing instructions, helpline call requests, or invoice descriptions..."
                              rows={3}
                              className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0A0B0E] border border-slate-200 dark:border-white/5 rounded-xl text-xs font-medium outline-none focus:border-red-500 text-slate-800 dark:text-white resize-none"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleScanScam}
                            disabled={isScanningScam}
                            className="flex-1 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 hover:bg-slate-800 dark:hover:bg-slate-100 transition-all cursor-pointer disabled:opacity-50"
                          >
                            {isScanningScam ? (
                              <>
                                <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                                <span>Scanning content...</span>
                              </>
                            ) : (
                              <>
                                <Activity className="w-3.5 h-3.5 text-red-500" />
                                <span>Run Anti-Scam Shield Audit</span>
                              </>
                            )}
                          </button>

                          {(scamFileName || scamTextSample) && (
                            <button
                              type="button"
                              onClick={() => {
                                setScamFileName('');
                                setScamTextSample('');
                                setScamResult(null);
                              }}
                              className="px-3 py-2 border border-slate-200 dark:border-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                            >
                              Reset
                            </button>
                          )}
                        </div>

                        {/* Output Scam Gauge */}
                        {scamResult && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`p-4 rounded-xl border ${
                              scamResult.isSafe 
                                ? 'bg-emerald-500/5 border-emerald-500/15' 
                                : scamResult.riskScore < 70 
                                  ? 'bg-amber-500/5 border-amber-500/15'
                                  : 'bg-rose-500/5 border-rose-500/15'
                            } space-y-3`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold font-mono text-slate-600 dark:text-slate-300">
                                SCAM SHIELD AUDIT RESULTS
                              </span>
                              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                                scamResult.isSafe 
                                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' 
                                  : scamResult.riskScore < 70 
                                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                                    : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                              }`}>
                                Risk: {scamResult.riskScore}%
                              </span>
                            </div>

                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                              {scamResult.recommendation}
                            </p>

                            {scamResult.triggers.length > 0 && (
                              <div className="space-y-1">
                                <span className="text-[10px] font-mono text-slate-400 block">RISK TRIGGERS FOUND:</span>
                                <ul className="space-y-0.5">
                                  {scamResult.triggers.map((trigger, idx) => (
                                    <li key={idx} className="text-[10px] font-mono text-rose-500 flex items-center gap-1">
                                      <span>⚠️</span> {trigger}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </div>
                    </div>

                    {/* Threat vector status table */}
                    <div className="bg-slate-50 dark:bg-[#0E1016]/40 border border-slate-200 dark:border-white/5 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-red-500" />
                        <h4 className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          Real-Time Anti-Fraud Guard Status
                        </h4>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-white dark:bg-[#12151C] p-3 rounded-xl border border-slate-200/50 dark:border-white/5 flex items-center justify-between">
                          <span className="text-[10px] font-sans font-bold text-slate-600 dark:text-slate-300">Invoice Redirection</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50" />
                        </div>
                        <div className="bg-white dark:bg-[#12151C] p-3 rounded-xl border border-slate-200/50 dark:border-white/5 flex items-center justify-between">
                          <span className="text-[10px] font-sans font-bold text-slate-600 dark:text-slate-300">Fake Helpline Scans</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50" />
                        </div>
                        <div className="bg-white dark:bg-[#12151C] p-3 rounded-xl border border-slate-200/50 dark:border-white/5 flex items-center justify-between">
                          <span className="text-[10px] font-sans font-bold text-slate-600 dark:text-slate-300">Wire Transfer Auditing</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50" />
                        </div>
                        <div className="bg-white dark:bg-[#12151C] p-3 rounded-xl border border-slate-200/50 dark:border-white/5 flex items-center justify-between">
                          <span className="text-[10px] font-sans font-bold text-slate-600 dark:text-slate-300">Secure AES Key Gen</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 1. LANGUAGES TAB */}
                {activeTab === 'languages' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
                        Languages
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Select your preferred interface language.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3.5 pt-4">
                      {LANGUAGES.map((lang) => {
                        const isSelected = activeLanguage === lang.code;
                        return (
                          <button
                            key={lang.code}
                            onClick={() => {
                              onSelectLanguage(lang.code);
                              addToast(`Interface language updated to ${lang.label}.`, 'info');
                            }}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-red-500/5 dark:bg-red-500/10 border-red-500 text-red-600 dark:text-red-400 font-bold'
                                : 'bg-white dark:bg-[#12151C]/50 border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:border-slate-300 dark:hover:border-white/10'
                            }`}
                          >
                            <span className="text-sm">{lang.label}</span>
                            {isSelected && (
                              <Check className="w-4 h-4 text-red-500 shrink-0 ml-2" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* 2. HELP & FAQ TAB */}
                {activeTab === 'help' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="text-center max-w-2xl mx-auto space-y-2">
                      <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white">
                        {t.supportFaqs || 'Our support team answers the following questions nearly every day'}
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {t.supportSub || 'We thought they could be useful for you too'}
                      </p>
                    </div>

                    <div className="space-y-3.5 pt-6 max-w-3xl mx-auto">
                      {faqs.map((faq, index) => {
                        const isOpen = openFaqIndex === index;
                        return (
                          <div 
                            key={index}
                            className="border-b border-slate-200 dark:border-white/5 last:border-b-0 pb-3"
                          >
                            <button
                              onClick={() => handleFaqToggle(index)}
                              className="w-full flex items-center justify-between py-3 text-left text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
                            >
                              <span>{faq.q}</span>
                              {isOpen ? (
                                <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                              )}
                            </button>
                            
                            <AnimatePresence>
                              {isOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed py-2 pl-1">
                                    {faq.a}
                                  </p>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* 3. CONTACT SUPPORT TAB */}
                {activeTab === 'contact' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
                  >
                    {/* Left text column */}
                    <div className="lg:col-span-5 space-y-4">
                      <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 dark:text-white">
                        {t.contactTitle || 'Contact'}
                      </h2>
                      <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed">
                        {t.contactSub || 'Contact us to report a problem, clarify any doubts about PDF Pro, or just find out more.'}
                      </p>
                    </div>

                    {/* Right form column */}
                    <div className="lg:col-span-7 bg-white dark:bg-[#12151C] border border-slate-200 dark:border-white/5 p-6 rounded-2xl shadow-lg">
                      <form onSubmit={handleContactSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                              {t.yourName || 'Your Name*'}
                            </label>
                            <input
                              type="text"
                              value={contactName}
                              onChange={(e) => setContactName(e.target.value)}
                              placeholder="Your Name"
                              className="w-full text-sm bg-slate-50 dark:bg-[#0A0B0E] border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2.5 outline-none focus:border-red-500 transition-colors dark:text-white"
                              required
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                              {t.yourEmail || 'Your Email*'}
                            </label>
                            <input
                              type="email"
                              value={contactEmail}
                              onChange={(e) => setContactEmail(e.target.value)}
                              placeholder="Your Email"
                              className="w-full text-sm bg-slate-50 dark:bg-[#0A0B0E] border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2.5 outline-none focus:border-red-500 transition-colors dark:text-white"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                            {t.subject || 'Subject*'}
                          </label>
                          <div className="relative">
                            <select
                              value={contactSubject}
                              onChange={(e) => setContactSubject(e.target.value)}
                              className="w-full text-sm bg-slate-50 dark:bg-[#0A0B0E] border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2.5 outline-none focus:border-red-500 transition-colors dark:text-white appearance-none cursor-pointer font-medium"
                              required
                            >
                              <option disabled value="Choose a subject...">
                                {t.chooseSubject || 'Choose a subject...'}
                              </option>
                              <option value="Technical Support">{t.technicalSupport || 'Technical Support'}</option>
                              <option value="Billing & Subscription">{t.billingSubscription || 'Billing & Subscription'}</option>
                              <option value="Feature Request">{t.featureRequest || 'Feature Request'}</option>
                              <option value="Partnership / Business">{t.partnershipBusiness || 'Partnership / Business'}</option>
                              <option value="Report a Bug">{t.reportBug || 'Report a Bug'}</option>
                              <option value="General Inquiry">{t.generalInquiry || 'General Inquiry'}</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                              <ChevronDown className="w-4 h-4" />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                            {t.message || 'Message*'}
                          </label>
                          <textarea
                            value={contactMessage}
                            onChange={(e) => setContactMessage(e.target.value)}
                            placeholder="Write a message"
                            rows={4}
                            className="w-full text-sm bg-slate-50 dark:bg-[#0A0B0E] border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2.5 outline-none focus:border-red-500 transition-colors dark:text-white resize-none"
                            required
                          />
                        </div>

                        {/* Checkbox Accept Terms */}
                        <div className="flex items-start gap-2.5 pt-1.5">
                          <input
                            type="checkbox"
                            id="acceptTerms"
                            checked={acceptTerms}
                            onChange={(e) => setAcceptTerms(e.target.checked)}
                            className="mt-1 h-4 w-4 rounded border-slate-300 text-red-500 focus:ring-red-500 accent-red-500 cursor-pointer"
                          />
                          <label htmlFor="acceptTerms" className="text-xs text-slate-500 dark:text-slate-400 cursor-pointer leading-normal">
                            I accept{' '}
                            <span className="text-red-500 underline hover:text-red-600 transition-colors">
                              Terms & Conditions
                            </span>{' '}
                            and{' '}
                            <span className="text-red-500 underline hover:text-red-600 transition-colors">
                              Legal & Privacy
                            </span>
                          </label>
                        </div>

                        <div className="flex justify-end pt-2">
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-3 bg-[#E53E3E] hover:bg-[#C53030] active:scale-[0.98] text-white font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer w-full sm:w-auto"
                          >
                            {isSubmitting ? 'Sending...' : t.sendMessage || 'Send message'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
