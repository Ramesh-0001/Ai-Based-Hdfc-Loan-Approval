import React from 'react';
import { ArrowRight } from 'lucide-react';

const FeatureCard = ({ title, description, icon: Icon, onClick, color }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] border border-gray-200 cursor-pointer transition-all duration-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] hover:scale-[1.02] group"
    >
      <div className={`w-14 h-14 rounded-xl ${color} bg-opacity-10 flex items-center justify-center mb-6 transition-all duration-300 group-hover:bg-opacity-100`}>
        <Icon className={`${color.replace('bg-', 'text-')} group-hover:text-white transition-colors duration-300`} size={28} />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed mb-6 font-normal">
        {description}
      </p>
      
      <div className="flex items-center text-banking-primary font-semibold text-sm group-hover:translate-x-1 transition-transform">
        <span>Get Started</span>
        <ArrowRight size={16} className="ml-2" />
      </div>
    </div>
  );
};

export default FeatureCard;
