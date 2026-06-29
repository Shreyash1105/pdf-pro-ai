import { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  User, 
  MessageSquare, 
  Bot, 
  Trash2, 
  FileText, 
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { FileItem } from '../types';

interface AIChatToolProps {
  fileItem: FileItem;
  onReset: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export default function AIChatTool({ fileItem, onReset }: AIChatToolProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: `Hello! I have loaded "${fileItem.name}" into my secure AI context. Ask me anything about this document! I can summarize clauses, find specific details, translate sections, or explain complex ideas.`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    "Summarize this document in 3 sentences.",
    "Are there any security risks or clauses I should know about?",
    "Find the main contact information or author of this file."
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isSending) return;

    if (!textToSend) setInput('');

    const userMsg: Message = {
      id: Math.random().toString(36).substring(2, 9),
      sender: 'user',
      text: query,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsSending(true);

    // Prepare FormData for the AI Chat endpoint
    const formData = new FormData();
    formData.append('file', fileItem.file);
    formData.append('message', query);

    try {
      const response = await fetch('/api/convert/ai-chat', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Could not get answer from the server.');
      }

      const data = await response.json();
      
      const botMsg: Message = {
        id: Math.random().toString(36).substring(2, 9),
        sender: 'bot',
        text: data.reply || 'Sorry, I couldn\'t find a valid response inside the document.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: Math.random().toString(36).substring(2, 9),
        sender: 'bot',
        text: `⚠️ Error: ${err.message || 'The server returned an unexpected error. Please try again.'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'bot',
        text: `Chat context cleared. I'm ready for another question about "${fileItem.name}"!`,
        timestamp: new Date()
      }
    ]);
  };

  return (
    <div className="flex flex-col h-[550px] bg-white dark:bg-[#12151C] border border-slate-100 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
      {/* Chat header */}
      <div className="px-5 py-4 bg-slate-50 dark:bg-[#161920]/60 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-display font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-1.5">
              Interactive AI Assistant
              <span className="text-[10px] font-mono uppercase bg-indigo-500/10 text-indigo-500 px-1.5 py-0.5 rounded">Active</span>
            </h4>
            <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 truncate max-w-xs md:max-w-md">
              {fileItem.name} ({Math.round(fileItem.size / 1024)} KB)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={clearChat}
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-[#161920] rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
            title="Clear Chat History"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onReset}
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-[#161920] rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
            title="Upload Different Document"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3.5 max-w-[85%] ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                msg.sender === 'user'
                  ? 'bg-rose-500 text-white border-rose-600'
                  : 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
              }`}
            >
              {msg.sender === 'user' ? (
                <User className="w-4 h-4" />
              ) : (
                <Bot className="w-4 h-4 text-indigo-500" />
              )}
            </div>

            <div
              className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-rose-500 text-white font-medium rounded-tr-none'
                  : 'bg-slate-50 dark:bg-[#161920]/60 border border-slate-100 dark:border-white/5 text-slate-700 dark:text-slate-200 rounded-tl-none font-sans'
              }`}
            >
              {msg.text}
              <div className="text-[9px] mt-1.5 text-right opacity-60 font-mono">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {isSending && (
          <div className="flex items-start gap-3.5 max-w-[85%] animate-pulse">
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 bg-slate-50 dark:bg-[#161920]/60 border border-slate-100 dark:border-white/5 rounded-2xl rounded-tl-none">
              <div className="flex space-x-1.5 py-1">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggested Prompts panel */}
      {messages.length === 1 && (
        <div className="px-5 py-3.5 border-t border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-[#0E1117]/40">
          <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1 mb-2">
            <HelpCircle className="w-3.5 h-3.5" /> Suggested Prompts
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="text-xs text-left bg-white dark:bg-[#161920]/80 hover:bg-slate-50 dark:hover:bg-[#1b1f28] text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-white/5 px-3 py-1.5 rounded-xl transition-all cursor-pointer font-sans shadow-sm"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input controls */}
      <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-[#0A0B0E]/20">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isSending}
            placeholder="Type your question about this document here..."
            className="flex-1 px-4 py-3 border border-slate-200 dark:border-white/10 bg-white dark:bg-[#12151C] text-slate-800 dark:text-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-sans"
          />
          <button
            type="submit"
            disabled={!input.trim() || isSending}
            className="px-4 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-200 disabled:dark:bg-[#161920] disabled:text-slate-400 text-white rounded-xl transition-all flex items-center justify-center cursor-pointer shadow-sm shadow-indigo-500/10 hover:shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
