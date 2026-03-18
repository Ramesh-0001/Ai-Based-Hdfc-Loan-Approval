import React from 'react';
import { Sparkles, ArrowRight, Bot, Target, ShieldCheck, Globe } from 'lucide-react';

const LoanRecommendations = ({ latestApp, onApply }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-700 font-sans">
      {/* Personalized Offers */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] flex flex-col justify-between group h-full">
        <div>
          <div className="flex items-center space-x-3 mb-6">
            <Sparkles className="text-blue-600" size={18} />
            <h4 className="text-sm font-medium text-gray-900">Recommended for you</h4>
          </div>
          
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-50/50 mb-6">
            <p className="text-sm text-gray-700 leading-relaxed font-normal">
              {latestApp?.recommendation || "Maintain your credit utilization below 30% to qualify for platinum interest rates in the next cycle."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-slate-50 p-6 rounded-xl border border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Max limit</p>
              <p className="text-2xl font-semibold text-gray-900 tracking-tight">₹8.5 lac</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-xl border border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Interest rate</p>
              <p className="text-2xl font-semibold text-blue-600 tracking-tight">8.25%</p>
            </div>
          </div>
        </div>

        <button 
          onClick={onApply}
          className="w-full py-4 bg-blue-600 text-white rounded-xl text-sm font-medium flex items-center justify-center space-x-2 hover:bg-blue-700 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] active:scale-95"
        >
          <span>View detailed terms</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* AI Intelligence Insights */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] relative overflow-hidden flex flex-col justify-between border border-gray-200">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-6"></div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-blue-400">
                <Bot size={20} />
            </div>
            <div>
                <h4 className="text-sm font-medium text-white">AI insights</h4>
                <p className="text-[11px] text-gray-500 mt-1 font-normal">Risk intelligence report</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <InsightRow icon={Target} text="Debt-to-income ratio is 14% below sector average." />
            <InsightRow icon={ShieldCheck} text="Stable income trajectory suggests high repayment probability." />
            <InsightRow icon={Globe} text="Historical repayment timeliness established at 100%." />
          </div>
        </div>

        <div className="mt-6 pt-8 border-t border-white/5 flex justify-between items-center relative z-10">
          <div>
            <p className="text-xs text-gray-500 mb-1">Confidence score</p>
            <p className="text-2xl font-semibold text-blue-400 tracking-tight">98.4%</p>
          </div>
          <button className="px-6 py-2 bg-white hover:bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-300 transition-all">
            Full report
          </button>
        </div>
      </div>
    </div>
  );
};

const InsightRow = ({ icon: Icon, text }) => (
  <div className="flex items-start space-x-4 group">
    <div className="mt-0.5 text-blue-400 opacity-60">
      <Icon size={16} />
    </div>
    <p className="text-sm text-gray-400 leading-relaxed font-normal">
      {text}
    </p>
  </div>
);

export default LoanRecommendations;
