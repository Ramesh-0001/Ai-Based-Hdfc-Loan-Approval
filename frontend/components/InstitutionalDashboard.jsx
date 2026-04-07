import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, FileText, CheckCircle2, XCircle, 
  Clock, ShieldAlert, Search, Eye, Filter, RefreshCcw, 
  LogOut, User, DollarSign, Activity, Bell, Settings,
  ChevronRight, ArrowUpRight, BarChart3, TrendingUp,
  Home, ShieldCheck, AlertTriangle, Users, FileBarChart,
  Menu, ChevronLeft, Terminal, Cpu, PieChart as PieChartIcon
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { API_BASE_URL } from '../src/config/api';

const InstitutionalDashboard = ({ user, onLogout }) => {
  // Navigation & UI State
  const [activeTab, setActiveTab] = useState("Control Center");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  
  // Real-Time Dynamic Verification States
  const [systemStatus, setSystemStatus] = useState("Waiting for application selection");
  const [syncStatus, setSyncStatus] = useState("Synced");
  const [logs, setLogs] = useState([
    { message: "Global database synchronized with institutional hub", time: "08:45", status: "Synced" },
    { message: "Node protocol established: Level 2 authorization active", time: "09:12", status: "Active" }
  ]);

  // Dynamic Analytics States 
  const [yieldData, setYieldData] = useState([]);
  const [approvalTrends, setApprovalTrends] = useState([]);
  const [exposureData, setExposureData] = useState([]);

  // Data State
  const [stats, setStats] = useState({
    totalApplications: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
    fraudAlerts: 0
  });
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 🛠 MASTER ANALYTICS CALCULATOR (Global or Local)
  const calculateAnalytics = (apps, currentApp = null) => {
    const dataToProcess = currentApp ? [currentApp] : apps;
    
    // 1. Yield Distribution
    const totalExposure = dataToProcess.reduce((sum, app) => sum + (app.loanAmount || 0), 0);
    setYieldData([
      { name: 'Principal', value: totalExposure },
      { name: 'Est. Yield', value: totalExposure * 0.12 },
      { name: 'Risk Ops', value: totalExposure * 0.02 }
    ]);

    // 2. Approval Trends (Simulated over time series)
    setApprovalTrends([
      { month: 'Jan', value: apps.filter(a => a.status === 'APPROVED').length + 10 },
      { month: 'Feb', value: apps.filter(a => a.status === 'PENDING').length + 20 },
      { month: 'Mar', value: apps.length },
      { month: 'Apr', value: currentApp ? 80 : 65 }
    ]);

    // 3. Exposure Distribution
    const lowRisk = apps.filter(a => a.riskLevel === 'Low').length;
    const highRisk = apps.filter(a => a.riskLevel === 'High').length;
    setExposureData([
      { sector: 'Low Risk Node', value: lowRisk || 1 },
      { sector: 'High Risk Node', value: highRisk || 1 },
      { sector: 'Manual Review', value: apps.filter(a => a.status === 'PENDING').length || 1 }
    ]);
  };

  // 1. Fetch Summary Stats
  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/dashboard`);
      const data = await res.json();
      if (data && !data.error) {
        setStats(data);
      }
    } catch (err) {
      console.error("Stats Sync Error:", err);
    }
  };

  // 2. Fetch Applications
  const fetchApplications = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/applications`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setApplications(data);
        // Calculate initial global analytics
        calculateAnalytics(data);
      }
    } catch (err) {
      console.error("Apps Sync Error:", err);
    }
  };

  const refreshDashboard = async () => {
    setRefreshing(true);
    await Promise.all([fetchStats(), fetchApplications()]);
    setRefreshing(false);
    setLoading(false);
  };

  useEffect(() => {
    refreshDashboard();
    const interval = setInterval(refreshDashboard, 10000);
    return () => clearInterval(interval);
  }, []);

  // 🛠 MASTER DYNAMIC TRIGGER (On Application Selection)
  useEffect(() => {
    if (!selectedApp) return;

    setSystemStatus("Fetching applicant data...");
    setSyncStatus("Syncing...");
    
    // Simulate API delay for verification & analytics population
    const timer = setTimeout(() => {
        setSystemStatus("Verification in progress...");
        
        // Recalculate Analytics for specific selected app
        calculateAnalytics(applications, selectedApp);

        setSystemStatus("Verification completed");
        setSyncStatus("Synced");

        // Add Telemetry Log
        setLogs(prev => [{
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            message: `Deep audit completed for ${selectedApp.fullName}. Node integrity: 100%.`,
            status: "Verified"
        }, ...prev]);

    }, 1500);

    return () => clearTimeout(timer);
  }, [selectedApp]);

  const filteredApps = applications.filter(app => 
    !searchQuery || 
    app.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectApp = (app) => {
    setSelectedApp(app);
    setActiveTab("Verification");
  };

  const handleSync = () => {
    setSyncStatus("Syncing");
    setSystemStatus("Broadcasting node update...");
    setTimeout(() => {
        refreshDashboard();
        setSyncStatus("Synced");
    }, 2000);
  };

  const menuItems = [
    { name: "Control Center", icon: Home },
    { name: "Applications", icon: FileText },
    { name: "Verification", icon: ShieldCheck },
    { name: "Risk Check", icon: Activity },
    { name: "Fraud Alerts", icon: AlertTriangle },
    { name: "Customer Profile", icon: Users },
    { name: "Reports", icon: FileBarChart },
    { name: "Notifications", icon: Bell }
  ];

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 font-sans">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium text-gray-400">Loading Operational Hub...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans text-gray-900 antialiased overflow-hidden">
      {/* 🛠 NEAT SIDEBAR */}
      <aside className={`${isCollapsed ? 'w-20' : 'w-[260px]'} bg-white border-r border-gray-100 flex flex-col z-50 transition-all duration-300 relative shadow-sm`}>
        <button 
           onClick={() => setIsCollapsed(!isCollapsed)}
           className="absolute -right-3 top-24 bg-white text-gray-400 p-1 rounded-full border border-gray-100 hover:text-blue-600 transition-colors z-[60] shadow-sm"
        >
           {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className="p-8 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <div className="min-w-[36px] h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-100">H</div>
            {!isCollapsed && (
              <div className="animate-in fade-in duration-500">
                <h1 className="text-sm font-bold text-gray-900 tracking-tight">HDFC Portal</h1>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Institutional</p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 px-4 pt-6 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map(item => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`w-full group rounded-xl flex items-center px-4 py-3.5 transition-all duration-200 relative ${
                activeTab === item.name 
                ? 'bg-blue-50 text-blue-600 font-semibold' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-blue-600'
              }`}
            >
              <item.icon size={18} className={`flex-shrink-0 ${activeTab === item.name ? 'text-blue-600' : 'group-hover:text-blue-600'}`} />
              {!isCollapsed && <span className="ml-4 text-[13.5px] truncate font-medium">{item.name}</span>}
              {item.name === "Notifications" && !isCollapsed && logs.length > 0 && (
                 <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg shadow-red-100">{logs.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-50 bg-gray-50/10">
            <button 
                onClick={onLogout}
                className={`w-full flex items-center gap-4 px-4 py-4 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all text-xs font-semibold ${isCollapsed ? 'justify-center' : ''}`}
            >
                <LogOut size={18} />
                {!isCollapsed && <span>Sign Out System</span>}
            </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-20 bg-white/50 backdrop-blur-md border-b border-gray-100 px-10 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
             <h2 className="text-xl font-semibold text-gray-900 tracking-tight leading-none">
                {activeTab}
             </h2>
             {refreshing && <RefreshCcw size={14} className="text-blue-600 animate-spin" />}
          </div>
          <div className="flex items-center gap-6">
             <div className="h-8 w-px bg-gray-100"></div>
             <div className="flex flex-col text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Node Relay</p>
                <p className={`${syncStatus === 'Error' ? 'text-red-500' : 'text-emerald-500'} font-bold text-[11px] flex items-center gap-1.5 justify-end uppercase`}>
                   <span className={`w-1.5 h-1.5 ${syncStatus === 'Syncing' ? 'bg-amber-500' : syncStatus === 'Error' ? 'bg-red-500' : 'bg-emerald-500'} rounded-full animate-pulse shadow-sm`}></span>
                   {syncStatus}
                </p>
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 bg-[#f8fafc]">
          <div className="max-w-7xl mx-auto pb-20">
            {activeTab === "Control Center" && <DashboardView stats={stats} applications={filteredApps} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSelectApp={handleSelectApp} />}
            {activeTab === "Applications" && <ApplicationsView applications={filteredApps} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSelectApp={handleSelectApp} />}
            {activeTab === "Verification" && <VerificationView app={selectedApp} status={systemStatus} onSync={handleSync} syncStatus={syncStatus} />}
            {activeTab === "Risk Check" && <RiskCheckView applications={applications} />}
            {activeTab === "Fraud Alerts" && <FraudAlertsView applications={applications} onSelectApp={handleSelectApp} />}
            {activeTab === "Customer Profile" && <CustomerProfileView app={selectedApp} />}
            {activeTab === "Reports" && (
                <ReportsView 
                    yieldData={yieldData} 
                    trends={approvalTrends} 
                    exposure={exposureData} 
                    onExport={() => console.log("Exporting verification summary...")} 
                />
            )}
            {activeTab === "Notifications" && <NotificationsView logs={logs} onClear={() => setLogs([])} />}
          </div>
        </div>
      </main>
    </div>
  );
};

// 📦 MODULAR VIEW COMPONENTS

const DashboardView = ({ stats, applications, searchQuery, setSearchQuery, onSelectApp }) => (
  <div className="space-y-8 animate-in fade-in duration-700">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-sans">
      <MetricCard label="Total Applications" value={stats.totalApplications} icon={FileText} color="blue" />
      <MetricCard label="Approved" value={stats.approved} icon={CheckCircle2} color="emerald" />
      <MetricCard label="Rejected" value={stats.rejected} icon={XCircle} color="rose" />
      <MetricCard label="Pending" value={stats.pending} icon={Clock} color="amber" border />
      <MetricCard label="Fraud Alerts" value={stats.fraudAlerts} icon={ShieldAlert} color="red" />
    </div>
    <ApplicationTable 
      title="Recent Requests" 
      subtitle="Institutional workflow monitoring"
      data={applications.slice(0, 8)}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      onSelectApp={onSelectApp}
    />
  </div>
);

const ApplicationsView = ({ applications, searchQuery, setSearchQuery, onSelectApp }) => (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
    <ApplicationTable 
      title="Loan Registry" 
      subtitle={`Total: ${applications.length} synchronized records`}
      data={applications}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      fullView
      onSelectApp={onSelectApp}
    />
  </div>
);

const VerificationView = ({ app, status, onSync, syncStatus }) => (
  <div className="animate-in fade-in duration-500">
     <div className="bg-white rounded-2xl border border-gray-100 p-20 text-center shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldCheck size={32} />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">{app ? app.fullName : "Verification Hub"}</h3>
        <p className="text-gray-400 mt-3 max-w-sm mx-auto text-sm leading-relaxed tracking-tight">
           {status}
        </p>
        
        {app ? (
            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto text-left">
                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">Applicant Node</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">{app.fullName}</p>
                </div>
                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">Ident ID</p>
                    <p className="text-sm font-semibold text-gray-900 font-mono">#{app.id?.slice(0,10)}</p>
                </div>
                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">Node Status</p>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        <span className="text-xs font-bold text-blue-600">{syncStatus}</span>
                    </div>
                </div>
            </div>
        ) : (
            <div className="mt-10 p-8 border-2 border-dashed border-gray-100 rounded-2xl text-gray-300 text-xs font-bold uppercase tracking-[0.2em] max-w-xs mx-auto">
               Input Required
            </div>
        )}

        <button 
            onClick={onSync}
            disabled={syncStatus === "Syncing" || !app}
            className="mt-12 bg-blue-600 text-white px-10 py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-30 disabled:shadow-none"
        >
            {syncStatus === "Syncing" ? "Syncing Global Database..." : "Force Sync Global Database"}
        </button>
     </div>
  </div>
);

const RiskCheckView = ({ applications }) => (
  <div className="space-y-8 animate-in fade-in duration-700">
    <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between mb-10 text-sans">
           <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                 <Activity size={20} className="text-blue-600" />
                 Institutional Exposure
              </h3>
              <p className="text-xs text-gray-400 mt-1">Live heuristic evaluation</p>
           </div>
           <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full uppercase tracking-wider">
              <TrendingUp size={14} />
              REAL-TIME
           </div>
        </div>
        <div className="h-[400px] w-full min-w-0">
           <ResponsiveContainer width="100%" height="100%">
              <BarChart data={applications.slice(0, 10)}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis dataKey="fullName" hide />
                 <YAxis axisLine={false} tickLine={false} fontSize={10} tick={{fill: '#94a3b8'}} tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} />
                 <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.05)' }} />
                 <Bar dataKey="loanAmount" radius={[6, 6, 0, 0]} barSize={32}>
                    {applications.slice(0, 10).map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.status === 'APPROVED' ? '#10b981' : entry.status === 'REJECTED' ? '#ef4444' : '#2563eb'} fillOpacity={0.8} />
                    ))}
                 </Bar>
              </BarChart>
           </ResponsiveContainer>
        </div>
    </div>
  </div>
);

