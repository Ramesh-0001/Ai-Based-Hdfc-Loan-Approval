
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CustomerEntry = ({ onLogin, isDark }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        // Simulated API Call or just state update as per requirements
        // "Allow access via name + phone/email OR Continue as Guest"
        setTimeout(() => {
            onLogin({
                id: Date.now(),
                name: name || 'Guest User',
                email: email || 'guest@hdfc.com',
                role: 'APPLICANT'
            });
            navigate('/dashboard');
        }, 1000);
    };

    const handleGuest = () => {
        setLoading(true);
        setTimeout(() => {
            onLogin({
                id: 999,
                name: 'Guest Applicant',
                role: 'APPLICANT',
                isGuest: true
            });
            navigate('/dashboard');
        }, 800);
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-6">
            <div className="max-w-md w-full">
                <div className="text-center mb-10">
                    <button
                        onClick={() => navigate('/login')}
                        className="mb-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-blue-500 flex items-center justify-center mx-auto space-x-2 transition-colors"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                        <span>Back to Roles</span>
                    </button>
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-3xl shadow-xl shadow-blue-500/20 mb-6">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <h1 className={`text-3xl font-black tracking-tight mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Applicant Portal
                    </h1>
                    <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                        Start your journey with HDFC AI
                    </p>
                </div>

                <div className={`p-10 rounded-[2.5rem] shadow-2xl border-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest mb-2 px-1 text-gray-400">Full Name</label>
                                <input
                                    type="text"
                                    className={`w-full px-6 py-4 rounded-2xl outline-none border-2 transition-all font-bold ${isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-gray-50 border-gray-100 focus:border-blue-600'
                                        }`}
                                    placeholder="Enter your name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest mb-2 px-1 text-gray-400">Email / Phone</label>
                                <input
                                    type="text"
                                    className={`w-full px-6 py-4 rounded-2xl outline-none border-2 transition-all font-bold ${isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-gray-50 border-gray-100 focus:border-blue-600'
                                        }`}
                                    placeholder="email@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 rounded-2xl bg-blue-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95"
                        >
                            {loading ? 'Processing...' : 'Access Dashboard'}
                        </button>

                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center"><div className={`w-full border-t ${isDark ? 'border-slate-800' : 'border-gray-100'}`}></div></div>
                            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest"><span className={`${isDark ? 'bg-slate-900 text-slate-600' : 'bg-white text-gray-400'} px-4`}>OR</span></div>
                        </div>

                        <button
                            type="button"
                            onClick={handleGuest}
                            className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest border-2 transition-all active:scale-95 ${isDark ? 'border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white' : 'border-gray-100 text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                                }`}
                        >
                            Continue as Guest
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CustomerEntry;
