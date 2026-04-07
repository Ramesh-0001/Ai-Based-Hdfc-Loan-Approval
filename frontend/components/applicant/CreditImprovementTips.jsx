import React from 'react';
import { Target, TrendingUp, Lightbulb, Zap, ArrowRight, ShieldCheck, Cpu, Database, Activity, Lock, Sparkles } from 'lucide-react';

const CreditImprovementTips = ({ score, tips }) => {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] relative overflow-hidden group transition-all animate-in fade-in duration-1000 font-sans">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full -mr-16 -mt-6 blur-3xl transition-transform duration-1000 group-hover:scale-125"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl -ml-16 -mb-6"></div>
            
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-yellow-400 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] group-hover:rotate-12 transition-all duration-700">
                             <Sparkles size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold tracking-tight">AI credit coach</h3>
                            <div className="flex items-center space-x-2 mt-1">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]"></div>
                                <p className="text-[11px] font-normal text-gray-400">Personalized strategy active</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-6 bg-white rounded-xl p-6 border border-white/5">
                    <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest mb-3">Your resilience index</p>
                    <div className="flex items-baseline space-x-3">
                        <span className="text-2xl font-semibold tracking-tight text-white">{score}</span>
                        <span className="text-sm font-medium text-gray-500">/ 900</span>
                    </div>
                    <div className="w-full h-1.5 bg-white rounded-full mt-6 overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-[2000ms] ease-out ${score > 750 ? 'bg-blue-500' : score > 650 ? 'bg-orange-500' : 'bg-red-500'}`}
                            style={{ width: `${(score/900)*100}%` }}
                        ></div>
                    </div>
                </div>

                <div className="space-y-4">
                    <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest pl-1 mb-4">Strategic recommendations</p>
                    <div className="grid grid-cols-1 gap-4">
                        {tips.map((tip, idx) => (
                            <div key={idx} className="bg-white p-4 rounded-xl border border-white/5 flex items-start space-x-4 transition-all hover:bg-white hover:border-gray-200 cursor-default group/tip">
                                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 group-hover/tip:bg-blue-600 group-hover/tip:text-white transition-all">
                                    <Target size={16} />
                                </div>
                                <p className="text-[13px] font-normal leading-relaxed text-gray-300 transition-colors group-hover/tip:text-white">{tip}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="mt-6 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center bg-transparent gap-6">
                <div className="flex items-center space-x-2 text-gray-500">
                    <Cpu size={12} className="text-blue-500" />
                    <p className="text-[10px] font-medium tracking-widest uppercase">Predictive analysis active</p>
                </div>
                <button className="w-full sm:w-auto py-3 px-6 bg-blue-600 text-white rounded-xl font-medium text-xs hover:bg-blue-700 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] active:scale-95 flex items-center justify-center space-x-2 group/btn">
                    <span>Generate full audit report</span>
                    <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default CreditImprovementTips;