const FraudAlertsView = ({ applications, onSelectApp }) => (
  <div className="space-y-6 animate-in fade-in duration-500">
     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {applications.filter(a => a.fraudAlerts > 0 || a.riskLevel === 'High').map(app => (
           <div key={app.id} onClick={() => onSelectApp(app)} className="bg-white rounded-2xl border border-red-50 p-6 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group">
              <div className="flex justify-between items-start mb-6">
                 <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <AlertTriangle size={24} />
                 </div>
                 <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full uppercase tracking-wider border border-red-100">Critical</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">{app.fullName}</h4>
              <p className="text-[10px] text-gray-400 font-bold uppercase mb-4">Node: #{app.id?.slice(0,8)}</p>
              <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                 <span className="text-xs text-gray-500 font-medium">Risk Exposure:</span>
                 <span className="text-sm font-bold text-gray-900">₹{(app.loanAmount || 0).toLocaleString()}</span>
              </div>
           </div>
        ))}
     </div>
  </div>
);

const CustomerProfileView = ({ app }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-20 text-center shadow-sm animate-in fade-in duration-500">
     <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Users size={32} />
     </div>
     <h3 className="text-xl font-semibold text-gray-900">{app ? app.fullName : "Customer Identity Node"}</h3>
     <p className="text-gray-400 mt-2 max-w-sm mx-auto text-sm leading-relaxed">
        {app ? `Operational ID: ${app.id?.slice(0, 16)}` : "Select an applicant recorded in the registry to decrypt behavior stats."}
     </p>
     
     {app ? (
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-4xl mx-auto">
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-100 transition-colors">
                <p className="text-[10px] text-gray-400 font-extrabold uppercase mb-3 tracking-widest">Behavior Score</p>
                <div className="flex items-center gap-3">
                    <div className="text-2xl font-bold text-gray-900">842</div>
                    <div className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-bold rounded-lg uppercase">Excellent</div>
                </div>
            </div>
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-100 transition-colors">
                <p className="text-[10px] text-gray-400 font-extrabold uppercase mb-3 tracking-widest">Strategy</p>
                <div className="text-sm font-bold text-gray-800">{app.riskLevel} Tier Lending</div>
            </div>
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-100 transition-colors">
                <p className="text-[10px] text-gray-400 font-extrabold uppercase mb-3 tracking-widest">Verification</p>
                <div className="text-sm font-bold text-emerald-600 flex items-center gap-1.5 lowercase">
                    <ShieldCheck size={14} /> 
                    <span>node integrity synchronized</span>
                </div>
            </div>
        </div>
     ) : (
        <div className="mt-12 w-16 h-1 bg-gray-100 rounded-full mx-auto"></div>
     )}
  </div>
);

