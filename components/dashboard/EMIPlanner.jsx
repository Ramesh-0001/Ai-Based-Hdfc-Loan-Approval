import React, { useState, useEffect } from 'react';
import { Calculator, PieChart, IndianRupee, TrendingUp, Info, ArrowRight } from 'lucide-react';

const EMIPlanner = () => {
  const [amount, setAmount] = useState(1000000);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(5);
  const [emi, setEmi] = useState(0);

  const calculateEMI = (p, r, t) => {
    const monthlyRate = r / 12 / 100;
    const months = t * 12;
    const emiValue = (p * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    return Math.round(emiValue);
  };

  useEffect(() => {
    setEmi(calculateEMI(amount, rate, tenure));
  }, [amount, rate, tenure]);

  const comparison = [3, 5, 7].map(t => ({
    years: t,
    emi: calculateEMI(amount, rate, t),
    interest: calculateEMI(amount, rate, t) * t * 12 - amount
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-700 font-sans">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-medium text-gray-900 tracking-tight">EMI modeler</h1>
            <p className="text-sm text-gray-400 mt-2 font-normal">Simulate repayments and interest projections</p>
          </div>
          <div className="px-4 py-1.5 bg-blue-50 rounded-lg border border-blue-50">
             <span className="text-xs font-medium text-blue-600">Institutional logic</span>
          </div>
      </header>

      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <InputGroup label="Capital exposure (₹)" value={amount} onChange={(e) => setAmount(Number(e.target.value))} icon={IndianRupee} />
          <InputGroup label="Annual rate (%)" value={rate} step="0.1" onChange={(e) => setRate(Number(e.target.value))} icon={TrendingUp} />
          <InputGroup label="Tenure (Years)" value={tenure} onChange={(e) => setTenure(Number(e.target.value))} icon={Calculator} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] relative overflow-hidden group shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] transition-all hover:bg-gray-800">
            <div className="flex items-center space-x-2 mb-6 opacity-60">
                <span className="text-xs font-medium">Monthly installment</span>
            </div>
            <h4 className="text-2xl font-semibold tracking-tight mb-2">₹{emi.toLocaleString()}</h4>
            <div className="mt-6 pt-6 border-t border-white/5 flex flex-col space-y-2">
              <span className="text-[11px] text-gray-500 font-normal">Total payable:</span>
              <span className="text-lg font-medium text-blue-400">₹{(emi * tenure * 12).toLocaleString()}</span>
            </div>
          </div>

          {comparison.map((comp, idx) => (
            <div key={idx} className="bg-white rounded-xl p-6 border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] hover:border-blue-100 transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-xs font-semibold text-gray-900">{comp.years} year term</p>
                  <p className="text-[11px] text-gray-400 mt-1 font-normal">Repayment node</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-slate-50 transition-colors group-hover:bg-blue-50 flex items-center justify-center text-gray-400 group-hover:text-blue-600">
                  <PieChart size={16} />
                </div>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 tracking-tight">₹{comp.emi.toLocaleString()}</h4>
              <div className="mt-6 flex items-center space-x-2 text-gray-400">
                  <Info size={12} />
                  <p className="text-[11px] font-normal">Interest: ₹{comp.interest.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-600 rounded-xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]">
          <div>
              <h3 className="text-xl font-medium tracking-tight">Ready to proceed?</h3>
              <p className="text-sm opacity-80 mt-1 font-normal">Apply using these parameters for immediate review</p>
          </div>
          <button className="px-6 py-3 bg-white text-blue-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all flex items-center space-x-2 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]">
              <span>Start application</span>
              <ArrowRight size={16} />
          </button>
      </div>
    </div>
  );
};

const InputGroup = ({ label, value, onChange, step = "1", icon: Icon }) => (
    <div className="space-y-3">
        <label className="text-xs font-medium text-gray-500 ml-1">{label}</label>
        <div className="relative">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                <Icon size={18} />
            </div>
            <input 
                type="number" 
                step={step}
                value={value} 
                onChange={onChange}
                className="w-full bg-slate-50 border border-gray-200 rounded-xl pl-14 pr-6 py-4 text-base font-medium text-gray-900 outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all"
            />
        </div>
    </div>
);

export default EMIPlanner;
