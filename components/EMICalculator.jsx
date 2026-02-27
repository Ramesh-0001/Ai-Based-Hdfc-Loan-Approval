
import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const EMICalculator = () => {
    const [amount, setAmount] = useState(500000);
    const [interest, setInterest] = useState(8.5);
    const [tenure, setTenure] = useState(5);

    const calculateEMI = () => {
        const r = interest / 12 / 100;
        const n = tenure * 12;
        const emi = (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        return emi;
    };

    const emi = calculateEMI();
    const totalPayable = emi * tenure * 12;
    const totalInterest = totalPayable - amount;

    const data = [
        { name: 'Principal Amount', value: amount },
        { name: 'Total Interest', value: totalInterest }
    ];

    const COLORS = ['#003d82', '#e11b22'];

    return (
        <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="text-center space-y-4">
                <span className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-[#003d82] dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] rounded-full border border-blue-100 dark:border-blue-800">Financial Planning</span>
                <h1 className="text-5xl font-black text-[#003d82] dark:text-blue-400 tracking-tight">Smart EMI Calculator</h1>
                <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto font-medium">Precision simulation engine for HDFC institutional lending. Plan your financial future with dynamic visualizations.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Inputs Column */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] shadow-2xl shadow-blue-900/5 border border-gray-100 dark:border-slate-700 space-y-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 dark:bg-slate-700/50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>

                        <div className="relative z-10 space-y-10">
                            <div>
                                <div className="flex justify-between items-end mb-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Loan Amount</label>
                                    <span className="text-2xl font-black text-[#003d82] dark:text-blue-400">₹{amount.toLocaleString()}</span>
                                </div>
                                <input
                                    type="range"
                                    min="50000"
                                    max="10000000"
                                    step="50000"
                                    value={amount}
                                    onChange={(e) => setAmount(Number(e.target.value))}
                                    className="w-full h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-[#003d82] hover:accent-[#e11b22] transition-colors"
                                />
                                <div className="flex justify-between text-[8px] text-gray-300 mt-2 font-black uppercase tracking-tighter">
                                    <span>min ₹50,000</span>
                                    <span>max ₹1,00,00,000</span>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-end mb-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Interest Rate (% P.A.)</label>
                                    <span className="text-2xl font-black text-[#003d82] dark:text-blue-400">{interest}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="5"
                                    max="20"
                                    step="0.1"
                                    value={interest}
                                    onChange={(e) => setInterest(Number(e.target.value))}
                                    className="w-full h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-[#003d82] hover:accent-[#e11b22] transition-colors"
                                />
                                <div className="flex justify-between text-[8px] text-gray-300 mt-2 font-black uppercase tracking-tighter">
                                    <span>min 5%</span>
                                    <span>max 20%</span>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-end mb-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Tenure (Years)</label>
                                    <span className="text-2xl font-black text-[#003d82] dark:text-blue-400">{tenure} Yrs</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="30"
                                    step="1"
                                    value={tenure}
                                    onChange={(e) => setTenure(Number(e.target.value))}
                                    className="w-full h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-[#003d82] hover:accent-[#e11b22] transition-colors"
                                />
                                <div className="flex justify-between text-[8px] text-gray-300 mt-2 font-black uppercase tracking-tighter">
                                    <span>min 1 yr</span>
                                    <span>max 30 yrs</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Visual Analysis Column */}
                <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Results HUD */}
                    <div className="bg-[#003d82] p-10 rounded-[2.5rem] shadow-2xl flex flex-col justify-between text-white relative overflow-hidden group">
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
                        <div className="relative z-10">
                            <p className="text-blue-200 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Monthly Installment</p>
                            <h2 className="text-5xl font-black tracking-tighter mb-10">₹{Math.round(emi).toLocaleString()}</h2>

                            <div className="space-y-6 pt-10 border-t border-white/10">
                                <div className="flex justify-between items-center">
                                    <span className="text-blue-200 text-[10px] font-black uppercase tracking-widest">Total Interest</span>
                                    <span className="text-xl font-black">₹{Math.round(totalInterest).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <span className="text-blue-300 text-[8px] font-black uppercase tracking-[0.2em] block mb-1">Total Payable</span>
                                        <span className="text-3xl font-black text-white">₹{Math.round(totalPayable).toLocaleString()}</span>
                                    </div>
                                    <div className="bg-white/10 p-2 rounded-xl text-[10px] font-black uppercase tracking-tighter animate-pulse">
                                        SECURE QUOTE
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chart Card */}
                    <div className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-slate-700 flex flex-col items-center">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6">Payment Composition</h4>
                        <div className="w-full h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '16px',
                                            border: 'none',
                                            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                            fontSize: '10px',
                                            fontWeight: 'bold',
                                            textTransform: 'uppercase'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-6 flex flex-col space-y-3 w-full">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#003d82]"></div>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase">Principal</span>
                                </div>
                                <span className="text-[10px] font-black text-gray-800 dark:text-white">{Math.round((amount / totalPayable) * 100)}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#e11b22]"></div>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase">Interest</span>
                                </div>
                                <span className="text-[10px] font-black text-gray-800 dark:text-white">{Math.round((totalInterest / totalPayable) * 100)}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 dark:bg-slate-950/50 p-10 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-2">
                    <h3 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tighter">Ready to proceed with this plan?</h3>
                    <p className="text-xs text-gray-500 font-medium">Get instant AI-driven approval in less than 60 seconds.</p>
                </div>
                <div className="flex space-x-4">
                    <button className="px-10 py-5 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 text-gray-800 dark:text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:border-[#003d82] transition-all active:scale-95">Download PDF</button>
                    <button className="px-10 py-5 bg-[#e11b22] text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-red-700 shadow-xl shadow-red-900/20 transition-all active:scale-95">Apply Instantly</button>
                </div>
            </div>
        </div>
    );
};

export default EMICalculator;
