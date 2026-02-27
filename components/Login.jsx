import React, { useState } from 'react';

const Login = ({ onLogin, isDark }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5001/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (data.success) {
                onLogin(data.user);
            } else {
                setError(data.message || 'Authentication failed');
            }
        } catch (err) {
            setError('Could not connect to the AI server. Is it running?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center p-6 transition-colors duration-500 ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}>
            <div className="max-w-md w-full">
                {/* Logo Section */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-[#e11b22] rounded-3xl shadow-2xl shadow-red-500/20 mb-6 group transition-transform hover:scale-110">
                        <span className="text-white font-black text-4xl">H</span>
                    </div>
                    <h1 className={`text-4xl font-black tracking-tight mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        HDFC <span className="text-[#003d82]">AI Portal</span>
                    </h1>
                    <p className={`font-bold text-sm uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                        Risk Management System v2.0
                    </p>
                </div>

                {/* Login Card */}
                <div className={`p-10 rounded-[2.5rem] shadow-2xl border-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center space-x-3 animate-head-shake">
                                <div className="p-1 bg-red-500 rounded-full">
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </div>
                                <span className="text-xs font-black text-red-600 uppercase tracking-tighter">{error}</span>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 px-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                                    Employee ID / Username
                                </label>
                                <input
                                    type="text"
                                    required
                                    className={`w-full px-6 py-4 rounded-2xl outline-none border-2 transition-all font-bold ${isDark
                                            ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500'
                                            : 'bg-gray-50 border-gray-100 focus:border-[#003d82]'
                                        }`}
                                    placeholder="e.g. admin_hdfc"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 px-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                                    Access Pin / Password
                                </label>
                                <input
                                    type="password"
                                    required
                                    className={`w-full px-6 py-4 rounded-2xl outline-none border-2 transition-all font-bold ${isDark
                                            ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500'
                                            : 'bg-gray-50 border-gray-100 focus:border-[#003d82]'
                                        }`}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 ${loading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-[#003d82] text-white hover:bg-[#002d62] shadow-blue-500/20'
                                }`}
                        >
                            {loading ? 'Verifying Credentials...' : 'Secure Authorization'}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className={`text-[10px] font-bold italic ${isDark ? 'text-slate-600' : 'text-gray-400'}`}>
                            Property of HDFC Bank. Unauthorized access is strictly prohibited.
                        </p>
                    </div>
                </div>

                {/* Footer Branding */}
                <div className="mt-10 flex justify-center items-center space-x-6">
                    <div className="flex flex-col items-center">
                        <div className={`w-8 h-1 rounded-full mb-1 ${isDark ? 'bg-slate-800' : 'bg-gray-200'}`}></div>
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">AI Node: 0042</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className={`w-8 h-1 rounded-full mb-1 ${isDark ? 'bg-slate-800' : 'bg-gray-200'}`}></div>
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">Region: West</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
