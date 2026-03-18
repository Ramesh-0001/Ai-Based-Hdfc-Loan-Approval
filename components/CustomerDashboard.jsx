import React, { useState } from 'react';
import DashboardLayout from './layout/DashboardLayout';
import ApplyLoan from './ApplyLoan';
import ViewApplication from './ViewApplication';
// Other components as needed
import AIChatAssistant from './dashboard/AIChatAssistant';
import ApplicationTimeline from './dashboard/ApplicationTimeline';
import AIRiskScoreDetails from './dashboard/AIRiskScoreDetails';
import TrackApplication from './TrackApplication';
import EMICalculator from './EMICalculator';
import EligibilityChecker from './EligibilityChecker';
import DocumentsModule from './DocumentsModule';
import { 
  ArrowRight,
  TrendingUp,
  ChevronRight,
  ShieldCheck,
  Calculator,
  Activity,
  FileCheck2,
  AlertCircle,
  Clock,
  PieChart as PieChartIcon,
  Award,
  Zap,
  Briefcase
} from 'lucide-react';

const CustomerDashboard = ({ user, applications = [], onLogout, onSubmit }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const latestApp = applications.length > 0 ? applications[0] : null;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6 animate-in fade-in duration-500 font-sans">
            <header className="pb-8 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Overview</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Loan eligibility, financial profile & application status
                </p>
              </div>
            </header>

            {/* Row 1: Prime AI & Audit Metrics (4 Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Card 1: AI Risk Score */}
              <div className="relative bg-white rounded-xl p-6 border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] transition-all hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] group h-[160px]">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-gray-600">AI Risk Score</p>
                    <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                      <ShieldCheck size={16} />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 leading-none mb-2">
                    {latestApp ? (latestApp.aiCreditworthiness || latestApp.ai_creditworthiness || 0) : '--'}/100
                  </h3>
                  <p className="text-xs text-gray-400">
                    {latestApp ? 'Based on latest audit' : 'Submit app for audit'}
                  </p>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTab(latestApp ? 'eligibility' : 'apply');
                  }}
                  className="absolute bottom-4 left-5 right-5 py-2 bg-blue-50 text-blue-600 rounded-xl text-[11px] font-semibold hover:bg-blue-600 hover:text-white transition-all opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 flex items-center justify-center gap-2"
                >
                  {latestApp ? 'View Detailed Audit' : 'Start Application'} <ArrowRight size={14} />
                </button>
              </div>

              {/* Card 2: Active Application */}
              <div className="relative bg-white rounded-xl p-6 border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] transition-all hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] group h-[160px]">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[11px] font-medium text-gray-600">Active Application</p>
                    <div className="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500">
                      <Clock size={16} />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 leading-none mb-2 truncate">
                    {latestApp ? (latestApp.status === 'PENDING' ? 'Manual Review' : latestApp.status.charAt(0) + latestApp.status.slice(1).toLowerCase()) : 'None'}
                  </h3>
                  <p className="text-xs text-gray-400 truncate">
                    {latestApp ? `Updated: ${new Date(latestApp.createdAt || Date.now()).toLocaleDateString()}` : 'Apply to start'}
                  </p>
                </div>
                <button 
                  onClick={() => setActiveTab(latestApp ? 'view-application' : 'apply')}
                  className="absolute bottom-4 left-5 right-5 py-2 bg-blue-50 text-blue-600 rounded-xl text-[11px] font-semibold hover:bg-blue-600 hover:text-white transition-all opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 flex items-center justify-center gap-2"
                >
                  {latestApp ? 'View Application details' : 'Initialize Application'} <ArrowRight size={14} />
                </button>
              </div>

              {/* Card 3: Approval Probability */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] transition-all hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] group flex flex-col justify-between h-[160px]">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-gray-600">Approval Probability</p>
                    <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                      <Zap size={16} />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 leading-none mb-2">
                    {latestApp ? (latestApp.aiCreditworthiness ? `${latestApp.aiCreditworthiness}%` : '82%') : '--'}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {latestApp ? (latestApp.aiCreditworthiness >= 70 ? 'High chance' : latestApp.aiCreditworthiness >= 50 ? 'Medium' : 'Low') : 'Analysis pending'}
                  </p>
                </div>
              </div>

              {/* Card 4: Eligible Loan Amount */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] transition-all hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] group flex flex-col justify-between h-[160px]">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-gray-600">Eligible Loan Amount</p>
                    <div className="w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                      <FileCheck2 size={16} />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 leading-none mb-2">
                    {latestApp ? `₹${Number(latestApp.eligibleAmount || Math.round(latestApp.loanAmount * 0.95)).toLocaleString()}` : '--'}
                  </h3>
                  <p className="text-xs text-gray-400">Based on income & profile</p>
                </div>
              </div>
            </div>

            {/* Row 2: Operational Financial Metrics (4 Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 5: Credit Score */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] transition-all hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] group flex flex-col justify-between h-[160px]">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-gray-600">Credit Score</p>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      !latestApp ? 'bg-slate-50 text-gray-400' :
                      (latestApp.creditScore >= 750 ? 'bg-green-50 text-green-600' : 
                      latestApp.creditScore >= 650 ? 'bg-orange-50 text-orange-500' : 'bg-red-50 text-red-500')
                    }`}>
                      <Award size={16} />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 leading-none mb-2">
                    {latestApp?.creditScore || '--'}
                  </h3>
                  <p className={`text-[12px] font-medium ${
                    !latestApp ? 'text-gray-400' :
                    (latestApp.creditScore >= 750 ? 'text-green-600' : 
                    latestApp.creditScore >= 650 ? 'text-orange-500' : 'text-red-500')
                  }`}>
                    {latestApp ? (latestApp.creditScore >= 750 ? 'Excellent' : latestApp.creditScore >= 650 ? 'Good' : 'Poor') : 'Score pending'}
                  </p>
                </div>
              </div>

              {/* Card 6: Income Ratio */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] transition-all hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] group flex flex-col justify-between h-[160px]">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-gray-600">Debt-to-Income (DTI)</p>
                    <div className="w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                      <PieChartIcon size={16} />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 leading-none mb-2">
                    {latestApp?.derived_features?.dti_ratio 
                      ? `${Math.round(latestApp.derived_features.dti_ratio)}%` 
                      : (() => {
                          const insight = latestApp?.ml_insight;
                          if (!insight) return '--';
                          if (typeof insight === 'object') return `${Math.round(insight.dti_ratio || 0)}%`;
                          try {
                            const parsed = JSON.parse(insight);
                            return `${Math.round(parsed.dti_ratio || 0)}%`;
                          } catch (e) {
                            return '--';
                          }
                        })()}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {latestApp ? 'Calculated Risk Ratio' : 'Awaiting financial data'}
                  </p>
                </div>
              </div>

              {/* Card 7: Monthly EMI */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] transition-all hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] group flex flex-col justify-between h-[160px]">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-gray-600">Proposed EMI</p>
                    <div className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
                      <span className="font-semibold text-[14px]">₹</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 leading-none mb-2">
                    {latestApp ? `₹${Math.round(latestApp?.derived_features?.proposed_emi || 
                      (() => {
                        const insight = latestApp?.ml_insight;
                        let val = 0;
                        if (insight && typeof insight === 'object') {
                          val = insight.proposed_emi || 0;
                        } else if (insight && typeof insight === 'string') {
                          try { val = JSON.parse(insight).proposed_emi || 0; } catch (e) {}
                        }
                        
                        // Final Fallback: Manual Formula if data missing
                        if (val <= 0 && latestApp.loanAmount && latestApp.tenure) {
                          const P = latestApp.loanAmount;
                          const R = (10.5 / 100) / 12; // Static 10.5% fallback
                          const N = latestApp.tenure;
                          val = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
                        }
                        return val || 0;
                      })()).toLocaleString()}` : '--'}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {latestApp ? 'Projected monthly outgo' : 'Calculate your liability'}
                  </p>
                </div>
              </div>

              {/* Card 8: Loan Requested */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] transition-all hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] group flex flex-col justify-between h-[160px]">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <p className="text-sm font-medium text-gray-600">Loan Requested</p>
                    <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                      <Briefcase size={16} />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 leading-none mb-2">
                    {latestApp ? `₹${Number(latestApp.loanAmount).toLocaleString()}` : '--'}
                  </h3>
                  <p className="text-xs text-gray-400 truncate">
                    {latestApp ? (latestApp.loanPurpose || 'General Purpose') : 'Requested by applicant'}
                  </p>
                </div>
              </div>
            </div>

            {/* Live Application Tracking Section */}
            <ApplicationTimeline latestApp={latestApp} />

          </div>
        );

      case 'apply':
        return (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <ApplyLoan 
              user={user} 
              onSubmit={(appData) => {
                onSubmit(appData);
              }}
              onFinish={() => setActiveTab('view-application')} 
            />
          </div>
        );

      case 'view-application':
        return (
          <ViewApplication 
            app={latestApp} 
            onBack={() => setActiveTab('dashboard')} 
          />
        );

      case 'eligibility':
        return (
          <div className="animate-in fade-in duration-500">
             <AIRiskScoreDetails app={latestApp} />
          </div>
        );

      case 'emi':
        return (
          <div className="animate-in fade-in duration-500">
             <EMICalculator 
                initialAmount={latestApp?.loanAmount || 500000} 
                initialTenure={latestApp?.tenure ? parseInt(latestApp.tenure)/12 : 5}
             />
          </div>
        );
      
      case 'timeline':
        return (
          <div className="animate-in fade-in duration-500">
             <TrackApplication 
                applications={applications} 
                user={user}
                onSelectApp={(app) => {
                   // Optional: handle clicking an app in track view
                }}
             />
          </div>
        );

      case 'check-eligibility':
        return (
          <div className="animate-in fade-in duration-500">
             <EligibilityChecker />
          </div>
        );

      case 'documents':
        return (
          <div className="animate-in fade-in duration-500">
             <DocumentsModule />
          </div>
        );

      case 'health':
        return (
            <div className="animate-in fade-in duration-500 h-[60vh] flex flex-col justify-center max-w-2xl mx-auto">
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] text-center font-sans">
                    <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mx-auto mb-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]">
                        <TrendingUp size={32} />
                    </div>
                    <h3 className="text-[28px] font-semibold text-gray-900 tracking-tight capitalize">Financial Health Hub</h3>
                    <p className="text-[15px] text-gray-500 mt-4 leading-relaxed font-normal">
                        Establishing a secure connection to your institutional record {user?.name}. Your health metrics will synchronize once the banking gateway is verified.
                    </p>
                    <button 
                         onClick={() => setActiveTab('dashboard')}
                         className="mt-6 px-6 py-3.5 bg-blue-600 text-white rounded-xl font-medium text-[15px] hover:bg-blue-700 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] active:scale-95 flex items-center space-x-2 mx-auto"
                    >
                        <span>Return to root</span>
                        <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout 
      user={user} 
      onLogout={onLogout} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
    >
      <div className="relative pb-24">
        {renderContent()}
        <AIChatAssistant />
      </div>
    </DashboardLayout>
  );
};

export default CustomerDashboard;
