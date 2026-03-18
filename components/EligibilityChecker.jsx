import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  Activity, 
  Zap, 
  TrendingUp, 
  Briefcase,
  IndianRupee,
  Clock,
  PieChart
} from 'lucide-react';

const EligibilityChecker = () => {
    const [formData, setFormData] = useState({
        amount: 500000,
        income: 75000,
        emi: 0,
        employmentType: 'Salaried'
    });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const checkEligibility = (e) => {
        e.preventDefault();
        setLoading(true);
        
        setTimeout(() => {
            const { income, amount, emi } = formData;
            
            // Simplified institutional logic
            const proposedEMI = (amount * 0.02); // 2% rough estimate
            const totalMonthlyLiabilities = Number(emi) + proposedEMI;
            const dti = (totalMonthlyLiabilities / income) * 100;
            
            let status = 'Eligible';
            let color = 'green';
            if (dti > 50) {
                status = 'Not Eligible';
                color = 'red';
            } else if (dti > 40) {
                status = 'Manual Review';
                color = 'yellow';
            }

            const maxLoanLimit = income * 48; // 4 years of income rule of thumb
            
            setResult({
                status,
                color,
                loanLimit: maxLoanLimit,
                estimatedEMI: Math.round(proposedEMI),
                dti: Math.round(dti),
                explanation: status === 'Eligible' 
                  ? "Your profile meets HDFC's prime lending criteria." 
                  : status === 'Manual Review' 
                  ? "Your DTI is at the threshold. Institutional review required." 
                  : "High debt-to-income ratio detected. Variance exceeds safe limits."
            });
            setLoading(false);
        }, 1200);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 font-sans max-w-6xl mx-auto">
            <header className="pb-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Loan Eligibility Checker</h1>
                    <p className="text-sm text-gray-500 mt-1">Simulate your institutional credit limit and risk profile</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-2">
                {/* Inputs Section */}
                <div className="lg:col-span-4">
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]">
                        <h3 className="text-sm font-semibold text-gray-900 mb-6 flex items-center gap-2">
                          <Activity size={18} className="text-blue-600" />
                          Risk Parameters
                        </h3>
                        <form onSubmit={checkEligibility} className="space-y-5">
                            <InputField 
                                label="Monthly Income" 
                                value={formData.income} 
                                onChange={(val) => setFormData({...formData, income: val})}
                                prefix="₹"
                                icon={IndianRupee}
                            />
                            <InputField 
                                label="Loan Amount Requested" 
                                value={formData.amount} 
                                onChange={(val) => setFormData({...formData, amount: val})}
                                prefix="₹"
                                icon={Zap}
                            />
                            <InputField 
                                label="Existing EMI" 
                                value={formData.emi} 
                                onChange={(val) => setFormData({...formData, emi: val})}
                                prefix="₹"
                                icon={Clock}
                            />
                            
                            <div className="space-y-2 group">
                                <label className="text-xs font-semibold text-gray-500 ml-1 group-focus-within:text-blue-600 transition-colors">Employment Type</label>
                                <div className="relative">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                                        <Briefcase size={18} />
                                    </div>
                                    <select 
                                        value={formData.employmentType}
                                        onChange={(e) => setFormData({...formData, employmentType: e.target.value})}
                                        className="w-full bg-slate-50 border border-transparent rounded-xl py-4 pl-12 pr-6 text-[13px] font-semibold text-gray-900 outline-none focus:bg-white focus:border-blue-100 transition-all appearance-none cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]"
                                    >
                                        <option value="Salaried">Institutional Salaried</option>
                                        <option value="Self-Employed">Private Business</option>
                                        <option value="Professional">Licensed Professional</option>
                                    </select>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full py-4 mt-4 bg-blue-600 text-white font-semibold rounded-xl text-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] hover:bg-blue-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-95"
                            >
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-gray-200 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <span>Initialize Check</span>
                                        <ArrowRight size={16} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Results Section */}
                <div className="lg:col-span-8 flex flex-col">
                  {!result && !loading && (
                    <div className="flex-1 bg-slate-50 rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center p-6 text-center">
                      <div className="w-16 h-16 bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] flex items-center justify-center mb-4 text-blue-600">
                        <ShieldCheck size={32} />
                      </div>
                      <h4 className="text-sm font-semibold text-gray-900">Ready for Assessment</h4>
                      <p className="text-xs text-gray-500 mt-2 max-w-xs leading-relaxed">
                        Enter your financial parameters and initialize the check to see your institutional eligibility results.
                      </p>
                    </div>
                  )}

                  {loading && (
                    <div className="flex-1 bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center p-6">
                      <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                      <p className="text-sm font-semibold text-gray-900">Processing Audit Node...</p>
                    </div>
                  )}

                  {result && !loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-in zoom-in-95 duration-500">
                      <ResultCard 
                        label="Eligibility Status" 
                        value={result.status} 
                        color={result.color}
                        explanation={result.explanation}
                        icon={ShieldCheck}
                      />
                      <ResultCard 
                        label="Eligible Loan Amount" 
                        value={`₹${result.loanLimit.toLocaleString()}`} 
                        color="blue"
                        explanation="Maximum potential institutional credit exposure."
                        icon={TrendingUp}
                      />
                      <ResultCard 
                        label="Estimated EMI" 
                        value={`₹${result.estimatedEMI.toLocaleString()}`} 
                        color="blue"
                        explanation="Calculated institutional monthly repayment volume."
                        icon={Clock}
                      />
                      <ResultCard 
                        label="DTI Ratio (%)" 
                        value={`${result.dti}%`} 
                        color={result.dti > 45 ? 'red' : result.dti > 35 ? 'yellow' : 'green'}
                        explanation="Total monthly debt relative to gross income."
                        icon={PieChart}
                      />
                    </div>
                  )}
                </div>
            </div>
        </div>
    );
};

const InputField = ({ label, value, onChange, prefix, icon: Icon }) => (
    <div className="space-y-2 group text-left">
        <label className="text-xs font-semibold text-gray-500 ml-1 group-focus-within:text-blue-600 transition-colors uppercase tracking-tight">{label}</label>
        <div className="relative">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
              <Icon size={18} />
            </div>
            <input 
                type="number" 
                value={value} 
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full bg-slate-50 border border-transparent rounded-xl py-4 pl-12 pr-6 text-[13px] font-semibold text-gray-900 outline-none focus:bg-white focus:border-blue-100 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]"
            />
        </div>
    </div>
);

const ResultCard = ({ label, value, color, explanation, icon: Icon }) => {
  const colorStyles = {
    green: 'border-green-100 bg-green-50 text-green-700',
    yellow: 'border-orange-100 bg-orange-50/30 text-orange-700',
    red: 'border-red-100 bg-red-50 text-red-700',
    blue: 'border-blue-100 bg-blue-50 text-blue-700'
  };

  const bgStyles = {
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600',
    blue: 'bg-blue-100 text-blue-600'
  };

  return (
    <div className={`p-6 border rounded-xl flex flex-col h-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] transition-all ${colorStyles[color]}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-xl ${bgStyles[color]}`}>
          <Icon size={18} />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
          {label}
        </span>
      </div>
      <div className="flex-1">
        <h3 className="text-2xl font-semibold mb-2 tracking-tight">
          {value}
        </h3>
        <p className="text-[11px] font-medium leading-relaxed opacity-80">
          {explanation}
        </p>
      </div>
    </div>
  );
};

export default EligibilityChecker;
