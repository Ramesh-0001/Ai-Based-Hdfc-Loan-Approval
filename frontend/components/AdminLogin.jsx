import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ChevronLeft, ArrowRight, Lock, Command } from 'lucide-react';

const AdminLogin = ({ onLogin }) => {
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
        setTimeout(() => {
            setShowOtp(true);
            setLoading(false);
        }, 1200);
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
                setError(data.message || 'Invalid admin credentials');
            }
        } catch (err) {
            setError('System core timeout. Retransmitting...');
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
                        className="mb-6 inline-flex items-center text-sm font-medium text-gray-400 hover:text-gray-900 transition-all duration-200 group"
                    >
                        <ChevronLeft size={14} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                        <span>Back to portals</span>
                    </button>
                    
                    <div className="flex items-center justify-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-white font-semibold text-lg">H</div>
                    </div>

                    <h1 className="text-2xl font-semibold text-gray-900">Admin Sign In</h1>
                    <p className="text-sm text-gray-500 mt-2">System administrator access</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]">
                    <form onSubmit={showOtp ? handleFinalSubmit : handleInitialSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
                                Error: {error}
                            </div>
                        )}

                        {!showOtp ? (
                            <div className="space-y-4">
                                <InputGroup 
                                    label="Admin Username" 
                                    type="text"
                                    placeholder="Enter admin ID"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                                <InputGroup 
                                    label="Password" 
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-2.5 bg-white border-r border-gray-200 rounded-lg font-medium text-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] hover:bg-black hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] transition-all duration-200 inline-flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
                                >
                                    {loading ? (
                                        <div className="flex items-center">
                                            <div className="w-4 h-4 border-2 border-gray-200 border-t-white rounded-full animate-spin mr-3"></div>
                                            <span>Verifying...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <span>Continue</span>
                                            <ArrowRight size={16} />
                                        </>
                                    )}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6 text-center">
                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 flex items-center justify-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div>
                                    <p className="text-xs font-medium text-blue-700">Two-factor authentication required</p>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-500">OTP Code</label>
                                    <input
                                        type="text"
                                        required
                                        maxLength="6"
                                        className="w-full px-4 py-4 bg-slate-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200 text-2xl font-semibold text-center tracking-[0.3em] text-gray-900 placeholder:text-gray-300"
                                        placeholder="000000"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    />
                                </div>

                                <div className="flex flex-col space-y-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] hover:bg-blue-700 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] transition-all duration-200"
                                    >
                                        {loading ? 'Verifying...' : 'Verify & Sign in'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowOtp(false)}
                                        className="text-xs font-medium text-gray-400 hover:text-gray-900 transition-all duration-200"
                                    >
                                        Go back
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
                
                <footer className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2 text-gray-400">
                        <Command size={14} />
                        <span className="text-xs font-medium">Admin access secured</span>
                    </div>
                    <p className="text-xs text-gray-400">
                        © 2026 HDFC Bank Ltd. Admin Console
                    </p>
                </footer>
            </div>
        </div>
    );
};

const InputGroup = ({ label, type, placeholder, value, onChange }) => (
    <div className="space-y-1.5 group text-left">
        <label className="text-xs font-medium text-gray-500 group-focus-within:text-blue-600 transition-colors">{label}</label>
        <input
            type={type}
            required
            className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200 text-sm text-gray-900 placeholder:text-gray-400"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
        />
    </div>
);

export default AdminLogin;
