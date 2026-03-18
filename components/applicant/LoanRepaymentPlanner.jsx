import React, { useState, useEffect } from 'react';
import { Calculator, IndianRupee, TrendingUp, Info, ArrowRight, ShieldCheck, Activity } from 'lucide-react';

const LoanRepaymentPlanner = () => {
    const [amount, setAmount] = useState(500000);
    const [rate, setRate] = useState(10.5);
    const [tenure, setTenure] = useState(60);
    const [result, setResult] = useState(null);

    useEffect(() => {
        calculateRepayment();
    }, [amount, rate, tenure]);

    const calculateRepayment = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/finance/repayment-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, rate, tenure })
            });
            const data = await response.json();
            setResult(data);
        } catch (error) {
            // Fallback calculation if backend is unavailable
            const r = (rate / 100) / 12;
            const emi = (amount * r * Math.pow(1 + r, tenure)) / (Math.pow(1 + r, tenure) - 1);
            setResult({
                monthly_emi: Math.round(emi),
                total_interest_payable: Math.round(emi * tenure - amount),
                total_repayment_amount: Math.round(emi * tenure)
            });
        }
    };

    return (
        <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] border border-gray-200 font-sans">
            <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]">
                    <Calculator size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-gray-900 tracking-tight">Repayment planner</h3>
                    <p className="text-sm text-gray-400 font-normal mt-1">Simulate repayments and amortization logic</p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <PlanInput label="Loan amount (₹)" value={amount} onChange={(e) => setAmount(Number(e.target.value))} icon={IndianRupee} />
                    <PlanInput label="Interest rate (%)" value={rate} step="0.1" onChange={(e) => setRate(Number(e.target.value))} icon={Activity} />
                    <PlanInput label="Tenure (months)" value={tenure} onChange={(e) => setTenure(Number(e.target.value))} icon={TrendingUp} />
                </div>

                {result && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-gray-200">
                        <ResultCard label="Monthly EMI" value={`₹${result.monthly_emi.toLocaleString()}`} color="blue" />
                        <ResultCard label="Total Interest" value={`₹${result.total_interest_payable.toLocaleString()}`} color="orange" />
                        <ResultCard label="Total Amount" value={`₹${result.total_repayment_amount.toLocaleString()}`} color="green" />
                    </div>
                )}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-8">
                <div className="flex items-center space-x-6 text-[10px] font-medium text-gray-300 uppercase tracking-widest">
                    <div className="flex items-center space-x-2">
                        <ShieldCheck size={12} className="text-blue-500 opacity-60" />
                        <span>Audit verified</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Info size={12} className="text-blue-500 opacity-60" />
                        <span>Core v4.8</span>
                    </div>
                </div>
                <button className="flex items-center space-x-2 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                    <span>Export amortization schedule</span>
                    <ArrowRight size={14} />
                </button>
            </div>
        </div>
    );
};

const PlanInput = ({ label, value, onChange, icon: Icon, step = "1" }) => (
    <div className="space-y-4 group">
        <label className="text-xs font-medium text-gray-400 ml-1 group-focus-within:text-blue-600 transition-colors">{label}</label>
        <div className="relative">
            <Icon className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" size={18} />
            <input 
                type="number" 
                step={step}
                value={value} 
                onChange={onChange}
                className="w-full bg-slate-50 border border-transparent rounded-xl pl-16 pr-6 py-4.5 text-base font-semibold tracking-tight outline-none focus:bg-white focus:border-blue-100 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]"
            />
        </div>
    </div>
);

const ResultCard = ({ label, value, color }) => {
    const colors = {
        blue: "bg-blue-50 text-blue-600 border-blue-50",
        orange: "bg-orange-50 text-orange-600 border-orange-50",
        green: "bg-green-50 text-green-600 border-green-50"
    };

    return (
        <div className={`p-6 rounded-[28px] border ${colors[color]} flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] transition-all hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] animate-in fade-in slide-in-from-bottom-2 duration-500`}>
            <p className="text-[10px] font-medium uppercase tracking-widest mb-3 opacity-70">{label}</p>
            <p className={`text-2xl font-semibold tracking-tight ${color === 'blue' ? 'text-gray-900' : ''}`}>{value}</p>
        </div>
    );
};

export default LoanRepaymentPlanner;
