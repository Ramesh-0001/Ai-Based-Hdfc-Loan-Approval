
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = ({ onLogin, isDark }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showOtp, setShowOtp] = useState(false);
    const navigate = useNavigate();
    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

    const handleInitialSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate level 1 auth
        setTimeout(() => {
            setShowOtp(true);
            setLoading(false);
        }, 1000);
    };

    const handleFinalSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/login/admin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, otp })
            });

            const data = await response.json();

            if (data.success) {
                onLogin(data.user);
                navigate('/dashboard');
            } else {
                setError(data.message || 'Invalid Admin Credentials');
            }
        } catch (err) {
            setError('Root access node unreachable.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-6">
            <div className="max-w-md w-full">
                <div className="text-center mb-10">
                    <button
                        onClick={() => navigate('/login')}
                        className="mb-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-indigo-500 flex items-center justify-center mx-auto space-x-2 transition-colors"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                        <span>Back to Roles</span>
                    </button>
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-500/20 mb-6 group">
                        <svg className="w-10 h-10 text-white transition-transform group-hover:rotate-180 duration-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h1 className={`text-3xl font-black tracking-tight mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Root System Auth
                    </h1>
                    <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                        High-Security Administrative Access
                    </p>
                </div>

                <div className={`p-10 rounded-[2.5rem] shadow-2xl border-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
                    <form onSubmit={showOtp ? handleFinalSubmit : handleInitialSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl">
                                <span className="text-[10px] font-black text-red-600 uppercase tracking-tighter">{error}</span>
                            </div>
                        )}

                        {!showOtp ? (
                            <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest mb-2 px-1 text-gray-400">Master Username</label>
                                    <input
                                        type="text"
                                        required
                                        className={`w-full px-6 py-4 rounded-2xl outline-none border-2 transition-all font-bold ${isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-gray-50 border-gray-100 focus:border-indigo-600'
                                            }`}
                                        placeholder="root_admin"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest mb-2 px-1 text-gray-400">Master Key</label>
                                    <input
                                        type="password"
                                        required
                                        className={`w-full px-6 py-4 rounded-2xl outline-none border-2 transition-all font-bold ${isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-gray-50 border-gray-100 focus:border-indigo-600'
                                            }`}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-5 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95"
                                >
                                    {loading ? 'Initiating Phase I...' : 'Authorize Phase I'}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-in zoom-in-95 duration-500">
                                <div className="p-4 bg-indigo-50 rounded-2xl mb-6">
                                    <p className="text-[10px] font-black text-indigo-600 uppercase text-center leading-relaxed">
                                        Phase I Verified. <br />Enter 6-Digit Secondary OTP.
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest mb-2 px-1 text-gray-400">Security OTP</label>
                                    <input
                                        type="text"
                                        required
                                        maxLength="6"
                                        className={`w-full px-6 py-4 rounded-2xl outline-none border-2 transition-all font-bold text-center tracking-[1em] text-lg ${isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-gray-50 border-gray-100 focus:border-indigo-600'
                                            }`}
                                        placeholder="000000"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                    />
                                </div>
                                <div className="flex flex-col space-y-3">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-5 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95"
                                    >
                                        {loading ? 'Validating Root...' : 'Complete Authorization'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowOtp(false)}
                                        className={`w-full py-3 text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-600 hover:text-white' : 'text-gray-400 hover:text-indigo-600'} transition-colors`}
                                    >
                                        Cancel Phase II
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
