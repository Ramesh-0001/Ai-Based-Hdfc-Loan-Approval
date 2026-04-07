import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ChevronLeft, ArrowRight, Lock, UserCheck } from 'lucide-react';

const OfficerLogin = ({ onLogin }) => {
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
                setError(data.message || 'Invalid employee ID or password');
            }
        } catch (err) {
            setError('Operational node unreachable. Check parameters.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
            <div className="max-w-md w-full space-y-6">
                <div className="text-center">
                    <button
                        onClick={() => navigate('/login')}
                        className="mb-6 inline-flex items-center text-sm font-medium text-gray-400 hover:text-blue-600 transition-all duration-200 group"
                    >
                        <ChevronLeft size={14} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                        <span>Back to portals</span>
                    </button>
                    
                    <div className="flex items-center justify-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-semibold text-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]">H</div>
                    </div>

                    <h1 className="text-2xl font-semibold text-gray-900">Officer Sign In</h1>
                    <p className="text-sm text-gray-500 mt-2">Bank officer authentication portal</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
                                Error: {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <InputGroup 
                                label="Employee ID" 
                                type="text"
                                placeholder="HDFC_XXXX"
                                value={empId}
                                onChange={(e) => setEmpId(e.target.value)}
                                icon={UserCheck}
                            />
                            <div className="space-y-2">
                                <div className="flex items-center justify-between px-1">
                                <label className="text-xs font-medium text-gray-500">Password</label>
                                    <button type="button" className="text-xs font-medium text-blue-600 hover:underline">Forgot?</button>
                                </div>
                                <div className="relative group">
                                    <input
                                        type="password"
                                        required
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200 text-sm text-gray-900 placeholder:text-gray-400"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] hover:bg-blue-700 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] transition-all duration-200 inline-flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="flex items-center">
                                    <div className="w-4 h-4 border-2 border-gray-200 border-t-white rounded-full animate-spin mr-3"></div>
                                    <span>Signing in...</span>
                                </div>
                            ) : (
                                <>
                                    <span>Sign in</span>
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </form>
                </div>
                
                <footer className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2 text-gray-400">
                        <Lock size={14} />
                        <span className="text-xs font-medium">SSL Encrypted</span>
                    </div>
                    <p className="text-xs text-gray-400">
                        © 2026 HDFC Bank Ltd. Officer Portal
                    </p>
                </footer>
            </div>
        </div>
    );
};

const InputGroup = ({ label, type, placeholder, value, onChange, icon: Icon }) => (
    <div className="space-y-1.5 group text-left">
        <label className="text-xs font-medium text-gray-500 group-focus-within:text-blue-600 transition-colors">{label}</label>
        <div className="relative">
            <input
                type={type}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200 text-sm text-gray-900 placeholder:text-gray-400"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
            />
        </div>
    </div>
);

export default OfficerLogin;
