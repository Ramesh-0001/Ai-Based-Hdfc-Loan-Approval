import React from 'react';
import { ShieldCheck, Smartphone, Fingerprint, Activity, Info, AlertTriangle } from 'lucide-react';

const SecurityScore = ({ score = 98 }) => {
    const isSecure = score > 90;
    
    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm shadow-blue-500/10">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 tracking-tight">Access Integrity</h3>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Real-time Fraud Shield</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className={`text-4xl font-black ${isSecure ? 'text-green-600' : 'text-red-500'} tracking-tighter`}>{score}<span className="text-sm font-bold text-gray-300 ml-1">/100</span></div>
                    <div className={`text-[10px] font-black uppercase tracking-widest mt-1 ${isSecure ? 'text-green-600' : 'text-red-500'}`}>
                        {isSecure ? 'ACCOUNT SECURE' : 'ACTION REQUIRED'}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-100 group hover:border-blue-200 transition-colors">
                    <div className="flex items-center gap-4">
                        <Smartphone size={18} className="text-blue-500" />
                        <span className="text-xs font-bold text-gray-700">Trusted Device</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-[10px] font-bold text-green-500 uppercase">Verified</span>
                    </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-100 group hover:border-blue-200 transition-colors">
                    <div className="flex items-center gap-4">
                        <Fingerprint size={18} className="text-blue-500" />
                        <span className="text-xs font-bold text-gray-700">Identity Audit</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-[10px] font-bold text-green-500 uppercase">100% Match</span>
                    </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-100 group hover:border-blue-200 transition-colors">
                    <div className="flex items-center gap-4">
                        <Activity size={18} className={isSecure ? 'text-blue-500' : 'text-red-500'} />
                        <span className="text-xs font-bold text-gray-700">Login Activity</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isSecure ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className={`text-[10px] font-bold uppercase ${isSecure ? 'text-green-500' : 'text-red-500'}`}>
                            {isSecure ? 'Natural' : 'Suspicious'}
                        </span>
                    </div>
                </div>
            </div>

            <div className={`mt-8 p-4 rounded-xl border flex items-start gap-4 ${isSecure ? 'bg-blue-50 border-blue-100' : 'bg-red-50 border-red-100'}`}>
                {isSecure ? <Info size={16} className="text-blue-600 mt-0.5" /> : <AlertTriangle size={16} className="text-red-600 mt-0.5" />}
                <div>
                   <p className={`text-[11px] font-bold tracking-tight mb-1 ${isSecure ? 'text-blue-900 group-hover:text-blue-700' : 'text-red-900'}`}>
                    {isSecure ? "Your identity is protected by multi-factor banking encryption." : "Wait: Potential unauthorized access attempt detected from unknown location."}
                   </p>
                   <p className="text-[10px] font-medium text-gray-400 uppercase italic">Latest check: {(new Date()).toLocaleTimeString()}</p>
                </div>
            </div>
        </div>
    );
};

export default SecurityScore;
