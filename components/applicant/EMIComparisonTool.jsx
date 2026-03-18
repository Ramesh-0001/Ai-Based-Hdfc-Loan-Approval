import React, { useState, useEffect } from 'react';
import { Calculator, PieChart, TrendingUp, Info } from 'lucide-react';

const EMIComparisonTool = ({ loanAmount = 500000 }) => {
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchComparison();
    }, [loanAmount]);

    const fetchComparison = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8000/api/finance/compare-emi', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: loanAmount,
                    rate: 10.5,
                    tenure_options: [3, 5, 7]
                })
            });
            const data = await response.json();
            setOptions(data);
        } catch (error) {
            // Fallback
            const rate = 10.5;
            const r = (rate / 100) / 12;
            const fallback = [3, 5, 7].map(years => {
                const tenure = years * 12;
                const emi = (loanAmount * r * Math.pow(1 + r, tenure)) / (Math.pow(1 + r, tenure) - 1);
                return {
                    tenure_years: years,
                    emi: Math.round(emi),
                    total_interest: Math.round(emi * tenure - loanAmount)
                };
            });
            setOptions(fallback);
        }
        setLoading(false);
    };

    return (
        <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] border border-gray-200 p-6 overflow-hidden font-sans">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 tracking-tight">Tenure comparison</h3>
            
            <div className="space-y-4">
                {options.map((opt, idx) => (
                    <div 
                        key={idx} 
                        className={`group relative p-6 rounded-xl border transition-all duration-300 cursor-default ${idx === 1 ? 'bg-blue-50 border-blue-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]' : 'bg-slate-50 border-transparent hover:border-gray-200'}`}
                    >
                        {idx === 1 && (
                            <span className="absolute -top-2 right-6 bg-blue-600 text-white text-[9px] font-medium uppercase tracking-widest px-3 py-1 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]">Most popular</span>
                        )}
                        
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-1">Tenure option</p>
                                <p className="text-lg font-semibold text-gray-900">{opt.tenure_years} years</p>
                            </div>
                            <div className="text-right sm:text-center">
                                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-1">Monthly EMI</p>
                                <p className="text-xl font-semibold text-blue-600">₹{opt.emi.toLocaleString()}</p>
                            </div>
                            <div className="hidden sm:block text-right">
                                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-1">Total interest</p>
                                <p className="text-sm font-medium text-gray-600">₹{opt.total_interest.toLocaleString()}</p>
                            </div>
                        </div>
                        
                        {/* Visual Bar for Interest Ratio */}
                        <div className="mt-6 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                            <div 
                                className={`h-full transition-all duration-1000 ease-out rounded-full ${idx === 0 ? 'bg-green-500' : idx === 1 ? 'bg-blue-600' : 'bg-orange-500'}`}
                                style={{ width: `${100 - (opt.total_interest / (opt.emi * opt.tenure_years * 12)) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-6 flex items-center justify-center space-x-2 text-[11px] text-gray-400 font-normal">
                <Info size={14} className="text-blue-600" />
                <p>Calculated at 10.5% base interest rate</p>
            </div>
        </div>
    );
};

export default EMIComparisonTool;
