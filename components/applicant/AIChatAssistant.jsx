import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Bot, Minimize2, Sparkles, User, Cpu, Zap, Activity, Clock, X, ChevronDown, RefreshCcw } from 'lucide-react';

const AIChatAssistant = () => {
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! I am HDFC's AI loan assistant. How can I help you navigate your financial journey today?", sender: 'bot' }
    ]);
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

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), text: input, sender: 'user', timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const response = await fetch('http://localhost:8000/api/support/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: input })
            });
            const data = await response.json();
            
            setTimeout(() => {
                setIsTyping(false);
                setMessages(prev => [...prev, { id: Date.now() + 1, text: data.response, sender: 'bot', suggestions: data.suggestions, timestamp: new Date() }]);
            }, 1000);
        } catch (error) {
            setTimeout(() => {
                setIsTyping(false);
                setMessages(prev => [...prev, { id: Date.now() + 1, text: "I'm having trouble connecting to the intelligence node. Please try again later.", sender: 'bot', timestamp: new Date() }]);
            }, 1000);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] font-sans">
            {/* Toggle Button / FAB */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg hover:shadow-blue-500/25 active:scale-95 group relative overflow-hidden ${
                    isOpen 
                    ? 'bg-white text-gray-900 border border-gray-100 rotate-90' 
                    : 'bg-gradient-to-br from-blue-600 to-blue-700 text-white'
                }`}
            >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {isOpen ? (
                    <X size={24} className="relative z-10" />
                ) : (
                    <div className="relative">
                        <MessageSquare size={24} className="relative z-10 group-hover:scale-110 transition-transform" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-blue-600 z-20 group-hover:animate-ping"></div>
                    </div>
                )}
                
                {/* Visual Glow Effect */}
                {!isOpen && (
                    <div className="absolute inset-0 bg-blue-400 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity animate-pulse"></div>
                )}
            </button>

            {/* Main Chat Container */}
            <div className={`absolute bottom-20 right-0 w-[420px] max-h-[70vh] flex flex-col bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/40 overflow-hidden transition-all duration-500 origin-bottom-right ${
                isOpen 
                ? 'scale-100 opacity-100 translate-y-0 translate-x-0' 
                : 'scale-[0.8] opacity-0 pointer-events-none translate-y-12 translate-x-12'
            }`}>
                
                {/* Modern Header */}
                <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-8 -mt-8 animate-pulse"></div>
                    
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
                                <Bot size={24} strokeWidth={1.5} />
                            </div>
                            <div className="flex flex-col">
                                <h3 className="text-sm font-semibold tracking-wide flex items-center gap-2">
                                    AI Concierge
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]"></span>
                                </h3>
                                <p className="text-[10px] text-blue-100 font-medium tracking-tight opacity-80 uppercase">HDFC Neural Network Active</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                <RefreshCcw size={14} className="text-blue-100" />
                            </button>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                <Minimize2 size={14} className="text-blue-100" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Message Surface */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 scrollbar-thin scrollbar-thumb-gray-200 min-h-[400px]">
                    {messages.map((msg, index) => (
                        <div 
                            key={msg.id} 
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} max-w-[85%]`}>
                                {msg.sender === 'bot' && (
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Assistant</span>
                                )}
                                
                                <div className={`p-4 rounded-2xl text-[13px] leading-relaxed shadow-sm transition-all hover:shadow-md ${
                                    msg.sender === 'user' 
                                    ? 'bg-blue-600 text-white rounded-tr-none' 
                                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                }`}>
                                    <p className="font-medium antialiased">{msg.text}</p>
                                    
                                    {msg.suggestions && (
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {msg.suggestions.map((s, idx) => (
                                                <button 
                                                    key={idx} 
                                                    onClick={() => { setInput(s); handleSend(); }}
                                                    className="bg-blue-50 text-blue-600 border border-blue-100/50 px-3 py-1.5 rounded-full text-[10px] font-semibold hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all active:scale-95"
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="mt-1.5 flex items-center gap-1.5 px-1">
                                    <span className="text-[8px] font-bold text-gray-300 uppercase tracking-tighter">
                                        {(msg.timestamp || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {isTyping && (
                        <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2">
                            <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                                <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Surface */}
                <div className="p-6 bg-white border-t border-gray-100 relative group/input">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
                    
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within/input:text-blue-500 transition-colors">
                            <Sparkles size={18} />
                        </div>
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Describe your credit needs..."
                            className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-transparent rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-blue-100/50 focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-gray-300 shadow-inner"
                        />
                        <button 
                            onClick={handleSend}
                            disabled={!input.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-md active:scale-90 disabled:opacity-0 disabled:scale-90 transition-all duration-300"
                        >
                            <Send size={16} />
                        </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between px-2">
                        <div className="flex items-center gap-4 text-[9px] font-bold text-gray-300 tracking-widest uppercase">
                            <span className="flex items-center"><Cpu size={10} className="mr-1.5 opacity-50" /> V4.0</span>
                            <span className="flex items-center"><Zap size={10} className="mr-1.5 opacity-50" /> Secure</span>
                        </div>
                        <span className="text-[9px] font-bold text-blue-600/30 uppercase tracking-widest">HDFC Institutional AI</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIChatAssistant;
