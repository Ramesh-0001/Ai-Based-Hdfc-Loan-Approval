import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, IndianRupee, TrendingUp, Info } from 'lucide-react';

const FinancialHealthDashboard = ({ income, creditScore, existingEmis, requestedLoan }) => {
    const [health, setHealth] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHealth();
    }, [income, creditScore, existingEmis, requestedLoan]);

    const fetchHealth = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8000/api/dashboard/health?income=${income}&credit_score=${creditScore}&existing_emis=${existingEmis}&requested_loan=${requestedLoan}`);
            const data = await response.json();
            setHealth(data);
        } catch (error) {
            // Static calculation as fallback
            const monthlyInc = income / 12;
            const lbr = (existingEmis / monthlyInc) * 100;
            setHealth({
                monthly_income: Math.round(monthlyInc),
                loan_burden_ratio: Math.round(lbr),
                credit_score: creditScore,
                risk_level: creditScore > 750 ? "Very low" : (creditScore > 650 ? "Low" : "Moderate"),
                recommended_loan_limit: income * 4,
                metrics: [
                    { label: "Income stability", value: income > 500000 ? "Good" : "Average" },
                    { label: "Debt safety", value: lbr < 35 ? "Safe" : "Warning" },
                    { label: "Credit standing", value: creditScore > 750 ? "Prime" : "Regular" }
                ]
            });
        }
        setLoading(false);
    };

    if (loading || !health) return (
        <div className="min-h-[200px] flex flex-col items-center justify-center space-y-4 font-sans">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-xs text-gray-400">Aggregating health metrics...</p>
        </div>
    );

    return (
        <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] border border-gray-200 font-sans">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-6">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-50">
                        <Activity size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900 tracking-tight">Financial summary</h3>
                        <p className="text-sm text-gray-400 font-normal mt-1">Institutional risk and stability profile</p>
                    </div>
                </div>
                <div className={`px-4 py-1.5 rounded-xl text-[11px] font-medium border ${health.risk_level.includes('low') || health.risk_level.includes('Low') ? 'bg-green-50 text-green-600 border-green-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                    <span className="flex items-center">
                        <ShieldCheck size={12} className="mr-1.5" />
                        {health.risk_level} risk
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <SummaryCard label="Monthly income" value={`₹${health.monthly_income.toLocaleString()}`} icon={IndianRupee} />
                <SummaryCard label="Debt-to-income" value={`${health.loan_burden_ratio}%`} icon={TrendingUp} />
                <SummaryCard label="Credit score" value={health.credit_score} icon={Activity} />
                <SummaryCard label="Max loan limit" value={`₹${health.recommended_loan_limit.toLocaleString()}`} icon={ShieldCheck} />
            </div>

            <div className="space-y-6 pt-10 border-t border-gray-200">
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest pl-1">Key health indicators</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {health.metrics.map((m, idx) => (
                        <div key={idx} className="bg-slate-50 border border-gray-200 p-5 rounded-xl flex items-center justify-between group hover:bg-white hover:border-blue-100 transition-all">
                            <span className="text-xs font-medium text-gray-500">{m.label}</span>
                            <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border ${
                                m.value === 'Safe' || m.value === 'Good' || m.value === 'Prime' 
                                ? 'bg-green-50 text-green-600 border-green-100' 
                                : 'bg-orange-50 text-orange-600 border-orange-100'
                            }`}>
                                {m.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-6 flex items-center justify-center space-x-2 text-[10px] font-medium text-gray-300 tracking-widest uppercase">
                <Info size={12} className="text-blue-500 opacity-60" />
                <span>Enterprise v4.8 • Core Risk Evaluator</span>
            </div>
        </div>
    );
};

const SummaryCard = ({ label, value, icon: Icon }) => (
    <div className="p-6 bg-slate-50 rounded-xl border border-gray-200 flex flex-col justify-between hover:bg-white hover:border-blue-100 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]">
        <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-blue-600 mb-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]">
            <Icon size={16} />
        </div>
        <div>
            <p className="text-xs font-medium text-gray-400 mb-1">{label}</p>
            <p className="text-xl font-semibold text-gray-900 tracking-tight">{value}</p>
        </div>
    </div>
);

export default FinancialHealthDashboard;
