import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  ShieldCheck, 
  Cpu, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  ChevronRight, 
  Eye, 
  AlertCircle, 
  Zap, 
  Database, 
  LogOut,
  TrendingUp,
  BarChart3,
  PieChart,
  ClipboardList,
  ShieldAlert,
  Download,
  Filter,
  Check,
  AlertTriangle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line
} from 'recharts';
import { API_BASE_URL } from '../src/config/api';

const InstitutionalDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedApp, setSelectedApp] = useState(null);
  const [apps, setApps] = useState([]);
  const [stats, setStats] = useState({
    total_apps: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
    fraud_cases: 0,
  });
  const [auditLogs, setAuditLogs] = useState([]);
  const [fraudAlerts, setFraudAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [trendData, setTrendData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [decisionReason, setDecisionReason] = useState('');
  
  // New Filter States
  const [filters, setFilters] = useState({
    riskLevel: 'ALL',
    status: 'ALL',
    minAmount: '',
    maxAmount: ''
  });

  // Mock document data for preview simulation
  const mockDocuments = [
    { id: 'id-proof', name: 'Identity_Aadhar_Scan.pdf', type: 'ID Proof', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    { id: 'income-proof', name: 'Income_Salary_Slip.jpg', type: 'Income Proof', url: 'https://plus.unsplash.com/premium_photo-1661335273919-46735399569b?q=80&w=2070&auto=format&fit=crop' },
    { id: 'address-proof', name: 'Residential_Utility_Bill.pdf', type: 'Address Proof', url: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf' }
  ];

  const [documentModal, setDocumentModal] = useState({ isOpen: false, app: null, doc: null });
  const [zoom, setZoom] = useState(1);
  const [actionConfirm, setActionConfirm] = useState({ isOpen: false, type: '', appId: '', reason: '' });

  // Fetch all necessary data
  const fetchData = async () => {
    try {
      const [officerRes, appsRes, logsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/officer/dashboard`),
        fetch(`${API_BASE_URL}/api/applications`),
        fetch(`${API_BASE_URL}/api/admin/audit-logs`)
      ]);

      const officerData = await officerRes.json();
      const appsData = await appsRes.json();
      const logsData = await logsRes.json();

      if (officerData.stats) {
        setStats({
          total_apps: officerData.stats.total || 0,
          approved: officerData.stats.approved || 0,
          rejected: officerData.stats.rejected || 0,
          pending: officerData.stats.pending || 0,
          fraud_cases: officerData.stats.total > 0 ? ((officerData.stats.rejected / officerData.stats.total) * 10).toFixed(1) : 0,
        });
      }
      
      if (officerData.trendData) {
        setTrendData(officerData.trendData);
      }
      
      setApps(appsData || []);
      setAuditLogs(logsData || []);
      setFraudAlerts(officerData.recentApplications || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // AUTO-REFRESH EVERY 10 SECONDS
    return () => clearInterval(interval);
  }, []);

  const [statusMsg, setStatusMsg] = useState(null);


  const showStatus = (msg, type = 'success') => {
    setStatusMsg({ text: msg, type });
    setTimeout(() => setStatusMsg(null), 5000); // Auto-clear after 5s
  };

  const handleUpdateStatus = async (appId, status, manualReason = '') => {
    const finalReason = manualReason || decisionReason;
    if (!finalReason && status !== 'PENDING') {
      showStatus("Please provide a reason for this decision.", "error");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/update-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: appId,
          status: status,
          remark: finalReason || 'Review initiated',
          officer: user.name
        })
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        showStatus(`Application ${status === 'APPROVED' ? 'Approved' : 'Rejected'} Successfully!`, "success");
        setDecisionReason('');
        await fetchData();
        
        const updatedAppsRes = await fetch(`${API_BASE_URL}/api/applications`);
        const updatedApps = await updatedAppsRes.json();
        const updated = updatedApps.find(a => a.id === appId);
        if (updated) setSelectedApp(updated);
      } else {
        showStatus("Could not update application status.", "error");
      }
    } catch (err) {
      console.error("Update failed:", err);
      showStatus("Network error. Please check server.", "error");
    }
  };

  const filteredApps = apps
    .filter(app => {
      const matchSearch = (app.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          app.id?.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchStatus = filters.status === 'ALL' || app.status === filters.status;
      
      const appRisk = app.aiCreditworthiness >= 70 ? 'Low' : app.aiCreditworthiness >= 50 ? 'Medium' : 'High';
      const matchRisk = filters.riskLevel === 'ALL' || appRisk === filters.riskLevel;
      
      const loanAmt = parseFloat(app.loanAmount || 0);
      const matchMinAmt = filters.minAmount === '' || loanAmt >= parseFloat(filters.minAmount);
      const matchMaxAmt = filters.maxAmount === '' || loanAmt <= parseFloat(filters.maxAmount);

      return matchSearch && matchStatus && matchRisk && matchMinAmt && matchMaxAmt;
    })
    .sort((a, b) => {
      // SMART PRIORITY SORTING: High Risk (lower score) goes to top
      return (a.aiCreditworthiness || 0) - (b.aiCreditworthiness || 0);
    });

  // Dynamic Trend Data removed hardcoded version

  // Sidebar Components
  const SidebarSection = ({ title, children }) => (
    <div className="mb-5">
      <h3 className="px-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">{title}</h3>
      <div className="space-y-0.5">{children}</div>
    </div>
  );

  const SidebarItem = ({ id, label, icon: Icon, active, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
        active 
        ? 'bg-blue-600 text-white' : 'text-gray-600 hover:!bg-blue-600 hover:!text-white'
      }`}
    >
      <Icon size={18} className={active ? 'text-white' : 'text-gray-500 group-hover:!text-white'} />
      <span>{label}</span>
      {active && <ChevronRight size={14} className="ml-auto opacity-70" />}
    </button>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <header className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Executive Dashboard V4 (Force Update)</h1>
                <p className="text-sm text-gray-500 mt-1">Real-time loan origination & risk monitoring</p>
              </div>
              <div className="flex bg-white border border-gray-200 p-1 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]">
                <button className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-medium transition-all duration-200">Today</button>
                <button className="px-3 py-1.5 text-gray-400 hover:text-gray-900 rounded-xl text-xs font-medium transition-all duration-200">Weekly</button>
              </div>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard label="Total Applications" value={stats.total_apps} icon={FileText} color="text-blue-600" bg="bg-blue-50" />
              <StatCard label="Approved" value={stats.approved} icon={CheckCircle2} color="text-green-600" bg="bg-green-50" />
              <StatCard label="Rejected" value={stats.rejected} icon={XCircle} color="text-red-600" bg="bg-red-50" />
              <StatCard label="Pending Audit" value={stats.pending} icon={Clock} color="text-orange-600" bg="bg-orange-50" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Trend Chart */}
              <div className="lg:col-span-8 bg-white border border-gray-200 rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-semibold text-gray-900">Origination Trend</h3>
                  <Download size={16} className="text-gray-400 cursor-pointer hover:text-blue-600 transition-colors" />
                </div>
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%" minHeight={0}>
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} tick={{fill: '#94a3b8'}} />
                      <YAxis axisLine={false} tickLine={false} fontSize={10} tick={{fill: '#94a3b8'}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                      />
                      <Area type="monotone" dataKey="apps" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorApps)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="lg:col-span-4 bg-white border border-gray-200 rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Recent Records</h3>
                <div className="space-y-3">
                  {apps.slice(0, 5).map((app, idx) => (
                    <div 
                      key={app.id || idx} 
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-all duration-200 cursor-pointer group"
                      onClick={() => { setSelectedApp(app); setActiveTab('review'); }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-semibold text-xs">
                          {app.fullName?.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{app.fullName}</p>
                          <p className="text-xs text-gray-400">₹{(app.loanAmount || 0).toLocaleString()}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-xl border ${
                        app.status === 'APPROVED' ? 'bg-green-50 text-green-600 border-green-100' : 
                        app.status === 'REJECTED' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-50 text-gray-500 border-gray-200'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => setActiveTab('review')}
                  className="w-full mt-4 py-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all duration-200"
                >
                  View All Applications
                </button>
              </div>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <header className="flex flex-col space-y-6">
              <div className="flex items-center justify-between">
                 <div>
                    <h1 className="text-xl font-semibold text-gray-900">Applications Review</h1>
                    <p className="text-sm text-gray-500 mt-1">Queue for manual underwriting</p>
                 </div>
                 <div className="relative group w-64">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" size={14} />
                    <input 
                      type="text" 
                      placeholder="Search applicant..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:bg-white outline-none transition-all duration-200"
                    />
                 </div>
              </div>

              {/* NEW Filter Bar */}
              <div className="flex flex-wrap items-center gap-4 bg-slate-50 p-4 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2">
                  <Filter size={14} className="text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 uppercase">Filters:</span>
                </div>
                
                <select 
                  className="bg-white border border-gray-200 rounded-xl text-sm px-3 py-1.5 outline-none focus:ring-1 focus:ring-blue-400"
                  value={filters.riskLevel}
                  onChange={(e) => setFilters(prev => ({ ...prev, riskLevel: e.target.value }))}
                >
                  <option value="ALL">All Risk Levels</option>
                  <option value="High">High Risk</option>
                  <option value="Medium">Medium Risk</option>
                  <option value="Low">Low Risk</option>
                </select>

                <select 
                  className="bg-white border border-gray-200 rounded-xl text-sm px-3 py-1.5 outline-none focus:ring-1 focus:ring-blue-400"
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="ALL">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>

                <div className="flex items-center bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <span className="px-2 text-xs text-gray-400">₹</span>
                  <input 
                    type="number" 
                    placeholder="Min Amount"
                    className="w-24 border-none text-sm py-1.5 px-1 focus:ring-0 outline-none"
                    value={filters.minAmount}
                    onChange={(e) => setFilters(prev => ({ ...prev, minAmount: e.target.value }))}
                  />
                  <span className="px-1 text-gray-300">-</span>
                  <input 
                    type="number" 
                    placeholder="Max Amount"
                    className="w-24 border-none text-sm py-1.5 px-1 focus:ring-0 outline-none"
                    value={filters.maxAmount}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
                  />
                </div>

                <button 
                  onClick={() => {
                    setFilters({ riskLevel: 'ALL', status: 'ALL', minAmount: '', maxAmount: '' });
                    setSearchQuery('');
                  }}
                  className="ml-auto text-xs font-medium text-blue-600 hover:underline"
                >
                  Reset All
                </button>
              </div>
            </header>

            <div className="bg-white border border-gray-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-gray-200">
                  <tr>
                    <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Priority</th>
                    <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Applicant Profile</th>
                    <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Financials</th>
                    <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase text-center">AI Risk Indicator</th>
                    <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Audit Status</th>
                    <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase text-right">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredApps.map((app, i) => {
                    const riskSort = app.aiCreditworthiness >= 70 ? 'Low' : app.aiCreditworthiness >= 50 ? 'Medium' : 'High';
                    const breakdown = app.score_breakdown || [];
                    
                    return (
                      <tr 
                        key={app.id || i} 
                        className={`hover:bg-slate-50 transition-colors cursor-pointer group ${selectedApp?.id === app.id ? 'bg-blue-50' : ''}`}
                        onClick={() => {
                          setSelectedApp(app);
                          setActiveTab('manual-decisions');
                        }}
                      >
                        <td className="px-6 py-5">
                          <div className={`w-2 h-10 rounded-full ${
                            riskSort === 'High' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 
                            riskSort === 'Medium' ? 'bg-orange-400' : 'bg-green-400'
                          }`}></div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center space-x-3">
                             <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-500 font-semibold text-xs flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                {app.fullName?.charAt(0)}
                             </div>
                             <div className="min-w-0">
                                <p className="text-[13px] font-semibold text-gray-900 truncate">{app.fullName}</p>
                                <p className="text-[10px] text-gray-400 font-medium">ID: {app.id?.substring(0, 8).toUpperCase()}</p>
                                <div className="mt-1 flex flex-col space-y-0.5">
                                  {breakdown.slice(0, 3).map((item, idx) => (
                                    <span key={idx} className="text-[9px] text-gray-400 flex items-center">
                                      <span className={item.score >= 0 ? 'text-green-500' : 'text-red-400'}>{item.score >= 0 ? '+' : ''}{item.score}</span>
                                      <span className="ml-1 opacity-70">from {item.factor}</span>
                                    </span>
                                  ))}
                                </div>
                             </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                           <p className="text-[13px] font-semibold text-gray-900 font-mono">₹{(app.loanAmount || 0).toLocaleString()}</p>
                           <p className="text-[10px] text-gray-400 mt-1 font-medium">{app.loanPurpose} • {app.tenure}m</p>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <div className="flex flex-col items-center">
                            <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold border ${
                              riskSort === 'Low' ? 'bg-green-50 text-green-600 border-green-100' :
                              riskSort === 'Medium' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-red-50 text-red-600 border-red-100'
                            }`}>
                               <Cpu size={12} />
                               <span>{app.aiCreditworthiness || 0}%</span>
                            </span>
                            <span className="text-[9px] font-semibold text-gray-300 mt-1 uppercase tracking-tighter">{riskSort} Risk</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                           <span className={`text-[10px] font-semibold px-3 py-1 rounded-full border ${
                              app.status === 'APPROVED' ? 'bg-green-50 text-green-600 border-green-100' : 
                              app.status === 'REJECTED' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-50 text-gray-500 border-gray-200'
                           }`}>
                              {app.status}
                           </span>
                        </td>
                         <td className="px-6 py-5">
                          <div className="flex items-center justify-end space-x-1.5">
                             <button 
                               onClick={(e) => { 
                                 e.stopPropagation(); 
                                 setActionConfirm({ isOpen: true, type: 'APPROVE', appId: app.id, reason: '' });
                               }} 
                               className="p-2 text-green-600 hover:bg-green-50 rounded-xl transition-all" 
                               title="Quick Approve"
                             >
                               <CheckCircle2 size={16} />
                             </button>
                             <button 
                               onClick={(e) => { 
                                 e.stopPropagation(); 
                                 setActionConfirm({ isOpen: true, type: 'REJECT', appId: app.id, reason: '' });
                               }} 
                               className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all" 
                               title="Quick Reject"
                             >
                               <XCircle size={16} />
                             </button>
                             <button 
                               onClick={(e) => { 
                                 e.stopPropagation(); 
                                 setSelectedApp(app); 
                                 setActiveTab('manual-decisions'); 
                               }} 
                               className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all" 
                               title="Open Review"
                             >
                               <Eye size={16} />
                             </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredApps.length === 0 && (
                <div className="py-6 text-center">
                   <AlertCircle size={32} className="mx-auto text-gray-200 mb-4" />
                   <p className="text-sm font-medium text-gray-400">No matching applications found</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'ai-insights':
        if (!selectedApp) return <EmptySelectionState onGoBack={() => setActiveTab('review')} />;
        return <AIRiskInsights app={selectedApp} onGoBack={() => setActiveTab('review')} />;

      case 'ai-recommendation':
        if (!selectedApp) return <EmptySelectionState onGoBack={() => setActiveTab('review')} />;
        return <AIRecommendation app={selectedApp} onGoBack={() => setActiveTab('review')} />;

      case 'verification':
        if (!selectedApp) return <EmptySelectionState onGoBack={() => setActiveTab('review')} />;
        return <DocumentVerification app={selectedApp} onGoBack={() => setActiveTab('review')} setDocumentModal={setDocumentModal} />;

      case 'manual-decisions':
        if (!selectedApp) return <EmptySelectionState onGoBack={() => setActiveTab('review')} />;
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
             <div className="flex items-center space-x-3 mb-2">
                <button onClick={() => setActiveTab('review')} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400"><ChevronRight size={18} className="rotate-180" /></button>
                <h1 className="text-2xl font-semibold text-gray-900">Application Review & Decision</h1>
             </div>

             {/* Integrated Document Verification */}
             <DocumentVerification app={selectedApp} compact={true} setDocumentModal={setDocumentModal} />

             {/* Manual Decisions Panel */}
             <ManualDecisions 
               app={selectedApp} 
               reason={decisionReason} 
               setReason={setDecisionReason} 
               onSubmit={handleUpdateStatus} 
               onGoBack={() => setActiveTab('review')} 
             />
          </div>
        );

      case 'audit':
        return <AuditTrail logs={auditLogs} />;

      case 'fraud':
        return <FraudAlerts alerts={fraudAlerts} />;

      case 'analytics':
        return <AnalyticsDashboard stats={stats} trendData={trendData} />;

      default:
        return <div>Module Under Construction</div>;
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 space-y-6">
         <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
         <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 tracking-tight">Synchronizing Dashboard</h2>
            <p className="text-gray-400 text-sm mt-1">Fetching live institutional loan data from HDFC nodes...</p>
         </div>
         <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 animate-pulse"></div>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans leading-normal">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col z-50">
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3 mb-2">
             <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-semibold text-sm">
                H
             </div>
             <div>
                <span className="block font-semibold text-gray-900 text-sm">HDFC BANK</span>
                <span className="block text-[10px] font-semibold text-blue-600 uppercase tracking-wider">Officer Portal</span>
             </div>
          </div>
        </div>

        <nav className="flex-1 px-3 overflow-y-auto">
          <SidebarSection title="Main">
            <SidebarItem id="dashboard" label="Dashboard" icon={LayoutDashboard} active={activeTab === 'dashboard'} onClick={setActiveTab} />
            <SidebarItem id="review" label="Applications Review" icon={FileText} active={activeTab === 'review'} onClick={setActiveTab} />
          </SidebarSection>
          
          <SidebarSection title="AI & Decision">
            <SidebarItem id="ai-insights" label="AI Risk Insights" icon={ShieldCheck} active={activeTab === 'ai-insights'} onClick={setActiveTab} />
            <SidebarItem id="ai-recommendation" label="AI Recommendation" icon={Zap} active={activeTab === 'ai-recommendation'} onClick={setActiveTab} />
          </SidebarSection>


          <SidebarSection title="Control">
            <SidebarItem id="manual-decisions" label="Manual Decisions" icon={CheckCircle2} active={activeTab === 'manual-decisions'} onClick={setActiveTab} />
            <SidebarItem id="audit" label="Audit Trail" icon={Database} active={activeTab === 'audit'} onClick={setActiveTab} />
          </SidebarSection>

          <SidebarSection title="Intelligence">
            <SidebarItem id="fraud" label="Fraud Alerts" icon={ShieldAlert} active={activeTab === 'fraud'} onClick={setActiveTab} />
          </SidebarSection>

          <SidebarSection title="Analytics">
            <SidebarItem id="analytics" label="Analytics Dashboard" icon={BarChart3} active={activeTab === 'analytics'} onClick={setActiveTab} />
          </SidebarSection>
        </nav>

        {/* User Profile */}
        <div className="p-4 mt-auto border-t border-gray-200">
           <div className="flex items-center gap-3 mb-4 px-1">
              <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center font-semibold text-blue-600 text-xs">
                 {user?.name?.charAt(0)}
              </div>
              <div className="min-w-0">
                 <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'Bank Officer'}</p>
                 <p className="text-xs text-gray-500">Officer ID: OP-042</p>
              </div>
           </div>
           <button 
             onClick={onLogout}
             className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200 group"
           >
             <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" />
             <span>Sign Out</span>
           </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 ml-64 min-h-screen flex flex-col">
        {/* Top Navbar */}
        <header className="h-16 bg-white sticky top-0 z-40 px-6 border-b border-gray-200 flex items-center justify-between">
           <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
              <span>Officer Portal</span>
              <ChevronRight size={10} />
              <span className="text-blue-600 capitalize">{activeTab.replace('-', ' ')}</span>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 rounded-xl border border-green-100">
                 <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                 <span className="text-xs font-medium">System Online</span>
              </div>
              <div className="w-px h-6 bg-gray-100"></div>
              <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                 <Search size={18} />
              </button>
           </div>
        </header>

        {/* Content */}
        {/* Content */}
        <main className="p-6 max-w-[1200px] mx-auto w-full flex-1 relative">
           {/* Fixed Floating Status Message (Toast) */}
           {statusMsg && (
              <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[9999] px-5 py-3 rounded-xl border shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] flex items-center gap-3 max-w-md w-full mx-4 ${
               statusMsg.type === 'success' 
               ? 'bg-white border-green-100 text-green-700' 
               : 'bg-white border-red-100 text-red-700'
             }`}>
                 <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  statusMsg.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                   {statusMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                </div>
                <div>
                    <p className="text-sm font-medium leading-tight">{statusMsg.text}</p>
                    <p className="text-xs opacity-60 mt-0.5">Just now</p>
                </div>
             </div>
           )}

           {renderContent()}
        </main>

        {/* --- DOCUMENT PREVIEW MODAL --- */}
        {documentModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/20 backdrop-blur-sm p-6 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-5xl h-[85vh] rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{documentModal.doc.name}</h3>
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">{documentModal.doc.type} • Application: {documentModal.app.id}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex bg-white rounded-xl border border-gray-200 p-1 mr-4">
                    <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-1 px-3 hover:bg-slate-50 rounded text-gray-500 font-semibold">-</button>
                    <span className="px-3 py-1 text-xs font-semibold text-gray-600 border-x border-gray-200">{Math.round(zoom * 100)}%</span>
                    <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-1 px-3 hover:bg-slate-50 rounded text-gray-500 font-semibold">+</button>
                  </div>
                  <button 
                    onClick={() => setDocumentModal({ isOpen: false, app: null, doc: null })}
                    className="p-2 hover:bg-gray-200 rounded-full text-gray-400 transition-colors"
                  >
                    <XCircle size={24} />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 bg-gray-200 overflow-auto p-6 flex justify-center items-start">
                <div 
                  className="bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] transition-transform duration-200 origin-top"
                  style={{ transform: `scale(${zoom})`, minWidth: '600px', minHeight: '800px' }}
                >
                  {documentModal.doc.url.endsWith('.pdf') ? (
                    <iframe 
                      src={`${documentModal.doc.url}#toolbar=0&navpanes=0`} 
                      className="w-full h-full border-none rounded-xl"
                      style={{ width: '800px', height: '1100px' }}
                      title="PDF Preview"
                    />
                  ) : (
                    <img src={documentModal.doc.url} alt="Document" className="max-w-full h-auto rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]" />
                  )}
                </div>
              </div>

              <div className="p-6 bg-white border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-gray-400">
                  <ShieldCheck size={16} />
                  <span className="text-[11px] font-semibold uppercase tracking-widest">Signed & Verified by HDFC AI node</span>
                </div>
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => {
                        showStatus("Document Verified Successfully", "success");
                        setDocumentModal({ isOpen: false, app: null, doc: null });
                    }}
                    className="px-6 py-2.5 bg-green-600 text-white rounded-xl text-xs font-semibold hover:bg-green-700 transition-all flex items-center space-x-2 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]"
                  >
                    <CheckCircle2 size={16} />
                    <span>Verify Document</span>
                  </button>
                  <button 
                    onClick={() => {
                        showStatus("Document Flagged for Correction", "error");
                        setDocumentModal({ isOpen: false, app: null, doc: null });
                    }}
                    className="px-6 py-2.5 bg-red-50 text-red-600 rounded-xl text-xs font-semibold hover:bg-red-100 transition-all flex items-center space-x-2 border border-red-100"
                  >
                    <XCircle size={16} />
                    <span>Reject / Flag</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- QUICK ACTION CONFIRMATION MODAL --- */}
        {actionConfirm.isOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/20 backdrop-blur-sm p-6 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-md rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] overflow-hidden">
              <div className="p-6 text-center">
                <div className={`w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center ${
                  actionConfirm.type === 'APPROVE' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  {actionConfirm.type === 'APPROVE' ? <CheckCircle2 size={32} /> : <AlertTriangle size={32} />}
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Confirm {actionConfirm.type === 'APPROVE' ? 'Approval' : 'Rejection'}?</h3>
                <p className="text-sm text-gray-400 mt-2">Are you sure you want to {actionConfirm.type.toLowerCase()} application {actionConfirm.appId}?</p>
                
                {actionConfirm.type === 'REJECT' && (
                   <div className="mt-6 text-left">
                     <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest ml-1">Rejection Reason (Mandatory)</label>
                     <textarea 
                       className="w-full mt-2 p-4 bg-slate-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-red-200 transition-all min-h-[100px]"
                       placeholder="Specify why this application is being rejected..."
                       value={actionConfirm.reason}
                       onChange={(e) => setActionConfirm(prev => ({ ...prev, reason: e.target.value }))}
                     />
                   </div>
                )}
              </div>
              
              <div className="p-6 bg-slate-50 flex items-center space-x-3">
                <button 
                  onClick={() => setActionConfirm({ isOpen: false, type: '', appId: '', reason: '' })}
                  className="flex-1 py-3 text-sm font-semibold text-gray-500 hover:bg-white rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={async () => {
                    const status = actionConfirm.type === 'APPROVE' ? 'APPROVED' : 'REJECTED';
                    const reason = actionConfirm.reason || (actionConfirm.type === 'APPROVE' ? 'Approved via officer quick action' : '');
                    
                    if (actionConfirm.type === 'REJECT' && !reason) {
                      showStatus("Please provide a reason for rejection", "error");
                      return;
                    }
                    
                    await handleUpdateStatus(actionConfirm.appId, status, reason);
                    setActionConfirm({ isOpen: false, type: '', appId: '', reason: '' });
                  }}
                  className={`flex-1 py-3 text-sm font-semibold text-white rounded-xl transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] ${
                    actionConfirm.type === 'APPROVE' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  Confirm Decision
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const StatCard = ({ label, value, icon: Icon, color, bg }) => (
  <div className="bg-white border border-gray-200 rounded-xl !important p-6 shadow-none transition-all duration-200 group hover:-translate-y-1 transition-all">
    <div className={`w-10 h-10 rounded-xl ${bg} ${color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
      <Icon size={20} />
    </div>
    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
    <div className="flex items-baseline space-x-2">
       <h3 className="text-2xl font-semibold text-gray-900 tracking-tighter">{(value || 0).toLocaleString()}</h3>
       <span className="text-[10px] font-semibold text-green-500 bg-green-50 px-1.5 py-0.5 rounded-xl">+2%</span>
    </div>
  </div>
);

const EmptySelectionState = ({ onGoBack }) => (
  <div className="py-32 text-center animate-in fade-in duration-500">
    <div className="w-20 h-20 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-inner">
       <FileText size={40} className="text-gray-200" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900">Selective Audit Required</h3>
    <p className="text-sm text-gray-400 mt-2 max-w-sm mx-auto">Please select an application from the Review Queue to access AI insights and decision control.</p>
    <button onClick={onGoBack} className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-all active:scale-95 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]">
      Open Review Queue
    </button>
  </div>
);

const AIRiskInsights = ({ app, onGoBack }) => {
  const breakdown = app.score_breakdown || [];
  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
       <div className="flex items-center space-x-3 mb-2">
          <button onClick={onGoBack} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400"><ChevronRight size={18} className="rotate-180" /></button>
          <h1 className="text-2xl font-semibold text-gray-900">AI Risk Analysis</h1>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 flex flex-col space-y-6">
             <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] relative overflow-hidden">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4">Neural Audit Score</p>
                <div className="flex items-baseline space-x-2">
                   <h2 className="text-2xl font-semibold text-blue-600 tracking-tighter">{app.aiCreditworthiness || 0}</h2>
                   <span className="text-xl font-semibold text-gray-400">/ 100</span>
                </div>
                <div className="mt-6 inline-flex items-center space-x-3 px-4 py-2 bg-slate-50 border border-gray-200 rounded-xl">
                   <span className={`w-2 h-2 rounded-full ${app.aiCreditworthiness >= 70 ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                   <span className="text-[11px] font-semibold text-gray-900 uppercase tracking-wider">{app.riskLevel || 'MEDIUM'} RISK TIER</span>
                </div>
             </div>

             <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]">
                <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-widest mb-6">Risk Profile Summary</h4>
                <div className="space-y-4">
                   <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                      <span className="text-[13px] text-gray-500">Applicant Confidence</span>
                      <span className="text-[13px] font-semibold text-gray-900">{app.mlConfidence || 0}%</span>
                   </div>
                   <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                      <span className="text-[13px] text-gray-500">Credit Score Index</span>
                      <span className="text-[13px] font-semibold text-gray-900 font-mono">{app.creditScore || 0}</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-[13px] text-gray-500">Verification Status</span>
                      <span className="text-[13px] font-semibold text-blue-600">AUTO-PASS</span>
                   </div>
                </div>
             </div>
          </div>

          <div className="lg:col-span-7">
             <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] h-full flex flex-col">
                <h4 className="text-[13px] font-semibold text-gray-900 uppercase tracking-widest mb-6">AI Score Breakdown</h4>
                <div className="flex-1 space-y-6">
                   {breakdown.length > 0 ? breakdown.map((item, idx) => (
                      <div key={idx} className="group">
                        <div className="flex items-center justify-between mb-2">
                           <div className="flex flex-col">
                              <span className="text-[14px] font-semibold text-gray-800">{item.factor}</span>
                              <span className="text-[10px] text-gray-400 italic mt-0.5">{item.reason}</span>
                           </div>
                           <span className={`text-[16px] font-semibold font-mono ${item.score >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                              {item.score >= 0 ? '+' : ''}{item.score}
                           </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                           <div 
                             className={`h-full rounded-full transition-all duration-1000 ${item.score >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                             style={{ width: `${Math.abs(item.score) * 2}%` }}
                           ></div>
                        </div>
                      </div>
                   )) : (
                     <div className="flex flex-col items-center justify-center h-full text-gray-300">
                        <Zap size={48} strokeWidth={1} className="mb-4 opacity-20" />
                        <p className="text-sm font-medium">Neural breakdown not available for this record</p>
                     </div>
                   )}
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

const AIRecommendation = ({ app, onGoBack }) => {
  const recommendations = app.recommendations || [];
  const status = app.status?.toUpperCase() || 'PENDING';
  
  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
       <div className="flex items-center space-x-3 mb-2">
          <button onClick={onGoBack} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400"><ChevronRight size={18} className="rotate-180" /></button>
          <h1 className="text-2xl font-semibold text-gray-900">AI Recommendation</h1>
       </div>

       <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]">
          <div className="grid grid-cols-1 lg:grid-cols-12">
             <div className="lg:col-span-4 p-6 bg-slate-50 border-r border-gray-200 flex flex-col items-center justify-center text-center">
                <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center mb-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] shadow-black/5 ${
                  status === 'APPROVED' ? 'bg-green-600 text-white' : 
                  status === 'REJECTED' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
                }`}>
                   <ShieldCheck size={40} />
                </div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Primary AI Decision</p>
                <h2 className={`text-2xl font-semibold tracking-tighter ${
                  status === 'APPROVED' ? 'text-green-600' : 
                  status === 'REJECTED' ? 'text-red-600' : 'text-blue-600'
                }`}>
                   {status}
                </h2>
                <div className="mt-6 pt-8 border-t border-gray-200 w-full">
                   <p className="text-[12px] font-semibold text-gray-400 italic">"Based on neural weighted comparison of 18 features"</p>
                </div>
             </div>
             
             <div className="lg:col-span-8 p-6">
                <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-widest mb-6 border-b border-gray-200 pb-4">Decision Reasoning</h4>
                <div className="space-y-6">
                   <div>
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                         <TrendingUp size={14} className="mr-2" /> Key Justification
                      </p>
                      <p className="text-lg font-medium text-gray-800 leading-relaxed">
                         {app.ai_reasoning?.[0] || "Applicant shows exceptional credit history and stable income profile aligned with HDFC Tier-1 standards."}
                      </p>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                         <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4">Core Strengths</p>
                         <ul className="space-y-3">
                            {app.ai_reasoning?.slice(1, 4).map((str, i) => (
                               <li key={i} className="flex items-center space-x-3 text-[13px] font-medium text-gray-600">
                                  <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                                  <span>{str}</span>
                               </li>
                            ))}
                         </ul>
                      </div>
                      <div>
                         <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4">Risk Thresholds</p>
                         <ul className="space-y-3">
                            <li className="flex items-center space-x-3 text-[13px] font-medium text-gray-600">
                               <Check size={14} className="text-blue-500" />
                               <span>DTI Ratio: Safe (35%)</span>
                            </li>
                            <li className="flex items-center space-x-3 text-[13px] font-medium text-gray-600">
                               <Check size={14} className="text-blue-500" />
                               <span>Income Vintage: Prime</span>
                            </li>
                         </ul>
                      </div>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

const DocumentVerification = ({ app, onGoBack, setDocumentModal }) => {
  const [docs, setDocs] = useState([
    { id: 'id-proof', name: 'Identity_Aadhar_Scan.pdf', type: 'ID Proof', status: 'Verified', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    { id: 'income-proof', name: 'Income_Salary_Slip.jpg', type: 'Income Proof', status: 'Pending', url: 'https://plus.unsplash.com/premium_photo-1661335273919-46735399569b?q=80&w=2070&auto=format&fit=crop' },
    { id: 'address-proof', name: 'Residential_Utility_Bill.pdf', type: 'Address Proof', status: 'Verified', url: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf' },
  ]);

  const updateDoc = (idx, status) => {
    const newDocs = [...docs];
    newDocs[idx].status = status;
    setDocs(newDocs);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
       <div className="flex items-center space-x-3 mb-2">
          {onGoBack && <button onClick={onGoBack} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400"><ChevronRight size={18} className="rotate-180" /></button>}
          <h1 className="text-2xl font-semibold text-gray-900">Document Verification</h1>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
             {docs.map((doc, idx) => (
                <div key={idx} className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] flex items-center justify-between group hover:border-blue-100 transition-all">
                   <div className="flex items-center space-x-5">
                      <div className="w-12 h-12 bg-slate-50 text-gray-400 rounded-xl flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                         <FileText size={24} />
                      </div>
                      <div>
                         <p className="text-[14px] font-semibold text-gray-900">{doc.name}</p>
                         <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mt-1">{doc.type}</p>
                      </div>
                   </div>
                   <div className="flex items-center space-x-4">
                      <span className={`text-[10px] font-semibold px-3 py-1 rounded-full border ${
                        doc.status === 'Verified' ? 'bg-green-50 text-green-600 border-green-100' : 
                        doc.status === 'Rejected' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-50 text-gray-400 border-gray-200'
                      }`}>
                         {doc.status}
                      </span>
                      <div className="w-px h-6 bg-gray-100"></div>
                      <div className="flex space-x-2">
                         <button onClick={() => updateDoc(idx, 'Verified')} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all" title="Mark Verified"><CheckCircle2 size={16} /></button>
                         <button onClick={() => updateDoc(idx, 'Rejected')} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Mark Rejected"><XCircle size={16} /></button>
                         <button 
                           onClick={() => setDocumentModal({ isOpen: true, app, doc })}
                           className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                           title="Preview Document"
                         >
                           <Eye size={16} />
                         </button>
                      </div>
                   </div>
                </div>
             ))}
          </div>

          <div className="lg:col-span-4">
             <div className="bg-blue-600 rounded-xl p-6 text-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] sticky top-24">
                <ShieldCheck size={32} className="mb-6 opacity-30" />
                <h4 className="text-xl font-semibold mb-4">Audit Guidelines</h4>
                <ul className="space-y-4 opacity-80">
                   <li className="flex items-start space-x-3 text-xs leading-relaxed">
                      <Check size={14} className="mt-0.5 shrink-0" />
                      <span>Ensure Name matches Application identity exactly.</span>
                   </li>
                   <li className="flex items-start space-x-3 text-xs leading-relaxed">
                      <Check size={14} className="mt-0.5 shrink-0" />
                      <span>Validate income period covers last 3 institutional cycles.</span>
                   </li>
                   <li className="flex items-start space-x-3 text-xs leading-relaxed">
                      <Check size={14} className="mt-0.5 shrink-0" />
                      <span>Check for digital manipulation signatures on PDF files.</span>
                   </li>
                </ul>
                <div className="mt-6 pt-10 border-t border-gray-200">
                   <p className="text-[10px] font-semibold uppercase tracking-widest opacity-50 mb-1">Queue ID</p>
                   <p className="text-sm font-mono tracking-tighter">HQ-COMP-77291</p>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

const ManualDecisions = ({ app, reason, setReason, onSubmit, onGoBack }) => (
  <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
     <div className="flex items-center space-x-3 mb-2">
        <button onClick={onGoBack} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400"><ChevronRight size={18} className="rotate-180" /></button>
        <h1 className="text-2xl font-semibold text-gray-900">Control & Manual Decision</h1>
     </div>

     <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
           <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]">
              <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-widest mb-6">Executive Decision Panel</h4>
              
              <div className="space-y-6">
                 <div className="p-6 bg-slate-50 rounded-xl border border-gray-200">
                    <div className="flex items-center space-x-4 mb-4">
                       <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-semibold text-gray-500 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] border border-gray-200/50">
                          {app.fullName?.charAt(0)}
                       </div>
                       <div>
                          <p className="text-[14px] font-semibold text-gray-900">{app.fullName}</p>
                          <p className="text-xs text-gray-400">Request: ₹{(app.loanAmount || 0).toLocaleString()}</p>
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-y-4 gap-x-6 mt-6 pt-6 border-t border-gray-200/60">
                       <div className="space-y-1">
                          <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest text-blue-600">Reported Income</p>
                          <p className="text-sm font-semibold text-gray-900 font-mono">₹{(app.income || 0).toLocaleString()}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest text-blue-600">Credit Score</p>
                          <p className={`text-sm font-semibold ${app.creditScore >= 750 ? 'text-green-600' : 'text-orange-600'}`}>{app.creditScore}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest text-blue-600">Job Tenure</p>
                          <p className="text-sm font-semibold text-gray-900">{app.jobTenure || 0} Years Experience</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest text-blue-600">Account History</p>
                          <p className="text-sm font-semibold text-gray-900">{app.repayment_history || 'Satisfactory'}</p>
                       </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-6 bg-white p-3 rounded-xl border border-gray-200/50 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]">
                       <span>Application Terminal</span>
                       <span className="text-blue-600">ID: {app.id?.substring(0, 12).toUpperCase()}</span>
                    </div>
                 </div>

                 <div>
                    <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Officer Remark (Mandatory)</label>
                    <textarea 
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Enter detailed justification for manual override..."
                      className="w-full h-32 p-5 bg-slate-50 border border-gray-200 rounded-xl text-[14px] outline-none focus:bg-white focus:border-blue-200 transition-all resize-none placeholder:text-gray-300"
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => onSubmit(app.id, 'APPROVED')}
                      className="flex items-center justify-center space-x-3 py-4 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 transition-all active:scale-95 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]"
                    >
                       <CheckCircle2 size={18} />
                       <span>Confirm Approval</span>
                    </button>
                    <button 
                      onClick={() => onSubmit(app.id, 'REJECTED')}
                      className="flex items-center justify-center space-x-3 py-4 bg-red-600 text-white rounded-xl font-semibold text-sm hover:bg-red-700 transition-all active:scale-95 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]"
                    >
                       <XCircle size={18} />
                       <span>Confirm Rejection</span>
                    </button>
                 </div>
                 <button 
                    onClick={() => onSubmit(app.id, 'PENDING')}
                    className="w-full py-4 bg-gray-100 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-all"
                 >
                   Defer Decision / Under Review
                 </button>
              </div>
           </div>
        </div>

        <div className="lg:col-span-5 flex flex-col space-y-6">
           <div className="bg-orange-50 rounded-xl p-6 border border-orange-100/50">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-orange-600 mb-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]">
                 <AlertTriangle size={20} />
              </div>
              <h4 className="text-[11px] font-semibold text-orange-900 uppercase tracking-widest mb-3">Audit Protocol 2.1</h4>
              <p className="text-xs text-orange-700 leading-relaxed font-medium">
                 Manual overrides are tracked by the Global Audit Ledger. Decisions must align with Institutional Risk Policy P-90. Misalignment may trigger executive review.
              </p>
           </div>
           
           {app.ml_insight && (
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]">
                 <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-6">ML Predictive Confidence</h4>
                 <div className="flex items-center space-x-6">
                    <div className="relative w-20 h-20 flex items-center justify-center">
                       <svg className="w-full h-full transform -rotate-90">
                          <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-50"/>
                          <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-blue-600"
                            strokeDasharray={2 * Math.PI * 36}
                            strokeDashoffset={2 * Math.PI * 36 * (1 - (app.mlConfidence || 0) / 100)}
                          />
                       </svg>
                       <span className="absolute text-sm font-semibold text-gray-900">{app.mlConfidence || 0}%</span>
                    </div>
                    <div className="min-w-0">
                       <p className="text-xs font-semibold text-gray-900">High Algorithmic Certainty</p>
                       <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">Model recommends following AI decision logic based on historical convergence.</p>
                    </div>
                 </div>
              </div>
           )}
        </div>
     </div>
  </div>
);

const AuditTrail = ({ logs }) => (
  <div className="space-y-6 animate-in fade-in duration-500">
     <header>
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">System Audit Ledger</h1>
        <p className="text-sm text-gray-400 mt-1">Immutable trace of all financial decisions and overrides</p>
     </header>

     <div className="bg-white border border-gray-200 rounded-[28px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] overflow-hidden">
        <table className="w-full text-left">
           <thead className="bg-slate-50 border-b border-gray-200">
              <tr>
                 <th className="px-6 py-4 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Transaction ID</th>
                 <th className="px-6 py-4 text-[10px] font-semibold text-gray-400 uppercase tracking-widest text-center">AI Recommendation</th>
                 <th className="px-6 py-4 text-[10px] font-semibold text-gray-400 uppercase tracking-widest text-center">Final Resolution</th>
                 <th className="px-6 py-4 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Decision Timestamp</th>
                 <th className="px-6 py-4 text-[10px] font-semibold text-gray-400 uppercase tracking-widest text-right">Officer Entity</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-gray-50">
              {logs.map((log, i) => (
                <tr key={log.id || i} className="hover:bg-slate-50 transition-colors">
                   <td className="px-6 py-6">
                      <span className="text-[12px] font-semibold text-gray-900 font-mono tracking-tighter uppercase">{log.application_id?.substring(0, 16)}</span>
                   </td>
                   <td className="px-6 py-6 text-center">
                     <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-xl border border-blue-100/50">AI: {log.action === 'APPROVED' ? 'PASS' : 'REVIEW'}</span>
                   </td>
                   <td className="px-6 py-6 text-center">
                      <span className={`text-[10px] font-semibold px-3 py-1 rounded-full border ${
                        log.action === 'APPROVED' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
                      }`}>
                         {log.action}
                      </span>
                   </td>
                   <td className="px-6 py-6">
                      <p className="text-[12px] font-semibold text-gray-900 leading-tight">{new Date(log.decision_timestamp).toLocaleDateString()}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{new Date(log.decision_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                   </td>
                   <td className="px-6 py-6 text-right">
                      <p className="text-[12px] font-semibold text-gray-900">{log.officer_name}</p>
                      <span className="text-[10px] font-semibold text-blue-600">ID: OFF-{log.officer_id}</span>
                   </td>
                </tr>
              ))}
           </tbody>
        </table>
        {logs.length === 0 && (
           <div className="py-6 text-center text-gray-300">
              <Database size={32} className="mx-auto mb-4 opacity-10" />
              <p className="text-sm font-semibold uppercase tracking-widest opacity-30">No historical records found</p>
           </div>
        )}
     </div>
  </div>
);

const FraudAlerts = ({ alerts }) => (
  <div className="space-y-6 animate-in fade-in duration-500">
     <header>
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Intelligence Terminal</h1>
        <p className="text-sm text-gray-400 mt-1">Live adversarial detection and suspicious activity monitor</p>
     </header>

     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {alerts.map((alert, idx) => (
           <div key={idx} className="bg-white border border-gray-200 rounded-[28px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] hover:border-red-100 transition-all group">
              <div className="flex items-center justify-between mb-6">
                 <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ShieldAlert size={20} />
                 </div>
                 <span className="text-[9px] font-semibold text-white bg-red-600 px-2 py-0.5 rounded-xl uppercase">CRITICAL</span>
              </div>
              <h4 className="text-[13px] font-semibold text-gray-900 mb-2">{alert.reason || "Suspicious Financial Profile"}</h4>
              <p className="text-[11px] text-gray-400 leading-relaxed mb-6 line-clamp-2">Application analysis detected inconsistent income signals or document metadata variance.</p>
              <div className="pt-6 border-t border-gray-200 flex items-center justify-between">
                 <div>
                    <p className="text-[10px] font-semibold text-gray-900">{alert.customer}</p>
                    <p className="text-[9px] text-gray-400">₹{(alert.amount || 0).toLocaleString()}</p>
                 </div>
                 <button className="text-[10px] font-semibold text-blue-600 hover:underline">Marked for Audit</button>
              </div>
           </div>
        ))}
        {alerts.length === 0 && (
           <div className="col-span-full py-6 bg-slate-50 rounded-xl border border-dashed border-gray-200 text-center">
              <ShieldCheck size={40} className="mx-auto text-gray-200 mb-4" />
              <p className="text-sm font-semibold text-gray-300 uppercase tracking-widest">Network Secure — No active alerts</p>
           </div>
        )}
     </div>
  </div>
);

const AnalyticsDashboard = ({ stats, trendData }) => (
  <div className="space-y-6 animate-in fade-in duration-500">
     <header className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Advanced Analytics</h1>
           <p className="text-sm text-gray-400 mt-1">System-wide performance and yield distribution</p>
        </div>
        <button className="flex items-center space-x-2 px-6 py-2.5 bg-white border-r border-gray-200 rounded-xl text-xs font-semibold hover:bg-black transition-all">
           <Download size={14} />
           <span>System Audit Export</span>
        </button>
     </header>

     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnalyticsCard label="Origination Rate" value={`${((stats.approved / (stats.total_apps || 1)) * 100).toFixed(1)}%`} sub="Approval Index" icon={Zap} bg="bg-green-50 text-green-600" />
        <AnalyticsCard label="Rejection Volume" value={`${((stats.rejected / (stats.total_apps || 1)) * 100).toFixed(1)}%`} sub="Risk Filter" icon={XCircle} bg="bg-red-50 text-red-600" />
        <AnalyticsCard label="Neural Precision" value="98.2%" sub="Model Confidence" icon={ShieldCheck} bg="bg-blue-50 text-blue-600" />
     </div>

     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]">
           <h3 className="text-sm font-semibold text-gray-900 mb-6">Daily Throughput</h3>
           <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%" minHeight={0}>
                 <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} tick={{fill: '#94a3b8'}} />
                    <YAxis axisLine={false} tickLine={false} fontSize={10} tick={{fill: '#94a3b8'}} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                    <Bar dataKey="apps" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={20} />
                    <Bar dataKey="approved" fill="#10b981" radius={[6, 6, 0, 0]} barSize={20} />
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]">
           <h3 className="text-sm font-semibold text-gray-900 mb-6">Approval Index (Neural)</h3>
           <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%" minHeight={0}>
                 <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} tick={{fill: '#94a3b8'}} />
                    <YAxis axisLine={false} tickLine={false} fontSize={10} tick={{fill: '#94a3b8'}} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                    <Line type="monotone" dataKey="approved" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#fff', stroke: '#2563eb', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                 </LineChart>
              </ResponsiveContainer>
           </div>
        </div>
     </div>
  </div>
);

const AnalyticsCard = ({ label, value, sub, icon: Icon, bg }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]">
     <div className="flex items-center justify-between mb-6">
        <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
           <Icon size={20} />
        </div>
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{sub}</span>
     </div>
     <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-1">{label}</p>
     <h1 className="text-2xl font-semibold tracking-tighter text-gray-900">{value}</h1>
  </div>
);

export default InstitutionalDashboard;
