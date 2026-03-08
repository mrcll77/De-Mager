import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Book, 
  Send, 
  User, 
  Bot, 
  Eye, 
  Accessibility, 
  Clock, 
  Zap,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { ChatMessage } from '../types';
import { getHealthConsultantResponse } from '../services/geminiService';

interface KnowledgeHubProps {
  chatHistory: ChatMessage[];
  onSendMessage: (text: string) => void;
  onReceiveMessage: (text: string) => void;
}

const EDUCATIONAL_CONTENT = [
  {
    title: "Postur Tubuh Saat Belajar",
    description: "Duduk tegak, bahu rileks, dan layar sejajar mata. Jangan membungkuk ya!",
    icon: <Accessibility className="w-5 h-5 text-blue-400" />,
    color: "border-blue-500/30 bg-blue-500/5"
  },
  {
    title: "Atasi Mata Lelah (Eye Strain)",
    description: "Gunakan aturan 20-20-20: Setiap 20 menit, lihat benda sejauh 20 kaki selama 20 detik.",
    icon: <Eye className="w-5 h-5 text-emerald-400" />,
    color: "border-emerald-500/30 bg-emerald-500/5"
  },
  {
    title: "Pentingnya Micro-breaks",
    description: "Bergeraklah setiap 30 menit. Cukup jalan kaki ringan atau peregangan singkat.",
    icon: <Clock className="w-5 h-5 text-orange-400" />,
    color: "border-orange-500/30 bg-orange-500/5"
  },
  {
    title: "Kesehatan Remaja & Aktivitas",
    description: "Riset menunjukkan aktif bergerak meningkatkan fokus belajar dan mood kamu!",
    icon: <Zap className="w-5 h-5 text-indigo-400" />,
    color: "border-indigo-500/30 bg-indigo-500/5"
  }
];

export const KnowledgeHub: React.FC<KnowledgeHubProps> = ({ chatHistory, onSendMessage, onReceiveMessage }) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userQuery = input.trim();
    setInput('');
    onSendMessage(userQuery);
    setIsTyping(true);

    // Format history for Gemini
    const history = chatHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' as const : 'model' as const,
      parts: [{ text: msg.text }]
    }));

    const response = await getHealthConsultantResponse(userQuery, history);
    onReceiveMessage(response);
    setIsTyping(false);
  };

  return (
    <div className="min-h-full flex flex-col lg:flex-row gap-6 p-4 sm:p-6 lg:h-full lg:overflow-hidden no-scrollbar">
      {/* Education Section */}
      <div className="lg:flex-1 flex flex-col gap-6 lg:overflow-y-auto no-scrollbar pr-2">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center border border-indigo-500/30">
            <Book className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Knowledge Hub</h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Edukasi & Tips Kesehatan</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {EDUCATIONAL_CONTENT.map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-5 rounded-3xl border ${item.color} group hover:scale-[1.02] transition-all cursor-default`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                  {item.icon}
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-tight">{item.title}</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Latest News / Research Placeholder */}
        <div className="mt-4 p-6 glass rounded-[2.5rem] border border-white/5 bg-slate-900/40">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Riset Terbaru</h4>
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-3 hover:bg-white/5 rounded-2xl transition-all cursor-pointer group">
              <div className="w-12 h-12 bg-slate-800 rounded-xl shrink-0 flex items-center justify-center text-xl">🧠</div>
              <div>
                <h5 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">Dampak Duduk Terlalu Lama pada Otak Remaja</h5>
                <p className="text-[10px] text-slate-500 mt-1">Studi menunjukkan aktivitas fisik singkat meningkatkan volume hipokampus...</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 ml-auto self-center" />
            </div>
            <div className="flex items-start gap-4 p-3 hover:bg-white/5 rounded-2xl transition-all cursor-pointer group">
              <div className="w-12 h-12 bg-slate-800 rounded-xl shrink-0 flex items-center justify-center text-xl">🥗</div>
              <div>
                <h5 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">Nutrisi untuk Fokus Belajar Maksimal</h5>
                <p className="text-[10px] text-slate-500 mt-1">Konsumsi Omega-3 dan hidrasi cukup kunci utama performa kognitif...</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 ml-auto self-center" />
            </div>
          </div>
        </div>
      </div>

      {/* Chatbot Section */}
      <div className="lg:flex-1 min-h-[600px] lg:min-h-0 flex flex-col glass rounded-[3rem] border border-white/5 bg-slate-900/60 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center gap-4 bg-indigo-600/5">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-900/40">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-tighter text-white">Anti-Sedentary AI</h3>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Health Consultant</p>
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar"
        >
          {chatHistory.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 opacity-20">
                <Sparkles className="w-8 h-8 text-indigo-400" />
              </div>
              <p className="text-sm font-bold text-slate-500 italic">
                "Halo! Aku konsultan kesehatanmu. Tanya apa saja tentang cara tetap aktif saat belajar!"
              </p>
            </div>
          )}
          {chatHistory.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user' ? 'bg-indigo-600' : 'bg-slate-800 border border-white/10'
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-indigo-400" />}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-900/20' 
                    : 'bg-slate-800/80 text-slate-200 border border-white/5 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="bg-slate-800/80 p-4 rounded-2xl rounded-tl-none border border-white/5 flex gap-1">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-white/5 bg-slate-900/40">
          <div className="relative flex items-center gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Tanya tentang kesehatan..."
              className="flex-1 bg-slate-800/50 border border-white/10 rounded-2xl py-4 pl-5 pr-14 outline-none focus:border-indigo-500 transition-all text-sm text-white"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="absolute right-2 w-10 h-10 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 rounded-xl flex items-center justify-center transition-all text-white"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
