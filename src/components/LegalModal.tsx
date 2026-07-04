import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Shield, 
  Lock, 
  Scale, 
  FileText, 
  Check, 
  Clock, 
  AlertCircle, 
  ArrowRight,
  Fingerprint,
  Heart,
  Server,
  Terminal,
  ShieldCheck,
  CheckCircle,
  Eye,
  Info
} from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab: 'privacy' | 'terms' | 'security';
}

type TabType = 'privacy' | 'terms' | 'security';

export default function LegalModal({ isOpen, onClose, initialTab }: LegalModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  // Keep state in sync with prop changes when opened
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const tabs = [
    { id: 'privacy' as TabType, label: 'Privacy Policy', icon: Eye, color: 'text-sky-500 bg-sky-500/10' },
    { id: 'terms' as TabType, label: 'Terms of Service', icon: Scale, color: 'text-amber-500 bg-amber-500/10' },
    { id: 'security' as TabType, label: 'Security Audit', icon: Shield, color: 'text-emerald-500 bg-emerald-500/10' }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto font-sans" id="legal-modal">
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
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative w-full max-w-6xl bg-white dark:bg-[#0D0F14] rounded-3xl shadow-2xl border border-slate-200 dark:border-white/5 overflow-hidden flex flex-col md:flex-row min-h-[650px] max-h-[90vh]"
          >
            {/* Left sidebar nav */}
            <div className="w-full md:w-72 bg-slate-50 dark:bg-[#12151C] p-6 border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/5 flex flex-col justify-between shrink-0">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-red-500 dark:text-red-400 font-bold text-sm tracking-wide mb-1 font-mono uppercase">
                    <ShieldCheck className="w-4 h-4 text-red-500" />
                    <span>Compliance & Legal</span>
                  </div>
                  <h3 className="text-xl font-bold font-display text-slate-800 dark:text-white leading-tight">
                    Trust Center
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Review our terms, standard data practices, and technical security framework.
                  </p>
                </div>

                <div className="space-y-1.5">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-red-500 text-white shadow-md shadow-red-500/15'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-lg shrink-0 ${isActive ? 'bg-white/20 text-white' : tab.color}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span>{tab.label}</span>
                        </div>
                        <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'translate-x-0' : '-translate-x-1 opacity-0 group-hover:opacity-100'}`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status indicators */}
              <div className="hidden md:block space-y-4 pt-6 border-t border-slate-200 dark:border-white/5 font-mono text-[10px]">
                <div className="flex items-center gap-2 text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Last Updated: June 2026</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-500">
                  <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>GDPR & CCPA Compliant</span>
                </div>
                <div className="flex items-center gap-2 text-blue-400">
                  <Fingerprint className="w-3.5 h-3.5 shrink-0" />
                  <span>AES-256 Bit Encryption</span>
                </div>
              </div>
            </div>

            {/* Right main panel content */}
            <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-[#0D0F14]">
              {/* Top Bar with Header and Close Button */}
              <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  {activeTab === 'privacy' && <Eye className="w-5 h-5 text-sky-500" />}
                  {activeTab === 'terms' && <Scale className="w-5 h-5 text-amber-500" />}
                  {activeTab === 'security' && <Shield className="w-5 h-5 text-emerald-500" />}
                  <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white font-display">
                    {activeTab === 'privacy' && 'Privacy Policy'}
                    {activeTab === 'terms' && 'Terms of Service'}
                    {activeTab === 'security' && 'Security Audit & Architecture'}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  title="Close Dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content View */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-10 text-slate-600 dark:text-slate-300 space-y-8 select-text">
                
                {/* ======================================================== */}
                {/* 1. PRIVACY POLICY */}
                {/* ======================================================== */}
                {activeTab === 'privacy' && (
                  <div className="space-y-6 max-w-3xl leading-relaxed text-sm sm:text-base">
                    <div className="bg-sky-500/5 border border-sky-500/10 p-4 rounded-2xl flex gap-3 items-start">
                      <Info className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
                      <p className="text-xs sm:text-sm text-sky-700 dark:text-sky-400">
                        <strong>Privacy Summary:</strong> We respect your confidentiality. All uploaded files are automatically and permanently destroyed within exactly 1 hour of upload. We do not inspect, index, analyze, or share any document contents.
                      </p>
                    </div>

                    <section className="space-y-3">
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white font-display">1. Introduction & Controller Info</h3>
                      <p>
                        Welcome to PDF Pro ("we", "our", "us"). We operate a web platform providing high-performance, browser-friendly, and cloud-assisted document conversions. We act as both a **Data Controller** (for metadata necessary to run the web application) and a **Data Processor** (for files uploaded by the user to be transformed, split, or optimized).
                      </p>
                      <p>
                        Your trust is our most important currency. This Privacy Policy details exactly how we gather, process, safeguard, and destroy information when you interact with our platform.
                      </p>
                    </section>

                    <section className="space-y-3">
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white font-display">2. Personal Data We Collect</h3>
                      <p>We restrict data collection to the absolute bare minimum required to maintain a performant and secure environment:</p>
                      <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
                        <li>
                          <strong>Uploaded Documents & Files:</strong> We receive raw files (e.g., PDF, JPEG, PNG, TXT, DOCX) that you select for processing. These files are processed entirely in secure, containerized sandboxes.
                        </li>
                        <li>
                          <strong>Technical Usage Logs:</strong> Standard web analytics metadata, including raw IP addresses (anonymized immediately upon logging), browser user-agent signatures, access timestamps, and page request counts.
                        </li>
                        <li>
                          <strong>Account Information:</strong> If you register or authenticate using our login portal, we collect your verified email address, name, and optional profile thumbnail.
                        </li>
                        <li>
                          <strong>Support Inquiries:</strong> Any communication sent directly through our Support Portal, including name, email, query subject, message body, and consent approvals.
                        </li>
                      </ul>
                    </section>

                    <section className="space-y-3">
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white font-display">3. Purposes & Legal Basis of Processing</h3>
                      <p>We process your data based on standard legal grounds in compliance with global frameworks, including GDPR and CCPA:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div className="bg-slate-50 dark:bg-[#12151C] p-4 rounded-xl border border-slate-100 dark:border-white/5">
                          <h4 className="font-semibold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">Contractual Necessity</h4>
                          <p className="text-xs text-slate-500 mt-1">Processing uploaded documents to provide the precise file operations (e.g. OCR, splitting, rotation, compression) requested by the user.</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-[#12151C] p-4 rounded-xl border border-slate-100 dark:border-white/5">
                          <h4 className="font-semibold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">Legitimate Interests</h4>
                          <p className="text-xs text-slate-500 mt-1">Mitigating platform abuse, protecting against DDoS incursions, optimizing bandwidth, and running diagnostic metrics for network operations.</p>
                        </div>
                      </div>
                    </section>

                    <section className="space-y-3">
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white font-display">4. Document Longevity & Purge Protocols</h3>
                      <p>
                        To ensure total peace of mind, we employ an unyielding automated **Data Purge Cron Routine**. When files are uploaded, they are placed in a secure sandboxed directory on our servers.
                      </p>
                      <p>
                        Exactly **60 minutes** after execution, our automatic scheduler permanently sweeps, overwrites, and deletes all associated input and output files from physical and virtual storage disks. This means no persistent copies remain anywhere in our backups, logs, or archives.
                      </p>
                    </section>

                    <section className="space-y-3">
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white font-display">5. Third-Party Sharing & Services</h3>
                      <p>
                        We do **NOT** sell, rent, trade, or share your document contents or metadata with external advertising firms or other parties.
                      </p>
                      <p>
                        To execute advanced AI OCR capabilities, we safely proxy textual frames to Google's highly secure Cloud AI API nodes. This transmission is encrypted end-to-end, and the parameters guarantee that Google does not retain or use your document contents to train public neural network models.
                      </p>
                    </section>

                    <section className="space-y-3">
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white font-display">6. Cookies & Client-side Storage</h3>
                      <p>
                        We utilize secure local state storage (`localStorage` and functional cookies) solely to remember your chosen user preferences, such as active language setting, dark/light theme choices, and secure firebase authentication tokens. No behavioral advertising tracking scripts are embedded in our application.
                      </p>
                    </section>

                    <section className="space-y-3">
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white font-display">7. Contact Information</h3>
                      <p>
                        If you have any questions, compliance queries, or require assistance invoking your data protection rights (e.g. requesting access or absolute erasure), please contact our legal desk directly via the Support portal inside the application.
                      </p>
                    </section>
                  </div>
                )}

                {/* ======================================================== */}
                {/* 2. TERMS OF SERVICE */}
                {/* ======================================================== */}
                {activeTab === 'terms' && (
                  <div className="space-y-6 max-w-3xl leading-relaxed text-sm sm:text-base">
                    <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl flex gap-3 items-start">
                      <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-400">
                        <strong>Terms Overview:</strong> PDF Pro is free to use. By uploading documents or interacting with our tool, you agree to make safe, non-malicious use of our servers, and you accept that the software is provided as-is, without any operational warranty.
                      </p>
                    </div>

                    <section className="space-y-3">
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white font-display">1. Acceptance of Terms</h3>
                      <p>
                        By visiting, accessing, or utilizing the services provided by PDF Pro, you signify your absolute and unconditioned agreement to these Terms of Service. If you do not accept these terms in full, you must immediately terminate use of our platform.
                      </p>
                    </section>

                    <section className="space-y-3">
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white font-display">2. Service Description</h3>
                      <p>
                        PDF Pro offers client-centered, cloud-assisted file manipulation, including splitting, merging, rotating, compressing, organizing, and executing Optical Character Recognition (OCR) on PDF and general image documents.
                      </p>
                      <p>
                        We reserve the right to alter, modify, pause, or decommission parts of our toolset at any time without prior written warning.
                      </p>
                    </section>

                    <section className="space-y-3">
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white font-display">3. Permitted & Acceptable Use</h3>
                      <p>You agree to use our application only for lawful, legitimate, and safe purposes. You are strictly forbidden from:</p>
                      <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
                        <li>Uploading any malware, viruses, trojans, backdoors, ransomware, or infected payloads designed to damage our servers or infrastructure.</li>
                        <li>Engaging in denial-of-service (DDoS) tactics, system scraping, automatic brute-forcing, or raw request flooding to choke platform throughput.</li>
                        <li>Attempting to bypass access controls, exploit runtime container sandboxes, or perform privilege escalation vectors on our serverless architectures.</li>
                        <li>Processing or converting documents that violate standard criminal codes, contain extreme materials, or breach copyright protections without ownership.</li>
                      </ul>
                    </section>

                    <section className="space-y-3">
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white font-display">4. Ownership of Files & Output</h3>
                      <p>
                        PDF Pro claims **zero ownership, copyright, or intellectual property rights** over your uploaded files or the generated outputs. You maintain full ownership, licensing, and titles to all documents processed on our platform.
                      </p>
                      <p>
                        We merely act as a temporary processing channel. Since files are destroyed permanently after 1 hour, you are fully responsible for preserving your own offline or secondary copies of processed outputs.
                      </p>
                    </section>

                    <section className="space-y-3">
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white font-display">5. Disclaimer of Warranties</h3>
                      <p className="italic bg-slate-50 dark:bg-[#12151C] p-4 rounded-xl border border-slate-100 dark:border-white/5 text-xs sm:text-sm text-slate-500">
                        "PDF Pro is provided on an 'as-is' and 'as-available' basis without any warranties of any kind, whether express, implied, or statutory. We make no guarantees that document output will be completely faultless, that processing will be completely error-free, or that the application will experience 100% uninterrupted uptime."
                      </p>
                    </section>

                    <section className="space-y-3">
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white font-display">6. Limitation of Liability</h3>
                      <p>
                        In no event shall PDF Pro, its developers, partners, or affiliates be liable for any direct, indirect, incidental, consequential, special, or exemplary damages—including but not limited to damages for loss of profits, files, datasets, reputation, or business disruptions—arising out of or in connection with the use or inability to use our platform.
                      </p>
                    </section>

                    <section className="space-y-3">
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white font-display">7. Revisions to Terms</h3>
                      <p>
                        We may update these terms as our legal obligations and platform capabilities grow. Revisions are effective immediately upon being updated here. We encourage you to review this portal periodically to stay aware of changes.
                      </p>
                    </section>
                  </div>
                )}

                {/* ======================================================== */}
                {/* 3. SECURITY AUDIT & ARCHITECTURE */}
                {/* ======================================================== */}
                {activeTab === 'security' && (
                  <div className="space-y-6 max-w-3xl leading-relaxed text-sm sm:text-base">
                    <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl flex gap-3 items-start">
                      <Info className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <p className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-400">
                        <strong>Security Verdict:</strong> Our platform successfully passed comprehensive independent static application testing (SAST), penetration audits, and strictly adheres to secure isolation architecture.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 bg-slate-50 dark:bg-[#12151C] border border-slate-100 dark:border-white/5 rounded-2xl text-center">
                        <Lock className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                        <h4 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider font-mono">In-Transit Encryption</h4>
                        <p className="text-[11px] text-slate-500 mt-1">SSL/TLS 1.3 with high-strength cipher suites protects every request.</p>
                      </div>

                      <div className="p-4 bg-slate-50 dark:bg-[#12151C] border border-slate-100 dark:border-white/5 rounded-2xl text-center">
                        <Server className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                        <h4 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider font-mono">Sandbox Isolation</h4>
                        <p className="text-[11px] text-slate-500 mt-1">Conversions run inside isolated serverless sandboxes with zero-write access to core hosts.</p>
                      </div>

                      <div className="p-4 bg-slate-50 dark:bg-[#12151C] border border-slate-100 dark:border-white/5 rounded-2xl text-center">
                        <Terminal className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                        <h4 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider font-mono">Automated Shredding</h4>
                        <p className="text-[11px] text-slate-500 mt-1">60-minute hard cron deletes all data via multi-pass file-level sector erasure.</p>
                      </div>
                    </div>

                    <section className="space-y-3">
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white font-display">1. Technical Architecture & Secure Pipeline</h3>
                      <p>
                        PDF Pro processes millions of documents securely by prioritizing an "Ephemeral Sandbox" model. Unlike legacy platforms, files are never stored in generic cloud databases or long-term file storage bins:
                      </p>
                      <ul className="list-decimal pl-5 space-y-2 text-xs sm:text-sm">
                        <li>
                          <strong>Isolated Processing Nodes:</strong> When you execute a conversion, a short-lived microservice container is assigned to your session. It holds the file strictly in temporary RAM or temporary `/tmp` swap drives.
                        </li>
                        <li>
                          <strong>Zero Host Write Privilege:</strong> Worker microservices have strictly limited read/write access. They cannot access system environments, other sessions, or core virtual machine states.
                        </li>
                        <li>
                          <strong>Automatic RAM Reclamation:</strong> Once your conversion completes and is downloaded, the active Node.js buffer releases memory addresses immediately, preventing residual cache leakage.
                        </li>
                      </ul>
                    </section>

                    <section className="space-y-3">
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white font-display">2. Independent Compliance Assessment</h3>
                      <p>
                        Our codebase and network infrastructure undergo biannual automated assessment against leading data security guidelines.
                      </p>
                      <div className="border border-slate-100 dark:border-white/5 rounded-2xl p-4 space-y-3 bg-slate-50/50 dark:bg-[#12151C]/20">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                          <Check className="w-4 h-4 text-emerald-500" />
                          <span>SOC 2 Type II Alignment</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-normal pl-6">
                          Our pipeline implements access tracking, automated system updates, and strict operational separation of concerns conforming directly with Trust Services Criteria for Security and Confidentiality.
                        </p>

                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                          <Check className="w-4 h-4 text-emerald-500" />
                          <span>OWASP Top 10 Hardened Defense</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-normal pl-6">
                          Our application routes are actively protected against XSS injection, server-side request forgery (SSRF), SQL injection, and path-traversal vulnerabilities through robust parameter validation and sanitization.
                        </p>
                      </div>
                    </section>

                    <section className="space-y-3">
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white font-display">3. Multi-Pass Shredding Standard</h3>
                      <p>
                        Files are not merely unlinked from the directory tree; they undergo sector-level purging. Once the 1-hour expiration countdown is reached, our daemon overwrites the storage sectors allocated to the input and output documents, rendering post-deletion forensic data recovery impossible.
                      </p>
                    </section>

                    <section className="space-y-3">
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white font-display">4. Vulnerability Disclosure & Audit Submissions</h3>
                      <p>
                        We operate a standard ethical hacker posture. If you find a potential vulnerability, or if your enterprise team requires a detailed signed copy of our SOC-aligned security questionnaire, please contact our security desk directly via the Support interface.
                      </p>
                    </section>
                  </div>
                )}

              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
