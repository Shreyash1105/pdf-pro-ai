import { useState, useEffect } from 'react';
import { 
  motion, 
  AnimatePresence 
} from 'motion/react';
import { 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Users, 
  Trophy, 
  Cpu, 
  Database, 
  Cloud, 
  Lock, 
  Terminal, 
  UserCheck, 
  RefreshCw, 
  ExternalLink, 
  ChevronRight, 
  Layers, 
  FileText, 
  Combine, 
  Scissors, 
  PenTool, 
  Briefcase, 
  Check, 
  Zap, 
  ArrowRight,
  TrendingUp,
  Heart,
  FileCheck,
  Scale
} from 'lucide-react';

interface FeatureShowcaseProps {
  activeLanguage: string;
  onSelectTool: (toolId: any) => void;
}

// Localized Content for our showcase
const showcaseTranslations: Record<string, any> = {
  en: {
    trustedBy: "Trusted by forward-thinking companies worldwide",
    badgeTitle: "Recognized as an Industry Leader",
    badgeSub: "Awarded and trusted across top platforms for reliability, speed, and safety.",
    whyChooseUs: "Engineered for excellence",
    allInOneSub: "Whether you need to split, merge, compress, or OCR, our secure sandbox executes jobs at lightning speed with maximum fidelity.",
    sandboxTitle: "Experience the Precision",
    sandboxSub: "See our elite processing engines in action. Click on any capability below to run a simulated live compilation.",
    bentoTitle: "Designed for Enterprise Scale",
    bentoSub: "Our zero-knowledge infrastructure guarantees bank-grade safety, developer APIs, and cloud syncing pipelines.",
    sectorsTitle: "Tailored for Your Industry Sector",
    sectorsSub: "Unlock pre-engineered document workflows designed specifically to simplify operations in your business niche.",
    statsTitle: "Transforming document workflows globally",
    counterLabel: "Secure conversions processed globally",
    uptimeLabel: "Uptime SLA Guarantee",
    usersLabel: "Daily Active Users",
    paperLabel: "Sheets of Paper Saved Yearly"
  },
  es: {
    trustedBy: "Confiado por empresas líderes en todo el mundo",
    badgeTitle: "Reconocido como líder de la industria",
    badgeSub: "Galardonado y de confianza en las mejores plataformas por su fiabilidad, velocidad y seguridad.",
    whyChooseUs: "Diseñado para la excelencia",
    allInOneSub: "Ya sea que necesite dividir, combinar, comprimir o realizar OCR, nuestro entorno seguro ejecuta trabajos a la velocidad del rayo.",
    sandboxTitle: "Experimenta la Precisión",
    sandboxSub: "Vea nuestros motores de procesamiento de élite en acción. Haga clic en cualquier función para ejecutar una simulación.",
    bentoTitle: "Diseñado para Escala Empresarial",
    bentoSub: "Nuestra infraestructura de conocimiento cero garantiza seguridad de nivel bancario, API para desarrolladores y sincronización en la nube.",
    sectorsTitle: "Adaptado a su Sector Industrial",
    sectorsSub: "Desbloquee flujos de trabajo de documentos diseñados específicamente para simplificar las operaciones en su nicho.",
    statsTitle: "Transformando flujos de trabajo de documentos en todo el mundo",
    counterLabel: "Conversiones seguras procesadas globalmente",
    uptimeLabel: "Garantía de SLA de tiempo de actividad",
    usersLabel: "Usuarios activos diarios",
    paperLabel: "Hojas de papel guardadas anualmente"
  },
  fr: {
    trustedBy: "Adopté par les entreprises les plus innovantes au monde",
    badgeTitle: "Reconnu comme leader du secteur",
    badgeSub: "Récompensé pour sa fiabilité, sa vitesse et sa sécurité sur les plus grandes plateformes.",
    whyChooseUs: "Conçu pour l'excellence",
    allInOneSub: "Que vous ayez besoin de fusionner, compresser, diviser ou OCR, notre bac à sable sécurisé traite vos fichiers en un clin d'œil.",
    sandboxTitle: "Faites l'expérience de la précision",
    sandboxSub: "Découvrez nos moteurs de traitement d'élite. Cliquez sur une fonctionnalité pour lancer une simulation en direct.",
    bentoTitle: "Conçu pour l'échelle de l'entreprise",
    bentoSub: "Notre infrastructure sans connaissance garantit une sécurité bancaire, des API développeurs et une synchronisation cloud.",
    sectorsTitle: "Adapté à votre secteur d'activité",
    sectorsSub: "Activez des flux de travail documentaires pré-configurés pour simplifier les opérations de votre secteur.",
    statsTitle: "Transformer les flux documentaires mondiaux",
    counterLabel: "Conversions sécurisées traitées dans le monde",
    uptimeLabel: "Garantie de disponibilité SLA",
    usersLabel: "Utilisateurs actifs par jour",
    paperLabel: "Feuilles de papier économisées par an"
  }
};

