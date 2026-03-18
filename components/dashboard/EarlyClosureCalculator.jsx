import React, { useState, useEffect } from 'react';
import { History, Zap, TrendingDown, IndianRupee, Cpu, ArrowRight, ShieldCheck, Activity, Globe, Database, Info, Lock } from 'lucide-react';

const EarlyClosureCalculator = () => {
  const [outstanding, setOutstanding] = useState(1500000);
  const [rate, setRate] = useState(9.5);
  const [remainingMonths, setRemainingMonths] = useState(36);
  const [savings, setSavings] = useState(0);

  useEffect(() => {
    // Simple Interest savings estimation for demonstration
    // In reality, this would be an Amortization calculation
    const monthlyRate = rate / 12 / 100;
    const emi = (outstanding * monthlyRate * Math.pow(1 + monthlyRate, remainingMonths)) / (Math.pow(1 + monthlyRate, remainingMonths) - 1);
    const totalPayable = emi * remainingMonths;
    const interestSaved = totalPayable - outstanding;
    setSavings(Math.round(interestSaved));
  }, [outstanding, rate, remainingMonths]);

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] transition-all hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] animate-in fade-in duration-700 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6 px-2">
        <div className="flex items-center space-x-5">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] transition-transform hover:scale-110">
                <History size={24} />
            </div>
            <div>
                <h3 className="text-sm font-medium text-gray-900 tracking-tight leading-none">Liquidation optimizer</h3>
                <p className="text-[11px] text-gray-400 mt-2 flex items-center">
                    <Database size={12} className="mr-2" />
                    Amortization logic v2.1
                </p>
            </div>
        </div>
        <div className="flex items-center space-x-3 bg-slate-50 px-5 py-2.5 rounded-xl border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]">
            <Cpu size={14} className="text-blue-600" />
            <span className="text-[11px] font-medium text-blue-600">AI Calibration active</span>
        </div>
      </div>

      <div className="lg:flex lg:space-x-16 items-stretch">
        <div className="flex-1 space-y-6 mb-6 lg:mb-0">
          <InputGroup label="Principal outstanding (₹)" value={outstanding} onChange={(e) => setOutstanding(Number(e.target.value))} icon={IndianRupee} />
          
          <div className="grid grid-cols-2 gap-6">
            <InputGroup label="Interest rate (%)" value={rate} step="0.1" onChange={(e) => setRate(Number(e.target.value))} icon={Activity} />
            <InputGroup label="Months remaining" value={remainingMonths} onChange={(e) => setRemainingMonths(Number(e.target.value))} icon={Globe} />
          </div>

          <div className="bg-slate-50 p-6 rounded-xl border border-gray-200 flex items-start space-x-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]">
              <Info size={18} className="text-blue-600 mt-0.5" />
              <p className="text-xs font-normal text-gray-500 leading-relaxed">
                Parameters are processed via institutional risk orbits to establish the most precise liquidation index for your current exposure node.
              </p>
          </div>
        </div>

        <div className="lg:w-[380px] bg-white border text-gray-900 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] flex flex-col justify-between relative overflow-hidden group transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-6 group-hover:scale-125 transition-transform duration-1000"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl -ml-16 -mb-6"></div>
          
          <div className="relative z-10 text-center">
            <div className="w-16 h-16 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-blue-400 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] mx-auto mb-6 group-hover:bg-blue-600 group-hover: transition-all duration-500">
              <Zap size={28} />
            </div>
            <p className="text-xs font-medium text-gray-400 mb-4 tracking-wider uppercase">Estimated yield savings</p>
            <h4 className="text-2xl font-semibold text-white tracking-tight transition-all duration-500">
                ₹{savings.toLocaleString()}
            </h4>
            
            <div className="mt-6 flex flex-col items-center space-y-4">
                <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-green-500/10 text-green-400 rounded-lg text-[11px] font-medium border border-green-500/20">
                    <TrendingDown size={14} />
                    <span>Max ROI optimization hub</span>
                </div>
                <button className="w-full mt-6 py-4 bg-white text-gray-900 rounded-xl font-medium text-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] hover:bg-blue-600 hover:text-white transition-all active:scale-95 flex items-center justify-center space-x-2 group/btn">
                    <span>Execute liquidation</span>
                    <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-8 border-t border-gray-200 flex items-center justify-between px-2">
          <div className="flex items-center space-x-8 text-gray-300">
               <div className="flex items-center space-x-2">
                   <ShieldCheck size={12} />
                   <span className="text-[10px] font-medium uppercase tracking-wider">Audit compliant</span>
               </div>
               <div className="flex items-center space-x-2">
                   <Lock size={12} />
                   <span className="text-[10px] font-medium uppercase tracking-wider">Safe execution</span>
               </div>
          </div>
          <p className="text-[10px] font-medium text-blue-600 uppercase tracking-widest">Enterprise v4.8</p>
      </div>
    </div>
  );
};

const InputGroup = ({ label, value, onChange, step = "1", icon: Icon }) => (
    <div className="space-y-4 group">
        <label className="text-xs font-medium text-gray-400 ml-1 group-focus-within:text-blue-600 transition-colors">{label}</label>
        <div className="relative">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors">
                <Icon size={18} />
            </div>
            <input 
                type="number" 
                step={step}
                value={value} 
                onChange={onChange}
                className="w-full bg-slate-50 border border-transparent rounded-xl pl-16 pr-6 py-4.5 text-base font-semibold tracking-tight outline-none focus:bg-white focus:border-blue-100 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] placeholder:text-gray-200"
            />
        </div>
    </div>
);

export default EarlyClosureCalculator;
