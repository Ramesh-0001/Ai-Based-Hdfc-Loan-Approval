import React from 'react';
import { Activity, TrendingUp, Wallet, AlertCircle, CheckCircle2 } from 'lucide-react';

const FinancialHealthSection = ({ dti = 35, savings = 72, spendingRisk = 'Low' }) => {
  const getStatusColor = (val, type) => {
    if (type === 'dti') {
      if (val < 30) return 'text-green-600 bg-green-50 border-green-100';
      if (val < 45) return 'text-yellow-600 bg-yellow-50 border-yellow-100';
      return 'text-red-600 bg-red-50 border-red-100';
    }
    if (type === 'savings') {
      if (val > 70) return 'text-green-600 bg-green-50 border-green-100';
      if (val > 40) return 'text-yellow-600 bg-yellow-50 border-yellow-100';
      return 'text-red-600 bg-red-50 border-red-100';
    }
    if (type === 'spending') {
      if (val === 'Low') return 'text-green-600 bg-green-50 border-green-100';
      if (val === 'Moderate') return 'text-yellow-600 bg-yellow-50 border-yellow-100';
      return 'text-red-600 bg-red-50 border-red-100';
    }
    return 'text-gray-600 bg-gray-50 border-gray-100';
  };

  const getProgressColor = (val, type) => {
    if (type === 'dti') {
      if (val < 30) return 'bg-green-500';
      if (val < 45) return 'bg-yellow-500';
      return 'bg-red-500';
    }
    if (type === 'savings') {
      if (val > 70) return 'bg-green-500';
      if (val > 40) return 'bg-yellow-500';
      return 'bg-red-500';
    }
    return 'bg-blue-500';
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Activity size={20} className="text-blue-600" />
          Financial Health Hub
        </h3>
        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Live Audit</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* DTI Ratio */}
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-tight">Debt-to-Income</p>
              <h4 className="text-2xl font-black text-gray-900 mt-1">{dti}%</h4>
            </div>
            <span className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${getStatusColor(dti, 'dti')}`}>
              {dti < 30 ? 'Healthy' : dti < 45 ? 'Moderate' : 'High Risk'}
            </span>
          </div>
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${getProgressColor(dti, 'dti')}`} 
              style={{ width: `${Math.min(dti, 100)}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-gray-500 font-medium italic">
            {dti > 40 ? "“Your debt is slightly high, consider reducing loans”" : "“Excellent debt management. High loan eligibility.”"}
          </p>
        </div>

        {/* Savings Score */}
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-tight">Savings Score</p>
              <h4 className="text-2xl font-black text-gray-900 mt-1">{savings}/100</h4>
            </div>
            <span className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${getStatusColor(savings, 'savings')}`}>
              {savings > 70 ? 'Superior' : savings > 40 ? 'Average' : 'Low'}
            </span>
          </div>
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${getProgressColor(savings, 'savings')}`} 
              style={{ width: `${savings}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-gray-500 font-medium italic">
            {savings < 50 ? "“Consider increasing your emergency fund.”" : "“Strong liquidity detected in linked accounts.”"}
          </p>
        </div>

        {/* Spending Risk */}
        <div className="space-y-3">
          <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-blue-600 shadow-sm">
                <Wallet size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Spending Risk</p>
                <p className="text-sm font-black text-gray-900">{spendingRisk}</p>
              </div>
            </div>
            <div className={`w-3 h-3 rounded-full animate-pulse ${
              spendingRisk === 'Low' ? 'bg-green-500' : spendingRisk === 'Moderate' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
          </div>
          <div className="flex items-center gap-2 px-2">
            <CheckCircle2 size={12} className="text-green-500" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">No unusual spikes detected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialHealthSection;
