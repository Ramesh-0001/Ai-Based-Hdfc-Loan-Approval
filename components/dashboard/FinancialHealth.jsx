import React from 'react';
import { ShieldCheck, IndianRupee, Clock, HelpCircle, Activity, TrendingUp, Cpu } from 'lucide-react';

const FinancialHealth = ({ latestApp }) => {
  const derived = latestApp?.derived_features || {};
  const score = latestApp?.aiCreditworthiness ? (300 + latestApp.aiCreditworthiness * 6) : 742;
  const percentage = (score / 900) * 100;

  const monthlyEmi = derived.proposed_emi || 12400;
  const dti = derived.dti_ratio || 28;
  const maxLimit = derived.max_loan_eligibility || 1500000;
  const riskTier = latestApp?.riskTier || (score > 750 ? "Tier-1 prime hub" : "Standard sovereign");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch animate-in fade-in duration-700 font-sans">
      <div className="lg:col-span-4 bg-white rounded-xl p-6 border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] flex flex-col items-center justify-center text-center relative group overflow-hidden">
        <div className="flex items-center space-x-3 mb-6 relative z-10">
          <Activity size={14} className="text-blue-600" />
          <p className="text-xs font-medium text-gray-500">Credit integrity index</p>
        </div>
        
        <div className="relative w-48 h-48 transition-transform duration-700">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="96" cy="96" r="80" fill="transparent" stroke="#f8fafc" strokeWidth="8" />
            <circle cx="96" cy="96" r="80" fill="transparent" stroke="#2563eb" strokeWidth="8" 
              strokeDasharray={502.6} strokeDashoffset={502.6 - (502.6 * percentage) / 100}
              strokeLinecap="round" className="transition-all duration-1000 ease-out" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-semibold text-gray-900 tracking-tight leading-none">{score}</span>
            <div className="flex items-center space-x-2 mt-4 bg-blue-50 px-3 py-1 rounded-full border border-blue-50">
               <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
               <span className="text-[11px] font-medium text-blue-600">Prime stable</span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-8 border-t border-gray-200 w-full relative z-10">
          <p className="text-sm font-medium text-gray-900">{riskTier}</p>
          <p className="text-xs text-gray-400 mt-2">Institutional profile category</p>
        </div>
      </div>

      <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <MetricCard 
          label="Registry resolution" 
          value={latestApp?.status || "No data available"} 
          icon={Clock} 
          color="bg-orange-50" 
          iconColor="text-orange-600"
          subtext="Updated 2 hours ago"
        />
        <MetricCard 
          label="Estimated limit" 
          value={`₹${(maxLimit / 100000).toFixed(1)} lac`} 
          icon={ShieldCheck} 
          color="bg-blue-50" 
          iconColor="text-blue-600"
          subtext="Predictive credit limit"
        />
        <MetricCard 
          label="Utilization ratio" 
          value={`${dti}%`} 
          icon={TrendingUp} 
          color="bg-green-50" 
          iconColor="text-green-600"
          subtext="Optimal debt balance"
        />
        <MetricCard 
          label="Proposed payment" 
          value={`₹${monthlyEmi.toLocaleString()}`} 
          icon={IndianRupee} 
          color="bg-slate-50" 
          iconColor="text-gray-900"
          subtext="Monthly repayment amount"
        />
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, icon: Icon, color, iconColor, subtext }) => (
  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] transition-all hover:border-blue-100">
    <div className="flex justify-between items-start mb-6">
      <div className={`w-12 h-12 rounded-xl ${color} ${iconColor} flex items-center justify-center`}>
        <Icon size={20} />
      </div>
      <HelpCircle size={14} className="text-gray-300 hover:text-blue-600 transition-colors cursor-pointer" />
    </div>
    <div className="space-y-1">
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <h4 className="text-2xl font-semibold text-gray-900 tracking-tight capitalize">{value.toLowerCase()}</h4>
      <div className="flex items-center space-x-2 mt-3">
          <p className="text-[11px] text-gray-400 font-normal">
            {subtext}
          </p>
      </div>
    </div>
  </div>
);

export default FinancialHealth;
