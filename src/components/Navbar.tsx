import { useState } from 'react';
import { Moon, Sun, ShieldAlert, Sparkles, LogIn, LogOut, History, FileText, User, LayoutGrid, ChevronDown, ChevronRight, Search } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { TOOLS, IconMapper } from './ToolsGrid';
import { ToolType } from '../types';

interface NavbarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onReset: () => void;
  currentUser: FirebaseUser | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
  showHistory: boolean;
  onToggleHistory: (show: boolean) => void;
  onOpenPortal: () => void;
  onSelectTool: (toolId: ToolType) => void;
}

export default function Navbar({ 
  darkMode, 
  onToggleDarkMode, 
  onReset,
  currentUser,
  onOpenAuth,
  onSignOut,
  showHistory,
  onToggleHistory,
  onOpenPortal,
  onSelectTool
}: NavbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const userInitials = currentUser?.displayName
    ? currentUser.displayName.slice(0, 2).toUpperCase()
    : currentUser?.email?.slice(0, 2).toUpperCase() || 'U';

  const handleLogoClick = () => {
    onToggleHistory(false);
    onReset();
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#0D0F14]/90 backdrop-blur-md border-b border-slate-100 dark:border-white/5 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div 
              onClick={handleLogoClick}
              className="flex items-center space-x-2 cursor-pointer group"
            >
              <div className="bg-red-600 dark:bg-red-500 px-2 py-1 rounded-md text-white font-sans text-[11px] font-black uppercase tracking-wider group-hover:scale-105 transition-transform shadow-md">
                PRO
              </div>
              <span className="font-display font-black text-lg tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                PDF PRO
                <span className="text-[9px] uppercase tracking-wider font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 dark:border-red-500/30 px-2 py-0.5 rounded flex items-center gap-0.5 font-mono">
                  <Sparkles className="w-2.5 h-2.5 fill-current text-red-500" /> AI POWERED
                </span>
              </span>
            </div>

            {/* Quick Links */}
            <div className="hidden md:flex items-center space-x-6 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {/* All Tools Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => {
                  setIsDropdownOpen(false);
                  setSearchQuery('');
                }}
              >
                <button 
                  onClick={handleLogoClick}
                  className={`hover:text-slate-800 dark:hover:text-white cursor-pointer transition-colors flex items-center gap-1 py-3 ${
                    isDropdownOpen || !showHistory ? 'text-red-500 dark:text-red-400 font-bold' : ''
                  }`}
                >
                  <span>All Tools</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-red-500' : 'text-slate-400'}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 mt-0 w-[640px] bg-white dark:bg-[#11131B] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-slate-700 dark:text-slate-300 normal-case tracking-normal">
                    {/* Search box inside dropdown */}
                    <div className="relative mb-4 pb-3 border-b border-slate-100 dark:border-white/5 flex items-center justify-between gap-3">
                      <div className="relative flex-grow">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input 
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search e.g. 'Word', 'Excel', 'Compress'..."
                          className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-[#0A0B0E] border border-slate-200 dark:border-white/5 rounded-xl text-xs font-medium outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/15 text-slate-800 dark:text-white"
                          onClick={(e) => e.stopPropagation()}
                        />
                        {searchQuery && (
                          <button 
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2.5 top-2.5 text-[9px] font-mono uppercase bg-slate-100 dark:bg-white/10 px-1 rounded hover:text-red-500 cursor-pointer text-slate-400"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 shrink-0">
                        ⚡ Direct Choose
                      </span>
                    </div>

                    {/* Content area based on search query */}
                    {searchQuery ? (
                      <div className="max-h-[360px] overflow-y-auto pr-1">
                        <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-2 font-mono px-1">
                          Search Results ({TOOLS.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.description.toLowerCase().includes(searchQuery.toLowerCase())).length})
                        </div>
                        {TOOLS.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.description.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
                          <div className="grid grid-cols-2 gap-2">
                            {TOOLS.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.description.toLowerCase().includes(searchQuery.toLowerCase())).map(tool => {
                              const IconComponent = IconMapper[tool.iconName] || FileText;
                              const extIn = tool.allowedInputTypes[0]?.replace('.', '').toUpperCase();
                              const extOut = tool.outputType?.replace('.', '').toUpperCase();
                              return (
                                <div 
                                  key={tool.id}
                                  onClick={() => {
                                    onSelectTool(tool.id);
                                    setIsDropdownOpen(false);
                                    setSearchQuery('');
                                  }}
                                  className="group/item flex items-center justify-between p-2.5 bg-slate-50 hover:bg-red-500/5 dark:bg-[#181A25] dark:hover:bg-red-500/[0.03] border border-transparent hover:border-red-500/30 rounded-xl transition-all cursor-pointer"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm ${tool.colorClass}`}>
                                      <IconComponent className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="truncate text-left">
                                      <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 group-hover/item:text-red-500 dark:group-hover/item:text-red-400 transition-colors truncate">
                                        {tool.title}
                                      </span>
                                      <span className="block text-[9px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                                        {tool.description}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0 pl-1">
                                    {extIn && extOut && (
                                      <span className="text-[8px] font-mono px-1 bg-white dark:bg-black/20 text-slate-400 border border-slate-200/20 rounded">
                                        {extIn}➔{extOut}
                                      </span>
                                    )}
                                    <ChevronRight className="w-3 h-3 text-slate-300 group-hover/item:text-red-500 group-hover/item:translate-x-0.5 transition-all" />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="py-6 text-center text-slate-400 text-xs">
                            No matching tools found. Try another search query!
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-4 max-h-[380px] overflow-y-auto pr-1">
                        {/* COLUMN 1: CONVERT TO PDF */}
                        <div className="space-y-3">
                          <div className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-600 dark:text-emerald-400 font-mono border-b border-emerald-500/10 pb-1 flex items-center gap-1">
                            <span>📥</span> Convert TO PDF
                          </div>
                          <div className="space-y-1.5">
                            {TOOLS.filter(t => t.category === 'convert-to').map(tool => {
                              const IconComponent = IconMapper[tool.iconName] || FileText;
                              return (
                                <div 
                                  key={tool.id}
                                  onClick={() => {
                                    onSelectTool(tool.id);
                                    setIsDropdownOpen(false);
                                  }}
                                  className="group/item flex items-center justify-between p-2 bg-slate-50/60 hover:bg-red-500/5 dark:bg-[#151720] dark:hover:bg-red-500/[0.03] border border-transparent hover:border-red-500/20 rounded-xl transition-all cursor-pointer"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div className={`w-6.5 h-6.5 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs ${tool.colorClass}`}>
                                      <IconComponent className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 group-hover/item:text-red-500 dark:group-hover/item:text-red-400 truncate">
                                      {tool.title}
                                    </span>
                                  </div>
                                  <ChevronRight className="w-3 h-3 text-slate-300 group-hover/item:text-red-500 group-hover/item:translate-x-0.5 transition-all shrink-0" />
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* COLUMN 2: CONVERT FROM PDF */}
                        <div className="space-y-3">
                          <div className="text-[10px] uppercase tracking-wider font-extrabold text-blue-600 dark:text-blue-400 font-mono border-b border-blue-500/10 pb-1 flex items-center gap-1">
                            <span>📤</span> Convert FROM PDF
                          </div>
                          <div className="space-y-1.5">
                            {TOOLS.filter(t => t.category === 'convert-from').map(tool => {
                              const IconComponent = IconMapper[tool.iconName] || FileText;
                              return (
                                <div 
                                  key={tool.id}
                                  onClick={() => {
                                    onSelectTool(tool.id);
                                    setIsDropdownOpen(false);
                                  }}
                                  className="group/item flex items-center justify-between p-2 bg-slate-50/60 hover:bg-red-500/5 dark:bg-[#151720] dark:hover:bg-red-500/[0.03] border border-transparent hover:border-red-500/20 rounded-xl transition-all cursor-pointer"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div className={`w-6.5 h-6.5 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs ${tool.colorClass}`}>
                                      <IconComponent className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 group-hover/item:text-red-500 dark:group-hover/item:text-red-400 truncate">
                                      {tool.title}
                                    </span>
                                  </div>
                                  <ChevronRight className="w-3 h-3 text-slate-300 group-hover/item:text-red-500 group-hover/item:translate-x-0.5 transition-all shrink-0" />
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* COLUMN 3: ORGANIZE & SECURITY */}
                        <div className="space-y-3">
                          <div className="text-[10px] uppercase tracking-wider font-extrabold text-purple-600 dark:text-purple-400 font-mono border-b border-purple-500/10 pb-1 flex items-center gap-1">
                            <span>⚙️</span> Edit, Secure & AI
                          </div>
                          <div className="space-y-1.5">
                            {TOOLS.filter(t => !['convert-to', 'convert-from'].includes(t.category)).map(tool => {
                              const IconComponent = IconMapper[tool.iconName] || FileText;
                              return (
                                <div 
                                  key={tool.id}
                                  onClick={() => {
                                    onSelectTool(tool.id);
                                    setIsDropdownOpen(false);
                                  }}
                                  className="group/item flex items-center justify-between p-2 bg-slate-50/60 hover:bg-red-500/5 dark:bg-[#151720] dark:hover:bg-red-500/[0.03] border border-transparent hover:border-red-500/20 rounded-xl transition-all cursor-pointer"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div className={`w-6.5 h-6.5 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs ${tool.colorClass}`}>
                                      <IconComponent className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 group-hover/item:text-red-500 dark:group-hover/item:text-red-400 truncate">
                                      {tool.title}
                                    </span>
                                  </div>
                                  <ChevronRight className="w-3 h-3 text-slate-300 group-hover/item:text-red-500 group-hover/item:translate-x-0.5 transition-all shrink-0" />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {currentUser && (
                <span 
                  onClick={() => onToggleHistory(true)} 
                  className={`hover:text-slate-800 dark:hover:text-white cursor-pointer transition-colors flex items-center gap-1.5 ${showHistory ? 'text-red-500 dark:text-red-400 font-bold' : ''}`}
                >
                  <History className="w-3.5 h-3.5" />
                  My History
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="hidden lg:flex items-center space-x-1 text-xs text-slate-400 dark:text-slate-500 border-r border-slate-200 dark:border-white/5 pr-4 mr-1">
              <ShieldAlert className="w-4 h-4 text-emerald-500 mr-1" />
              <span>Auto-deleted in 1h</span>
            </div>

            {/* Navigation / History for mobile */}
            {currentUser && (
              <button
                onClick={() => onToggleHistory(!showHistory)}
                className={`md:hidden p-2.5 rounded-xl border transition-all cursor-pointer ${
                  showHistory 
                    ? 'bg-red-500/10 border-red-500/30 text-red-500 dark:text-red-400' 
                    : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#12151C]'
                }`}
                title="View Conversion History"
              >
                <History className="w-5 h-5" />
              </button>
            )}

            {/* Dark Mode Button */}
            <button
              onClick={onToggleDarkMode}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#12151C] transition-all cursor-pointer shadow-sm"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-500" />
              )}
            </button>

            {/* 9 Square Dot Launcher Button */}
            <button
              onClick={onOpenPortal}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#12151C] transition-all cursor-pointer shadow-sm"
              title="Languages, Q&A & Support"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>

            {/* User Account / Sign In */}
            {currentUser ? (
              <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-slate-200 dark:border-white/5">
                <div 
                  className="hidden sm:flex flex-col items-end text-right text-xs"
                  title={currentUser.email || ''}
                >
                  <span className="font-bold text-slate-800 dark:text-slate-100 max-w-[120px] truncate">
                    {currentUser.displayName || 'User'}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate max-w-[120px]">
                    {currentUser.email}
                  </span>
                </div>

                {/* Profile Circle Avatar */}
                <div 
                  onClick={() => onToggleHistory(true)}
                  className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-white/5 dark:to-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-center font-display font-black text-xs text-slate-600 dark:text-slate-300 cursor-pointer shadow-sm hover:border-red-500/35 transition-colors"
                  title="My History & Profile"
                >
                  {userInitials}
                </div>

                {/* Sign Out Icon Button */}
                <button
                  onClick={onSignOut}
                  className="p-2.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-xl transition-all cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5"
                  title="Sign Out"
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer font-sans"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
