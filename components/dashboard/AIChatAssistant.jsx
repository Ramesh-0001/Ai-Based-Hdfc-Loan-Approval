import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Bot, Minimize2, Sparkles, User, Cpu, Zap, Activity, Clock } from 'lucide-react';

const AIChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([
    { role: 'bot', text: "Welcome to the HDFC digital concierge. I am your institutional support node. How may I assist your credit journey today?", timestamp: new Date() }
  ]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat, isOpen]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newChat = [...chat, { role: 'user', text: message, timestamp: new Date() }];
    setChat(newChat);
    const userMsg = message.toLowerCase();
    setMessage('');

    // Simulated responses
    setTimeout(() => {
      let botResponse = "I'm analyzing your request against our current institutional lending parameters.";
      if (userMsg.includes('status')) botResponse = "Your application node is currently under manual audit by our underwriting pool. Expected resolution within 4 institutional cycles.";
      if (userMsg.includes('emi')) botResponse = "Our EMI modeler hub can assist with repayment simulations. Based on your current profiling, you're pre-approved for up to ₹15 Lac.";
      if (userMsg.includes('interest')) botResponse = "Institutional prime rates for high-stability profiles start at 8.25% p.a. as per current market indexing.";
      
      setChat(prev => [...prev, { role: 'bot', text: botResponse, timestamp: new Date() }]);
    }, 1000);
  };

  return (
    <>
      {/* Floating Trigger */}
      <div className="fixed bottom-10 right-10 z-[100]">
          <button
            onClick={() => setIsOpen(true)}
            className={`w-16 h-16 bg-blue-600 text-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] flex items-center justify-center transition-all duration-700 hover:scale-110 active:scale-90 group relative overflow-hidden ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
          >
            <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            <MessageSquare size={28} className="relative z-10 transition-transform group-hover:rotate-12" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]"></div>
          </button>
      </div>

      {/* Chat Window */}
      <div className={`fixed bottom-10 right-10 w-[420px] h-[640px] bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] shadow-blue-900/10 border border-gray-200 flex flex-col overflow-hidden transition-all duration-700 z-[110] origin-bottom-right ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-[0.85] opacity-0 pointer-events-none translate-y-20'}`}>
        {/* Header */}
        <div className="p-6 pb-6 bg-white flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-6"></div>
          <div className="flex items-center space-x-4 relative z-10">
            <div className="w-12 h-12 bg-blue-50 border border-blue-100 text-blue-600 rounded-xl flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]">
              <Bot size={24} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-medium text-gray-900 tracking-tight">Digital concierge</h3>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-medium border border-blue-50">AI Node</span>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]"></div>
                <span className="text-[11px] font-normal text-gray-400">Intelligence active</span>
              </div>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 text-gray-300 hover:text-gray-900 bg-slate-50 rounded-xl transition-all relative z-10">
            <Minimize2 size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 pt-4 space-y-6 scrollbar-hide bg-slate-50">
          {chat.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
              <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[85%]`}>
                <div className={`p-4 rounded-xl text-[13px] font-normal leading-relaxed tracking-normal ${msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]' 
                  : 'bg-white text-gray-900 border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] rounded-tl-none'}`}>
                  <p>{msg.text}</p>
                </div>
                <div className="flex items-center space-x-2 mt-2 px-1">
                    <Clock size={10} className="text-gray-300" />
                    <span className="text-[9px] font-medium text-gray-300 uppercase tracking-wider">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-6 pt-6 bg-white border-t border-gray-200 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -ml-16 -mb-6"></div>
          <form onSubmit={handleSend} className="relative z-10">
            <div className="relative group">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask a question..."
                    className="w-full pl-6 pr-14 py-4 bg-slate-50 border border-transparent rounded-xl text-sm font-normal outline-none focus:bg-white focus:border-blue-100 transition-all placeholder:text-gray-300 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]"
                />
                <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] active:scale-90 group/btn"
                >
                    <Send size={16} />
                </button>
            </div>
          </form>
          <div className="mt-6 flex items-center justify-center space-x-6 text-[10px] font-medium text-gray-300 tracking-widest uppercase">
            <span className="flex items-center"><Cpu size={10} className="mr-2" /> HDFC System V4.8</span>
            <span className="flex items-center"><Zap size={10} className="mr-2" /> Encrypted</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIChatAssistant;
