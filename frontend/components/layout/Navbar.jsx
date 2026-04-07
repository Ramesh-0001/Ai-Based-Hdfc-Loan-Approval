import React, { useState } from 'react';
import { Menu, Bell, User } from 'lucide-react';

const Navbar = ({ onMenuClick, user, activeTab, notifications = [], onMarkRead }) => {
  const [showNotif, setShowNotif] = useState(false);

  const getTabTitle = (tab) => {
    const titles = {
      dashboard: "Dashboard",
      apply: "Loan Application",
      eligibility: "AI Risk Score",
      "check-eligibility": "Eligibility Checker",
      emi: "EMI Planner",
      timeline: "Loan Status",
      health: "Financial Health",
    };
    return titles[tab] || "Dashboard";
  };

  const userNotifications = notifications.filter(n => {
      if (!user) return false;
      if (!n.targetRoles) return n.customerName === user.name;
      if (user.role === 'ADMIN' && n.targetRoles.includes('ADMIN')) return true;
      if (user.role === 'OFFICER' && (n.targetRoles.includes('OFFICER') || n.recipientId === user.id)) return true;
      if (user.role === 'APPLICANT' && n.targetRoles.includes('CUSTOMER') && n.customerName === user.name) return true;
      return false;
  }).slice(0, 10);

  const unreadCount = userNotifications.filter(n => !n.read).length;

  const handleToggleNotif = () => {
      if (!showNotif && unreadCount > 0 && onMarkRead) {
          onMarkRead(user);
      }
      setShowNotif(!showNotif);
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-40 pl-4 pr-6 flex items-center justify-between transition-all duration-200 font-sans">
      <div className="flex items-center space-x-6">
        <button 
          onClick={onMenuClick}
          className="p-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all duration-200 active:bg-gray-200"
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
        <div className="relative">
          <button 
            onClick={handleToggleNotif}
            className={`p-2 rounded-lg relative transition-all duration-200 ${showNotif ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-white animate-pulse shadow-sm"></span>
            )}
          </button>

          {showNotif && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 z-50">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
                      <h3 className="text-[10px] font-bold text-gray-400 capitalize tracking-wider">System Notifications</h3>
                      <span className="text-[8px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">REALTIME</span>
                  </div>
                  <div className="max-h-[350px] overflow-y-auto divide-y divide-gray-50">
                      {userNotifications.length === 0 ? (
                          <div className="p-10 text-center text-gray-300">
                              <Bell size={24} className="mx-auto mb-3 opacity-20" />
                              <p className="text-xs font-medium italic">No new activity logged</p>
                          </div>
                      ) : (
                          userNotifications.map(n => (
                              <div key={n.id} className="p-4 hover:bg-slate-50 transition-colors group">
                                  <div className="flex items-start space-x-3">
                                      <div className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${n.type === 'APPROVED' ? 'bg-green-500' : n.type === 'REJECTED' ? 'bg-red-500' : 'bg-blue-500 shadow-[0_0_8px_rgba(37,99,235,0.4)]'}`}></div>
                                      <div className="flex-1 min-w-0">
                                          <p className="text-[13px] font-medium text-gray-700 leading-snug group-hover:text-gray-900 transition-colors">
                                              {typeof n.message === 'string' ? n.message : JSON.stringify(n.message)}
                                          </p>
                                          <p className="text-[10px] text-gray-400 mt-1.5 font-bold uppercase tracking-wider">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                      </div>
                                  </div>
                              </div>
                          ))
                      )}
                  </div>
              </div>
          )}
        </div>
        
        <div className="h-8 w-[1px] bg-gray-100 hidden sm:block"></div>

        {/* Profile */}
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900 leading-tight group-hover:text-blue-600 transition-colors capitalize tracking-tight">{user?.name || 'User Profile'}</p>
            <p className="text-[10px] text-gray-400 mt-0.5 font-bold tracking-widest uppercase">{user?.role || 'Guest'}</p>
          </div>
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-slate-50 border border-gray-100 flex items-center justify-center text-blue-600 text-sm font-bold transition-all duration-200 group-hover:bg-blue-600 group-hover:text-white shadow-sm">
              {user?.name?.charAt(0) || <User size={16} />}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
