import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Download, ArrowRight, Calculator, TrendingUp, Info } from 'lucide-react';

const EMICalculator = ({ initialAmount, initialTenure }) => {
    const [amount, setAmount] = useState(initialAmount || 500000);
    const [interest, setInterest] = useState(8.5);
    const [tenure, setTenure] = useState(initialTenure || 5);

    const calculateEMI = () => {
        const r = interest / 12 / 100;
        const n = tenure * 12;
        const emi = (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        return emi;
    };

    const emi = calculateEMI();
    const totalPayable = emi * tenure * 12;
    const totalInterest = totalPayable - amount;

    const chartData = [
        { name: 'Principal amount', value: amount },
        { name: 'Interest payable', value: totalInterest }
    ];

    const COLORS = ['#2563eb', '#cbd5e1'];

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-700 py-6 px-6 font-sans">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-10 border-b border-gray-200">
                <div>
                    <div className="inline-flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100 mb-4">
                        <Calculator size={12} className="text-blue-600" />
                        <span className="text-[11px] font-medium text-blue-600">Precision modeler</span>
                    </div>
                    <h2 className="text-2xl font-medium text-gray-900 tracking-tight">EMI terminal</h2>
                    <p className="text-sm text-gray-400 mt-2 font-normal">Institutional amortization and repayment simulator</p>
                </div>
                <div className="hidden sm:flex items-center space-x-3 px-6 py-3 bg-white border border-gray-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]">
                    <TrendingUp className="text-blue-600" size={16} />
                    <span className="text-[11px] font-medium text-gray-900">Real-time projections</span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Inputs Section */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] space-y-6">
                        <RangeInput 
                            label="Capital exposure" 
                            value={amount} 
                            min={50000} 
                            max={10000000} 
                            step={50000} 
                            unit="₹"
                            onChange={setAmount} 
                        />
                        <RangeInput 
                            label="Annual interest rate" 
                            value={interest} 
                            min={5} 
                            max={20} 
                            step={0.1} 
                            unit="%"
                            onChange={setInterest} 
                        />
                        <RangeInput 
                            label="Maturity horizon (years)" 
                            value={tenure} 
                            min={1} 
                            max={30} 
                            step={1} 
                            unit="y"
                            onChange={setTenure} 
                        />
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-6"></div>
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 mb-2 font-normal">Monthly installment</p>
                                <h2 className="text-2xl font-semibold tracking-tight">₹{Math.round(emi).toLocaleString()}</h2>
                                <p className="text-[11px] text-blue-400 font-medium mt-6 flex items-center">
                                    <Info size={12} className="mr-2" />
                                    Estimated periodic liability
                                </p>
                            </div>
                            <div className="w-14 h-14 bg-white border border-gray-200 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                <Calculator className="text-blue-400" size={24} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Analysis Section */}
                <div className="lg:col-span-7">
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] h-full flex flex-col">
                        <h3 className="text-sm font-medium text-gray-900 mb-6">Amortization intelligence</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow">
                            <div className="h-64 relative flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            innerRadius={65}
                                            outerRadius={85}
                                            paddingAngle={8}
                                            dataKey="value"
                                            stroke="none"
                                            animationDuration={1500}
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ 
                                                borderRadius: '16px', 
                                                border: 'none', 
                                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', 
                                                fontSize: '11px',
                                                fontWeight: '500'
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Ratio</span>
                                    <span className="text-xl font-semibold text-gray-900">{(amount / totalPayable * 100).toFixed(0)}%</span>
                                </div>
                            </div>

                            <div className="space-y-6 flex flex-col justify-center">
                                <ResultMetric label="Total interest yield" value={`₹${Math.round(totalInterest).toLocaleString()}`} color="#cbd5e1" />
                                <ResultMetric label="Aggregate liability" value={`₹${Math.round(totalPayable).toLocaleString()}`} color="#2563eb" primary />
                                
                                <div className="pt-8 border-t border-gray-200 space-y-4">
                                    <div className="flex justify-between items-center text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                                        <span>Exposure ratio</span>
                                        <span className="text-blue-600">{Math.round((amount / totalPayable) * 100)}% pri / {Math.round((totalInterest / totalPayable) * 100)}% int</span>
                                    </div>
                                    <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden border border-gray-200 p-0.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]">
                                        <div 
                                            className="bg-blue-600 h-full rounded-full transition-all duration-1000 ease-out" 
                                            style={{ width: `${(amount / totalPayable) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col sm:flex-row gap-4 border-t border-gray-200 pt-10">
                            <button className="flex-1 flex items-center justify-center space-x-2 py-4 border border-gray-200 rounded-xl text-xs font-semibold text-gray-400 hover:bg-slate-50 hover:text-gray-900 transition-all active:scale-95">
                                <Download size={14} />
                                <span>Export audit report</span>
                            </button>
                            <button className="flex-1 flex items-center justify-center space-x-2 py-4 bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] hover:bg-blue-700 transition-all active:scale-95">
                                <span>Initialize application</span>
                                <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <footer className="text-center pt-8">
                 <p className="text-[10px] font-medium text-gray-300 tracking-widest">
                    HDFC Institutional Network • Yield Engine v4.8
                 </p>
            </footer>
        </div>
    );
};

const RangeInput = ({ label, value, min, max, step, unit, onChange }) => (
    <div className="space-y-6 group">
        <div className="flex justify-between items-end px-1">
            <label className="text-xs font-medium text-gray-400 group-focus-within:text-blue-600 transition-colors">{label}</label>
            <span className="text-2xl font-semibold text-gray-900 tracking-tight">
                {unit === '₹' ? `₹${value.toLocaleString()}` : `${value}${unit}`}
            </span>
        </div>
        <div className="relative h-1.5 flex items-center px-1">
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer accent-blue-600 border border-transparent focus:outline-none transition-all"
            />
        </div>
        <div className="flex justify-between text-[10px] text-gray-300 font-medium px-1 tracking-wider uppercase">
            <span>Base: {unit === '₹' ? '₹50k' : min + unit}</span>
            <span>Ceiling: {unit === '₹' ? '₹1cr' : max + unit}</span>
        </div>
    </div>
);

const ResultMetric = ({ label, value, color, primary }) => (
    <div className="space-y-2 group">
        <p className="text-[11px] font-medium text-gray-400 flex items-center group-hover:text-blue-600 transition-colors">
            <span className="w-1.5 h-1.5 rounded-full mr-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]" style={{ backgroundColor: color }}></span>
            {label}
        </p>
        <p className={`text-2xl font-semibold tracking-tight ${primary ? 'text-gray-900' : 'text-gray-500'}`}>
            {value}
        </p>
    </div>
);

export default EMICalculator;
