import { Shield, Lock, EyeOff, CheckCircle } from 'lucide-react';

interface FooterProps {
  onOpenLegal: (tab: 'privacy' | 'terms' | 'security') => void;
}

export default function Footer({ onOpenLegal }: FooterProps) {
  return (
    <footer className="border-t border-slate-100 dark:border-white/5 bg-white dark:bg-[#0D0F14] py-12 px-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Trust Badge Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10 border-b border-slate-100 dark:border-white/5 pb-10">
          <div className="flex items-start space-x-3.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Secure Processing</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">End-to-end encrypted connection and sandboxed conversions.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="p-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Auto-Delete in 1 Hour</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Files are permanently shredded from our disks automatically.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg shrink-0">
              <EyeOff className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Strictly Private</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">We never inspect or share your files. Completely safe.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">100% Free & Unlimited</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Free batch conversions with no page caps or paywalls.</p>
            </div>
          </div>
        </div>

        {/* Footer bottom links and trust signals */}
        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-slate-400 dark:text-slate-500 space-y-4 md:space-y-0">
          <p>© 2026 PDF Pro. All conversions run locally on high-security serverless nodes.</p>
          <div className="flex space-x-6 font-medium">
            <button 
              onClick={() => onOpenLegal('privacy')} 
              className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer bg-transparent border-none p-0 font-medium"
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => onOpenLegal('terms')} 
              className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer bg-transparent border-none p-0 font-medium"
            >
              Terms of Service
            </button>
            <button 
              onClick={() => onOpenLegal('security')} 
              className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer bg-transparent border-none p-0 font-medium"
            >
              Security Audit
            </button>
          </div>
        </div>

        {/* Design Theme Indicators Bar */}
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 py-6 border-t border-slate-100 dark:border-white/5 text-[10px] sm:text-[11px] font-semibold tracking-wide uppercase text-slate-400 dark:text-slate-500 font-mono mt-10">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span>Files deleted after 1 hour</span>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-red-500" />
            <span>AES-256 Bit Encryption</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-blue-500" />
            <span>Real-time Processing</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="italic">Total Pros: 12.4M</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
