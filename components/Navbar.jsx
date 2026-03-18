import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bell, Sun, Moon, LogOut, LayoutDashboard, BarChart3, Calculator, Search, ShieldCheck, MapPin } from 'lucide-react';

const Navbar = ({ user, onLogout, isDark, onToggleTheme, notifications = [], onMarkRead }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showNotif, setShowNotif] = useState(false);

    const isLoginPage = location.pathname.startsWith('/login');

    const userNotifications = notifications.filter(n => {
        if (!user) return false;
        if (!n.targetRoles) return n.customerName === user.name;
        if (user.role === 'ADMIN' && n.targetRoles.includes('ADMIN')) return true;
        if (user.role === 'OFFICER' && (n.targetRoles.includes('OFFICER') || n.recipientId === user.id)) return true;
        if (user.role === 'APPLICANT' && n.targetRoles.includes('CUSTOMER') && n.customerName === user.name) return true;
        return false;
    }).slice(0, 10);

    const unreadCount = userNotifications.filter(n => !n.read).length;

    const handleToggleNotif = () => {
        if (!showNotif && unreadCount > 0) {
            onMarkRead(user);
        }
        setShowNotif(!showNotif);
    };

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { 
            path: '/stats', 
            label: 'Intelligence', 
            icon: BarChart3, 
            roles: ['ADMIN', 'OFFICER'] 
        },
        { path: '/check-eligibility', label: 'Eligibility', icon: ShieldCheck },
        { path: '/emi-calculator', label: 'Plan EMI', icon: Calculator },
        { path: '/track-application', label: 'Track Filing', icon: Search }
    ];

    if (isLoginPage) return null;

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 transition-all duration-300">
            <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex items-center space-x-10">
                    <Link to="/" className="flex items-center space-x-3 group">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-semibold text-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] transform group-hover:rotate-6 transition-transform">
                            H
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-sm tracking-tight text-gray-900 leading-none">HDFC Bank</span>
                            <span className="text-[9px] font-semibold text-blue-500 uppercase tracking-widest leading-none mt-1">AI Lending</span>
                        </div>
                    </Link>

                    <div className="hidden lg:flex items-center space-x-6">
                        {navItems.filter(item => !item.roles || item.roles.includes(user?.role)).map(item => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center space-x-2 px-1 py-4 border-b-2 transition-all ${
                                    location.pathname === item.path 
                                    ? 'border-blue-600 text-blue-600' 
                                    : 'border-transparent text-gray-500 hover:text-gray-900'
                                }`}
                            >
                                <item.icon size={16} />
                                <span className="text-[11px] font-semibold uppercase tracking-wider">{item.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <button
                            onClick={handleToggleNotif}
                            className={`p-2 rounded-lg transition-all relative ${showNotif ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-900 hover:bg-slate-50'}`}
                        >
                            <Bell size={18} />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 bg-red-600 w-2.5 h-2.5 rounded-full border-2 border-white animate-pulse"></span>
                            )}
                        </button>

                        {showNotif && (
                            <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 z-50">
                                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-slate-50">
                                    <h3 className="text-[11px] font-semibold text-gray-900 uppercase tracking-widest">Inbound Updates</h3>
                                    <span className="text-[9px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">LIVE</span>
                                </div>
                                <div className="max-h-[350px] overflow-y-auto divide-y divide-gray-50">
                                    {userNotifications.length === 0 ? (
                                        <div className="p-6 text-center text-gray-400">
                                            <p className="text-xs font-semibold italic">No pending notifications</p>
                                        </div>
                                    ) : (
                                        userNotifications.map(n => (
                                            <div key={n.id} className="p-4 hover:bg-slate-50 transition-colors">
                                                <div className="flex items-start space-x-3">
                                                    <div className={`mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 ${n.type === 'APPROVED' ? 'bg-green-500' : n.type === 'REJECTED' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                                                    <div>
                                                        <p className="text-xs font-semibold text-gray-800 leading-snug">{n.message}</p>
                                                        <p className="text-[9px] text-gray-400 mt-1 font-semibold uppercase tracking-widest">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="p-3 bg-slate-50 border-t border-gray-200 text-center">
                                    <Link to="/dashboard" onClick={() => setShowNotif(false)} className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest hover:underline">Full Activity Ledger</Link>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="h-6 w-px bg-gray-100 mx-2"></div>

                    {user && (
                        <div className="flex items-center space-x-4">
                            <div className="hidden sm:flex flex-col items-end">
                                <span className="text-xs font-semibold text-gray-900">{user.name}</span>
                                <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest">{user.role}</span>
                            </div>
                            <button
                                onClick={() => { onLogout(); navigate('/login'); }}
                                className="w-10 h-10 bg-slate-50 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl flex items-center justify-center transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]"
                                title="Exit Session"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
