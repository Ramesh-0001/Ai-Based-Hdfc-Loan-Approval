import React from 'react';
import { Menu, Bell, User } from 'lucide-react';

const Navbar = ({ onMenuClick, user, activeTab }) => {
  // Convert typical tab IDs back to human-readable titles, though the prompt asked for "Dashboard"
  const getTabTitle = (tab) => {
    const titles = {
      dashboard: "Dashboard",
      apply: "Loan Application",
      eligibility: "AI Risk Score",
      "check-eligibility": "Eligibility Checker",
      emi: "EMI Planner",
      timeline: "Loan Status",
      health: "Financial Health",
      documents: "Documents"
    };
    return titles[tab] || "Dashboard";
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-40 px-6 flex items-center justify-between transition-all duration-200 font-sans">
      <div className="flex items-center space-x-6">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-400 hover:text-gray-900 hover:bg-slate-50 rounded-xl transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]"
        >
          <Menu size={20} />
        </button>
        
        {/* Page Title */}
        <div className="hidden sm:flex items-center gap-3 text-sm font-semibold text-gray-900">
          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          <h2>{getTabTitle(activeTab)}</h2>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg relative transition-all duration-200">
          <Bell size={18} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-600 rounded-full border border-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]"></span>
        </button>
        
        <div className="h-8 w-[1px] bg-gray-100 hidden sm:block"></div>

        {/* Profile */}
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900 leading-tight">{user?.name || 'Applicant Profile'}</p>
            <p className="text-[11px] text-gray-400 mt-0.5 font-normal tracking-wide">Consumer portal</p>
          </div>
          <div className="relative">
            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-blue-600 text-sm font-medium transition-all duration-200 group-hover:bg-blue-600 group-hover:text-white">
              {user?.name?.charAt(0) || <User size={16} />}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
