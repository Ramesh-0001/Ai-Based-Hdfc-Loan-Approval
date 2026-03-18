import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const DashboardLayout = ({ children, user, onLogout, activeTab, setActiveTab }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-gray-900">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        onLogout={onLogout}
        user={user}
      />

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen transition-all duration-200">
        <Navbar 
          onMenuClick={() => setIsSidebarOpen(true)} 
          onLogout={onLogout}
          user={user}
        />
        
        <main className="p-6 flex-1 overflow-y-auto">
          <div className="max-w-[1200px] mx-auto">
            {children}
          </div>
        </main>

        <footer className="mt-auto py-6 px-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-400">
                © {new Date().getFullYear()} HDFC Bank Ltd. All rights reserved.
            </p>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
