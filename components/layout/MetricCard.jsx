import React from 'react';

const MetricCard = ({ title, value, subtext, icon: Icon, colorClass }) => {
  // Extract text color from color class (e.g., bg-banking-primary -> text-banking-primary)
  const textColor = colorClass.replace('bg-', 'text-');
  const bgColor = colorClass + ' bg-opacity-[0.08]';

  return (
    <div className="bg-white rounded-xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-200 transition-all duration-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:translate-y-[-2px] group">
      <div className="flex items-start justify-between">
        <div className="space-y-4">
          <p className="text-[13px] font-medium text-gray-400 tracking-wide">{title}</p>
          <div className="space-y-1">
            <p className="text-2xl font-semibold text-gray-900 tracking-tight">{value}</p>
            {subtext && <p className="text-[12px] text-gray-400 font-normal">{subtext}</p>}
          </div>
        </div>
        <div className={`p-2.5 rounded-xl ${bgColor} transition-all duration-300 group-hover:bg-opacity-[0.15]`}>
          <Icon className={`${textColor} transition-transform duration-300 group-hover:scale-110`} size={20} />
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
