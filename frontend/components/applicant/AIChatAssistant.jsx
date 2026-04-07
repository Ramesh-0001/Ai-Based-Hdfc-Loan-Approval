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
                if (textToSend.toLowerCase().includes('status')) fallback = "I cannot fetch your live status while offline, but generally applications take 2-4 working days for review.";
                
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
        { icon: <ShieldCheck size={16} />, label: "Loan Status", query: "Check my status" },
        { icon: <History size={16} />, label: "Eligibility", query: "Am I eligible?" },
        { icon: <Info size={16} />, label: "Documentation", query: "Required documents" },
    ];

    return (
        <div className="fixed bottom-6 right-6 z-[999] font-sans">
            {/* Toggle Button */}
            <div className="flex justify-end">
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl hover:scale-105 active:scale-95 ${
                        isOpen 
                        ? 'bg-hdfc-blue text-white rotate-90' 
                        : 'bg-white text-hdfc-blue border border-gray-100'
                    }`}
                >
                    {isOpen ? <X size={24} /> : <Bot size={28} />}
                    {!isOpen && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] text-white items-center justify-center font-bold">1</span>
                        </span>
                    )}
                </button>
            </div>

            {/* Chat Window */}
            <div className={`absolute bottom-20 right-0 w-[380px] h-[600px] max-h-[80vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transition-all duration-300 transform origin-bottom-right ${
                isOpen 
                ? 'scale-100 translate-y-0 opacity-100' 
                : 'scale-90 translate-y-10 opacity-0 pointer-events-none'
            }`}>
                
                {/* Header */}
                <div className="bg-hdfc-blue p-5 flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <Bot size={22} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm leading-tight">HDFC Digital Assistant</h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-[10px] text-white/80 font-medium tracking-wide">Always Online</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <RefreshCcw size={16} />
                        </button>
                        <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <MoreVertical size={16} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 space-y-4">
                    {messages.length === 0 ? (
                        <div className="py-6 transition-all duration-500">
                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm mb-6">
                                <h4 className="text-hdfc-blue font-bold mb-2">Welcome! 👋</h4>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    I am your intelligent banking companion. I can help you with your application, check status, or guide you through our loan products.
                                </p>
                            </div>

                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-2">Common Inquiries</p>
                            <div className="space-y-2">
                                {quickActions.map((action, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => handleSend(action.query)}
                                        className="w-full flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-hdfc-blue hover:text-hdfc-blue transition-all group group shadow-sm text-left"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-gray-400 group-hover:text-hdfc-blue transition-colors">{action.icon}</span>
                                            <span className="text-sm font-semibold">{action.label}</span>
                                        </div>
                                        <ChevronRight size={14} className="text-gray-300 transition-transform group-hover:translate-x-1" />
                                    </button>
                                ))}
                            </div>
                            
                            <div className="mt-8 flex items-center gap-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                                <Headphones size={24} className="text-hdfc-blue opacity-50" />
                                <div>
                                    <p className="text-[11px] text-gray-500 font-medium">Need immediate human assistance?</p>
                                    <p className="text-xs font-bold text-hdfc-blue cursor-pointer hover:underline">Connect with a Loan Officer</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div 
                                key={msg.id} 
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} transition-all`}
                            >
                                <div className={`max-w-[85%] group`}>
                                    <div className={`px-4 py-3 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                                        msg.sender === 'user' 
                                        ? 'bg-hdfc-blue text-white rounded-tr-none' 
                                        : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none'
                                    }`}>
                                        <p className="font-medium whitespace-pre-wrap">{msg.text}</p>
                                    </div>
                                    <div className={`mt-1.5 flex items-center gap-1.5 px-1 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        {msg.sender === 'bot' && <BadgeCheck size={12} className="text-hdfc-blue opacity-40" />}
                                        <span className="text-[9px] text-gray-400 font-bold">
                                            {(msg.timestamp || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    
                    {isTyping && (
                        <div className="flex justify-start">
                             <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></div>
                                <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                             </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Footer */}
                <div className="p-4 bg-white border-t border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="flex-1 relative">
                            <input 
                                type="text" 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask about interest rates, status..."
                                className="w-full pl-4 pr-10 py-3 bg-gray-100 border-none rounded-xl text-xs font-semibold focus:ring-2 focus:ring-hdfc-blue/20 transition-all outline-none"
                            />
                            <Mic size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-hdfc-blue transition-colors" />
                        </div>
                        <button 
                            onClick={() => handleSend()}
                            disabled={!input.trim()}
                            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
                                input.trim() 
                                ? 'bg-hdfc-blue text-white shadow-lg hover:shadow-hdfc-blue/30 active:scale-95' 
                                : 'bg-gray-100 text-gray-300 pointer-events-none'
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
