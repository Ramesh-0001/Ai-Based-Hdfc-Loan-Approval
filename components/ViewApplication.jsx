import React from 'react';
import { ChevronLeft, FileText, CheckCircle2, ShieldCheck, Clock, AlertCircle, Download } from 'lucide-react';
import { generateApplicationPdf } from '../utils/pdfGenerator';

const ViewApplication = ({ app, onBack }) => {
  if (!app) {
    return (
        <div className="flex flex-col items-center justify-center p-6 text-center h-[50vh]">
            <FileText size={48} className="text-gray-200 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Application Found</h3>
            <p className="text-sm text-gray-500 mb-6">You haven't submitted any loan applications yet.</p>
            <button
                onClick={onBack}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]"
            >
                Return to Dashboard
            </button>
        </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
        case 'APPROVED': return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold tracking-wide flex items-center gap-1"><CheckCircle2 size={12}/> APPROVED</span>;
        case 'REJECTED': return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold tracking-wide flex items-center gap-1"><AlertCircle size={12}/> REJECTED</span>;
        default: return <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold tracking-wide flex items-center gap-1"><Clock size={12}/> MANUAL REVIEW</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={onBack}
          className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center mr-3 group-hover:bg-slate-50 transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]">
              <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          </div>
          Back to Dashboard
        </button>
        <button 
          onClick={() => generateApplicationPdf(app)}
          className="flex items-center gap-2 px-6 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl text-sm font-medium transition-colors"
        >
          <Download size={16} /> Download as PDF
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50">
            <div>
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="text-blue-600" /> Loan Application Details
                </h2>
                <p className="text-sm text-gray-500 mt-1 uppercase tracking-wider font-medium font-mono">Ref: {app.id}</p>
            </div>
            <div className="flex flex-col items-start md:items-end gap-2">
                {getStatusBadge(app.status)}
                <p className="text-xs text-gray-400 font-medium">Applied on {new Date(app.createdAt || Date.now()).toLocaleDateString()}</p>
            </div>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-6">
            <InfoBlock label="Applicant Name" value={app.fullName || app.full_name} />
            <InfoBlock label="Email Address" value={app.email || 'N/A'} />
            <InfoBlock label="Mobile Number" value={app.mobile || 'N/A'} />
            <InfoBlock label="Age" value={`${app.age || 'N/A'} years`} />
            <InfoBlock label="Annual Income" value={`₹${Number(app.income || 0).toLocaleString()}`} />
            <InfoBlock label="Requested Amount" value={`₹${Number(app.loanAmount || app.loan_amount || 0).toLocaleString()}`} />
            <InfoBlock label="Loan Tenure" value={`${app.tenure} months`} />
            <InfoBlock label="Employment Type" value={app.employmentType || app.employment_type || 'N/A'} />
            <InfoBlock label="Loan Purpose" value={app.loanPurpose || app.loan_purpose || 'N/A'} />
            <InfoBlock label="Credit Score" value={app.creditScore || app.credit_score || 'N/A'} />
            <InfoBlock label="Repayment History" value={app.repaymentHistory || app.repayment_history || 'N/A'} />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-200 bg-slate-50">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ShieldCheck className="text-blue-600" /> AI Risk Audit Profile
            </h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-slate-50 border border-gray-200 flex flex-col justify-center">
                <p className="text-sm font-medium text-gray-500 mb-2">AI Creditworthiness Score</p>
                <div className="flex items-end gap-3">
                    <h3 className="text-2xl font-semibold text-gray-900">{app.aiCreditworthiness || app.ai_creditworthiness || '--'}</h3>
                    <span className="text-base font-medium text-gray-400 mb-1">/ 100</span>
                </div>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div 
                        className={`h-2.5 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] ${(!app.aiCreditworthiness || app.aiCreditworthiness < 50) ? 'bg-red-500' : app.aiCreditworthiness < 70 ? 'bg-orange-500' : 'bg-green-500'}`} 
                        style={{ width: `${app.aiCreditworthiness || 0}%` }}
                    ></div>
                </div>
            </div>
            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-white">
                    <span className="text-sm font-medium text-gray-600">Risk Assessment Level</span>
                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                        (app.riskLevel || app.risk_level) === 'Low' ? 'bg-green-100 text-green-700' :
                        (app.riskLevel || app.risk_level) === 'Medium' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                    }`}>
                        {app.riskLevel || app.risk_level || 'Unknown'} Risk
                    </span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-white">
                    <span className="text-sm font-medium text-gray-600">Loan Status</span>
                    <span className="text-sm font-semibold text-gray-900">
                        {app.status === 'PENDING' ? 'MANUAL REVIEW' : app.status}
                    </span>
                </div>
            </div>
        </div>

        {/* Score Breakdown Section */}
        {(() => {
            const rawBreakdown = app.scoreBreakdown || app.score_breakdown;
            if (!rawBreakdown) return null;
            
            let breakdown = [];
            try {
                breakdown = typeof rawBreakdown === 'string' ? JSON.parse(rawBreakdown) : rawBreakdown;
            } catch (e) {
                console.error("Score breakdown parse error:", e);
                return null;
            }

            if (!Array.isArray(breakdown) || breakdown.length === 0) return null;

            return (
                <div className="p-6 border-t border-gray-200 bg-slate-50">
                    <p className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider text-center">AI Risk Score Calculation</p>
                    <div className="space-y-4 max-w-xl mx-auto">
                        {breakdown.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center py-2 px-4 bg-white border-b border-gray-200 last:border-0 rounded-lg">
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-gray-700">{item.factor}</span>
                                    <span className="text-xs text-gray-400">  {item.reason}</span>
                                </div>
                                <div className={`text-sm font-semibold font-mono ${item.score >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                    {item.score >= 0 ? '+' : ''}{item.score}
                                </div>
                            </div>
                        ))}
                        <div className="flex justify-between items-center pt-4 border-t-2 border-dashed border-gray-200 mt-4 px-4 bg-blue-50 rounded-lg py-3">
                            <span className="text-sm font-semibold text-gray-900 uppercase">Final AI Score</span>
                            <span className="text-lg font-semibold text-blue-600">{app.aiCreditworthiness || app.ai_creditworthiness || '--'} / 100</span>
                        </div>
                    </div>
                </div>
            );
        })()}
      </div>
    </div>
  );
};

const InfoBlock = ({ label, value }) => (
    <div>
        <p className="text-xs font-medium text-gray-500 mb-1.5">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value}</p>
    </div>
);

export default ViewApplication;
