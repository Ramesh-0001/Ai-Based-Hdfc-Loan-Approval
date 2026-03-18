import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Bot, Minimize2, Sparkles, User, Cpu, Zap, Activity, Clock, X } from 'lucide-react';

const AIChatAssistant = () => {
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! I am HDFC's AI loan assistant. How can I help you today?", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), text: input, sender: 'user', timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        try {
            const response = await fetch('http://localhost:8000/api/support/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: input })
            });
            const data = await response.json();
            
            setTimeout(() => {
                setMessages(prev => [...prev, { id: Date.now() + 1, text: data.response, sender: 'bot', suggestions: data.suggestions, timestamp: new Date() }]);
            }, 600);
        } catch (error) {
            setTimeout(() => {
                setMessages(prev => [...prev, { id: Date.now() + 1, text: "I'm having trouble connecting to the intelligence node. Please try again later.", sender: 'bot', timestamp: new Date() }]);
            }, 600);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 font-sans">
            {/* Toggle Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-16 h-16 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-95 group relative overflow-hidden ${isOpen ? 'bg-slate-100 rotate-90 text-gray-900' : 'bg-blue-600'}`}
            >
                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform"></div>
                {isOpen ? (
                    <X size={28} className="text-white relative z-10" />
                ) : (
                    <MessageSquare size={28} className="text-white relative z-10" />
                )}
                {!isOpen && <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]"></div>}
            </button>

            {/* Chat Window */}
            <div className={`absolute bottom-20 right-0 w-[400px] bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] border border-gray-200 overflow-hidden transition-all duration-700 origin-bottom-right ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-[0.85] opacity-0 pointer-events-none translate-y-10'}`}>
                {/* Header */}
                <div className="p-6 pb-6 bg-white border-b border-gray-200 flex items-center justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-6"></div>
                    <div className="flex items-center space-x-4 relative z-10">
                        <div className="w-12 h-12 bg-blue-50 border border-blue-100 text-blue-600 rounded-xl flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]">
                            <Bot size={24} />
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <h3 className="text-base font-medium text-gray-900 tracking-tight">HDFC AI assistant</h3>
                                <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded text-[9px] font-medium border border-green-50">Active</span>
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]"></div>
                                <span className="text-[11px] font-normal text-gray-400">Secure connection</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className="h-[450px] overflow-y-auto p-6 pt-4 space-y-6 bg-slate-50 scrollbar-hide">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                            <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} max-w-[85%]`}>
                                <div className={`p-4 rounded-xl text-[13px] font-normal leading-relaxed ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-none shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]' : 'bg-white text-gray-900 border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] rounded-tl-none'}`}>
                                    {msg.text}
                                    {msg.suggestions && (
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {msg.suggestions.map((s, idx) => (
                                                <button 
                                                    key={idx} 
                                                    onClick={() => { setInput(s); handleSend(); }}
                                                    className="bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1.5 rounded-xl text-[10px] font-medium hover:bg-blue-100 transition-all"
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center space-x-2 mt-2 px-1">
                                    <Clock size={10} className="text-gray-300" />
                                    <span className="text-[9px] font-medium text-gray-300 uppercase tracking-wider">
                                        {(msg.timestamp || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-6 pt-6 bg-white border-t border-gray-200 relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -ml-16 -mb-6"></div>
                    <div className="relative z-10">
                        <div className="bg-slate-50 border border-transparent rounded-xl flex items-center p-2 focus-within:bg-white focus-within:border-blue-100 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]">
                            <input 
                                type="text" 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask a question..."
                                className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-normal px-4 placeholder:text-gray-300"
                            />
                            <button 
                                onClick={handleSend}
                                className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] active:scale-95"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                        <div className="mt-6 flex items-center justify-center space-x-6 text-[10px] font-medium text-gray-300 tracking-widest uppercase">
                            <span className="flex items-center"><Cpu size={10} className="mr-2" /> System V4.8</span>
                            <span className="flex items-center"><Zap size={10} className="mr-2" /> Encrypted</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIChatAssistant;
