
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OfficerLogin = ({ onLogin, isDark }) => {
    const [empId, setEmpId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/login/officer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ empId, password })
            });

            const data = await response.json();

            if (data.success) {
                onLogin(data.user);
                navigate('/dashboard');
            } else {
                setError(data.message || 'Invalid Employee ID or Password');
            }
        } catch (err) {
            setError('Connection failed. Verify AI Node status.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-6 text-green-600">
            <div className="max-w-md w-full">
                <div className="text-center mb-10">
                    <button
                        onClick={() => navigate('/login')}
                        className="mb-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-green-500 flex items-center justify-center mx-auto space-x-2 transition-colors"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                        <span>Back to Roles</span>
                    </button>
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-600 rounded-3xl shadow-xl shadow-green-500/20 mb-6">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <h1 className={`text-3xl font-black tracking-tight mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Officer Auth
                    </h1>
                    <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                        Review and Approve Applications
                    </p>
                </div>

                <div className={`p-10 rounded-[2.5rem] shadow-2xl border-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center space-x-3">
                                <span className="text-[10px] font-black text-red-600 uppercase tracking-tighter">{error}</span>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest mb-2 px-1 text-gray-400">Employee ID</label>
                                <input
                                    type="text"
                                    required
                                    className={`w-full px-6 py-4 rounded-2xl outline-none border-2 transition-all font-bold ${isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-green-500' : 'bg-gray-50 border-gray-100 focus:border-green-600'
                                        }`}
                                    placeholder="e.g. rameshkannan"
                                    value={empId}
                                    onChange={(e) => setEmpId(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest mb-2 px-1 text-gray-400">Password</label>
                                <input
                                    type="password"
                                    required
                                    className={`w-full px-6 py-4 rounded-2xl outline-none border-2 transition-all font-bold ${isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-green-500' : 'bg-gray-50 border-gray-100 focus:border-green-600'
                                        }`}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between px-1">
                            <label className="flex items-center space-x-2 cursor-pointer group">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest group-hover:text-green-600 transition-colors">Remember Node</span>
                            </label>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-green-600 cursor-pointer">Recover ID</span>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 rounded-2xl bg-green-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-green-500/20 hover:bg-green-700 transition-all active:scale-95"
                        >
                            {loading ? 'Validating ID...' : 'Verify Officer Access'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default OfficerLogin;