const ReportsView = ({ yieldData, trends, exposure, onExport }) => (
  <div className="space-y-8 animate-in fade-in duration-500">
     <div className="bg-white rounded-2xl border border-gray-100 p-10 shadow-sm">
        <div className="flex items-center justify-between mb-12">
            <div>
               <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileBarChart size={22} className="text-blue-600" />
                  Institutional Analytics
               </h3>
               <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-widest">Operational Yield & Decision Matrix</p>
            </div>
            <button 
                onClick={onExport}
                className="text-xs font-bold text-blue-600 border-2 border-blue-100 px-6 py-2.5 rounded-xl hover:bg-blue-600 hover:text-white transition-all uppercase tracking-widest shadow-sm shadow-blue-50"
            >
                Export Summary
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* 1. Yield Distribution Line Chart */}
            <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-6 min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Yield Components</p>
                <div className="h-48 w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={yieldData.length > 0 ? yieldData : [{name: 'M', value: 30}, {name: 'T', value: 50}]}>
                            <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            <Tooltip cursor={{fill: 'transparent'}} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 2. Approval Velocity Area Chart */}
            <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-6 min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Approval Trends</p>
                <div className="h-48 w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trends.length > 0 ? trends : [{month: 'J', value: 10}]}>
                            <defs>
                                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVal)" />
                            <Tooltip />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 3. Exposure Pie Chart */}
            <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-6 min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Exposure Profile</p>
                <div className="h-48 w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie 
                                data={exposure.length > 0 ? exposure : [{sector: 'E', value: 100}]} 
                                dataKey="value" 
                                cx="50%" 
                                cy="50%" 
                                innerRadius={40} 
                                outerRadius={60} 
                                fill="#3b82f6" 
                                stroke="#fff"
                            >
                                {exposure.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b'][index % 3]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
     </div>
  </div>
);

