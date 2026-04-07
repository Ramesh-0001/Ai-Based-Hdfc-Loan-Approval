import React, { useState, useEffect } from 'react';
import { ShieldCheck, TrendingUp, Info, Activity } from 'lucide-react';

const CreditSimulator = () => {
    const [salary, setSalary] = useState(75000);
    const [loanAmount, setLoanAmount] = useState(500000);
    const [existingLoans, setExistingLoans] = useState(15000);
    const [score, setScore] = useState(740);
    const [prevScore, setPrevScore] = useState(740);

    useEffect(() => {
        setPrevScore(score);
        const dti = (existingLoans + (loanAmount / 60)) / salary;
        let simulatedScore = 820 - (dti * 350);
        
        if (simulatedScore > 850) simulatedScore = 850;
        if (simulatedScore < 300) simulatedScore = 300;
        
        setScore(Math.round(simulatedScore));
    }, [salary, loanAmount, existingLoans]);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val);
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-xl hover:shadow-blue-900/10 transition-all duration-300 hover:scale-[1.03] animate-in fade-in duration-500 font-sans">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Credit Simulator</h3>
                        <p className="text-[11px] text-blue-600 font-bold uppercase tracking-widest">Risk Analysis</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Projected Score</p>
                    <div className="flex items-center gap-2 justify-end">
                        <span className={`text-2xl font-bold tracking-tight ${score >= 700 ? 'text-green-600' : score >= 500 ? 'text-orange-500' : 'text-red-500'}`}>
                            {score}
                        </span>
                        <div className={`flex items-center gap-0.5 text-xs font-bold ${score >= prevScore ? 'text-green-500' : 'text-red-500'}`}>
                             {score >= prevScore ? <TrendingUp size={14} /> : <TrendingUp size={14} className="rotate-180" />}
                             {Math.abs(score - prevScore)}
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {/* Sliders styled like other inputs */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <label className="font-medium text-gray-700">Monthly Salary</label>
                        <span className="font-bold text-blue-600">{formatCurrency(salary)}</span>
                    </div>
                    <input
                        type="range" min="10000" max="500000" step="5000" value={salary}
                        onChange={(e) => setSalary(Number(e.target.value))}
                        className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <label className="font-medium text-gray-700">Loan Amount</label>
                        <span className="font-bold text-blue-600">{formatCurrency(loanAmount)}</span>
                    </div>
                    <input
                        type="range" min="50000" max="5000000" step="50000" value={loanAmount}
                        onChange={(e) => setLoanAmount(Number(e.target.value))}
                        className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <label className="font-medium text-gray-700">Existing EMIs</label>
                        <span className="font-bold text-blue-600">{formatCurrency(existingLoans)}</span>
                    </div>
                    <input
                        type="range" min="0" max="200000" step="2000" value={existingLoans}
                        onChange={(e) => setExistingLoans(Number(e.target.value))}
                        className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                </div>
            </div>

            <div className="mt-6 p-4 bg-slate-50 border border-gray-100 rounded-xl flex gap-3 items-start">
                <Info size={16} className="text-blue-600 mt-0.5" />
                <p className="text-xs text-gray-600 leading-normal">
                    AI Analysis: Your projected score puts you in a <span className="font-bold text-blue-600">Secure</span> category for the selected loan amount.
                </p>
            </div>
        </div>
    );
};

export default CreditSimulator;
