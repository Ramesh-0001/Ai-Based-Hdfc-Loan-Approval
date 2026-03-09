
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const CustomerDashboard = ({ user, applications, onLogout }) => {
    const navigate = useNavigate();
    const [expandedAppId, setExpandedAppId] = useState(null);

    const isGuest = user?.isGuest;

    const handleSignIn = () => {
        onLogout();
        navigate('/login');
    };

    const toggleExpand = (id) => {
        setExpandedAppId(expandedAppId === id ? null : id);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#003d82] dark:text-blue-400">
                        {isGuest ? 'Guest Portal Preview' : 'My Loan Applications'}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {isGuest ? 'You are viewing the dashboard as a guest. Please sign in to apply.' : 'Track your requests and get instant updates.'}
                    </p>
                </div>
                {!isGuest && (
                    <Link to="/apply" className="px-6 py-3 bg-[#e11b22] text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg hover:bg-red-700 transition-all active:scale-95">
                        New Application
                    </Link>
                )}
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors duration-300">
                <div className="p-6">
                    {applications.length === 0 ? (
                        <div className="text-center py-16 space-y-4">
                            <div className="bg-gray-100 dark:bg-slate-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium">
                                {isGuest ? 'Application processing is disabled for guests.' : "You haven't submitted any applications yet."}
                            </p>
                            {isGuest ? (
                                <button
                                    onClick={handleSignIn}
                                    className="inline-block px-8 py-3 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                                >
                                    Sign in to Apply
                                </button>
                            ) : (
                                <Link to="/apply" className="text-[#003d82] dark:text-blue-400 font-bold hover:underline transition-colors">Get started today</Link>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {applications.map(app => (
                                <div key={app.id} className="group border dark:border-slate-700 rounded-lg p-0 overflow-hidden transition-all duration-300">
                                    <div
                                        onClick={() => toggleExpand(app.id)}
                                        className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${expandedAppId === app.id ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center space-x-2">
                                                <span className="font-bold text-lg text-gray-800 dark:text-gray-100">₹{app.loanAmount.toLocaleString()}</span>
                                                <span className="text-gray-400 dark:text-gray-600">•</span>
                                                <span className="text-sm text-gray-500 dark:text-gray-400">{app.loanPurpose}</span>
                                            </div>
                                            <p className="text-xs text-gray-400 dark:text-gray-500">ID: {app.id.toUpperCase()} • Submitted: {new Date(app.createdAt).toLocaleDateString()}</p>
                                        </div>

                                        <div className="flex items-center space-x-6">
                                            <div className="text-right">
                                                <div className={`text-sm font-bold px-3 py-1 rounded-full text-center ${app.status === 'APPROVED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                    app.status === 'REJECTED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                    }`}>
                                                    {app.status}
                                                </div>
                                            </div>
                                            <div className={`transform transition-transform duration-300 ${expandedAppId === app.id ? 'rotate-90' : ''}`}>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-[#003d82] dark:group-hover:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expandable Content */}
                                    {expandedAppId === app.id && (
                                        <div className="p-5 bg-gray-50 dark:bg-slate-800/50 border-t dark:border-slate-700 animate-in slide-in-from-top-2 duration-300">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-4">
                                                    <div>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Risk Assessment</p>
                                                        <div className="flex items-center space-x-3">
                                                            <div className={`px-2 py-1 rounded text-[10px] font-bold ${app.aiCreditworthiness >= 71 ? 'bg-green-100 text-green-700' : app.aiCreditworthiness >= 41 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                                                Score: {app.aiCreditworthiness}
                                                            </div>
                                                            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                                                                {app.aiCreditworthiness >= 71 ? 'Low Risk' : app.aiCreditworthiness >= 41 ? 'Medium Risk' : 'High Risk'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                                                                AI Decision Basis
                                                            </p>
                                                            <div className="space-y-1 bg-white dark:bg-slate-800 p-3 rounded-lg border dark:border-slate-700 shadow-sm">
                                                                {Array.isArray(app.aiReasoning) ? (
                                                                    app.aiReasoning.map((reason, idx) => (
                                                                        <p key={idx} className="text-[11px] text-gray-600 dark:text-gray-300 font-medium">• {reason.replace(/^•\s*/, '')}</p>
                                                                    ))
                                                                ) : (
                                                                    <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{app.aiReasoning || "Decision pending final manual review."}"</p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {app.status === 'REJECTED' && app.recommendations && app.recommendations.length > 0 && (
                                                            <div className="p-3 bg-[#003d82]/5 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800/50">
                                                                <p className="text-[10px] font-black text-[#003d82] dark:text-blue-400 uppercase tracking-widest mb-2">Improvement Roadmap</p>
                                                                <ul className="space-y-1">
                                                                    {app.recommendations.map((rec, idx) => (
                                                                        <li key={idx} className="text-[10px] text-blue-800 dark:text-blue-200 font-bold flex items-start">
                                                                            <span className="mr-2">✨</span> {rec}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Submission Summary</p>
                                                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                                                        <div>
                                                            <p className="text-[10px] text-gray-400">Term</p>
                                                            <p className="text-xs font-bold dark:text-white">{app.loanTenure} Months</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-gray-400">Interest Ratio</p>
                                                            <p className="text-xs font-bold dark:text-white">10.5% p.a.</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-gray-400">Employment</p>
                                                            <p className="text-xs font-bold dark:text-white">{app.employmentType}</p>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                            <span className="text-[10px] font-bold text-gray-400">RSA Verified</span>
                                                        </div>
                                                    </div>

                                                    {app.status === 'APPROVED' && (
                                                        <div className="mt-6 pt-4 border-t dark:border-slate-700">
                                                            <div className="flex justify-between items-center mb-2">
                                                                <p className="text-[10px] font-black text-[#003d82] dark:text-blue-400 uppercase">Monthly EMI Repayment</p>
                                                                <p className="text-xs font-black text-green-600">₹{Math.round(app.emi || (app.loanAmount * 0.012)).toLocaleString()}</p>
                                                            </div>
                                                            <div className="bg-gray-50 dark:bg-slate-900 p-3 rounded-lg">
                                                                <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mb-1">Repayment Schedule</p>
                                                                <div className="flex justify-between text-[10px] font-bold">
                                                                    <span>Principal: 72%</span>
                                                                    <span>Interest: 28%</span>
                                                                </div>
                                                                <div className="w-full h-1 bg-gray-200 rounded-full mt-1 overflow-hidden flex">
                                                                    <div className="h-full bg-blue-600" style={{ width: '72%' }}></div>
                                                                    <div className="h-full bg-amber-400" style={{ width: '28%' }}></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-gray-50 dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 transition-colors duration-300">
                <h3 className="font-bold text-gray-800 dark:text-white mb-2">How it works</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                    <div className="flex items-start space-x-3">
                        <div className="bg-[#003d82] dark:bg-blue-600 text-white w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold transition-colors">1</div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Submit your basic financial details and requirements.</p>
                    </div>
                    <div className="flex items-start space-x-3">
                        <div className="bg-[#003d82] dark:bg-blue-600 text-white w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold transition-colors">2</div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">HDFC AI Engine analyzes your risk profile in real-time.</p>
                    </div>
                    <div className="flex items-start space-x-3">
                        <div className="bg-[#003d82] dark:bg-blue-600 text-white w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold transition-colors">3</div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">A Loan Officer provides final confirmation on your request.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDashboard;
