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
  Sparkles
} from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { LANGUAGES, translations } from '../lib/translations';
import FeatureShowcase from './FeatureShowcase';

interface PortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeLanguage: string;
  onSelectLanguage: (code: string) => void;
  darkMode: boolean;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
  onSelectTool: (toolId: any) => void;
}

export default function PortalModal({
  isOpen,
  onClose,
  activeLanguage,
  onSelectLanguage,
  darkMode,
  addToast,
  onSelectTool
}: PortalModalProps) {
  const [activeTab, setActiveTab] = useState<'languages' | 'help' | 'contact'>('languages');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('Choose a subject...');
  const [contactMessage, setContactMessage] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