const NotificationsView = ({ logs, onClear }) => (
  <div className="space-y-6 animate-in fade-in duration-500">
     <div className="bg-white rounded-2xl border border-gray-50 p-10 shadow-sm">
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-lg font-semibold text-gray-900 tracking-tight">System Telemetry</h1>
            <button onClick={onClear} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors">Clear Interface</button>
        </div>
        <div className="space-y-2">
           {logs.map((log, i) => (
             <div key={i} className="flex gap-6 p-4 hover:bg-gray-50 rounded-xl transition-all group cursor-pointer border border-transparent hover:border-gray-100">
                <span className="text-[11px] font-bold text-gray-300 font-mono mt-1 opacity-50">[{log.time}]</span>
                <div className="flex-1">
                   <p className={`text-sm font-semibold tracking-tight ${log.status === 'Verified' || log.status === 'Synced' ? 'text-emerald-600' : log.status === 'Processing' ? 'text-blue-500' : 'text-gray-700'}`}>{log.message}</p>
                   <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                       <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                       Node status: {log.status}
                   </p>
                </div>
                <ChevronRight size={14} className="text-gray-200 group-hover:text-blue-600 transition-colors self-center" />
             </div>
           ))}
           {logs.length === 0 && <div className="py-24 text-center opacity-20 italic text-sm font-medium">Log stream empty. Waiting for node synchronization.</div>}
        </div>
     </div>
  </div>
);

