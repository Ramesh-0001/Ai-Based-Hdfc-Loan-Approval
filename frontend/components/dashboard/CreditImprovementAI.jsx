import React from 'react';
import { Target, TrendingUp, Lightbulb, Zap, ArrowRight, ShieldCheck, Cpu, Database, Activity, Lock } from 'lucide-react';

const CreditImprovementAI = ({ score = 812 }) => {
  const tips = [
    { 
      title: "Utilization delta", 
      desc: "Maintain your balances below 30% of total institutional limit. Current node: 22%.", 
      impact: "HIGH",
      icon: TrendingUp,
      type: "Portfolio yield"
    },
    { 
      title: "Repayment protocol", 
      desc: "A single late sync can drop your index by 40-60 points. Enable autonomous debiting.", 
      impact: "CRITICAL",
      icon: ShieldCheck,
      type: "Risk audit"
    },
    { 
      title: "Liability diversification", 
      desc: "Adding a low-exposure consumer node could optimize your global credit symmetry.", 
      impact: "MEDIUM",
      icon: Zap,
      type: "Integrity index"
    }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] relative overflow-hidden group transition-all animate-in fade-in duration-1000">
      <div className="absolute -top-10 -left-10 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px] transition-transform duration-[3000ms] group-hover:scale-150"></div>
      <div className="absolute -bottom-10 -right-10 w-80 h-80 bg-blue-600/5 rounded-full blur-[100px] transition-transform duration-[3000ms] group-hover:scale-125"></div>
      
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
          <div className="flex items-center space-x-5">
            <div className="w-14 h-14 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-blue-400 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] group-hover:rotate-12 transition-all duration-700">
                <Lightbulb size={28} />
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h3 className="text-xl font-medium tracking-tight">AI strategy hub</h3>
                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded text-[9px] font-medium border border-blue-500/20">V4.8 Enterprise</span>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-[11px] font-normal text-gray-400">Optimization core operational</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-6">
              <div className="text-right">
                  <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest mb-1">Current resilience</p>
                  <p className="text-2xl font-semibold text-blue-400 tracking-tight">{score}<span className="text-xs text-gray-600 ml-1 font-normal uppercase">Idx</span></p>
              </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {tips.map((tip, idx) => (
            <div key={idx} className="space-y-6 p-6 bg-white rounded-xl border border-white/5 hover:bg-white hover:border-gray-200 transition-all cursor-default group/card relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100/5 rounded-full blur-2xl translate-x-12 -translate-y-12 opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
              <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-400 border border-white/5 group-hover/card:bg-blue-600 group-hover/card:text-white transition-all duration-500">
                    <tip.icon size={20} />
                  </div>
                  <span className={`text-[10px] font-medium px-3 py-1 rounded-full border ${
                    tip.impact === 'CRITICAL' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 
                    tip.impact === 'HIGH' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' : 
                    'bg-green-500/10 border-green-500/20 text-green-400'
                  }`}>
                    {tip.impact.charAt(0) + tip.impact.slice(1).toLowerCase()}
                  </span>
              </div>
              <div className="space-y-4">
                <div className="flex flex-col">
                  <h4 className="text-[15px] font-medium tracking-tight text-white group-hover/card:text-blue-400 transition-colors leading-tight">{tip.title}</h4>
                  <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mt-2">{tip.type}</span>
                </div>
                <p className="text-[13px] text-gray-400 font-normal leading-relaxed mt-4">
                  {tip.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-white/5">
            <div className="flex items-center space-x-8 text-gray-600">
                <div className="flex items-center space-x-2">
                    <Cpu size={12} />
                    <span className="text-[10px] font-medium uppercase tracking-wider">Autonomous tuning</span>
                </div>
                <div className="flex items-center space-x-2">
                    <Database size={12} />
                    <span className="text-[10px] font-medium uppercase tracking-wider">Ledger audited</span>
                </div>
                <div className="flex items-center space-x-2">
                    <Lock size={12} />
                    <span className="text-[10px] font-medium uppercase tracking-wider">Secure auth</span>
                </div>
            </div>
            <button className="min-w-[280px] py-4 bg-blue-600 text-white rounded-xl font-medium text-sm flex items-center justify-center space-x-4 hover:bg-blue-700 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] active:scale-95 group/btn">
              <div className="flex items-center space-x-4 relative z-10">
                <span>Deploy credit blueprint</span>
                <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
              </div>
            </button>
        </div>
      </div>
    </div>
  );
};

export default CreditImprovementAI;
