import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const EligibilityChecker = () => {
    const [formData, setFormData] = useState({
        monthlyIncome: 50000,
        existingEMI: 0,
        creditScore: 750,
        employmentType: 'Salaried'
    });
    const [result, setResult] = useState(null);
    const [isEvaluating, setIsEvaluating] = useState(false);

    const checkEligibility = (e) => {
        e.preventDefault();
        setIsEvaluating(true);

        // Simulate institutional processing
        setTimeout(() => {
            const { monthlyIncome, existingEMI, creditScore, employmentType } = formData;
            let eligible = true;
            let reasons = [];

            if (creditScore < 650) {
                eligible = false;
                reasons.push("Institutional credit creditworthiness below threshold (Min: 650)");
            }

            const dti = (existingEMI / monthlyIncome) * 100;
            if (dti > 45) {
                eligible = false;
                reasons.push("Excessive debt-to-income leverage (>45%)");
            }

            if (employmentType === 'Unemployed') {
                eligible = false;
                reasons.push("Stable verified income stream requirement not met");
            }

            let maxLoan = 0;
            if (eligible) {
                const multiplier = creditScore >= 800 ? 60 : creditScore >= 700 ? 48 : 36;
                const disposableIncome = monthlyIncome - existingEMI;
                maxLoan = Math.max(0, disposableIncome * multiplier);
            }

            setResult({
                eligible,
                maxLoan: Math.round(maxLoan),
                reasons,
                dti: dti.toFixed(1)
            });
            setIsEvaluating(false);
        }, 1500);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-top-4 duration-1000">
            <div className="text-center space-y-4">
                <span className="px-4 py-1.5 bg-red-50 dark:bg-red-900/30 text-[#e11b22] dark:text-red-400 text-[10px] font-black uppercase tracking-[0.4em] rounded-full border border-red-100 dark:border-red-800">Pre-Assessment Module</span>
                <h1 className="text-5xl font-black text-[#003d82] dark:text-blue-400 tracking-tight">Institutional Eligibility Check</h1>
                <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto font-medium">Execute a non-binding feasibility study on your credit profile using HDFC Bank's real-time risk assessment parameters.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                {/* Form Card */}
                <div className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] shadow-2xl shadow-blue-900/5 border border-gray-100 dark:border-slate-700 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 dark:bg-slate-700/50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>

                    <form onSubmit={checkEligibility} className="relative z-10 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Monthly Applied Income (₹)</label>
                                <input
                                    type="number"
                                    className="w-full p-4 bg-gray-50 dark:bg-slate-900 dark:text-white border-2 border-transparent focus:border-[#003d82] rounded-2xl outline-none transition-all font-bold"
                                    value={formData.monthlyIncome}
                                    onChange={(e) => setFormData({ ...formData, monthlyIncome: Number(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Existing Fixed EMI (₹)</label>
                                <input
                                    type="number"
                                    className="w-full p-4 bg-gray-50 dark:bg-slate-900 dark:text-white border-2 border-transparent focus:border-[#003d82] rounded-2xl outline-none transition-all font-bold"
                                    value={formData.existingEMI}
                                    onChange={(e) => setFormData({ ...formData, existingEMI: Number(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current CIBIL/Credit Score</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        className="w-full p-4 bg-gray-50 dark:bg-slate-900 dark:text-white border-2 border-transparent focus:border-[#003d82] rounded-2xl outline-none transition-all font-bold"
                                        value={formData.creditScore}
                                        min="300"
                                        max="900"
                                        onChange={(e) => setFormData({ ...formData, creditScore: Number(e.target.value) })}
                                    />
                                    <span className="absolute right-4 top-4 text-[10px] font-black text-gray-400 uppercase">300-900</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Employment Category</label>
                                <select
                                    className="w-full p-4 bg-gray-50 dark:bg-slate-900 dark:text-white border-2 border-transparent focus:border-[#003d82] rounded-2xl outline-none transition-all font-bold appearance-none"
                                    value={formData.employmentType}
                                    onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                                >
                                    <option value="Salaried">Salaried Corporate</option>
                                    <option value="Self-Employed">Self-Employed Professional</option>
                                    <option value="Business">Business Entity Owner</option>
                                    <option value="Unemployed">Not Currently Employed</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isEvaluating}
                            className="w-full bg-[#003d82] hover:bg-blue-800 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-blue-900/20 uppercase tracking-widest text-xs flex items-center justify-center space-x-3 active:scale-95 disabled:opacity-50"
                        >
                            {isEvaluating ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Syncing with Credit Hub...</span>
                                </>
                            ) : (
                                <>
                                    <span>Verify Eligibility</span>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Result Hud */}
                <div className="relative min-h-[400px]">
                    {!result && !isEvaluating && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-gray-50 dark:bg-slate-900/30 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-slate-800">
                            <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-lg">
                                <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Awaiting Data Input for Analysis</p>
                        </div>
                    )}

                    {isEvaluating && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6">
                            <div className="w-24 h-24 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-sm font-black text-[#003d82] dark:text-blue-400 uppercase tracking-widest animate-pulse">Running Risk Simulations...</p>
                        </div>
                    )}

                    {result && (
                        <div className={`p-10 rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-700 h-full flex flex-col justify-between ${result.eligible ? 'bg-green-600 text-white' : 'bg-slate-900 text-white'
                            }`}>
                            <div>
                                <div className="flex items-start justify-between mb-8">
                                    <div>
                                        <h2 className="text-4xl font-black tracking-tighter mb-2">
                                            {result.eligible ? 'Clearance Granted' : 'Assessment On-Hold'}
                                        </h2>
                                        <p className="text-xs font-medium opacity-80">Institutional Simulation Reference: EVAL-2026-XQ</p>
                                    </div>
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${result.eligible ? 'bg-white text-green-600' : 'bg-red-600 text-white'}`}>
                                        {result.eligible ? (
                                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                                        ) : (
                                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M6 18L18 6M6 6l12 12" /></svg>
                                        )}
                                    </div>
                                </div>

                                {result.eligible ? (
                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mb-2">Borrowing Capacity Cap</p>
                                            <h3 className="text-6xl font-black tracking-tighter">₹{result.maxLoan.toLocaleString()}</h3>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white/10 p-4 rounded-2xl border border-white/20">
                                                <p className="text-[8px] font-black uppercase tracking-tighter opacity-60">Leverage (DTI)</p>
                                                <p className="text-xl font-black">{result.dti}%</p>
                                            </div>
                                            <div className="bg-white/10 p-4 rounded-2xl border border-white/20">
                                                <p className="text-[8px] font-black uppercase tracking-tighter opacity-60">Interest Tier</p>
                                                <p className="text-xl font-black">Elite Hub</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mb-4 text-red-400">Governance Conflict Detected</p>
                                            <ul className="space-y-3">
                                                {result.reasons.map((r, i) => (
                                                    <li key={i} className="flex items-start space-x-3 text-sm font-bold bg-white/5 p-4 rounded-2xl border border-white/10">
                                                        <span className="text-red-500">✕</span>
                                                        <span>{r}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <p className="text-xs italic opacity-60">"Consider de-leveraging existing debts or optimizing your credit trajectory to align with our lending appetite."</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-12">
                                {result.eligible ? (
                                    <Link
                                        to="/apply"
                                        className="w-full bg-white text-green-700 flex items-center justify-center py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:scale-[1.02] transition-transform"
                                    >
                                        Initiate Full Application
                                    </Link>
                                ) : (
                                    <Link
                                        to="/emi-calculator"
                                        className="w-full bg-slate-800 text-white flex items-center justify-center py-5 rounded-2xl font-black uppercase tracking-widest text-xs border border-white/10 hover:bg-slate-700 transition-all"
                                    >
                                        Simulate Lower Installments
                                    </Link>
                                )}
                                <p className="text-[8px] mt-4 text-center opacity-50 uppercase tracking-[0.2em] font-black">© HDFC Institutional Risk Unit | AI-Reference Evaluator</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EligibilityChecker;
