import React, { useState, useEffect } from 'react';
import { Calculator, Calendar, PieChart, TrendingDown, IndianRupee, CreditCard, ChevronRight } from 'lucide-react';

const EMIPlanner = () => {
    const [amount, setAmount] = useState(1000000);
    const [rate, setRate] = useState(8.5);
    const [tenure, setTenure] = useState(24); // in months
    const [emi, setEmi] = useState(0);
    const [totalInterest, setTotalInterest] = useState(0);

    useEffect(() => {
        const monthlyRate = rate / 12 / 100;
        const emiVal = (amount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1);
        setEmi(Math.round(emiVal));
        setTotalInterest(Math.round((emiVal * tenure) - amount));
    }, [amount, rate, tenure]);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val);
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-xl hover:shadow-blue-900/10 transition-all duration-300 hover:scale-[1.03] animate-in fade-in duration-500 font-sans">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                    <Calculator size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900 tracking-tight">EMI Specialist Planner</h3>
                    <p className="text-[11px] text-blue-600 font-bold uppercase tracking-widest mt-0.5 opacity-80">
                        Financial Strategy Tool
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                    <div className="space-y-3">
                        <div className="flex justify-between items-end">
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest italic">Principal Amount</span>
                            <span className="text-xl font-bold text-gray-900">{formatCurrency(amount)}</span>
                        </div>
                        <input
                            type="range" min="100000" max="10000000" step="50000" value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            className="w-full h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-end">
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest italic">Interest rate (p.a)</span>
                            <span className="text-xl font-bold text-blue-600">{rate}%</span>
                        </div>
                        <input
                            type="range" min="1" max="18" step="0.1" value={rate}
                            onChange={(e) => setRate(Number(e.target.value))}
                            className="w-full h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-end">
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest italic">Tenure (Months)</span>
                            <span className="text-xl font-bold text-gray-900">{tenure} Mo</span>
                        </div>
                        <input
                            type="range" min="12" max="360" step="12" value={tenure}
                            onChange={(e) => setTenure(Number(e.target.value))}
                            className="w-full h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="bg-slate-50 border border-gray-100 p-6 rounded-2xl flex items-center justify-between group hover:bg-white hover:border-blue-100 transition-all duration-300">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic mb-2">Monthly EMI</p>
                            <p className="text-2xl font-black text-gray-900 tabular-nums">{formatCurrency(emi)}</p>
                        </div>
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 border border-gray-100 shadow-sm transition-transform group-hover:scale-110">
                             <CreditCard size={18} />
                        </div>
                    </div>

                    <div className="bg-slate-50 border border-gray-100 p-6 rounded-2xl flex items-center justify-between group hover:bg-white hover:border-orange-100 transition-all duration-300">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic mb-2">Interest Payable</p>
                            <p className="text-2xl font-black text-gray-900 tabular-nums group-hover:text-orange-600 transition-colors">{formatCurrency(totalInterest)}</p>
                        </div>
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-orange-500 border border-gray-100 shadow-sm transition-transform group-hover:scale-110">
                             <TrendingDown size={18} />
                        </div>
                    </div>

                    <div className="bg-blue-600 p-6 rounded-2xl text-white shadow-xl shadow-blue-900/10 flex justify-between items-center group active:scale-[0.98] transition-all cursor-pointer">
                        <div>
                            <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-2 opacity-80 italic">Total Repayment</p>
                            <p className="text-2xl font-black tabular-nums">{formatCurrency(amount + totalInterest)}</p>
                        </div>
                        <div className="bg-white/10 p-2.5 rounded-xl group-hover:scale-110 transition-transform">
                            <ChevronRight size={18} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EMIPlanner;
