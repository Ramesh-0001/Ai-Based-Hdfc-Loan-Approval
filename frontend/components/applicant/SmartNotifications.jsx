import React, { useState } from 'react';
import { 
  Bell, 
  Trash2, 
  MessageCircle, 
  Zap, 
  History, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ArrowRight 
} from 'lucide-react';

const SmartNotifications = () => {
    const [notifications, setNotifications] = useState([
        { id: 1, type: 'review', message: "Your loan #A1029 is under review", icon: <Clock className="text-blue-500" />, read: false, time: '2m ago' },
        { id: 2, type: 'improvement', message: "Your risk score improved by 8%", icon: <Zap className="text-green-500" />, read: false, time: '1h ago' },
        { id: 3, type: 'alert', message: "High debt detected in secondary accounts", icon: <AlertCircle className="text-red-500" />, read: true, time: '3h ago' },
        { id: 4, type: 'status', message: "Application submitted successfully", icon: <CheckCircle2 className="text-green-500" />, read: true, time: '1d ago' },
    ]);

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col transition-all duration-300 hover:shadow-md">
            <header className="p-5 border-b border-gray-100 flex items-center justify-between bg-white text-gray-900 sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Bell size={20} className="text-blue-600" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] text-white flex items-center justify-center font-bold">{unreadCount}</span>
                            </span>
                        )}
                    </div>
                    <div>
                        <h3 className="text-sm font-bold tracking-tight">System Alerts</h3>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={markAllRead} 
                        className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline"
                    >
                        Mark All Read
                    </button>
                    <button 
                         onClick={clearAll}
                         className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto max-h-[380px] p-2 bg-gray-50/30">
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-3">
                            <History size={20} />
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed">Everything is up to date</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {notifications.map((n) => (
                            <div 
                                key={n.id}
                                className={`group p-4 rounded-xl transition-all border border-transparent hover:border-blue-100 hover:bg-white flex gap-4 items-start cursor-pointer ${
                                    !n.read ? 'bg-blue-50/50' : 'bg-transparent'
                                }`}
                            >
                                <div className={`w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 transition-transform`}>
                                    {n.icon}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <p className={`text-xs font-bold leading-tight ${!n.read ? 'text-gray-900' : 'text-gray-600 font-medium'}`}>
                                            {n.message}
                                        </p>
                                        <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap">{n.time}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] font-medium text-gray-400 tracking-wide uppercase italic">
                                            {n.type === 'alert' ? 'High Risk' : 'Operational Update'}
                                        </p>
                                        <ArrowRight size={12} className="text-transparent group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                                {!n.read && (
                                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0"></div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <footer className="p-4 bg-white border-t border-gray-100 text-center">
                <button className="text-[11px] font-bold text-gray-400 uppercase tracking-widest hover:text-blue-600 transition-colors">
                    View Comprehensive History
                </button>
            </footer>
        </div>
    );
};

export default SmartNotifications;