export default function FeatureShowcase({ activeLanguage, onSelectTool }: FeatureShowcaseProps) {
  const t = showcaseTranslations[activeLanguage] || showcaseTranslations['en'];

  // Live conversion counter
  const [conversionCount, setConversionCount] = useState(1429812042);
  const [flashCounter, setFlashCounter] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const increment = Math.floor(Math.random() * 5) + 2; // 2 to 6
      setConversionCount(prev => prev + increment);
      setFlashCounter(true);
      const timer = setTimeout(() => setFlashCounter(false), 500);
      return () => clearTimeout(timer);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Sandbox Tab Selection State
  const [activeSandboxTab, setActiveSandboxTab] = useState<'compress' | 'ocr' | 'esign' | 'merge'>('compress');
  const [sandboxProgress, setSandboxProgress] = useState(0);
  const [isSandboxRunning, setIsSandboxRunning] = useState(false);
  const [sandboxOutputReady, setSandboxOutputReady] = useState(false);

  // Form input for Sandbox E-Sign
  const [signerName, setSignerName] = useState('');

  // OCR state mock text
  const [ocrCompletedText, setOcrCompletedText] = useState('');

  // Trigger running simulated sandbox workflow
  useEffect(() => {
    setSandboxProgress(0);
    setSandboxOutputReady(false);
    setIsSandboxRunning(false);
  }, [activeSandboxTab]);

  const runSandboxSimulation = () => {
    if (isSandboxRunning) return;
    setIsSandboxRunning(true);
    setSandboxProgress(0);
    setSandboxOutputReady(false);

    const interval = setInterval(() => {
      setSandboxProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSandboxRunning(false);
          setSandboxOutputReady(true);
          return 100;
        }
        return prev + 5;
      });
    }, 80);
  };

  // Industries / Sectors Selection State
  const [activeSector, setActiveSector] = useState<'hr' | 'legal' | 'finance' | 'realestate' | 'healthcare' | 'sales'>('hr');

  const sectorsInfo = {
    hr: {
      title: "Human Resources",
      icon: Users,
      badge: "Onboarding & Recruiting",
      desc: "HR departments manage sensitive employee records, offer letters, and evaluation logs. Simplify forms distribution, batch-merge resumes, and secure signing securely.",
      benefits: [
        "Securely collect and organize scanned applicant CVs",
        "E-Sign and countersign employment contracts in bulk",
        "Redact confidential personal identification data before sharing",
        "Compress heavy employee portfolios for fast database archiving"
      ],
      mockupType: "hr"
    },
    legal: {
      title: "Legal & Compliance",
      icon: Scale,
      badge: "Contract Summarization & Risk Audit",
      desc: "Legal professionals deal with highly sensitive contracts and briefs. Quickly extract 'Core Obligations', 'Payment Terms', and 'Risk Clauses' from uploaded agreements in 5 seconds to save massive amounts of time.",
      benefits: [
        "AI Contract Risk Summarizer identifies liability exposure in 5 seconds",
        "Isolate core obligations, payment terms, and critical risk clauses",
        "Lock files with 256-bit AES encryption before external client review",
        "Confidentiality Guaranteed: All files are securely purged from our servers within 1 hour"
      ],
      mockupType: "legal"
    },
    finance: {
      title: "Finance & Accounting",
      icon: TrendingUp,
      badge: "Tax Reporting & Confidential Batching",
      desc: "Accounting teams process hundreds of receipts, daily invoices, and financial sheets. Enjoy fully confidential batching to merge invoices or split confidential monthly files with 100% security.",
      benefits: [
        "Secure Invoice Batching: merge daily invoices or split financial sheets in seconds",
        "Strict 1-Hour File Purging: documents are permanently wiped from the server to guarantee secrecy",
        "Convert scanned receipts and tax forms into structured text",
        "Apply custom watermark 'CONFIDENTIAL AUDIT' to draft statements"
      ],
      mockupType: "finance"
    },
    realestate: {
      title: "Real Estate & Brokerage",
      icon: Briefcase,
      badge: "Deeds & Purchase Contracts",
      desc: "Brokers speed up deal closures by coordinating multi-party sign-offs on title agreements and disclosures. Access files on any portable device instantly.",
      benefits: [
        "Sign mortgage disclosures and leasing contracts digitally",
        "Merge blueprints, property photos, and disclosures into single PDF books",
        "Add branding watermarks to proprietary market valuation booklets",
        "Reduce PDF file size to accommodate narrow mobile email limits"
      ],
      mockupType: "realestate"
    },
    healthcare: {
      title: "Healthcare Administration",
      icon: ShieldCheck,
      badge: "HIPAA Protected Health Info",
      desc: "Medical teams compile hundreds of case files, lab receipts, and insurance claims. Safe, local sandboxes preserve patient confidentiality at every point of the pipeline.",
      benefits: [
        "Process documents inside sandboxes that meet absolute data privacy laws",
        "Convert patient history scans into digitized, searchable clinical logs",
        "Securely organize referral charts, lab forms, and diagnostic reports",
        "Prevent leak of private medical identifiers with absolute file purges"
      ],
      mockupType: "healthcare"
    },
    sales: {
      title: "Sales & Client Operations",
      icon: Zap,
      badge: "RFPs, Proposals & Quotes",
      desc: "Fast-moving sales agents win client pitches by distributing clean, branded proposals and securing rapid, frictionless sign-offs. Enhance workflow speeds tenfold.",
      benefits: [
        "Embed customer signature spots in sales quote pages",
        "Stitch proposal summaries, spec sheets, and prices together",
        "Add custom firm branding logos to sales deliverables",
        "Optimized formats display with pixel perfection on tablets and mobiles"
      ],
      mockupType: "sales"
    }
  };

  const activeSectorData = sectorsInfo[activeSector];

  // Helper function to render sandbox mockup panel
  const renderSandboxMockup = () => {
    switch (activeSandboxTab) {
      case 'compress':
        return (
          <div className="h-full flex flex-col justify-between p-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-500" />
                <span className="text-xs font-mono font-bold dark:text-slate-300">financial_report_2026.pdf</span>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-500">15.4 MB</span>
            </div>

            <div className="py-8 flex flex-col items-center justify-center relative">
              {/* Dynamic compressing visualization */}
              <div className="relative w-28 h-28 flex items-center justify-center">
                {/* Outer spin rings */}
                <div className={`absolute inset-0 rounded-full border-2 border-dashed border-red-500/20 ${isSandboxRunning ? 'animate-spin' : ''}`} />
                <div className={`absolute inset-2 rounded-full border border-blue-500/20 ${isSandboxRunning ? 'animate-spin [animation-duration:10s]' : ''}`} />
                
                {/* Visual file scaling */}
                <motion.div 
                  animate={
                    isSandboxRunning 
                      ? { scale: [1, 0.7, 1], rotate: [0, 90, 180, 270, 360] } 
                      : sandboxOutputReady 
                        ? { scale: 0.75 } 
                        : { scale: 1 }
                  }
                  transition={{ repeat: isSandboxRunning ? Infinity : 0, duration: 2 }}
                  className="w-16 h-20 bg-white dark:bg-[#1A1D26] rounded-xl shadow-lg border border-slate-200 dark:border-white/10 flex flex-col justify-between p-3"
                >
                  <div className="w-full h-1 bg-red-500 rounded" />
                  <div className="space-y-1">
                    <div className="w-3/4 h-1 bg-slate-200 dark:bg-white/10 rounded" />
                    <div className="w-1/2 h-1 bg-slate-200 dark:bg-white/10 rounded" />
                  </div>
                  <div className="flex justify-end">
                    <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                  </div>
                </motion.div>

                {/* Arrow indicator */}
                {isSandboxRunning && (
                  <motion.div 
                    animate={{ y: [-15, 15, -15] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute -right-4 text-red-500"
                  >
                    <ArrowRight className="w-5 h-5 rotate-90" />
                  </motion.div>
                )}
              </div>

              {/* Progress text */}
              <div className="mt-6 text-center space-y-1">
                {isSandboxRunning ? (
                  <>
                    <p className="text-xs font-mono text-red-500 font-bold">Compressing Engine Active...</p>
                    <p className="text-lg font-bold font-mono text-slate-800 dark:text-white">{sandboxProgress}%</p>
                  </>
                ) : sandboxOutputReady ? (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }}
                    className="space-y-1.5"
                  >
                    <span className="inline-flex items-center gap-1 text-xs font-mono text-emerald-500 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> Compression Success
                    </span>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      New Size: <span className="text-emerald-500 font-mono font-bold">1.8 MB</span> (88% Reduced)
                    </p>
                  </motion.div>
                ) : (
                  <p className="text-xs text-slate-400">Click &quot;Run Simulation&quot; to execute compression engine.</p>
                )}
              </div>
            </div>

            <button
              onClick={runSandboxSimulation}
              disabled={isSandboxRunning}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-mono font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSandboxRunning ? 'animate-spin' : ''}`} />
              {isSandboxRunning ? 'PROCESSING...' : 'RUN SIMULATION'}
            </button>
          </div>
        );

      case 'ocr':
        return (
          <div className="h-full flex flex-col justify-between p-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                <span className="text-xs font-mono font-bold dark:text-slate-300">scanned_invoice_img.png</span>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-500">IMAGE SCAN</span>
            </div>

            {/* Split Screen Image -> Clean OCR text */}
            <div className="py-4 grid grid-cols-2 gap-4 h-48 relative overflow-hidden">
              {/* Left Column: Input Scan Image mockup */}
              <div className="border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-[#12151C] p-3 flex flex-col justify-between relative">
                <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-slate-800 text-white text-[8px] rounded font-mono">IMAGE</div>
                <div className="space-y-2 mt-4 opacity-50">
                  <div className="w-full h-2.5 bg-slate-400 rounded-sm" />
                  <div className="w-5/6 h-2.5 bg-slate-400 rounded-sm" />
                  <div className="w-2/3 h-2.5 bg-slate-400 rounded-sm" />
                  <div className="w-4/5 h-2.5 bg-slate-400 rounded-sm" />
                </div>
                <div className="flex justify-between items-center border-t border-slate-200 dark:border-white/5 pt-2">
                  <div className="w-10 h-3 bg-red-400 rounded" />
                  <div className="w-6 h-3 bg-slate-400 rounded" />
                </div>

                {/* Animated OCR scan bar */}
                {isSandboxRunning && (
                  <motion.div 
                    animate={{ top: ['0%', '95%', '0%'] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="absolute inset-x-0 h-0.5 bg-indigo-500 shadow-lg shadow-indigo-500/50"
                  />
                )}
              </div>

              {/* Right Column: Extracted code snippet */}
              <div className="border border-slate-200 dark:border-white/10 rounded-xl bg-slate-900 text-emerald-400 p-3 flex flex-col justify-between font-mono text-[9px] relative overflow-hidden">
                <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[8px] rounded font-bold">DIGITAL TEXT</div>
                
                <div className="space-y-1.5 mt-5">
                  <AnimatePresence>
                    {isSandboxRunning ? (
                      <div className="text-slate-500 animate-pulse">Scanning and compiling optical blocks...</div>
                    ) : sandboxOutputReady ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-1 text-slate-300"
                      >
                        <p className="text-emerald-400 font-bold"># INVOICE EXTRACTED</p>
                        <p><span className="text-slate-500">ID:</span> #INV-2026-904</p>
                        <p><span className="text-slate-500">DATE:</span> 2026-06-24</p>
                        <p><span className="text-slate-500">TOTAL:</span> $12,490.00 USD</p>
                        <p className="text-indigo-400 font-semibold">SUCCESS: 99.8% Accuracy</p>
                      </motion.div>
                    ) : (
                      <div className="text-slate-500 italic flex items-center justify-center h-28">Text extraction output goes here.</div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <button
              onClick={runSandboxSimulation}
              disabled={isSandboxRunning}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-mono font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Cpu className="w-3.5 h-3.5" />
              {isSandboxRunning ? 'RUNNING OCR ENGINE...' : 'RUN SIMULATION'}
            </button>
          </div>
        );

      case 'esign':
        return (
          <div className="h-full flex flex-col justify-between p-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-500" />
                <span className="text-xs font-mono font-bold dark:text-slate-300">legal_affidavit_consent.pdf</span>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-500">AUDITED CO-SIGN</span>
            </div>

            <div className="py-4 space-y-4">
              {/* Form Input for E-sign */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide">Enter Signing Signature</label>
                <input 
                  type="text" 
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="e.g. Tristan Lecrivain"
                  disabled={isSandboxRunning}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#12151C] border border-slate-200 dark:border-white/10 rounded-lg outline-none focus:border-emerald-500 text-slate-800 dark:text-white transition-all font-medium"
                />
              </div>

              {/* Secure Signature Block Box */}
              <div className="h-24 border border-dashed border-slate-200 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-[#12151C]/30 flex flex-col justify-between p-3 relative">
                <span className="absolute top-2 left-2 text-[8px] font-mono text-slate-400 tracking-wider">SIGNATURE VALIDATION BOX</span>
                
                {/* Visual vector path draw */}
                <div className="flex-grow flex items-center justify-center">
                  {isSandboxRunning ? (
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-[9px] font-mono text-slate-400 mt-1.5 animate-pulse">Encrypting cryptographic digest...</span>
                    </div>
                  ) : sandboxOutputReady ? (
                    <div className="text-center space-y-1.5 w-full">
                      {/* Signature graphic */}
                      <motion.p 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="font-serif italic text-2xl text-indigo-600 dark:text-indigo-400 font-bold select-none tracking-wide"
                      >
                        {signerName || 'Tristan Lecrivain'}
                      </motion.p>
                      {/* Hash stamp */}
                      <span className="block text-[8px] font-mono text-emerald-500 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full w-max mx-auto">
                        SHA-256 CO-SIGN COMPLIANT: #F7B9-31C4
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">Signature will be digitally drawn here</span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                if (!signerName.trim()) {
                  setSignerName('Tristan Lecrivain');
                }
                runSandboxSimulation();
              }}
              disabled={isSandboxRunning}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-mono font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <PenTool className="w-3.5 h-3.5" />
              {isSandboxRunning ? 'SIGNING DOCUMENT...' : 'CRYPTOGRAPHIC SIGN'}
            </button>
          </div>
        );

      case 'merge':
        return (
          <div className="h-full flex flex-col justify-between p-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <Combine className="w-5 h-5 text-rose-500" />
                <span className="text-xs font-mono font-bold dark:text-slate-300">Stitch Portfolio Files</span>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-500">BATCH MERGE</span>
            </div>

            {/* Simulated 3 drag cards merging to 1 */}
            <div className="py-4 flex flex-col justify-center items-center h-48 relative overflow-hidden">
              <AnimatePresence>
                {isSandboxRunning ? (
                  /* Cards moving together and merging animation */
                  <div className="relative w-full h-full flex items-center justify-center">
                    {/* Floating files orbiting closer */}
                    <motion.div 
                      animate={{ x: [-100, 0], y: [-30, 0], opacity: [1, 0.4] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute w-12 h-16 bg-rose-500 text-white rounded-lg shadow border border-rose-400 flex items-center justify-center font-mono text-xs font-bold"
                    >
                      PDF 1
                    </motion.div>
                    <motion.div 
                      animate={{ x: [100, 0], y: [-15, 0], opacity: [1, 0.4] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute w-12 h-16 bg-orange-500 text-white rounded-lg shadow border border-orange-400 flex items-center justify-center font-mono text-xs font-bold"
                    >
                      PDF 2
                    </motion.div>
                    <motion.div 
                      animate={{ y: [60, 0], opacity: [1, 0.4] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute w-12 h-16 bg-red-500 text-white rounded-lg shadow border border-red-400 flex items-center justify-center font-mono text-xs font-bold"
                    >
                      PDF 3
                    </motion.div>

                    {/* Central glowing merge block */}
                    <div className="w-16 h-16 bg-slate-800 dark:bg-white/10 rounded-full flex items-center justify-center border-2 border-red-500 border-dashed animate-spin" />
                  </div>
                ) : sandboxOutputReady ? (
                  /* Single big master PDF */
                  <motion.div
                    initial={{ scale: 0.5, rotate: -45, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    className="flex flex-col items-center justify-center space-y-3"
                  >
                    <div className="w-20 h-24 bg-gradient-to-br from-rose-500 via-orange-500 to-red-500 text-white rounded-2xl shadow-xl border border-red-400 flex flex-col justify-between p-3 relative overflow-hidden">
                      <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />
                      <div className="w-full h-1.5 bg-white/40 rounded-sm relative z-10" />
                      <Combine className="w-8 h-8 mx-auto text-white relative z-10" />
                      <div className="flex justify-between items-center relative z-10">
                        <span className="text-[8px] font-mono opacity-80">merged.pdf</span>
                        <span className="text-[7px] font-mono bg-white/20 px-1 py-0.2 rounded">3 Pgs</span>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-emerald-500 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Combined & Optimized
                    </span>
                  </motion.div>
                ) : (
                  /* Idle cards stack */
                  <div className="flex items-center gap-4 relative">
                    <div className="w-12 h-16 bg-rose-50 hover:bg-rose-100 dark:bg-rose-505/10 border border-rose-200 dark:border-rose-500/20 text-rose-500 rounded-lg shadow-sm flex items-center justify-center font-mono text-xs font-bold transition-all -rotate-12 cursor-pointer">
                      Doc A
                    </div>
                    <div className="w-12 h-16 bg-orange-50 hover:bg-orange-100 dark:bg-orange-505/10 border border-orange-200 dark:border-orange-500/20 text-orange-500 rounded-lg shadow-sm flex items-center justify-center font-mono text-xs font-bold transition-all rotate-6 cursor-pointer -translate-y-2">
                      Doc B
                    </div>
                    <div className="w-12 h-16 bg-red-50 hover:bg-red-100 dark:bg-red-505/10 border border-red-200 dark:border-red-500/20 text-red-500 rounded-lg shadow-sm flex items-center justify-center font-mono text-xs font-bold transition-all -rotate-6 cursor-pointer">
                      Doc C
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={runSandboxSimulation}
              disabled={isSandboxRunning}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-mono font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Combine className="w-3.5 h-3.5" />
              {isSandboxRunning ? 'CONSOLIDATING STACK...' : 'RUN SIMULATION'}
            </button>
          </div>
        );
    }
  };

  return (
    <div className="space-y-24 py-12 border-t border-slate-100 dark:border-white/5 mt-16">
      
      {/* 1. TRUSTED LOGOS SECTION */}
      <div className="text-center space-y-6">
        <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          {t.trustedBy}
        </h3>
        
        {/* Continuous Marquee Logos */}
        <div className="w-full overflow-hidden relative py-4">
          <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-slate-50 dark:from-[#0A0B0E] to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-slate-50 dark:from-[#0A0B0E] to-transparent z-10 pointer-events-none" />
          
          <div className="flex items-center gap-16 whitespace-nowrap animate-marquee">
            {/* Round 1 logos */}
            <span className="text-lg font-serif font-black tracking-[0.2em] text-slate-300 dark:text-slate-800 hover:text-red-500 transition-colors cursor-pointer select-none">SAMSUNG</span>
            <span className="text-lg font-sans font-extrabold tracking-[0.15em] italic text-slate-300 dark:text-slate-800 hover:text-blue-500 transition-colors cursor-pointer select-none">TOYOTA</span>
            <span className="text-lg font-serif italic font-bold tracking-[0.1em] text-slate-300 dark:text-slate-800 hover:text-indigo-500 transition-colors cursor-pointer select-none">SAAB GROUP</span>
            <span className="text-lg font-mono font-black tracking-widest text-slate-300 dark:text-slate-800 hover:text-orange-500 transition-colors cursor-pointer select-none">BOEING</span>
            <span className="text-lg font-sans font-light tracking-[0.3em] text-slate-300 dark:text-slate-800 hover:text-emerald-500 transition-colors cursor-pointer select-none">CISCO</span>
            
            {/* Round 2 duplicate for continuous sliding */}
            <span className="text-lg font-serif font-black tracking-[0.2em] text-slate-300 dark:text-slate-800 hover:text-red-500 transition-colors cursor-pointer select-none">SAMSUNG</span>
            <span className="text-lg font-sans font-extrabold tracking-[0.15em] italic text-slate-300 dark:text-slate-800 hover:text-blue-500 transition-colors cursor-pointer select-none">TOYOTA</span>
            <span className="text-lg font-serif italic font-bold tracking-[0.1em] text-slate-300 dark:text-slate-800 hover:text-indigo-500 transition-colors cursor-pointer select-none">SAAB GROUP</span>
            <span className="text-lg font-mono font-black tracking-widest text-slate-300 dark:text-slate-800 hover:text-orange-500 transition-colors cursor-pointer select-none">BOEING</span>
            <span className="text-lg font-sans font-light tracking-[0.3em] text-slate-300 dark:text-slate-800 hover:text-emerald-500 transition-colors cursor-pointer select-none">CISCO</span>
          </div>
        </div>
      </div>

      {/* 2. RECOGNITION BADGES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-5 space-y-4 text-left">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border border-amber-500/20">
            <Trophy className="w-3.5 h-3.5 fill-amber-500/20" /> top rated platform
          </span>
          <h2 className="font-display font-light text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight leading-tight">
            {t.badgeTitle}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
            {t.badgeSub}
          </p>
        </div>

        <div className="md:col-span-7 grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-[#12151C] border border-slate-100 dark:border-white/5 p-5 rounded-3xl flex flex-col items-center text-center space-y-2 shadow-sm relative overflow-hidden group hover:border-red-500/20 transition-all">
            <div className="absolute top-0 inset-x-0 h-1 bg-red-500/30 group-hover:bg-red-500 transition-colors" />
            <span className="text-yellow-500 text-sm">★★★★★</span>
            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono">Users Love Us</h4>
            <p className="text-[10px] text-slate-400">Consistent 4.9/5 satisfaction index on software surveys.</p>
          </div>

          <div className="bg-white dark:bg-[#12151C] border border-slate-100 dark:border-white/5 p-5 rounded-3xl flex flex-col items-center text-center space-y-2 shadow-sm relative overflow-hidden group hover:border-orange-500/20 transition-all">
            <div className="absolute top-0 inset-x-0 h-1 bg-orange-500/30 group-hover:bg-orange-500 transition-colors" />
            <Trophy className="w-6 h-6 text-orange-500" />
            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono">Leader Enterprise</h4>
            <p className="text-[10px] text-slate-400">Chosen as the premium choice for corporate scale operations.</p>
          </div>

          <div className="bg-white dark:bg-[#12151C] border border-slate-100 dark:border-white/5 p-5 rounded-3xl flex flex-col items-center text-center space-y-2 shadow-sm relative overflow-hidden group hover:border-indigo-500/20 transition-all">
            <div className="absolute top-0 inset-x-0 h-1 bg-indigo-500/30 group-hover:bg-indigo-500 transition-colors" />
            <TrendingUp className="w-6 h-6 text-indigo-500" />
            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono">Momentum Leader</h4>
            <p className="text-[10px] text-slate-400">Fastest growing brand and market share acceleration.</p>
          </div>

          <div className="bg-white dark:bg-[#12151C] border border-slate-100 dark:border-white/5 p-5 rounded-3xl flex flex-col items-center text-center space-y-2 shadow-sm relative overflow-hidden group hover:border-emerald-500/20 transition-all">
            <div className="absolute top-0 inset-x-0 h-1 bg-emerald-500/30 group-hover:bg-emerald-500 transition-colors" />
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono">Secure Choice</h4>
            <p className="text-[10px] text-slate-400">Compliant with the highest international document data rules.</p>
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE PLAYGROUND (SIMULATION SANDBOX) */}
      <div className="space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase font-bold text-red-500 bg-red-500/10 px-3 py-1.5 rounded-full">
            <Sparkles className="w-3 h-3 fill-red-500/20" /> interactive sandbox
          </span>
          <h2 className="font-display font-light text-3xl sm:text-5xl text-slate-900 dark:text-white tracking-tight">
            {t.sandboxTitle}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {t.sandboxSub}
          </p>
        </div>

        {/* Interactive layout widget */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-slate-100/40 dark:bg-[#12151C]/10 border border-slate-200/50 dark:border-white/5 rounded-3xl p-6 md:p-10 relative overflow-hidden">
          
          {/* Decorative glowing backdrops */}
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-red-500/5 dark:bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Left Tab selector & specs */}
          <div className="lg:col-span-5 space-y-6 relative z-10 flex flex-col justify-between">
            <div className="space-y-4">
              <button
                onClick={() => setActiveSandboxTab('compress')}
                className={`w-full flex items-start gap-4 p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                  activeSandboxTab === 'compress'
                    ? 'bg-white dark:bg-[#12151C] border-slate-200 dark:border-white/10 shadow-md'
                    : 'bg-transparent border-transparent hover:bg-slate-100/50 dark:hover:bg-white/5'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${activeSandboxTab === 'compress' ? 'bg-red-500 text-white' : 'bg-slate-200/50 dark:bg-white/5 text-slate-400'}`}>
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">Smart PDF Compression</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">Shrink heavy PDF documents up to 90% in size while retaining ultimate digital assets and resolution.</p>
                </div>
              </button>

              <button
                onClick={() => setActiveSandboxTab('ocr')}
                className={`w-full flex items-start gap-4 p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                  activeSandboxTab === 'ocr'
                    ? 'bg-white dark:bg-[#12151C] border-slate-200 dark:border-white/10 shadow-md'
                    : 'bg-transparent border-transparent hover:bg-slate-100/50 dark:hover:bg-white/5'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${activeSandboxTab === 'ocr' ? 'bg-indigo-500 text-white' : 'bg-slate-200/50 dark:bg-white/5 text-slate-400'}`}>
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">Optical Text Recognition (OCR)</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">Parse flattened scan papers or jpeg screen captures into clean, copyable and searchable digital PDFs.</p>
                </div>
              </button>

              <button
                onClick={() => setActiveSandboxTab('esign')}
                className={`w-full flex items-start gap-4 p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                  activeSandboxTab === 'esign'
                    ? 'bg-white dark:bg-[#12151C] border-slate-200 dark:border-white/10 shadow-md'
                    : 'bg-transparent border-transparent hover:bg-slate-100/50 dark:hover:bg-white/5'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${activeSandboxTab === 'esign' ? 'bg-emerald-500 text-white' : 'bg-slate-200/50 dark:bg-white/5 text-slate-400'}`}>
                  <PenTool className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">Secure E-Sign & Cryptography</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">Stamp audited e-signatures cryptographically into document bodies to secure ownership records.</p>
                </div>
              </button>

              <button
                onClick={() => setActiveSandboxTab('merge')}
                className={`w-full flex items-start gap-4 p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                  activeSandboxTab === 'merge'
                    ? 'bg-white dark:bg-[#12151C] border-slate-200 dark:border-white/10 shadow-md'
                    : 'bg-transparent border-transparent hover:bg-slate-100/50 dark:hover:bg-white/5'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${activeSandboxTab === 'merge' ? 'bg-rose-500 text-white' : 'bg-slate-200/50 dark:bg-white/5 text-slate-400'}`}>
                  <Combine className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">Batch Merging & Stitching</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">Stitch divergent pages, pamphlets, and worksheets together in bulk order with zero alignment issues.</p>
                </div>
              </button>
            </div>

            {/* Anchor back links */}
            <div className="pt-4 border-t border-slate-200/50 dark:border-white/5 hidden lg:block">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5 leading-relaxed">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Sandbox replicates the exact logic of our actual production server.</span>
              </span>
            </div>
          </div>

          {/* Right Visual interactive screen */}
          <div className="lg:col-span-7 bg-white dark:bg-[#0E1015] border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-xl relative min-h-[380px] z-10">
            {/* Fake macOS style browser window bar */}
            <div className="h-10 bg-slate-50 dark:bg-[#12151C] border-b border-slate-100 dark:border-white/5 px-4 flex items-center justify-between">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="text-[10px] font-mono font-medium text-slate-400 dark:text-slate-500 px-3 py-1 bg-slate-100 dark:bg-[#0A0B0E] rounded-md border border-slate-100 dark:border-white/5">
                pdfpro.com/sandbox/sandbox_engine
              </div>
              <div className="w-6" />
            </div>

            {/* Displaying Sandbox Render Component */}
            {renderSandboxMockup()}
          </div>

        </div>
      </div>

      {/* 4. DESIGNED FOR ENTERPRISE BENTO GRID */}
      <div className="space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border border-indigo-500/20">
            <Lock className="w-3.5 h-3.5 fill-indigo-500/20" /> enterprise specifications
          </span>
          <h2 className="font-display font-light text-3xl sm:text-5xl text-slate-900 dark:text-white tracking-tight">
            {t.bentoTitle}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {t.bentoSub}
          </p>
        </div>

        {/* Bento Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Card 1: Bank-Grade Security (Col-span 8) */}
          <div className="md:col-span-8 bg-white dark:bg-[#12151C] border border-slate-100 dark:border-white/5 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-red-500/25 transition-all">
            <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/5 dark:bg-red-500/10 rounded-full blur-3xl group-hover:bg-red-500/15 transition-all" />
            
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-2xl">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono font-bold text-red-500 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">AES-256 CERTIFIED</span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-display font-bold text-lg text-slate-800 dark:text-slate-100">Zero-Knowledge Cloud Infrastructure</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
                  We maintain an absolute zero-knowledge workflow. Your files are automatically purged from our computing node instances exactly 60 minutes after execution, meeting GDPR, HIPAA, and strict local records policies.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-slate-50 dark:border-white/5 mt-6 flex-wrap text-[10px] font-mono font-bold text-slate-400">
              <span className="bg-slate-50 dark:bg-white/5 px-2.5 py-1 rounded border border-slate-100 dark:border-white/10 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> GDPR COMPLIANT
              </span>
              <span className="bg-slate-50 dark:bg-white/5 px-2.5 py-1 rounded border border-slate-100 dark:border-white/10 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> HIPAA AUDITED
              </span>
              <span className="bg-slate-50 dark:bg-white/5 px-2.5 py-1 rounded border border-slate-100 dark:border-white/10 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> ISO 27001 SECURITIES
              </span>
            </div>
          </div>

          {/* Card 2: AI Summarizer (Col-span 4) */}
          <div className="md:col-span-4 bg-white dark:bg-[#12151C] border border-slate-100 dark:border-white/5 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-indigo-500/25 transition-all">
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/15 transition-all" />
            
            <div className="space-y-6">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 rounded-2xl w-max">
                <Sparkles className="w-6 h-6 fill-indigo-500/20" />
              </div>
              <div className="space-y-2">
                <h3 className="font-display font-bold text-lg text-slate-800 dark:text-slate-100 font-sans">AI Layout Compilers</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Leverage embedded intelligent parsers to summarize documents, build metadata tags, audit form templates, or translate legal blocks directly upon conversion.
                </p>
              </div>
            </div>

            <div className="pt-6">
              <span className="text-[10px] font-mono font-bold text-indigo-500 flex items-center gap-1 cursor-pointer hover:underline">
                Powered by Enterprise AI <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Card 3: Cloud Sync Node (Col-span 4) */}
          <div className="md:col-span-4 bg-white dark:bg-[#12151C] border border-slate-100 dark:border-white/5 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-blue-500/25 transition-all">
            <div className="absolute -top-16 -left-16 w-36 h-36 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/15 transition-all" />
            
            <div className="space-y-6">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 text-blue-500 rounded-2xl w-max">
                <Cloud className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="font-display font-bold text-lg text-slate-800 dark:text-slate-100">Integrated Cloud Vaults</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Stitch, export, or fetch files seamlessly by integrating workspace pipelines directly with Google Drive, Dropbox, and Microsoft OneDrive.
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-50 dark:border-white/5 flex gap-2.5 items-center text-xs text-slate-400">
              <span className="w-5 h-5 bg-blue-50 dark:bg-white/5 rounded flex items-center justify-center font-bold font-mono">G</span>
              <span className="w-5 h-5 bg-blue-50 dark:bg-white/5 rounded flex items-center justify-center font-bold font-mono">D</span>
              <span className="w-5 h-5 bg-blue-50 dark:bg-white/5 rounded flex items-center justify-center font-bold font-mono">O</span>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Synced Pipelines</span>
            </div>
          </div>

          {/* Card 4: Developer APIs terminal (Col-span 8) */}
          <div className="md:col-span-8 bg-slate-900 border border-slate-850 rounded-3xl p-6 md:p-8 flex flex-col lg:flex-row gap-6 justify-between items-stretch shadow-xl relative overflow-hidden group">
            <div className="space-y-4 flex-grow flex flex-col justify-between max-w-md">
              <div className="space-y-3">
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl w-max border border-emerald-500/20">
                  <Terminal className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-lg text-white font-mono">Developer API Pipeline</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Automate redundant document workflows by linking your codebase straight into our secure REST API servers. Trigger OCR parses, compress layouts, and seal signatures seamlessly.
                </p>
              </div>

              <div className="pt-4 flex gap-4 text-[10px] font-mono font-bold text-emerald-400">
                <span className="flex items-center gap-1 cursor-pointer hover:underline">
                  API Key Setup <ExternalLink className="w-3 h-3" />
                </span>
                <span className="flex items-center gap-1 cursor-pointer hover:underline">
                  Developer Documentation <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </div>

            {/* Fake CLI script render */}
            <div className="flex-shrink-0 w-full lg:w-64 bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-[9px] text-slate-300 flex flex-col justify-between">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
                <span className="text-slate-500 text-[8px] font-bold">curl -X POST</span>
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                </div>
              </div>
              <div className="space-y-1 select-all font-mono">
                <p className="text-emerald-400">curl <span className="text-slate-400">-X POST</span> \</p>
                <p>&nbsp;&nbsp;https://api.pdfpro.com/v1/ocr \</p>
                <p>&nbsp;&nbsp;-H <span className="text-amber-300">&quot;Authorization: Bearer $KEY&quot;</span> \</p>
                <p>&nbsp;&nbsp;-F <span className="text-indigo-400">file=@invoice_scan.jpg</span> \</p>
                <p>&nbsp;&nbsp;-F <span className="text-indigo-400">ai_parse=true</span></p>
              </div>
              <div className="border-t border-slate-850 pt-2 mt-4 text-[8px] text-emerald-500 font-bold font-mono">
                // Returns 99.8% precision JSON
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 5. SECTOR INDUSTRIES SOLUTIONS SECTION */}
      <div className="space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border border-amber-500/20">
            <Briefcase className="w-3.5 h-3.5" /> vertical integrations
          </span>
          <h2 className="font-display font-light text-3xl sm:text-5xl text-slate-900 dark:text-white tracking-tight">
            {t.sectorsTitle}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {t.sectorsSub}
          </p>
        </div>

        {/* Sector tab selectors */}
        <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
          {Object.entries(sectorsInfo).map(([key, sector]) => {
            const IconComponent = sector.icon;
            const isSelected = activeSector === key;
            return (
              <button
                key={key}
                onClick={() => setActiveSector(key as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-md'
                    : 'bg-white dark:bg-[#12151C]/40 border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/10'
                }`}
              >
                <IconComponent className="w-3.5 h-3.5" />
                <span>{sector.title}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Sector Showcase Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white dark:bg-[#12151C] border border-slate-100 dark:border-white/5 rounded-3xl p-6 md:p-10 shadow-sm relative overflow-hidden">
          {/* Background glowing circle */}
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-slate-500/5 rounded-full blur-2xl pointer-events-none" />

          {/* Left info panel */}
          <div className="lg:col-span-6 space-y-6 relative z-10">
            <div className="space-y-3">
              <span className="inline-block text-[10px] font-mono font-extrabold text-red-500 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                {activeSectorData.badge}
              </span>
              <h3 className="font-display font-bold text-2xl text-slate-800 dark:text-white flex items-center gap-2.5">
                {activeSectorData.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {activeSectorData.desc}
              </p>
            </div>

            {/* Checklists */}
            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
              {activeSectorData.benefits.map((benefit, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4">
              <button 
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-mono font-bold tracking-wide transition-all shadow-md shadow-red-500/15 cursor-pointer"
              >
                <span>EXECUTE WORKFLOW</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right illustration panel: Fake workspace view */}
          <div className="lg:col-span-6 border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#0E1015] rounded-2xl p-6 h-64 flex flex-col justify-between relative overflow-hidden shadow-inner">
            <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-slate-200 dark:bg-white/5 text-[8px] font-mono text-slate-500 uppercase tracking-widest">Interactive Panel</span>
            
            {/* Sector matching UI visualization */}
            {activeSector === 'hr' && (
              <div className="h-full flex flex-col justify-between py-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-2">
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">Resume_Archive_Stitch</span>
                  <span className="text-[10px] font-mono font-bold text-emerald-500">READY</span>
                </div>
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center bg-white dark:bg-[#12151C] p-2 rounded-lg border border-slate-100 dark:border-white/5">
                    <span className="text-xs font-medium dark:text-slate-300">1. offer_letter_signed.pdf</span>
                    <span className="text-[10px] font-mono text-slate-400">1.2 MB</span>
                  </div>
                  <div className="flex justify-between items-center bg-white dark:bg-[#12151C] p-2 rounded-lg border border-slate-100 dark:border-white/5">
                    <span className="text-xs font-medium dark:text-slate-300">2. identity_verify_scan.jpg</span>
                    <span className="text-[10px] font-mono text-slate-400">4.5 MB</span>
                  </div>
                </div>
                <div className="flex justify-end gap-2 text-[10px] font-mono font-bold">
                  <span className="px-2 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded">COMPILED: 5.7 MB</span>
                </div>
              </div>
            )}

            {activeSector === 'legal' && (
              <div className="h-full flex flex-col justify-between py-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-2">
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">Bates_Stamp_Attestation</span>
                  <span className="text-[10px] font-mono font-bold text-amber-500">PENDING AUDIT</span>
                </div>
                <div className="border border-slate-200 dark:border-white/10 p-3 rounded-lg bg-white dark:bg-[#12151C] text-center space-y-2">
                  <span className="inline-block px-1.5 py-0.5 bg-slate-900 text-white text-[9px] rounded font-mono">BATES RANGES</span>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">ATT-2026-0001 To ATT-2026-0849</p>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono font-bold">
                  <span className="text-slate-400">AES-256 Enabled</span>
                  <span className="px-2.5 py-1 bg-emerald-500 text-white rounded">STAMP STACK</span>
                </div>
              </div>
            )}

            {activeSector === 'finance' && (
              <div className="h-full flex flex-col justify-between py-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-2">
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">Quarterly_Tax_Parse</span>
                  <span className="text-[10px] font-mono font-bold text-emerald-500">OCR DONE</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs text-slate-500 font-mono">
                    <span>Tax Forms Extracted:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">14 Invoices</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-500 font-mono">
                    <span>Ledger Reconciliation:</span>
                    <span className="font-bold text-emerald-500">99.94% Confirmed</span>
                  </div>
                </div>
                <div className="flex justify-end gap-2 text-[10px] font-mono font-bold">
                  <span className="px-2 py-1 bg-slate-100 dark:bg-white/5 rounded text-slate-400">EXPORT TO EXCEL</span>
                </div>
              </div>
            )}

            {activeSector === 'realestate' && (
              <div className="h-full flex flex-col justify-between py-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-2">
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">Lease_Closing_Pack</span>
                  <span className="text-[10px] font-mono font-bold text-red-500">SIGNING</span>
                </div>
                <div className="text-center py-4 text-xs font-medium text-slate-500">
                  <span className="text-red-500 font-bold">Waiting on Buyers Signature</span>
                  <div className="flex justify-center gap-1.5 mt-2">
                    <span className="w-5 h-5 rounded-full bg-slate-300 border border-white flex items-center justify-center text-[8px] font-bold text-slate-700">TL</span>
                    <span className="w-5 h-5 rounded-full bg-slate-300 border border-white flex items-center justify-center text-[8px] font-bold text-slate-700">AB</span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono font-bold">
                  <span className="text-slate-400">3 Verified Parties</span>
                  <span className="px-2 py-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded">SEND REMINDER</span>
                </div>
              </div>
            )}

            {activeSector === 'healthcare' && (
              <div className="h-full flex flex-col justify-between py-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-2">
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">PHR_Clinical_Archive</span>
                  <span className="text-[10px] font-mono font-bold text-emerald-500">ENCRYPTED</span>
                </div>
                <div className="p-3 bg-slate-100 dark:bg-[#12151C]/50 rounded-lg border border-dashed border-slate-200 dark:border-white/5 text-center text-[11px] text-slate-500 leading-relaxed">
                  Patient record identifiers automatically obfuscated using local OCR sandboxes.
                </div>
                <div className="flex justify-end text-[10px] font-mono font-bold">
                  <span className="px-2 py-1 bg-emerald-500 text-white rounded">LOCK PORTFOLIO</span>
                </div>
              </div>
            )}

            {activeSector === 'sales' && (
              <div className="h-full flex flex-col justify-between py-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-2">
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">RFP_Sales_Quote</span>
                  <span className="text-[10px] font-mono font-bold text-emerald-500">READY</span>
                </div>
                <div className="space-y-2 text-xs text-slate-500 font-mono">
                  <div className="flex justify-between">
                    <span>Watermark Stamp:</span>
                    <span className="text-indigo-500 font-bold">BRANDED LOGO</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Contract Pack Size:</span>
                    <span className="text-slate-700 dark:text-slate-200">1.4 MB (Compressed)</span>
                  </div>
                </div>
                <div className="flex justify-end gap-2 text-[10px] font-mono font-bold">
                  <span className="px-2 py-1 bg-red-500 text-white rounded">DELIVER TO CLIENT</span>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* 6. GLOBAL IMPACT STATS DISPLAY */}
      <div className="bg-slate-900 text-white rounded-[2rem] p-8 md:p-12 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left: Interactive Real-time ticker card */}
          <div className="lg:col-span-5 bg-black/40 backdrop-blur-md border border-white/5 p-6 md:p-8 rounded-3xl space-y-4">
            <span className="inline-flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Live global statistics
            </span>
            <div className="space-y-1">
              <span className="block text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">{t.counterLabel}</span>
              <h3 className={`text-3xl sm:text-4xl font-extrabold font-mono tracking-tight transition-all duration-300 ${flashCounter ? 'text-emerald-400' : 'text-white'}`}>
                {conversionCount.toLocaleString()}
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our servers dynamically process client data logs locally and perform instantaneous conversions securely. File sizes are computed and cleared safely.
            </p>
          </div>

          {/* Right: Big grid statistics */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            <div className="space-y-2 text-left">
              <h4 className="text-3xl sm:text-4xl font-light tracking-tight text-white">30M+</h4>
              <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Active Users Globally</p>
            </div>

            <div className="space-y-2 text-left">
              <h4 className="text-3xl sm:text-4xl font-light tracking-tight text-white">99.9%</h4>
              <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">{t.uptimeLabel}</p>
            </div>

            <div className="space-y-2 text-left">
              <h4 className="text-3xl sm:text-4xl font-light tracking-tight text-white">20K+</h4>
              <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Backed Corporations</p>
            </div>

            <div className="space-y-2 text-left">
              <h4 className="text-3xl sm:text-4xl font-light tracking-tight text-white">50M</h4>
              <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">{t.paperLabel}</p>
            </div>

            <div className="space-y-2 text-left">
              <h4 className="text-3xl sm:text-4xl font-light tracking-tight text-white">100%</h4>
              <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">SSL Secure Sandboxes</p>
            </div>

            <div className="space-y-2 text-left">
              <h4 className="text-3xl sm:text-4xl font-light tracking-tight text-white">&lt; 3s</h4>
              <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Avg Processing Time</p>
            </div>
          </div>

        </div>
      </div>

      {/* 7. CUSTOMER TESTIMONIAL BUBBLE */}
      <div className="max-w-4xl mx-auto bg-amber-500/5 border border-amber-500/10 rounded-3xl p-6 md:p-10 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-2 h-full bg-amber-500" />
        
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          <div className="shrink-0">
            {/* Elegant avatar mock */}
            <div className="w-16 h-16 rounded-full bg-slate-200 border-2 border-amber-500 flex items-center justify-center font-serif text-lg font-bold text-slate-700">
              TL
            </div>
          </div>
          
          <div className="space-y-4 text-left">
            <blockquote className="text-sm md:text-base italic text-slate-700 dark:text-slate-300 leading-relaxed font-serif">
              &quot;PDF Pro has revolutionized our document management workflow. The seamless conversion, compression, and editing tools have saved us countless hours, and the intuitive interface makes it easy for everyone on our team to use. We can now handle all our document needs in one place, improving our workflow efficiency significantly. Highly recommended!&quot;
            </blockquote>
            
            <div className="flex items-center justify-between">
              <div>
                <cite className="not-italic font-bold text-xs text-slate-800 dark:text-white uppercase tracking-wider font-mono">Tristan Lecrivain</cite>
                <span className="block text-[10px] text-slate-400 font-mono mt-0.5">Head of Regional Sales at Saab</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-amber-500">★★★★★ Rated 5/5</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
