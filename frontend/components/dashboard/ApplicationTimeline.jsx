import React from 'react';
import { Clock, CheckCircle2, AlertCircle, Activity } from 'lucide-react';

const ApplicationTimeline = ({ latestApp }) => {
  const steps = [
    { name: "Submission", sub: "Application received" },
    { name: "Verification", sub: "Document review" },
    { name: "Fraud check", sub: "ID & fraud audit" },
    { name: "Risk assessment", sub: "AI eligibility scoring" },
    { name: "Final review", sub: "Underwriting phase" },
    { name: "Resolution", sub: "Final decision" }
  ];

  const getStatusStep = (status) => {
    switch (status) {
      case 'APPROVED': return 6;
      case 'REJECTED': return 6;
      case 'PENDING': return 4; 
      default: return latestApp ? 2 : 0;
    }
  };

  const currentStep = getStatusStep(latestApp?.status);

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] animate-in fade-in duration-700 font-sans">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-50">
            <Clock size={20} />
          </div>
          <div>
            <h3 className="text-base font-medium text-gray-900">Application status</h3>
            <p className="text-xs text-gray-400 mt-1 font-normal">Real-time tracking of your request</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full border border-blue-50">
          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div>
          <span className="text-[11px] font-medium text-blue-600">Updated now</span>
        </div>
      </div>
      
      <div className="relative flex justify-between items-start pt-4 px-4">
        {/* Connection Line */}
        <div className="absolute top-[21px] left-10 right-10 h-[2px] bg-gray-100 -z-0" />
        <div 
          className="absolute top-[21px] left-10 h-[2px] bg-blue-600 transition-all duration-1000 ease-in-out -z-0" 
          style={{ width: `calc(${((currentStep - 1) / (steps.length - 1)) * 100}% - 20px)` }}
        />

        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isCompleted = stepNum < currentStep || (stepNum === 6 && latestApp?.status === 'APPROVED');
          const isActive = stepNum === currentStep;
          const isFailed = stepNum === 6 && latestApp?.status === 'REJECTED';

          return (
            <div key={idx} className="flex flex-col items-center relative z-10 flex-1 px-2 group">
              <div 
                className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-500 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]
                ${isCompleted ? 'bg-blue-600 border-blue-600 text-white' : 
                  isFailed ? 'bg-red-600 border-red-600 text-white' :
                  isActive ? 'bg-white border-blue-600 text-blue-600 ring-4 ring-blue-50' : 
                  'bg-white border-gray-200 text-gray-300'}`}
              >
                {isCompleted ? <CheckCircle2 size={18} /> : 
                 isFailed ? <AlertCircle size={18} /> :
                 <span className="text-xs font-medium">{stepNum}</span>}
              </div>
              
              <div className="mt-6 text-center">
                <p className={`text-[11px] font-semibold tracking-tight uppercase ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                  {step.name}
                </p>
                <p className="text-[10px] text-gray-400 mt-1 max-w-[80px] leading-tight mx-auto font-normal">
                  {step.sub}
                </p>
              </div>
              
              {isActive && (
                <div className="mt-3 flex items-center space-x-1 justify-center">
                    <Activity size={10} className="text-blue-600 animate-pulse" />
                    <span className="text-[9px] font-medium text-blue-600">In review</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ApplicationTimeline;
