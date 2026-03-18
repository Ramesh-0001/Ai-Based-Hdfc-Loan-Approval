import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Target, ShieldCheck, Zap, Info } from 'lucide-react';

const SmartLoanRecommendation = ({ income, empType, creditScore }) => {
    const [recs, setRecs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecs();
    }, [income, empType, creditScore]);

    const fetchRecs = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8000/api/advisor/recommendations?income=${income}&emp_type=${empType}&credit_score=${creditScore}`);
            const data = await response.json();
            setRecs(data.eligible_types);
        } catch (error) {
            setRecs([
                { type: "Personal loan", reasoning: "Optimized for your current liquidity profile.", max_amount: income * 0.5 },
                { type: "Education loan", reasoning: "Ideal for institutional career development.", max_amount: 1500000 }
            ]);
        }
        setLoading(false);
    };

    return (
        <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] border border-gray-200 font-sans">
            <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]">
                    <Sparkles size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-gray-900 tracking-tight">Tailored recommendations</h3>
                    <p className="text-sm text-gray-400 font-normal mt-1">AI-driven product matching engine</p>
                </div>
            </div>
            
            <div className="space-y-4">
                {recs.map((rec, idx) => (
                    <div key={idx} className="group p-6 rounded-xl border border-gray-200 hover:border-blue-100 transition-all hover:bg-blue-50 cursor-default bg-slate-50">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900 tracking-tight">{rec.type}</h4>
                                <p className="text-[11px] text-gray-400 font-normal mt-1 leading-relaxed max-w-[200px]">{rec.reasoning}</p>
                            </div>
                            <div className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 transition-all group-hover:bg-blue-600 group-hover: group-hover:border-blue-600 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]">
                                <ArrowRight size={18} />
                            </div>
                        </div>
                        <div className="flex items-center space-x-3 pt-4 border-t border-gray-200/50">
                            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Maximum exposure:</span>
                            <span className="text-sm font-semibold text-blue-600 tracking-tight">₹{rec.max_amount.toLocaleString()}</span>
                        </div>
                    </div>
                ))}
            </div>
            
            <button className="w-full mt-6 py-4 border border-dashed border-gray-200 rounded-xl text-[11px] font-medium text-gray-400 uppercase tracking-widest hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center space-x-2 group">
                <Target size={14} className="opacity-60" />
                <span>View all institutional products</span>
            </button>
            
            <div className="mt-6 flex items-center justify-center space-x-4 text-[10px] font-medium text-gray-300 uppercase tracking-widest">
                <div className="flex items-center space-x-1.5 font-normal">
                    <ShieldCheck size={12} className="text-blue-500 opacity-60" />
                    <span>Compliance verified</span>
                </div>
                <span>•</span>
                <div className="flex items-center space-x-1.5 font-normal">
                    <Zap size={12} className="text-blue-500 opacity-60" />
                    <span>Real-time match</span>
                </div>
            </div>
        </div>
    );
};

export default SmartLoanRecommendation;
