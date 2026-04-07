import React from 'react';
import { Target, ShieldCheck, Activity, Info } from 'lucide-react';

const LoanProbabilityMeter = ({ probability, riskLevel }) => {
    // Determine color based on probability
    const getColor = () => {
        if (probability >= 85) return '#2563eb'; // Blue (Institutional Success)
        if (probability >= 70) return '#3b82f6'; // Light Blue
        if (probability >= 55) return '#f59e0b'; // Amber
        return '#ef4444'; // Red
    };

    const color = getColor();

    return (
        <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] border border-gray-200 flex flex-col items-center text-center font-sans">
            <h3 className="text-[11px] font-medium text-gray-400 uppercase tracking-widest mb-6">Approval probability</h3>
            
            <div className="relative w-48 h-48 flex items-center justify-center">
                {/* SVG Gauge */}
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="96"
                        cy="96"
                        r="84"
                        fill="transparent"
                        stroke="#f8fafc"
                        strokeWidth="10"
                    />
                    <circle
                        cx="96"
                        cy="96"
                        r="84"
                        fill="transparent"
                        stroke={color}
                        strokeWidth="10"
                        strokeDasharray={2 * Math.PI * 84}
                        strokeDashoffset={2 * Math.PI * 84 * (1 - probability / 100)}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]"
                    />
                </svg>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-semibold text-gray-900 tracking-tight leading-none">{probability}%</span>
                    <span className="text-[11px] font-medium text-gray-400 uppercase tracking-widest mt-4">Confidence</span>
                </div>
            </div>

            <div className="mt-6 space-y-4 w-full">
                <div 
                    className="inline-flex items-center px-4 py-1.5 rounded-xl text-xs font-semibold border transition-all" 
                    style={{ backgroundColor: `${color}08`, borderColor: `${color}20`, color: color }}
                >
                    <ShieldCheck size={14} className="mr-2" />
                    {riskLevel} risk profile
                </div>
                <div className="pt-6 border-t border-gray-200 flex items-center justify-center space-x-2">
                    <Activity size={12} className="text-blue-500 opacity-60" />
                    <p className="text-[10px] text-gray-400 font-normal leading-relaxed max-w-[200px]">
                        Based on institutional underwriting standards and real-time risk delta audits.
                    </p>
                </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200 w-full flex items-center justify-center space-x-2 text-[9px] font-medium text-gray-300 uppercase tracking-[0.4em]">
                <Target size={10} />
                <span>Risk Core v4.8</span>
            </div>
        </div>
    );
};

export default LoanProbabilityMeter;
