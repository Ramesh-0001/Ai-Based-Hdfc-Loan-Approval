import React from 'react';
import { 
  LayoutDashboard, 
  FilePlus, 
  ShieldCheck, 
  Calculator,
  Search,
  Heart,
  FolderOpen,
  LogOut, 
  ChevronRight,
  Zap,
  Activity,
  UserCheck
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen, onLogout, user }) => {
  
  const sections = [
    {
      title: 'Main',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'apply', label: 'Loan Application', icon: FilePlus },
        { id: 'timeline', label: 'Loan Status', icon: Search },
      ]
    },
    {
      title: 'Tools',
      items: [
        { id: 'eligibility', label: 'AI Risk Score', icon: ShieldCheck },
        { id: 'emi', label: 'EMI Planner', icon: Calculator },
        { id: 'check-eligibility', label: 'Eligibility Checker', icon: UserCheck },
      ]
    },
    {
      title: 'Finance',
      items: [
        { id: 'health', label: 'Financial Health', icon: Heart },
        { id: 'documents', label: 'Documents', icon: FolderOpen },
      ]
    }
  ];

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200
    transform transition-transform duration-300 ease-in-out lg:translate-x-0
    ${isOpen ? 'translate-x-0 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]' : '-translate-x-full'}
  `;

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-white border text-gray-900/10 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={sidebarClasses}>
        <div className="flex flex-col h-full font-sans">
          {/* Logo Section */}
          <div className="p-6 pb-4 mb-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-semibold text-sm">
                H
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm text-gray-900 leading-tight">HDFC Portal</span>
                <p className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider mt-0.5">Applicant</p>
              </div>
            </div>
          </div>

          {/* Navigation Section */}
          <nav className="flex-1 px-3 space-y-5 overflow-y-auto py-2">
            {sections.map((section) => (
              <div key={section.title} className="space-y-1">
                <p className="px-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  {section.title}
                </p>
                <div className="space-y-0.5">
                  {section.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsOpen(false);
                      }}
                      className={`
                        w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group
                        ${activeTab === item.id 
                          ? 'bg-blue-600 text-white font-medium' : 'text-gray-600 hover:!bg-blue-600 hover:!text-white'}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon 
                          size={18} 
                          className={`transition-colors ${activeTab === item.id ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} 
                          strokeWidth={activeTab === item.id ? 2 : 1.5}
                        />
                        <span className="text-sm">{item.label}</span>
                      </div>
                      {activeTab === item.id && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Footer User Profile Section */}
          <div className="p-4 mt-auto border-t border-gray-200">
            <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 mb-4 px-1">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-semibold text-xs shrink-0 uppercase shadow-sm">
                {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-gray-900 truncate tracking-tight leading-tight">{user?.name || 'User Profile'}</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">{user?.role || 'Applicant'}</span>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200 group border border-transparent"
            >
              <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" />
              <span>Sign Out</span>
            </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
