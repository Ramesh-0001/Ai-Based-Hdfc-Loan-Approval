import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Bot, 
  X, 
  Sparkles, 
  ChevronRight, 
  ShieldCheck, 
  History,
  Info,
  Maximize2,
  RefreshCcw,
  BadgeCheck,
  Activity,
  Mic,
  MoreVertical,
  Headphones
} from 'lucide-react';

const AIChatAssistant = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen, isTyping]);

    const handleSend = async (customText = null) => {
        const textToSend = customText || input;
        if (!textToSend.trim()) return;

        const userMsg = { 
            id: Date.now(), 
            text: textToSend, 
            sender: 'user', 
            timestamp: new Date() 
        };
        
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const response = await fetch('http://localhost:8000/api/support/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: textToSend })
            });
            
            if (response.ok) {
                const data = await response.json();
                setTimeout(() => {
                    setIsTyping(false);
                    setMessages(prev => [...prev, { 
                        id: Date.now() + 1, 
                        text: data.response, 
                        sender: 'bot', 
                        suggestions: data.suggestions, 
                        timestamp: new Date()
                    }]);
                }, 800);
            } else {
                throw new Error('Fallback needed');
            }
        } catch (error) {
            setTimeout(() => {
                setIsTyping(false);
                let fallback = "I'm having trouble connecting to my brain right now. Please check back shortly.";
                if (textToSend.toLowerCase().includes('status')) fallback = "Institutional access is currently restricted in offline mode. Please ensure the backend server is running.";
                
                setMessages(prev => [...prev, { 
                    id: Date.now() + 1, 
                    text: fallback, 
                    sender: 'bot', 
                    timestamp: new Date() 
                }]);
            }, 800);
        }
    };

    const quickActions = [
        { icon: <ShieldCheck size={16} />, label: "Status Audit", query: "Check status" },
        { icon: <History size={16} />, label: "Reports", query: "Generate report" },
        { icon: <Info size={16} />, label: "Help Center", query: "Documentation" },
    ];

    return (
        <div className="fixed bottom-6 right-6 z-[999] font-sans">
            {/* Toggle Button */}
            <div className="flex justify-end">
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl hover:scale-105 active:scale-95 ${
                        isOpen 
                        ? 'bg-slate-900 text-white' 
                        : 'bg-white text-blue-600 border border-gray-100'
                    }`}
                >
                    {isOpen ? <X size={24} /> : <Bot size={28} />}
                </button>
            </div>

            {/* Chat Window */}
            <div className={`absolute bottom-20 right-0 w-[380px] h-[600px] max-h-[80vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transition-all duration-300 transform origin-bottom-right ${
                isOpen 
                ? 'scale-100 translate-y-0 opacity-100' 
                : 'scale-90 translate-y-10 opacity-0 pointer-events-none'
            }`}>
                
                {/* Header */}
                <div className="bg-slate-900 p-5 flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10">
                            <Bot size={22} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm leading-tight tracking-wide">Assistant Intelligence</h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-[10px] text-gray-400 font-medium tracking-wide">Processing Secure Link</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4 bg-slate-50/30 space-y-4 scroll-smooth">
                    {messages.length === 0 ? (
                        <div className="py-6 space-y-6">
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <h4 className="text-slate-900 font-bold mb-2 flex items-center gap-2">
                                    <Sparkles size={16} className="text-blue-500" />
                                    Institutional Support
                                </h4>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    Our AI assistant is here to help with your application lifecycle. How can we facilitate your banking needs today?
                                </p>
                            </div>

                            <div className="space-y-2">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2 mb-3">Quick Actions</p>
                                {quickActions.map((action, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => handleSend(action.query)}
                                        className="w-full flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-blue-100 hover:bg-slate-50 transition-all group group shadow-sm text-left"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-gray-400 group-hover:text-blue-600 transition-colors">{action.icon}</span>
                                            <span className="text-sm font-medium text-gray-700">{action.label}</span>
                                        </div>
                                        <ChevronRight size={14} className="text-gray-300 transition-transform group-hover:translate-x-1" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div 
                                key={msg.id} 
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                            >
                                <div className={`max-w-[85%]`}>
                                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                        msg.sender === 'user' 
                                        ? 'bg-blue-600 text-white rounded-tr-none font-normal' 
                                        : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none font-medium'
                                    }`}>
                                        <p className="whitespace-pre-wrap">{msg.text}</p>
                                    </div>
                                    <div className={`mt-1.5 flex items-center gap-1.5 px-1 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <span className="text-[9px] text-gray-400 font-bold tracking-wider uppercase">
                                            {(msg.timestamp || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    
                    {isTyping && (
                        <div className="flex justify-start">
                             <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl flex items-center gap-1.5 shadow-sm">
                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                             </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Footer */}
                <div className="p-4 bg-white border-t border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="flex-1 relative">
                            <input 
                                type="text" 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Message Assistant..."
                                className="w-full pl-4 pr-10 py-3.5 bg-slate-50 border border-transparent rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:border-blue-100 focus:ring-0 transition-all outline-none"
                            />
                            <Mic size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-blue-600 transition-colors" />
                        </div>
                        <button 
                            onClick={() => handleSend()}
                            disabled={!input.trim()}
                            className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all ${
                                input.trim() 
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/10 hover:bg-blue-700 active:scale-95' 
                                : 'bg-slate-50 text-gray-300 pointer-events-none'
                            }`}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIChatAssistant;
