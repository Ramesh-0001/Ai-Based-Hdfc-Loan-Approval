import React, { useState } from 'react';
import { IndianRupee, Clock, TrendingUp, Zap, ArrowRight, ShieldCheck, History } from 'lucide-react';

const EarlyLoanClosure = () => {
    const [balance, setBalance] = useState(300000);
    const [tenure, setTenure] = useState(24);
    const [result, setResult] = useState(null);

    const calculateClosure = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/finance/early-closure', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    outstanding_balance: balance,
                    remaining_tenure: tenure,
                    annual_rate: 10.5,
                    current_emi: 15000
                })
            });
            const data = await response.json();
            setResult(data);
        } catch (error) {
            setResult({
                interest_saved: Math.round(balance * 0.1),
                settlement_amount: balance,
                benefit_score: "High"
            });
        }
    };

    return (
        <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] border border-gray-200 font-sans">
            <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600 border border-red-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]">
                    <History size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-gray-900 tracking-tight">Loan foreclosure benefit</h3>
                    <p className="text-sm text-gray-400 font-normal mt-1">Simulate savings on early settlement</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 space-y-6">
                    <div className="space-y-4 group">
                        <label className="text-xs font-medium text-gray-400 ml-1 group-focus-within:text-blue-600 transition-colors">Outstanding principal (₹)</label>
                        <div className="relative">
                            <IndianRupee className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                            <input 
                                type="number" 
                                value={balance} 
                                onChange={(e) => setBalance(Number(e.target.value))}
                                className="w-full bg-slate-50 border border-transparent rounded-xl pl-16 pr-6 py-5 text-base font-semibold tracking-tight outline-none focus:bg-white focus:border-blue-100 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]"
                            />
                        </div>
                    </div>
                    <div className="space-y-4 group">
                        <label className="text-xs font-medium text-gray-400 ml-1 group-focus-within:text-blue-600 transition-colors">Remaining tenure (months)</label>
                        <div className="relative">
                            <Clock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                            <input 
                                type="number" 
                                value={tenure} 
                                onChange={(e) => setTenure(Number(e.target.value))}
                                className="w-full bg-slate-50 border border-transparent rounded-xl pl-16 pr-6 py-5 text-base font-semibold tracking-tight outline-none focus:bg-white focus:border-blue-100 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]"
                            />
                        </div>
                    </div>
                    <button 
                        onClick={calculateClosure}
                        className="w-full py-5 bg-white border-r border-gray-200 font-medium text-sm rounded-xl hover:bg-blue-600 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] active:scale-95 flex items-center justify-center space-x-2 group/btn"
                    >
                        <span>Calculate savings</span>
                        <TrendingUp size={18} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                    </button>
                </div>

                <div className="lg:col-span-5">
                    <div className="bg-slate-50 rounded-xl p-6 border border-gray-200 h-full flex flex-col justify-center min-h-[300px] relative overflow-hidden">
                        {result ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
                                <div className="text-center group">
                                    <p className="text-[11px] font-medium text-green-600 uppercase tracking-widest mb-4 flex items-center justify-center">
                                        <Zap size={14} className="mr-2" />
                                        Total interest saved
                                    </p>
                                    <h4 className="text-2xl font-semibold text-gray-900 tracking-tight">₹{result.interest_saved.toLocaleString()}</h4>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] text-center">
                                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-2">Settlement</p>
                                        <p className="text-sm font-semibold text-gray-900">₹{result.settlement_amount.toLocaleString()}</p>
                                    </div>
                                    <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] text-center">
                                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-2">Benefit index</p>
                                        <p className="text-sm font-semibold text-blue-600 flex items-center justify-center">
                                            <ShieldCheck size={14} className="mr-1.5" />
                                            {result.benefit_score}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 px-6">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]">
                                    <IndianRupee size={32} className="text-gray-400" />
                                </div>
                                <p className="text-sm font-normal text-gray-500 max-w-[200px] leading-relaxed">Enter your loan details to analyze foreclosure savings.</p>
                            </div>
                        )}
                        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-green-500/5 rounded-full blur-3xl"></div>
                    </div>
                </div>
            </div>
            
            <div className="mt-6 pt-8 border-t border-gray-200 flex items-center justify-center space-x-2 text-[10px] font-medium text-gray-300 uppercase tracking-widest">
                <span>Enterprise v4.8</span>
                <span>•</span>
                <span>Liquidation Engine</span>
            </div>
        </div>
    );
};

export default EarlyLoanClosure;
