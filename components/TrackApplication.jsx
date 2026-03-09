
import React, { useState } from 'react';

const TrackApplication = ({ applications }) => {
    const [mobile, setMobile] = useState('');
    const [foundApp, setFoundApp] = useState(null);
    const [error, setError] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();

        if (mobile.length < 10) {
            setError('Please enter a valid 10-digit registered mobile number.');
            setFoundApp(null);
            return;
        }

        // Sort by id descending or createdAt descending (find gets the first match, but if we assume apps are chronological, find is fine or we can filter and take the latest)
        // Here we just find the first application that matches the mobile number
        const result = applications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).find(a => a.mobile === mobile);

        if (result) {
            setFoundApp(result);
            setError('');
        } else {
            setFoundApp(null);
            setError(`No application found for the mobile number "${mobile}". Please verify the number or contact support.`);
        }
    };

    return (
        <div className="max-w-xl mx-auto space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-[#003d82] dark:text-blue-400">Track Application</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Check the real-time status of your loan request.</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700">
                <form onSubmit={handleSearch} className="space-y-5">
                    <div>
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-2 font-serif">Registered Mobile Number</label>
                        <input
                            type="tel"
                            className="w-full p-4 bg-gray-50 dark:bg-slate-700 dark:text-white border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all tracking-widest font-bold"
                            placeholder="Enter 10-digit mobile"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-[#003d82] hover:bg-blue-800 text-white py-4 rounded-xl font-bold transition-all shadow-lg transform active:scale-[0.98]">
                        Securely Track Application Status
                    </button>
                </form>

                {error && (
                    <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl flex items-center space-x-3 text-red-600 dark:text-red-400 animate-pulse">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm font-bold">{error}</p>
                    </div>
                )}
            </div>

            {foundApp && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-700 animate-in zoom-in-95 duration-500">
                    <div className="bg-[#003d82] dark:bg-slate-900 p-6 text-white flex justify-between items-center">
                        <div>
                            <p className="text-xs uppercase tracking-widest font-bold opacity-60">Application ID</p>
                            <h2 className="text-2xl font-mono font-black">{foundApp.id.toUpperCase()}</h2>
                        </div>
                        <div className={`px-4 py-2 rounded-full font-black text-sm ${foundApp.status === 'APPROVED' ? 'bg-green-500 shadow-lg shadow-green-900/20' :
                            foundApp.status === 'REJECTED' ? 'bg-red-500 shadow-lg shadow-red-900/20' :
                                'bg-yellow-500 shadow-lg shadow-yellow-900/20'
                            }`}>
                            {foundApp.status}
                        </div>
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Applicant</p>
                                <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{foundApp.fullName}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Submitted On</p>
                                <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{new Date(foundApp.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Loan Amount</p>
                                <p className="text-xl font-black text-[#003d82] dark:text-blue-400">₹{foundApp.loanAmount.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">AI Score</p>
                                <p className="text-xl font-black text-gray-800 dark:text-gray-100">{foundApp.aiCreditworthiness}</p>
                            </div>
                        </div>

                        {/* New block for AI Reasoning and Analysis */}
                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                    AI Decision Basis
                                </p>
                                <div className="space-y-1 bg-gray-50 dark:bg-slate-900/50 p-4 rounded-xl border dark:border-slate-700 shadow-sm leading-relaxed">
                                    {Array.isArray(foundApp.aiReasoning) ? (
                                        foundApp.aiReasoning.map((reason, idx) => (
                                            <p key={idx} className="text-xs text-gray-700 dark:text-gray-300 font-medium">{reason}</p>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{foundApp.aiReasoning || "Decision pending final manual review."}"</p>
                                    )}
                                </div>
                            </div>

                            {foundApp.status === 'REJECTED' && foundApp.recommendations && foundApp.recommendations.length > 0 && (
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/50">
                                    <h4 className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">Personalized Recommendations</h4>
                                    <ul className="space-y-1">
                                        {foundApp.recommendations.map((rec, idx) => (
                                            <li key={idx} className="text-[11px] text-blue-800 dark:text-blue-200 font-bold flex items-start">
                                                <span className="mr-2">💡</span> {rec}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {foundApp.status === 'APPROVED' ? (
                                <div className="p-5 bg-green-50 dark:bg-green-900/20 rounded-xl border-2 border-green-200 dark:border-green-800/50">
                                    <h3 className="text-green-800 dark:text-green-400 font-black text-lg mb-1">Next Steps</h3>
                                    <p className="text-sm text-green-700 dark:text-green-300">Congratulations! Our bank official will contact you within 24 hours for final documentation.</p>
                                </div>
                            ) : foundApp.status === 'REJECTED' ? (
                                <div className="p-5 bg-red-50 dark:bg-red-900/20 rounded-xl border-2 border-red-200 dark:border-red-800/50">
                                    <h3 className="font-black text-lg mb-1 text-red-800 dark:text-red-400">Formal Status: Rejected</h3>
                                    <p className="text-sm italic font-medium text-red-700 dark:text-red-300">
                                        "{foundApp.bankerRemark || "Your application did not meet the minimum eligibility criteria at this time."}"
                                    </p>
                                </div>
                            ) : (
                                <div className="p-5 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border-2 border-yellow-200 dark:border-yellow-800/50">
                                    <h3 className="font-black text-lg mb-1 text-yellow-800 dark:text-yellow-400">Status: Pending Review</h3>
                                    <p className="text-sm italic font-medium text-yellow-700 dark:text-yellow-300">
                                        "Your application is currently being analyzed by our AI risk engine and a manual review by an officer."
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="pt-4 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between opacity-50">
                            <div className="flex space-x-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <span className="text-[10px] font-bold uppercase tracking-widest">RSA Secure</span>
                            </div>
                            <button className="text-[10px] font-bold uppercase tracking-widest hover:underline">Download Receipt</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrackApplication;
