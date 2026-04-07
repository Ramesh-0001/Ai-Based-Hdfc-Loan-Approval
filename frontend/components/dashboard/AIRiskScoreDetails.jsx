import React from 'react';
import { ShieldCheck, Info, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

const AIRiskScoreDetails = ({ app }) => {
    if (!app) {
        return (
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] text-center font-sans max-w-2xl mx-auto">
                <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mx-auto mb-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]">
                    <ShieldCheck size={32} />
                </div>
                <h3 className="text-[28px] font-semibold text-gray-900 tracking-tight">AI Risk Audit Pending</h3>
                <p className="text-[15px] text-gray-500 mt-4 leading-relaxed font-normal">
                    Submit a loan application to initialize our AI Risk Assessment engine. Your profile will be analyzed across multiple parameters to generate a detailed audit score.
                </p>
            </div>
        );
    }

    console.log("APP DATA:", app);
    const score = app.score || app.aiCreditworthiness || app.ai_creditworthiness || 0;
    const rawBreakdown = app.breakdown || app.score_breakdown || app.scoreBreakdown;
    let breakdown = [];
    if (rawBreakdown) {
        try {
            breakdown = typeof rawBreakdown === 'string' ? JSON.parse(rawBreakdown) : rawBreakdown;
        } catch (e) {
            console.error("Failed to parse score breakdown:", e);
            breakdown = [];
        }
    }
    if (!Array.isArray(breakdown)) breakdown = [];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans max-w-4xl mx-auto">
            <header className="flex items-center justify-between pb-8 border-b border-gray-200">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">AI Risk Score Analysis</h2>
                    <p className="text-sm text-gray-500 mt-2">Real-time breakdown of your institution-grade risk audit</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-semibold border border-blue-100 uppercase tracking-wider">
                    <ShieldCheck size={14} /> Audit Terminal Active
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Main Score Card */}
                <div className="lg:col-span-12 bg-white border border-gray-200 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex-1 text-center md:text-left">
                            <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-2">Final Risk Score</p>
                            <div className="flex items-baseline gap-4 justify-center md:justify-start">
                                <h1 className="text-2xl font-semibold text-blue-600 tracking-tighter">{score}</h1>
                                <span className="text-2xl font-semibold text-gray-300">/ 100</span>
                            </div>
                            <div className="mt-6 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                                        score >= 70 ? 'bg-green-100 text-green-700' : 
                                        score >= 50 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                        {score >= 70 ? 'Institutional Pass' : score >= 50 ? 'Manual Review Triggered' : 'Variance High'}
                                    </div>
                                    <span className="text-sm font-medium text-gray-400">Risk Level: <span className="text-gray-900">{app.status || app.riskLevel || app.risk_level || 'Medium'}</span></span>
                                </div>
                            </div>
                        </div>

                        <div className="w-full md:w-[400px]">
                            <h4 className="text-sm font-semibold text-gray-900 mb-6 uppercase tracking-wider text-center md:text-left">AI Score Calculation Basis</h4>
                            <div className="space-y-3">
                                {breakdown.length === 0 && (
                                  <p className="text-sm text-gray-400">No breakdown available</p>
                                )}
                                {breakdown.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center py-2.5 px-4 bg-slate-50 border-b border-gray-200/50 last:border-0 rounded-lg hover:bg-slate-50 transition-colors">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-gray-800">{item.factor}</span>
                                            <span className="text-[10px] text-gray-400 font-medium italic">{item.reason}</span>
                                        </div>
                                        <div className={`text-[15px] font-semibold font-mono ${item.score >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                            {item.score >= 0 ? '+' : ''}{item.score}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Insight Blocks */}
                <div className="lg:col-span-8 bg-white border border-gray-200 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]">
                    <div className="flex items-center gap-3 mb-6">
                        <TrendingUp className="text-blue-600" size={20} />
                        <h4 className="text-lg font-semibold text-gray-900">Score Dynamics</h4>
                    </div>
                    <p className="text-[15px] text-gray-500 leading-relaxed">
                        This AI score is dynamically calculated across 10 institutional weightage factors. Your strong <span className="text-blue-600 font-semibold">{breakdown.find(b => b.score === Math.max(...breakdown.map(i => i.score)))?.factor || 'financial health'}</span> contributes significantly to your high score. We recommend {app.status === 'PENDING' ? 'providing additional proof of stability' : 'maintaining this balance'} to optimize future credit lines.
                    </p>
                </div>

                <div className="lg:col-span-4 bg-white border border-gray-200 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
                    <div className="flex items-center gap-3 mb-6 font-semibold">
                        <Info className="text-blue-400" size={20} />
                        <h4>Audit Insights</h4>
                    </div>
                    <ul className="space-y-4">
                        <li className="flex items-start gap-3 text-sm text-gray-400">
                            <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
                            <span>Employment stability meets prime banking standards.</span>
                        </li>
                        <li className="flex items-start gap-3 text-sm text-gray-400">
                             <AlertCircle size={16} className="text-orange-400 shrink-0 mt-0.5" />
                             <span>Debt-to-income ratio is within safe institutional bounds.</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AIRiskScoreDetails;
