import React, { useState } from 'react';
import { API_BASE_URL } from '../src/config/api';
import { ShieldCheck, ArrowRight, Lock, User, AlertCircle, Key, Cpu } from 'lucide-react';

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/login`, {
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
            setError('System unreachable. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
            <div className="max-w-md w-full space-y-6">
                <div className="text-center">
                    <div className="flex flex-col items-center justify-center space-y-4 mb-6">
                        <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center text-white font-semibold text-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]">H</div>
                        <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1 rounded-lg">
                            <Lock size={12} className="text-blue-600" />
                            <span className="text-xs font-medium text-blue-600">Secure Login</span>
                        </div>
                    </div>
                    <h1 className="text-2xl font-semibold text-gray-900">Sign in to your account</h1>
                    <p className="text-sm text-gray-500 mt-2">Enter your credentials to continue</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]">
                    
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3 text-red-600">
                                <AlertCircle size={16} />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}

                        <div className="space-y-4">
                            <InputPortal 
                                label="Username" 
                                type="text"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                icon={User}
                            />
                            <InputPortal 
                                label="Password" 
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                icon={Lock}
                            />
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

                <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-400 mb-3">
                        <Cpu size={14} />
                        <span className="text-xs font-medium">SSL Encrypted Connection</span>
                    </div>
                    <p className="text-xs text-gray-400">
                        © 2026 HDFC Bank Ltd. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};

const InputPortal = ({ label, type, placeholder, value, onChange, icon: Icon }) => (
    <div className="space-y-1.5 group text-left">
        <label className="text-xs font-medium text-gray-500 group-focus-within:text-blue-600 transition-colors">{label}</label>
        <div className="relative">
            <input
                type={type}
                required
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-200 text-sm text-gray-900 placeholder:text-gray-400"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
            />
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                <Icon size={16} />
            </div>
        </div>
    </div>
);

export default Login;