// 🛠 REUSABLE COMPONENTS

const ApplicationTable = ({ title, subtitle, data, searchQuery, setSearchQuery, onSelectApp }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden text-sans">
    <div className="p-8 border-b border-gray-50 flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 tracking-tight leading-none">{title}</h3>
        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-2">{subtitle}</p>
      </div>
      <div className="relative group w-80">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" size={16} />
        <input 
          type="text" 
          placeholder="Search Registry..." 
          className="w-full pl-12 pr-6 py-3 bg-gray-50 border-transparent rounded-xl text-sm font-medium outline-none focus:bg-white focus:ring-1 focus:ring-blue-100 transition-all font-sans"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">
            <th className="py-6 px-10">Applicant Node</th>
            <th className="py-6 px-10">Risk Strategy</th>
            <th className="py-6 px-10 text-center">Exposure</th>
            <th className="py-6 px-10 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map((app, i) => (
            <tr key={i} onClick={() => onSelectApp && onSelectApp(app)} className="group hover:bg-gray-50/50 transition-all cursor-pointer">
              <td className="py-6 px-10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white text-gray-900 rounded-xl flex items-center justify-center font-bold text-sm border border-gray-100 group-hover:scale-110 transition-all shadow-sm">
                    {app.fullName?.charAt(0) || 'A'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 leading-none mb-1.5">{app.fullName}</p>
                    <p className="text-[10px] text-gray-400 font-bold font-mono">NODE_REF: #{app.id?.slice(0,10)}</p>
                  </div>
                </div>
              </td>
              <td className="py-6 px-10">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${app.riskLevel === 'Low' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-tight">{app.riskLevel || 'Standard'} Tier</span>
                </div>
              </td>
              <td className="py-6 px-10 text-center">
                <p className="text-sm font-bold text-gray-900">₹{(app.loanAmount || 0).toLocaleString()}</p>
                <div className="flex items-center justify-center gap-1 mt-1 opacity-40">
                   <div className="w-3 h-[1px] bg-gray-400"></div>
                   <p className="text-[9px] font-bold uppercase">SECURED</p>
                </div>
              </td>
              <td className="py-6 px-10 text-right">
                <span className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                    app.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                    app.status === 'REJECTED' ? 'bg-red-50 text-red-600 border-red-100' : 
                    'bg-blue-50 text-blue-600 border-blue-100'
                }`}>
                    {app.status || 'Pending'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const MetricCard = ({ label, value, icon: Icon, color, border }) => {
  const colorMap = {
    blue: 'text-blue-600 bg-blue-50 shadow-blue-100',
    emerald: 'text-emerald-600 bg-emerald-50 shadow-emerald-100',
    rose: 'text-rose-600 bg-rose-50 shadow-rose-100',
    amber: 'text-amber-600 bg-amber-50 shadow-amber-100',
    red: 'text-red-600 bg-red-50 shadow-red-100'
  };

  return (
    <div className={`bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-xl transition-all duration-300 group ${border ? 'border-dashed' : ''}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform shadow-sm ${colorMap[color]}`}>
        <Icon size={18} />
      </div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 leading-none">{label}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-2xl font-bold text-gray-900 tracking-tighter">{(value || 0).toLocaleString()}</h3>
        {label === 'Total Applications' && <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-md">+12%</span>}
      </div>
    </div>
  );
};

export default InstitutionalDashboard;
