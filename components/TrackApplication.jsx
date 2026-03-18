import React, { useState } from 'react';
import { Search, ChevronLeft, History, Clock, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TrackApplication = ({ applications, user }) => {
    const [mobile, setMobile] = useState('');
    const [selectedAppId, setSelectedAppId] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const userApps = user ? applications.filter(a => a.fullName === user.name).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : [];
    
    // Auto-select the first app if it exists and no app is selected
    const displayedApp = selectedAppId ? applications.find(a => a.id === selectedAppId) : (userApps.length > 0 ? userApps[0] : null);

    const handleSearch = (e) => {
        e.preventDefault();
        if (mobile.length < 10) {
            setError('Please enter a valid 10-digit mobile number');
            return;
        }

        const result = applications.find(a => a.mobile === mobile);
        if (result) {
            setSelectedAppId(result.id);
            setError('');
        } else {
            setError(`No application found for the mobile number "${mobile}"`);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-6 px-6 font-sans">
            <div className="max-w-2xl mx-auto space-y-6">
                {!displayedApp && (
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]">
                        <form onSubmit={handleSearch} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-400">Mobile Number</label>
                                <div className="relative group">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                                    <input
                                        type="tel"
                                        className="w-full pl-14 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-lg text-sm text-gray-900 outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-100 transition-all placeholder:text-gray-400"
                                        placeholder="Enter 10-digit number"
                                        value={mobile}
                                        onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        required
                                    />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] hover:bg-blue-700 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] transition-all">
                                Search Application
                            </button>
                        </form>

                        {error && (
                            <div className="mt-6 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3 text-red-500">
                                <AlertCircle size={16} />
                                <p className="text-sm">{error}</p>
                            </div>
                        )}
                    </div>
                )}

                {userApps.length > 1 && (
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide py-2">
                         {userApps.map(app => (
                             <button 
                                key={app.id} 
                                onClick={() => setSelectedAppId(app.id)}
                                className={`px-4 py-2 rounded-lg border whitespace-nowrap text-xs font-medium transition-all duration-200 ${selectedAppId === app.id || (!selectedAppId && userApps[0].id === app.id) ? 'bg-blue-600 border-blue-600 text-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]' : 'bg-white border-gray-200 text-gray-600 hover:border-blue-600'}`}
                             >
                                #{app.id.substring(10)} - {app.status}
                             </button>
                         ))}
                    </div>
                )}

                {displayedApp && (
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]">
                        <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <p className="text-xs font-medium text-gray-400 mb-1">Application ID</p>
                                <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">#{displayedApp.id.toUpperCase()}</h2>
                            </div>
                            <div className={`px-5 py-1.5 rounded-full text-[11px] font-medium border ${
                                displayedApp.status === 'APPROVED' ? 'bg-green-50 border-green-100 text-green-600' :
                                displayedApp.status === 'REJECTED' ? 'bg-red-50 border-red-100 text-red-600' :
                                'bg-blue-50 border-blue-100 text-blue-600'
                            }`}>
                                {displayedApp.status.charAt(0) + displayedApp.status.slice(1).toLowerCase()}
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <TrackItem label="Applicant Name" value={displayedApp.fullName} />
                                <TrackItem label="Applied On" value={new Date(displayedApp.createdAt).toLocaleDateString()} />
                                <TrackItem label="Loan Amount" value={`₹${Number(displayedApp.loanAmount).toLocaleString()}`} highlight />
                                <TrackItem label="Tenure" value={`${displayedApp.tenure} months`} />
                            </div>

                            <div className="space-y-4 pt-6 border-t border-gray-200">
                                <div className="bg-slate-50 rounded-xl p-5 border border-gray-200">
                                    <h4 className="text-xs font-medium text-gray-400 mb-3 flex items-center">
                                        <History size={14} className="mr-2 text-blue-600" />
                                        AI Assessment
                                    </h4>
                                    <p className="text-sm font-medium text-gray-600 leading-relaxed pl-6 border-l-2 border-blue-100">
                                        {displayedApp.recommendation || displayedApp.reviewReason || "Our institutional risk engine is currently refining your profile parameters."}
                                    </p>
                                </div>
                                <StatusNotification status={displayedApp.status} remark={displayedApp.bankerRemark} />
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="text-center pt-8">
                     <p className="text-xs text-gray-400">
                        © 2026 HDFC Bank Ltd. All rights reserved.
                     </p>
                </div>
            </div>
        </div>
    );
};

const TrackItem = ({ label, value, highlight }) => (
    <div className="group">
        <p className="text-xs font-medium text-gray-400 mb-2 transition-colors">{label}</p>
        <p className={`text-lg font-semibold tracking-tight ${highlight ? 'text-blue-600' : 'text-gray-900'}`}>{value}</p>
    </div>
);

const StatusNotification = ({ status, remark }) => {
    if (status === 'APPROVED') return (
        <div className="p-5 bg-green-50 border border-green-100 rounded-xl flex items-start gap-4">
            <div className="w-10 h-10 bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] flex items-center justify-center text-green-600">
                <CheckCircle2 size={20} />
            </div>
            <div>
                <h4 className="text-sm font-medium text-green-600">Application Approved</h4>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">Your loan has been approved. Our disbursement team will contact you shortly.</p>
            </div>
        </div>
    );
    
    if (status === 'REJECTED') return (
        <div className="p-5 bg-red-50 border border-red-100 rounded-xl flex items-start gap-4">
            <div className="w-10 h-10 bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] flex items-center justify-center text-red-600">
                <AlertCircle size={20} />
            </div>
            <div>
                <h4 className="text-sm font-medium text-red-500">Application Declined</h4>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">{remark || "Your application did not meet the current lending criteria."}</p>
            </div>
        </div>
    );

    return (
        <div className="p-5 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-4">
            <div className="w-10 h-10 bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] flex items-center justify-center text-blue-600">
                <Clock size={20} />
            </div>
            <div>
                <h4 className="text-sm font-medium text-blue-600">Under Review</h4>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">Our team is reviewing your application. Expected response time: <span className="font-medium text-gray-900">4-6 hours</span>.</p>
            </div>
        </div>
    );
};

export default TrackApplication;
