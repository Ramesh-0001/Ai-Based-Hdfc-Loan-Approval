import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Bot, Minimize2, Sparkles, User, Cpu, Zap, Activity, Clock, X, RefreshCcw } from 'lucide-react';

const AIChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chat, setChat] = useState([
    { role: 'bot', text: "Welcome to the HDFC digital concierge. I am your institutional support node. How may I assist your credit journey today?", timestamp: new Date() }
  ]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [chat, isOpen, isTyping]);

  const handleSend = (e) => {
    if (e) e.preventDefault();
    if (!message.trim()) return;

    const newChat = [...chat, { role: 'user', text: message, timestamp: new Date() }];
    setChat(newChat);
    const userMsg = message.toLowerCase();
    setMessage('');
    setIsTyping(true);

    // Simulated responses
    setTimeout(() => {
      setIsTyping(false);
      let botResponse = "I'm analyzing your request against our current institutional lending parameters.";
      if (userMsg.includes('status')) botResponse = "Your application node is currently under manual audit by our underwriting pool. Expected resolution within 4 institutional cycles.";
      if (userMsg.includes('emi')) botResponse = "Our EMI modeler hub can assist with repayment simulations. Based on your current profiling, you're pre-approved for up to ₹15 Lac.";
      if (userMsg.includes('interest')) botResponse = "Institutional prime rates for high-stability profiles start at 8.25% p.a. as per current market indexing.";
      
      setChat(prev => [...prev, { role: 'bot', text: botResponse, timestamp: new Date() }]);
    }, 1200);
  };

  return (
    <>
      {/* Floating Trigger */}
      <div className="fixed bottom-10 right-10 z-[100]">
          <button
            onClick={() => setIsOpen(true)}
            className={`w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-2xl shadow-xl hover:shadow-blue-500/25 transition-all duration-500 hover:scale-110 active:scale-90 group relative overflow-hidden ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <MessageSquare size={26} className="relative z-10 transition-transform group-hover:rotate-12" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
            <div className="absolute inset-0 bg-blue-400 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity animate-pulse"></div>
          </button>
      </div>

      {/* Modern Chat Window */}
      <div className={`fixed bottom-10 right-10 w-[420px] h-[680px] flex flex-col bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/40 overflow-hidden transition-all duration-500 z-[110] origin-bottom-right ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-[0.8] opacity-0 pointer-events-none translate-y-20'}`}>
        
        {/* Header Section */}
        <div className="p-7 bg-gradient-to-r from-slate-900 to-blue-900 text-white relative">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl -mr-16 -mt-16 animate-pulse"></div>
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner group transition-all duration-500 hover:rotate-[360deg]">
                <Bot size={24} className="text-blue-100" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col">
                <h3 className="text-sm font-semibold tracking-wide flex items-center gap-2">
                  Institutional Concierge
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]"></span>
                </h3>
                <p className="text-[10px] text-blue-200/60 font-medium tracking-tight uppercase">Bank Neural Interface V4.8</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-2.5 hover:bg-white/10 rounded-xl transition-all text-blue-200/80 hover:text-white"
              >
                <Minimize2 size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Messaging Area */}
        <div className="flex-1 overflow-y-auto p-7 space-y-6 scrollbar-hide bg-slate-50/50">
          {chat.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[85%]`}>
                {msg.role === 'bot' && (
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">AI Assistant</span>
                )}
                <div className={`p-4 rounded-[1.25rem] text-[13.5px] leading-relaxed shadow-sm transition-all hover:shadow-md ${
                  msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                }`}>
                  <p className="font-medium antialiased">{msg.text}</p>
                </div>
                <div className="mt-2 flex items-center gap-1.5 px-1">
                    <span className="text-[8px] font-bold text-gray-300 uppercase tracking-tighter">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {msg.role === 'bot' && <Sparkles size={10} className="text-blue-200" />}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Interaction Bar */}
        <div className="p-7 bg-white border-t border-slate-100 relative group/input">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/10 to-transparent"></div>
          
          <form onSubmit={handleSend} className="relative z-10">
            <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors">
                  <Activity size={18} />
                </div>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Inquire institutional data..."
                    className="w-full pl-12 pr-14 py-4.5 bg-slate-50 border border-transparent rounded-[1.5rem] text-sm font-medium outline-none focus:bg-white focus:border-blue-100/50 focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-slate-300 shadow-inner"
                />
                <button
                    type="submit"
                    disabled={!message.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 bg-blue-600 text-white rounded-2xl flex items-center justify-center hover:bg-blue-700 transition-all shadow-md active:scale-90 disabled:opacity-0 disabled:scale-90 duration-300"
                >
                    <Send size={18} />
                </button>
            </div>
          </form>
          
          <div className="mt-6 flex items-center justify-between px-2">
            <div className="flex items-center gap-4 text-[9px] font-bold text-gray-300 tracking-widest uppercase">
              <span className="flex items-center"><Cpu size={10} className="mr-1.5 opacity-40" /> Unit 4.8</span>
              <span className="flex items-center"><Zap size={10} className="mr-1.5 opacity-40" /> L2 Secured</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-[9px] font-bold text-blue-600/30 uppercase tracking-widest italic">Institutional AI</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIChatAssistant;
