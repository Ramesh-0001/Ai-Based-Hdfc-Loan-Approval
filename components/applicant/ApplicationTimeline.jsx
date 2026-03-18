import React from 'react';
import { CheckCircle2, Circle, Clock, ShieldCheck, Sparkles } from 'lucide-react';

const ApplicationTimeline = ({ status, progress, stages }) => {
    // Stage groups for visual styling
    const getStageStatus = (stageProgress) => {
        if (progress > stageProgress || (progress === 100 && stageProgress === 100)) return 'completed';
        if (progress === stageProgress) return 'active';
        return 'pending';
    };

    return (
        <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] border border-gray-200 font-sans">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                <div>
                    <h3 className="text-xl font-semibold text-gray-900 tracking-tight">Application progress</h3>
                    <div className="flex items-center space-x-2 mt-2">
                        <Clock size={14} className="text-blue-600" />
                        <p className="text-sm text-gray-400 font-normal">
                            Current node: <span className="text-blue-600 font-medium">{status}</span>
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-4 bg-slate-50 px-5 py-3 rounded-xl border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]">
                    <div className="text-right">
                        <p className="text-2xl font-semibold text-blue-600 tracking-tight">{progress}%</p>
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mt-1">Confidence score</p>
                    </div>
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]">
                        <Sparkles size={24} />
                    </div>
                </div>
            </div>

            <div className="relative space-y-6 pl-2">
                {/* Vertical Line */}
                <div className="absolute left-[20px] top-2 bottom-2 w-0.5 bg-gray-100"></div>
                <div 
                    className="absolute left-[20px] top-2 w-0.5 bg-blue-600 transition-all duration-1000 ease-out" 
                    style={{ height: `${progress}%`, maxHeight: '100%' }}
                ></div>

                {stages.map((stage) => {
                    const state = getStageStatus(stage.progress);
                    
                    return (
                        <div key={stage.id} className="flex items-start space-x-8 relative z-10 transition-all duration-500">
                            <div className={`
                                w-7 h-7 rounded-full flex items-center justify-center transition-all duration-700
                                ${state === 'completed' ? 'bg-blue-600 text-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]' : 
                                  state === 'active' ? 'bg-white border-4 border-blue-600 text-blue-600 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] scale-110' : 
                                  'bg-gray-100 border-2 border-transparent text-gray-400'}
                            `}>
                                {state === 'completed' ? (
                                    <CheckCircle2 size={16} />
                                ) : (
                                    <span className="text-[10px] font-semibold">{stage.id}</span>
                                )}
                            </div>
                            
                            <div className="flex-1">
                                <div className="flex items-center justify-between gap-4">
                                    <h4 className={`text-sm font-medium tracking-tight ${state === 'pending' ? 'text-gray-400' : 'text-gray-900'}`}>
                                        {stage.name}
                                    </h4>
                                    {state === 'active' && (
                                        <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-medium uppercase tracking-wider rounded-lg border border-blue-100">
                                            In progress
                                        </span>
                                    )}
                                </div>
                                <p className={`text-xs mt-1.5 leading-relaxed font-normal ${state === 'pending' ? 'text-gray-300' : 'text-gray-500'}`}>
                                    {state === 'completed' ? 'Verification successfully completed.' : 
                                     state === 'active' ? 'Currently reviewing your details with AI risk engine.' : 
                                     'Pending previous stage completion.'}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Verification Badges */}
            <div className="mt-6 pt-8 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl border border-transparent hover:border-blue-100 transition-all cursor-default">
                    <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]">
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <span className="text-xs font-medium text-gray-900 tracking-tight">Identity verified</span>
                        <p className="text-[10px] text-gray-400 font-normal mt-0.5">Biometric sync success</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl border border-transparent hover:border-blue-100 transition-all cursor-default">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]">
                        <Clock size={20} />
                    </div>
                    <div>
                        <span className="text-xs font-medium text-gray-900 tracking-tight">Scoring active</span>
                        <p className="text-[10px] text-gray-400 font-normal mt-0.5">Real-time risk audit</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplicationTimeline;
