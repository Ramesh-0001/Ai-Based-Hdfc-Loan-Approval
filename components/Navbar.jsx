
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = ({ user, onLogout, isDark, onToggleTheme, notifications = [], onMarkRead }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showNotif, setShowNotif] = useState(false);

    const isLoginPage = location.pathname.startsWith('/login');

    // Filter notifications based on Role-Based Access Control
    const userNotifications = notifications.filter(n => {
        if (!user) return false;
        if (!n.targetRoles) return n.customerName === user.name; // Fallback for old notifications

        // Admin: Sees system alerts, overrides, and decisions
        if (user.role === 'ADMIN' && n.targetRoles.includes('ADMIN')) return true;

        // Officer: Sees assignments and operational alerts
        if (user.role === 'OFFICER' && (n.targetRoles.includes('OFFICER') || n.recipientId === user.id)) return true;

        // Customer: Sees their own application updates
        if (user.role === 'APPLICANT' && n.targetRoles.includes('CUSTOMER') && n.customerName === user.name) return true;

        return false;
    }).slice(0, 15);

    const unreadCount = userNotifications.filter(n => !n.read).length;

    const handleToggleNotif = () => {
        if (!showNotif && unreadCount > 0) {
            onMarkRead(user);
        }
        setShowNotif(!showNotif);
    };

    return (
        <nav className="bg-[#003d82] dark:bg-slate-900 text-white shadow-lg sticky top-0 z-50 transition-colors duration-300">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
                    <div className="bg-white p-1 rounded">
                        <div className="w-8 h-8 bg-[#e11b22] flex items-center justify-center font-bold text-white rounded">H</div>
                    </div>
                    <span className="font-bold text-xl tracking-tight uppercase hidden lg:inline">HDFC Bank AI-Portal</span>
                </Link>

                <style>
                    {`
                        @keyframes shine {
                            0% { left: -100%; }
                            20% { left: 100%; }
                            100% { left: 100%; }
                        }
                        .active-glitter {
                            position: relative;
                            background: rgba(255, 255, 255, 0.15);
                            border: 1px solid rgba(255, 255, 255, 0.3);
                            backdrop-filter: blur(4px);
                            overflow: hidden;
                        }
                        .active-glitter::after {
                            content: '';
                            position: absolute;
                            top: 0;
                            left: -100%;
                            width: 100%;
                            height: 100%;
                            background: linear-gradient(
                                90deg,
                                transparent,
                                rgba(255, 255, 255, 0.2),
                                transparent
                            );
                            animation: shine 4s infinite;
                        }
                    `}
                </style>

                {/* Navigation Links - Hidden on Login Page */}
                {!isLoginPage && (
                    <div className="hidden md:flex items-center space-x-1 lg:space-x-2 mx-4 overflow-x-auto">
                        <Link
                            to="/dashboard"
                            className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${location.pathname === '/dashboard' ? 'active-glitter text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                            <span className="hidden lg:inline">Dashboard</span>
                        </Link>

                        {(user?.role === 'ADMIN' || user?.role === 'OFFICER') && (
                            <Link
                                to="/stats"
                                className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${location.pathname === '/stats' ? 'active-glitter text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                                <span className="hidden lg:inline whitespace-nowrap">Live Stats</span>
                            </Link>
                        )}

                        <Link
                            to="/check-eligibility"
                            className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${location.pathname === '/check-eligibility' ? 'active-glitter text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <span className="hidden lg:inline whitespace-nowrap">Checkability</span>
                        </Link>

                        <Link
                            to="/emi-calculator"
                            className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${location.pathname === '/emi-calculator' ? 'active-glitter text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                            <span className="hidden lg:inline whitespace-nowrap">EMI Calc</span>
                        </Link>

                        <Link
                            to="/track-application"
                            className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${location.pathname === '/track-application' ? 'active-glitter text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            <span className="hidden lg:inline whitespace-nowrap">Track Status</span>
                        </Link>
                    </div>
                )}

                <div className="flex items-center space-x-3 md:space-x-6">
                    {/* Notification Bell - Hidden on Login Page */}
                    {!isLoginPage && (
                        <div className="relative">
                            <button
                                onClick={handleToggleNotif}
                                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 relative group"
                                title="Notifications"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-100 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 bg-[#e11b22] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#003d82] dark:border-slate-900 animate-pulse">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Dropdown */}
                            {showNotif && (
                                <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 z-[100]">
                                    <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-900/50">
                                        <h3 className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-widest">Notifications</h3>
                                        <button onClick={() => setShowNotif(false)} className="text-gray-400 hover:text-gray-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="max-h-[400px] overflow-y-auto">
                                        {userNotifications.length === 0 ? (
                                            <div className="p-8 text-center text-gray-400">
                                                <p className="text-xs font-bold italic">No new updates yet.</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y dark:divide-slate-700">
                                                {userNotifications.map(n => (
                                                    <div key={n.id} className={`p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${n.read ? 'opacity-60' : ''}`}>
                                                        <div className="flex items-start space-x-3">
                                                            <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${n.type === 'APPROVED' ? 'bg-green-500 shadow-sm shadow-green-500/50' : n.type === 'REJECTED' ? 'bg-red-500 shadow-sm shadow-red-500/50' : 'bg-yellow-500 shadow-sm shadow-yellow-500/50'}`}></div>
                                                            <div>
                                                                <p className="text-xs font-bold text-gray-800 dark:text-gray-100">{n.message}</p>
                                                                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 font-medium italic">
                                                                    {new Date(n.timestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3 bg-gray-50 dark:bg-slate-900/50 border-t dark:border-slate-700 text-center">
                                        <Link to="/dashboard" onClick={() => setShowNotif(false)} className="text-[10px] font-black text-[#003d82] dark:text-blue-400 tracking-widest uppercase hover:underline">View All Applications</Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <button
                        onClick={onToggleTheme}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300"
                        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {isDark ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                        )}
                    </button>

                    {user && (
                        <div className="hidden md:flex flex-col items-end border-l border-white/20 pl-6">
                            <span className="text-sm font-medium">{user.name}</span>
                            <span className="text-xs opacity-75">{user.role}</span>
                        </div>
                    )}

                    {user ? (
                        <button
                            onClick={() => {
                                onLogout();
                                navigate('/login', { replace: true });
                            }}
                            className="flex items-center justify-center w-11 h-11 bg-[#e11b22] hover:bg-red-700 transition-all rounded-xl shadow-lg shadow-red-500/20 active:scale-95 text-white"
                            title="Sign Out"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    ) : (
                        !isLoginPage && (
                            <Link
                                to="/login"
                                className="flex items-center space-x-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/30 rounded-xl transition-all active:scale-95 group"
                            >
                                <svg className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span className="text-xs font-black uppercase tracking-widest leading-none">Sign In</span>
                            </Link>
                        )
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
