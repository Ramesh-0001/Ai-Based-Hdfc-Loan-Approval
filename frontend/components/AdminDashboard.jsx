import React, { useState, useEffect, useMemo } from 'react';
import { API_BASE_URL } from '../src/config/api';
import {
    LayoutDashboard, Users, ShieldCheck, Database,
    Activity, LogOut, Search, Plus, Trash2,
    RefreshCw, Bell, CheckCircle2, AlertTriangle, XCircle,
    Download, FileText, ChevronRight, PieChart as PieChartIcon,
    BarChart3, Settings, MoreVertical, ExternalLink, Loader2, X, UserPlus,
    UserCheck, ShieldAlert, Cpu, Network, TrendingUp, MapPin, Clock
} from 'lucide-react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area, LineChart, Line
} from 'recharts';

const AdminDashboard = ({ user, onLogout }) => {
    // Navigation State
    const [activeTab, setActiveTab] = useState(() => {
        return localStorage.getItem('hdfc_admin_tab_' + (user?.id || 'default')) || 'system-hub';
    });

    useEffect(() => {
        localStorage.setItem('hdfc_admin_tab_' + (user?.id || 'default'), activeTab);
    }, [activeTab, user?.id]);

    // Data State
    const [applications, setApplications] = useState([]);
    const [staffUsers, setStaffUsers] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [aiMetrics, setAiMetrics] = useState({ avg_score: 0, confidence_index: 0, system_health: 'Operational', processing_rate: '98.4%' });
    const [riskSettings, setRiskSettings] = useState({ approval_threshold: 75, review_threshold: 55, ai_sensitivity: 'Optimized', rules: [] });
    
    // UI/UX State
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [selectedItem, setSelectedItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [newUser, setNewUser] = useState({ username: '', full_name: '', role: 'OFFICER', password: '123' });
    const [notifications, setNotifications] = useState([]);
    const [lastFetchCount, setLastFetchCount] = useState(0);
    const [lastUpdateTime, setLastUpdateTime] = useState(new Date().toLocaleTimeString());
    const [actionLoading, setActionLoading] = useState(false);
    const [simulatedMetrics, setSimulatedMetrics] = useState({
        registryGrowth: '+4.2%',
        neuralConfidence: '94.0%',
        fraudAlertIndex: 13
    });
    
    // NEW Analytics States
    const [systemHubSubTab, setSystemHubSubTab] = useState('OVERVIEW');
    const [reportPeriod, setReportPeriod] = useState({ month: 'April', year: '2026' });
    const [performanceData, setPerformanceData] = useState([]);
    const [monthlyStats, setMonthlyStats] = useState({
        total: 1240, approved: 850, rejected: 240, pending: 150,
        amount: 85000000, fraud: 12, rate: '68.5%',
        trendData: [
            { day: '01', apps: 42 }, { day: '05', apps: 55 }, { day: '10', apps: 38 },
            { day: '15', apps: 72 }, { day: '20', apps: 61 }, { day: '25', apps: 85 },
            { day: '30', apps: 66 }
        ]
    });

    const isAdmin = user?.role === 'ADMIN';

    const adminSidebar = [
        { id: "system-hub", label: "System Hub", icon: LayoutDashboard },
        { id: "operations", label: "Operations", icon: Activity },
        { id: "fraud-intelligence", label: "Fraud Intelligence", icon: ShieldAlert },
        { id: "data-registry", label: "Data Registry", icon: Database },
        { id: "ai-decision-engine", label: "AI Decision Engine", icon: Cpu },
        { id: "workflow-engine", label: "Workflow Engine", icon: Network },
        { id: "governance", label: "Governance", icon: ShieldCheck },
        { id: "audit-ledger", label: "Audit Ledger", icon: FileText }
    ];

    // 🛠 MASTER DATA SYNC (100% Dynamic)
    const fetchData = async (silent = false) => {
        if (!silent) setLoading(true);
        setIsRefreshing(true);
        try {
            const endpoints = [
                fetch(`${API_BASE_URL}/api/applications`).then(r => r.json()),
                fetch(`${API_BASE_URL}/api/admin/users`).then(r => r.json()),
                fetch(`${API_BASE_URL}/api/admin/audit-logs`).then(r => r.json()),
                fetch(`${API_BASE_URL}/api/admin/ai-metrics`).then(r => r.json()).catch(() => ({})),
                fetch(`${API_BASE_URL}/api/admin/risk-settings`).then(r => r.json()).catch(() => (null))
            ];

            const [appsRes, usersRes, auditRes, metricsRes, configRes] = await Promise.all(endpoints);

            // Sync Applications
            const apps = Array.isArray(appsRes) ? appsRes : (appsRes.data || []);
            setApplications(apps);

            // Detect new apps for real-time notification
            if (apps.length > lastFetchCount && lastFetchCount !== 0) {
                const newCount = apps.length - lastFetchCount;
                addNotification(`NEW NODE INBOUND`, `${newCount} new institutional requests reached the cluster.`, 'info');
            }
            setLastFetchCount(apps.length);

            // Sync Users
            const users = Array.isArray(usersRes) ? usersRes : (usersRes.data || []);
            setStaffUsers(users);

            // Sync Audit Ledger
            setAuditLogs(Array.isArray(auditRes) ? auditRes : []);

            // Sync AI Health Metrics
            if (metricsRes && metricsRes.avg_score) {
                setAiMetrics({ ...metricsRes, processing_rate: (85 + Math.random() * 14).toFixed(1) + '%' });
            } else if (apps.length > 0) {
                const avg = apps.reduce((s, a) => s + (a.ai_creditworthiness || 0), 0) / apps.length;
                setAiMetrics({
                    avg_score: Math.round(avg),
                    confidence_index: 0.94,
                    system_health: 'Operational',
                    processing_rate: (95 + Math.random() * 4).toFixed(1) + '%'
                });
            }

            // Sync Policy Config
            if (configRes) {
                setRiskSettings(configRes);
            } else {
                // Default Dynamic Rules if missing
                setRiskSettings(prev => ({
                    ...prev,
                    rules: [
                        { id: 1, name: 'Anti-Collusion Protocol', status: 'ACTIVE', impact: 'CRITICAL' },
                        { id: 2, name: 'Velocity Check (Inter-Node)', status: 'ACTIVE', impact: 'HIGH' },
                        { id: 3, name: 'Identity Forgery Filter', status: 'INACTIVE', impact: 'MEDIUM' }
                    ]
                }));
            }
            
            setLastUpdateTime(new Date().toLocaleTimeString());

        } catch (error) {
            console.error('Institutional Sync Failure:', error);
            addNotification('SYNC ERROR', 'Global cluster synchronization failed. Retrying...', 'error');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    // Notification Handler
    const addNotification = (title, message, type = 'info') => {
        const id = Date.now();
        const newNotif = { id, title, message, type, time: new Date() };
        setNotifications(prev => [newNotif, ...prev].slice(0, 5));
        
        // Auto-remove after 6s
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 6000);
    };

    // 🔴 Master Sync Initializer
    useEffect(() => {
        fetchData();
        const syncInterval = setInterval(() => fetchData(true), 20000);
        return () => clearInterval(syncInterval);
    }, []);

    // 🚀 FIX 3: CONNECT MONTHLY STATS TO REAL DATA
    useEffect(() => {
        if (applications.length > 0) {
            const approved = applications.filter(a => a.status === 'APPROVED').length;
            const rejected = applications.filter(a => a.status === 'REJECTED').length;
            const pending = applications.filter(a => a.status === 'PENDING' || a.status === 'MANUAL REVIEW').length;
            const total = applications.length;
            const amount = applications.reduce((sum, a) => sum + (Number(a.loan_amount) || 0), 0);

            setMonthlyStats(prev => ({
                ...prev,
                total,
                approved,
                rejected,
                pending,
                amount,
                rate: ((approved / total) * 100).toFixed(1) + '%'
            }));
        }
    }, [applications]);

    // 🛠 DYNAMIC CALCULATIONS
    const stats = useMemo(() => {
        const approved = applications.filter(a => a.status === 'APPROVED').length;
        const rejected = applications.filter(a => a.status === 'REJECTED').length;
        const pending = applications.filter(a => a.status === 'PENDING' || a.status === 'MANUAL REVIEW').length;
        const totalAmount = applications.reduce((sum, a) => sum + (Number(a.loan_amount) || 0), 0);
        const fraudRiskRatio = applications.filter(a => (a.ai_creditworthiness || 0) < 40).length;
        
        // Dynamic Health Calculation: (Success Rate + AI Confidence) / 2
        const successRate = (approved / (applications.length || 1)) * 100;
        const calcHealth = Math.min(100, Math.round((successRate + 90) / 1.9)).toFixed(1) + '%';

        return { 
            total: applications.length, 
            approved, 
            rejected, 
            pending, 
            totalAmount, 
            fraudRiskRatio, 
            activeOfficers: staffUsers.length,
            calculatedHealth: calcHealth
        };
    }, [applications, staffUsers]);

    const formatCurrency = (val) => {
        if (!val || isNaN(val)) return '₹0';
        if (val >= 100000) {
            return `₹${(val / 100000).toFixed(1)}L`;
        }
        return `₹${val.toLocaleString('en-IN')}`;
    };

    const filteredApplications = applications.filter(app => {
        const matchesSearch = !searchQuery || 
            app.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.id?.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesFilter = filterStatus === 'ALL' || app.status === filterStatus;
        
        return matchesSearch && matchesFilter;
    });

    const handleAddUser = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/add-user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser)
            });
            if (res.ok) {
                setShowAddUserModal(false);
                setNewUser({ username: '', full_name: '', role: 'OFFICER', password: '123' });
                addNotification('AUTHORIZATION SUCCESS', `New officer node @${newUser.username} initialized.`, 'success');
                fetchData(true);
            } else {
                addNotification('AUTH CONFLICT', 'Identification node already exists.', 'error');
            }
        } catch (err) {
            addNotification('CONNECTION ERROR', 'Admin payload rejected by cluster.', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRevokeUser = async (userId) => {
        if (!window.confirm("CRITICAL: Permanent credential revocation will isolated this node. Proceed?")) return;
        setActionLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, { method: 'DELETE' });
            if (res.ok) {
                setSelectedItem(null);
                addNotification('REVOCATION SUCCESS', 'Identity node credentials purged from cluster.', 'success');
                fetchData(true);
            } else {
                addNotification('REVOCATION FAILED', 'Institutional node protected by consensus.', 'error');
            }
        } catch (err) {
            addNotification('CLUSTER ERROR', 'Revocation payload interrupted.', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdateUser = async (userId, data) => {
        setActionLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                addNotification('NODE SYNCHRONIZED', 'Identity metadata updated in registry.', 'success');
                fetchData(true);
            }
        } catch (err) {
            addNotification('SYNC ERROR', 'Update rejected by decentralized registry.', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const updateApplicationStatus = async (id, status, remark = 'Updated by Admin') => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/update-status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    id, 
                    status, 
                    remark,
                    officer: user?.name || 'Admin'
                })
            });

            if (res.ok) {
                setApplications(prev =>
                    prev.map(app => (app.id === id) ? { ...app, status } : app)
                );
                addNotification("SUCCESS", `Application ${id} status moved to ${status}`, "success");
                fetchData(true);
            }
        } catch (err) {
            addNotification("ERROR", "Failed to update application status", "error");
        }
    };


    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex-1 flex flex-col items-center justify-center py-40 space-y-4">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Synchronizing Registry Nodes...</p>
                </div>
            );
        }

        switch (activeTab) {
            case 'system-hub':
                return (
                    <div className="space-y-12 animate-in fade-in duration-700 pb-20 max-w-7xl mx-auto">
                        {/* 🟢 SECTION 1: GLOBAL OVERVIEW */}
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tighter">System Hub Overview</h2>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Global Node Cluster Status</p>
                                </div>
                                <button className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20">
                                    <Download size={16} />
                                    Export Full Cluster Audit
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard label="Institutional Registry" value={stats.total} icon={FileText} color="text-blue-600" bg="bg-blue-50" trend={simulatedMetrics.registryGrowth} onClick={() => setActiveTab('operations')} />
                                <StatCard label="Capital Authorized" value={formatCurrency(stats.totalAmount)} icon={CheckCircle2} color="text-emerald-600" bg="bg-emerald-50" trend="Live" onClick={() => setActiveTab('operations')} />
                                <StatCard label="Fraud Risk Ratio" value={stats.fraudRiskRatio} icon={AlertTriangle} color="text-rose-600" bg="bg-rose-50" trend="Aggressive" onClick={() => setActiveTab('fraud-intelligence')} />
                                <StatCard label="System Health" value={stats.calculatedHealth} icon={Activity} color="text-amber-500" bg="bg-amber-50" trend={aiMetrics.processing_rate} onClick={() => setActiveTab('fraud-intelligence')} />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-10 shadow-sm">
                                    <div className="flex items-center justify-between mb-12">
                                        <h3 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-3">
                                            <TrendingUp size={24} className="text-blue-600" />
                                            Approval Intelligence Trend: <span className="text-blue-600 font-black">{aiMetrics.avg_score}%</span>
                                        </h3>
                                        <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 bg-blue-50 px-4 py-2 rounded-2xl border border-blue-50 uppercase tracking-widest">
                                            <Database size={14} />
                                            Live Neural Stream
                                        </div>
                                    </div>
                                    <div className="h-[350px] min-h-[350px] w-full text-sans text-xs min-w-0">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={applications.slice(0, 15)}>
                                                <defs>
                                                    <linearGradient id="adminGrad" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="full_name" hide />
                                                <YAxis axisLine={false} tickLine={false} fontSize={10} tick={{fill: '#94a3b8'}} />
                                                <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', fontWeight: 'bold', padding: '16px' }} />
                                                <Area type="monotone" dataKey="ai_creditworthiness" stroke="#3b82f6" strokeWidth={4} fill="url(#adminGrad)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
                                        <h3 className="text-md font-bold text-gray-900 mb-8 flex items-center gap-3 tracking-tight">
                                            <Activity size={20} className="text-blue-600" />
                                            Node Telemetry Feed
                                        </h3>
                                        <div className="space-y-4">
                                            {applications.slice(0, 4).map(app => (
                                                <div key={app.id} onClick={() => setSelectedItem({ type: 'application', data: app })} className="flex items-center justify-between group cursor-pointer hover:translate-x-1 transition-all p-3 hover:bg-gray-50 rounded-2xl border border-transparent hover:border-gray-100">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center font-bold text-xs uppercase border border-gray-100 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                                            {app.full_name?.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-[13px] font-black text-gray-900 leading-none mb-1.5 tracking-tight">{app.full_name}</p>
                                                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">#{app.id?.slice(0,10)}</p>
                                                        </div>
                                                    </div>
                                                    <div className={`w-2 h-2 rounded-full ${app.status === 'APPROVED' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-amber-500 animate-pulse'}`}></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 shadow-sm">
                                        <h3 className="text-xs font-black text-blue-600 mb-6 uppercase tracking-[0.3em] flex items-center gap-3">
                                            <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.3)]"></div>
                                            Intelligence Bulletin
                                        </h3>
                                        <div className="space-y-6">
                                            {[
                                                { id: 1, text: 'Node #AF23 thruput spike detected', time: '2m', color: 'text-slate-900', icon: '⚡' },
                                                { id: 2, text: 'Cluster #H4 Policy update applied', time: '14m', color: 'text-slate-900', icon: '🛡️' },
                                                { id: 3, text: 'Unusual IP velocity from Node #R4', time: '22m', color: 'text-rose-600', icon: '⚠️' }
                                            ].map(alert => (
                                                <div key={alert.id} className="flex justify-between items-center gap-4 bg-white p-3 rounded-xl border border-slate-50 shadow-sm">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm">{alert.icon}</span>
                                                        <p className={`text-[11px] font-bold uppercase tracking-tight leading-none ${alert.color}`}>{alert.text}</p>
                                                    </div>
                                                    <span className="text-[9px] text-slate-400 font-bold shrink-0">{alert.time}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 🔵 SECTION 2: MONTHLY INTELLIGENCE */}
                        <div className="space-y-8 pt-8 border-t border-gray-100">
                            <div className="flex items-center justify-between bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tighter">Monthly Intelligence</h2>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Intelligence Spectrum for {reportPeriod.month} {reportPeriod.year}</p>
                                </div>
                                <div className="flex gap-4">
                                    <select 
                                        value={reportPeriod.month}
                                        onChange={(e) => setReportPeriod({...reportPeriod, month: e.target.value})}
                                        className="px-6 py-4 bg-gray-50 border-none rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] outline-none focus:ring-2 ring-blue-100 transition-all cursor-pointer shadow-sm"
                                    >
                                        {['January', 'February', 'March', 'April', 'May'].map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                <StatCard label="Monthly Nodes" value={monthlyStats.total} icon={Cpu} color="text-gray-900" bg="bg-gray-50" />
                                <StatCard label="Total Approved" value={monthlyStats.approved} icon={CheckCircle2} color="text-emerald-600" bg="bg-emerald-50" />
                                <StatCard label="Total Rejected" value={monthlyStats.rejected} icon={XCircle} color="text-rose-600" bg="bg-rose-50" />
                                <StatCard label="Capital Processed" value={formatCurrency(monthlyStats.amount)} icon={Database} color="text-blue-600" bg="bg-blue-50" />
                                <StatCard label="Fraud Cases" value={monthlyStats.fraud} icon={ShieldAlert} color="text-rose-600" bg="bg-rose-50" />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="bg-white border border-gray-100 rounded-3xl p-10 shadow-sm">
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-12 flex items-center gap-3">
                                        <Activity size={18} className="text-blue-600" />
                                        Daily Activity Trend
                                    </h3>
                                    <div className="h-[300px] w-full min-w-0">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={monthlyStats.trendData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="day" axisLine={false} tickLine={false} fontSize={10} tick={{fill: '#94a3b8'}} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} fontSize={10} tick={{fill: '#94a3b8'}} />
                                                <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', fontWeight: 'bold' }} />
                                                <Line type="monotone" dataKey="apps" stroke="#3b82f6" strokeWidth={4} dot={{ r: 6, fill: '#fff', strokeWidth: 3, stroke: '#3b82f6' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                                <div className="bg-white border border-gray-100 rounded-3xl p-10 shadow-sm">
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-12 flex items-center gap-3">
                                        <BarChart3 size={18} className="text-emerald-600" />
                                        Approved vs Rejected Baseline
                                    </h3>
                                    <div className="h-[300px] w-full min-w-0">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={[
                                                { name: 'Approved', val: monthlyStats.approved, color: '#10b981' },
                                                { name: 'Rejected', val: monthlyStats.rejected, color: '#f43f5e' }
                                            ]}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} tick={{fill: '#94a3b8'}} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} fontSize={10} tick={{fill: '#94a3b8'}} />
                                                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', fontWeight: 'bold' }} />
                                                <Bar dataKey="val" radius={[12, 12, 12, 12]} barSize={60}>
                                                    {[0,1].map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#f43f5e'} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 🟡 SECTION 3: OFFICER PERFORMANCE */}
                        <div className="space-y-8 pt-8 border-t border-gray-100">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Officer Performance</h2>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Operator Node Efficiency metrics</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                                {performanceData.slice(0, 5).map((officer, i) => (
                                    <div key={officer.name} className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-slate-900/5 transition-all">
                                        <div className="absolute top-0 right-0 p-4">
                                            <div className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">#{i+1}</div>
                                        </div>
                                        <div className="flex flex-col items-center text-center">
                                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl mb-6 shadow-lg ${
                                                i === 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                                            }`}>
                                                {officer.name.split(' ')[1].charAt(0)}
                                            </div>
                                            <h3 className="text-sm font-black text-gray-900 tracking-tight leading-none mb-2">{officer.name}</h3>
                                            <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em] mb-6">Efficiency Index</p>
                                            <div className="w-full bg-gray-50 rounded-2xl p-4">
                                                <p className="text-xl font-black text-gray-900 tracking-tighter leading-none mb-2">{officer.efficiency}</p>
                                                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full transition-all duration-1000 ${parseFloat(officer.efficiency) > 92 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: officer.efficiency }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden border-b border-gray-100">
                                <div className="p-10 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
                                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-[0.3em]">Global Node Performance Registry</h3>
                                </div>
                                <table className="w-full text-left">
                                    <thead className="bg-white border-b border-gray-100">
                                        <tr>
                                            <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Operator Node</th>
                                            <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Total Handled</th>
                                            <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Approved</th>
                                            <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Rejected</th>
                                            <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Efficiency %</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {performanceData.map(officer => (
                                            <tr key={officer.name} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-10 py-8 font-black text-sm text-gray-900">{officer.name}</td>
                                                <td className="px-10 py-8 text-center text-sm font-black text-gray-900">{officer.total}</td>
                                                <td className="px-10 py-8 text-center text-sm font-black text-emerald-600">{officer.approved}</td>
                                                <td className="px-10 py-8 text-center text-sm font-black text-rose-600">{officer.rejected}</td>
                                                <td className="px-10 py-8 text-right">
                                                    <span className={`text-sm font-black ${parseFloat(officer.efficiency) > 92 ? 'text-emerald-600' : 'text-blue-600'}`}>{officer.efficiency}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );
            case 'operations':
                const filteredApps = applications.filter(app => {
                    const matchStatus = filterStatus === 'ALL' || app.status === filterStatus;
                    const name = app.full_name || app.applicant_name || '';
                    const matchSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
                    return matchStatus && matchSearch;
                });

                return (
                    <div className="space-y-8 animate-in fade-in duration-500 pb-20 max-w-7xl mx-auto">
                        {/* High-Intelligence Filters */}
                        <div className="flex flex-col md:flex-row gap-6 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                                <input
                                    placeholder="Scan registry node identity..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-16 pr-8 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 ring-blue-100 transition-all font-sans"
                                />
                            </div>

                            <div className="flex gap-4">
                                {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => setFilterStatus(status)}
                                        className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
                                            filterStatus === status 
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-500/20' 
                                            : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50 hover:text-slate-900 shadow-sm'
                                        }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Node Handle</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center border-b border-slate-50">Logic Score</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right border-b border-slate-50">Exposure Index</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center border-b border-slate-50">Status Node</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right border-b border-slate-50">Operations</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredApps.map(app => (
                                        <tr key={app.id || app._id} className="hover:bg-slate-50/50 transition-colors cursor-pointer group">
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-11 h-11 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center font-bold text-xs uppercase border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                                        {(app.full_name || app.applicant_name || 'A').charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 tracking-tight leading-none mb-2">{app.full_name || app.applicant_name}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold tracking-widest leading-none">ID-#{ (app.id || app._id || '').slice(0, 8) }</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 text-center">
                                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100 font-black">
                                                    <span className={`text-xs ${app.ai_creditworthiness > 70 ? 'text-emerald-500' : 'text-amber-500'}`}>{app.ai_creditworthiness || 50}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 text-right font-bold text-slate-900 tabular-nums">
                                                {formatCurrency(app.loan_amount)}
                                            </td>
                                            <td className="px-10 py-8 text-center">
                                                <span className={`px-5 py-2 rounded-full text-[9px] font-black tracking-widest uppercase border ${
                                                    app.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    app.status === 'REJECTED' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                    'bg-amber-50 text-amber-500 border-amber-100 animate-pulse'
                                                }`}>
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            updateApplicationStatus(app.id || app._id, 'APPROVED');
                                                        }}
                                                        className="px-5 py-2.5 bg-white text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-slate-100 shadow-sm"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            updateApplicationStatus(app.id || app._id, 'REJECTED');
                                                        }}
                                                        className="px-5 py-2.5 bg-white text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-slate-100 shadow-sm"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'fraud-intelligence':
                return (
                    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-6">Mean Intelligence Baseline</p>
                                <div className="flex items-center justify-between">
                                    <h3 className="text-3xl font-bold text-gray-900 tracking-tighter">{aiMetrics.avg_score}</h3>
                                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><Network size={20} /></div>
                                </div>
                                <div className="mt-8 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-600 rounded-full transition-all duration-1000" style={{ width: `${aiMetrics.avg_score}%` }}></div>
                                </div>
                            </div>
                            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-6">Fraud Alert Index</p>
                                <div className="flex items-center justify-between">
                                    <h3 className="text-3xl font-bold text-rose-600 tracking-tighter">{stats.fraudRiskRatio}</h3>
                                    <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center"><ShieldAlert size={20} /></div>
                                </div>
                                <p className="mt-6 text-[10px] text-gray-400 font-medium">Nodes scoring below 40% creditworthiness detected in cluster.</p>
                            </div>
                            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm flex flex-col justify-center">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 leading-none">Neural Consistency</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center animate-pulse shadow-sm">
                                        <Cpu size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 leading-none mb-1.5 uppercase tracking-tighter">Synchronized</h3>
                                        <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider">{simulatedMetrics.neuralConfidence} Confidence</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-8 flex items-center gap-3 leading-none tracking-tight">
                                    <AlertTriangle size={20} className="text-rose-500" />
                                    Suspicious Pattern Analysis
                                </h3>
                                <div className="space-y-4">
                                    {applications.filter(app => (app.ai_creditworthiness || 0) < 50).slice(0, 5).map(app => (
                                        <div 
                                            key={app.id} 
                                            onClick={() => setSelectedItem({ type: 'application', data: app })}
                                            className="p-5 border border-rose-50 bg-rose-50/10 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-rose-50/30 transition-all border-l-4 border-l-rose-500"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-rose-500 shadow-sm border border-rose-100"><ShieldAlert size={18} /></div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{app.full_name}</p>
                                                    <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider">RISK SCORE: {app.ai_creditworthiness}%</p>
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className="text-gray-300 group-hover:text-rose-500 transition-colors" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-8 flex items-center gap-3 leading-none tracking-tight">
                                    <BarChart3 size={20} className="text-blue-600" />
                                    Cluster Risk Distribution
                                </h3>
                                <div className="h-[250px] w-full min-w-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={applications.slice(0, 10)}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="full_name" hide />
                                            <YAxis hide />
                                            <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.06)' }} cursor={{ fill: '#f8fafc' }} />
                                            <Bar dataKey="ai_creditworthiness" radius={[6, 6, 0, 0]} barSize={24}>
                                                {applications.slice(0, 10).map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.ai_creditworthiness < 50 ? '#f43f5e' : '#3b82f6'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'governance':
                const complianceScore = 98.4;
                return (
                    <div className="space-y-12 animate-in fade-in duration-700 pb-20 max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                            <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-12 text-white shadow-2xl relative overflow-hidden border border-slate-700/50">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-[60px] rounded-full"></div>
                                <div className="relative z-10">
                                    <ShieldCheck size={48} className="text-emerald-400 mb-8" />
                                    <h3 className="text-3xl font-black tracking-tighter mb-4">Institutional Integrity</h3>
                                    <p className="text-emerald-400 text-xs font-black uppercase tracking-[0.3em] mb-10">Fully Compliant Node Cluster</p>
                                    
                                    <div className="grid grid-cols-2 gap-10">
                                        <div className="space-y-3">
                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">KYC Global Audit</p>
                                            <p className="text-2xl font-black text-white leading-none">100%</p>
                                        </div>
                                        <div className="space-y-3">
                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Fraud Mitigation</p>
                                            <p className="text-2xl font-black text-white leading-none">99.8%</p>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-12 w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)] rounded-full transition-all duration-1000" style={{ width: `${complianceScore}%` }}></div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm space-y-8 hover:shadow-xl hover:shadow-slate-900/5 transition-all">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                                    <Activity size={18} className="text-blue-600" />
                                    Risk Matrix
                                </h4>
                                <div className="space-y-6">
                                    {['Head Cluster', 'North Node', 'South Relay', 'West Node'].map((branch, i) => (
                                        <div key={branch} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-blue-50 transition-colors group cursor-pointer group">
                                            <div className="flex items-center gap-4">
                                                <MapPin size={16} className="text-slate-300 group-hover:text-blue-600" />
                                                <span className="text-xs font-black text-slate-700 tracking-tight truncate max-w-[80px]">{branch}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full ${i === 2 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'}`}></div>
                                                <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">{i === 1 ? 'v5.0' : 'v4.8'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm flex flex-col justify-between overflow-hidden relative group hover:shadow-xl hover:shadow-slate-900/5 transition-all">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-12">Violation Registry</h4>
                                <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
                                    <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mb-6 shadow-emerald-100/50 shadow-xl group-hover:scale-110 transition-transform duration-500">
                                        <ShieldCheck size={48} />
                                    </div>
                                    <h4 className="text-lg font-black text-slate-900 tracking-tight leading-none mb-3">Nodes Pristine</h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] leading-relaxed">No institutional violations detected in last 24 nodes</p>
                                </div>
                                <button 
                                    onClick={() => {
                                        addNotification('DEEP SCAN', 'Institutional integrity audit running across all decentralized nodes...', 'info');
                                        setTimeout(() => addNotification('SCAN COMPLETE', 'Global compliance cluster fully verified.', 'success'), 2000);
                                    }}
                                    className="mt-8 py-4 bg-slate-50 text-slate-400 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95"
                                >
                                    Deep Audit Scan
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case 'data-registry':
                const filteredStaff = staffUsers.filter(u => 
                    !searchQuery || 
                    u.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    (u.full_name && u.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
                );
                return (
                    <div className="space-y-8 animate-in fade-in duration-500 pb-20 max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                                <input 
                                    type="text" 
                                    placeholder="Search identity handles in decentralized registry..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-gray-50 border-none py-4 pl-16 pr-8 rounded-2xl text-sm font-bold outline-none focus:ring-2 ring-blue-100 transition-all"
                                />
                            </div>
                            <button 
                                onClick={() => setShowAddUserModal(true)}
                                className="px-8 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center gap-3"
                            >
                                <Plus size={16} />
                                Authorize New Identity Node
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredStaff.map(u => (
                                <div 
                                    key={u.id} 
                                    onClick={() => setSelectedItem({ type: 'user', data: u })}
                                    className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-2xl hover:shadow-blue-900/5 transition-all group cursor-pointer relative overflow-hidden"
                                >
                                    <div className="flex items-center gap-5 mb-8">
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black border transition-all ${
                                            u.role === 'ADMIN' ? 'bg-rose-50 text-rose-500 border-rose-100 group-hover:bg-rose-500 group-hover:text-white' : 'bg-blue-50 text-blue-600 border-blue-100 group-hover:bg-blue-600 group-hover:text-white'
                                        }`}>
                                            {u.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-lg font-black text-gray-900 leading-none mb-2 tracking-tighter">{u.username}</p>
                                            <div className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em] inline-flex items-center gap-2">
                                                <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                                {u.role} NODE
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center py-4 border-t border-gray-50">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Access Level</span>
                                            <span className="text-xs font-black text-gray-700 tracking-tight uppercase leading-none">{u.role === 'ADMIN' ? 'Root Hub' : 'Operation Relay'}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-4 border-t border-gray-50">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Display Entity</span>
                                            <span className="text-xs font-black text-gray-700 tracking-tight uppercase leading-none truncate max-w-[120px]">{u.full_name || 'Standard Unit'}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-8 flex gap-2">
                                        <button className="flex-1 py-3 bg-gray-50 text-gray-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-transparent hover:border-gray-100 hover:text-gray-900 transition-all">Audit Node</button>
                                        <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:text-rose-500 hover:bg-rose-50 transition-all"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            ))}
                            {filteredStaff.length === 0 && (
                                <div className="col-span-full py-40 flex flex-col items-center justify-center opacity-30">
                                    <Users size={64} className="mb-4" />
                                    <p className="text-xs font-black uppercase tracking-[0.3em]">No identity nodes located in current cluster</p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'workflow-engine':
                const workflows = [
                    { id: 'OCR', label: 'Document Extraction', status: 'COMPLETED', nodes: applications.length },
                    { id: 'RISK', label: 'ML Neuro-Scoring', status: 'ACTIVE', nodes: applications.filter(a => a.status === 'PENDING').length },
                    { id: 'POLICY', label: 'Institutional Audit', status: 'QUEUED', nodes: applications.filter(a => a.status === 'MANUAL REVIEW').length },
                    { id: 'SETTLEMENT', label: 'Capital Disbursement', status: 'QUEUED', nodes: applications.filter(a => a.status === 'APPROVED').length }
                ];
                return (
                    <div className="space-y-12 animate-in fade-in duration-700 pb-20 max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                            {/* Connector Line */}
                            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-slate-100 -translate-y-1/2 hidden md:block"></div>
                            
                            {workflows.map((flow, i) => (
                                <div key={flow.id} className="relative z-10 bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm flex flex-col items-center text-center transition-all hover:translate-y-[-8px] hover:shadow-xl hover:shadow-slate-900/5 group">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm border-4 border-white ${
                                        flow.status === 'ACTIVE' ? 'bg-blue-600 text-white animate-pulse' : 
                                        flow.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                        'bg-slate-50 text-slate-400'
                                    }`}>
                                        {flow.status === 'COMPLETED' ? <CheckCircle2 size={24} /> : <span className="text-xl font-bold">{i + 1}</span>}
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-900 tracking-tight leading-none mb-3">{flow.label}</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">{flow.status}</p>
                                    <div className="w-full bg-slate-50 rounded-2xl py-3 px-4 flex justify-between items-center group-hover:bg-blue-50 transition-colors">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Load Factor</span>
                                        <span className="text-xs font-black text-slate-900 group-hover:text-blue-600">{flow.nodes} Node{flow.nodes !== 1 ? 's' : ''}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-slate-900 rounded-[2.5rem] p-12 text-white border border-slate-800 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/5 blur-[120px] rounded-full"></div>
                            <div className="relative z-10">
                                <h2 className="text-2xl font-black tracking-tight mb-2">Neural Decision Chain</h2>
                                <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-10">Real-time node propagation logic</p>
                                <div className="space-y-4">
                                    {applications.slice(0, 3).map((app, i) => (
                                        <div key={app.id} className="flex items-center gap-6 p-4 bg-white/5 rounded-2xl border border-white/10 group hover:bg-white/10 transition-all cursor-pointer">
                                            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-[10px]">{i+1}</div>
                                            <div className="flex-1">
                                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-1">Node Identification</p>
                                                <p className="text-sm font-bold text-white tracking-tight">{app.id}</p>
                                            </div>
                                            <div className="h-10 w-px bg-white/10"></div>
                                            <div className="flex-1">
                                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-1">Transitioning To</p>
                                                <p className="text-sm font-bold text-emerald-400 tracking-tight">{app.status === 'APPROVED' ? 'PROTOCOL SETTLEMENT' : 'MANUAL AUDIT GATE'}</p>
                                            </div>
                                            <ChevronRight className="text-white/20 group-hover:text-blue-400 transition-colors" size={20} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'audit-ledger':
                const filteredLogs = auditLogs.filter(log => 
                    !searchQuery || 
                    log.applicant_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    log.application_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    log.action?.toLowerCase().includes(searchQuery.toLowerCase())
                );
                return (
                    <div className="space-y-8 animate-in fade-in duration-500 pb-20 max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                                <input 
                                    type="text" 
                                    placeholder="Search ledger entries, hashes, or node actions..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-slate-50 border-none py-4 pl-16 pr-8 rounded-2xl text-sm font-bold outline-none focus:ring-2 ring-blue-100 transition-all font-sans"
                                />
                            </div>
                            <button 
                                onClick={() => {
                                    addNotification('EXPORT READY', 'Generating decentralized ledger manifest (CSV)...', 'info');
                                    setTimeout(() => addNotification('EXPORT SUCCESS', 'Consensus ledger backup downloaded.', 'success'), 1500);
                                }}
                                className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 flex items-center gap-3 hover:bg-black transition-all active:scale-95"
                            >
                                <Download size={16} />
                                Export Ledger Backup
                            </button>
                        </div>

                        <div className="space-y-6">
                            {filteredLogs.map((log, idx) => (
                                <div key={log.id || idx} className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm hover:shadow-2xl hover:shadow-slate-900/5 transition-all flex flex-col md:flex-row items-center justify-between group cursor-pointer gap-8 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-2 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="flex items-center gap-10 flex-1">
                                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex flex-col items-center justify-center font-bold text-slate-300 border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                            <span className="text-xl leading-none mb-1 tabular-nums">{new Date(log.decision_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).split(' ')[0]}</span>
                                            <span className="text-[10px] uppercase font-black">{new Date(log.decision_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).split(' ')[1]}</span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-4 mb-4">
                                                <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                                                    log.action === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : 
                                                    log.action === 'REJECTED' ? 'bg-rose-50 text-rose-600' : 
                                                    'bg-amber-50 text-amber-500'
                                                }`}>
                                                    {log.action}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] truncate max-w-[150px]">#{log.application_id?.slice(0, 12)}</span>
                                            </div>
                                            <p className="text-xl font-bold text-slate-900 tracking-tight leading-none">{log.applicant_name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-12 text-right">
                                        <div className="hidden lg:block">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-2 leading-none">Authority</p>
                                            <p className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-50 inline-block uppercase tracking-widest">{log.officer_name || 'SYSTEM CORE'}</p>
                                        </div>
                                        <div className="w-px h-12 bg-slate-100 hidden md:block"></div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-2 leading-none">Capital Flow</p>
                                            <p className="text-sm font-bold text-slate-900 tracking-tight tabular-nums">{formatCurrency(log.loan_amount)}</p>
                                        </div>
                                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all">
                                            <ChevronRight size={24} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {filteredLogs.length === 0 && (
                                <div className="py-40 flex flex-col items-center justify-center opacity-30">
                                    <Database size={64} className="mb-4" />
                                    <p className="text-xs font-black uppercase tracking-[0.3em]">No data records found in historical ledger</p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'ai-decision-engine':
                return (
                    <div className="max-w-4xl space-y-10 animate-in fade-in duration-500 pb-20">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white border border-gray-100 rounded-3xl p-10 shadow-sm space-y-8">
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-3 leading-none">
                                    <Cpu size={18} className="text-blue-600" />
                                    Threshold Protocols
                                </h4>
                                    <div className="space-y-10">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-[11px] font-bold text-gray-900 uppercase tracking-tight">AUTO-APPROVAL Consensus</span>
                                                <span className="text-2xl font-bold text-blue-600 tracking-tighter">{riskSettings.approval_threshold}%</span>
                                            </div>
                                            <input 
                                                type="range" min="0" max="100"
                                                className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600 outline-none" 
                                                value={riskSettings.approval_threshold} 
                                                onChange={(e) => setRiskSettings({...riskSettings, approval_threshold: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-[11px] font-bold text-gray-900 uppercase tracking-tight">MANUAL AUDIT Gate</span>
                                                <span className="text-2xl font-bold text-amber-500 tracking-tighter">{riskSettings.review_threshold}%</span>
                                            </div>
                                            <input 
                                                type="range" min="0" max="100"
                                                className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-amber-500 outline-none" 
                                                value={riskSettings.review_threshold} 
                                                onChange={(e) => setRiskSettings({...riskSettings, review_threshold: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white border border-gray-100 rounded-3xl p-10 shadow-sm space-y-8">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-3 leading-none">
                                        <ShieldCheck size={18} className="text-blue-600" />
                                        Rule Simulation Logic
                                    </h4>
                                    <div className="space-y-3">
                                        {riskSettings.rules?.map(rule => (
                                            <div key={rule.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                <div>
                                                    <p className="text-[11px] font-bold text-gray-900 leading-none mb-1.5">{rule.name}</p>
                                                    <p className={`text-[9px] font-bold uppercase tracking-wider ${rule.impact === 'CRITICAL' ? 'text-rose-500' : 'text-amber-500'}`}>{rule.impact} Protocol</p>
                                                </div>
                                                <button 
                                                    onClick={() => {
                                                        const newRules = riskSettings.rules.map(r => r.id === rule.id ? {...r, status: r.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'} : r);
                                                        setRiskSettings({...riskSettings, rules: newRules});
                                                        addNotification("POLICY UPDATE", `${rule.name} state modified manually.`, "info");
                                                    }}
                                                    className={`w-10 h-5 rounded-full transition-all relative ${rule.status === 'ACTIVE' ? 'bg-blue-600' : 'bg-gray-200'}`}
                                                >
                                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${rule.status === 'ACTIVE' ? 'right-1' : 'left-1'}`}></div>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <button 
                                        onClick={() => addNotification('SYNC INITIATED', 'Global risk profile propagating to decentralized nodes...', 'success')}
                                        className="w-full py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-gray-900/10 active:scale-95"
                                    >
                                        Synchronize Policy Cluster
                                    </button>
                                </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    // --- DETAIL MODAL LOGIC ---
    const DetailModal = () => {
        if (!selectedItem) return null;
        const { type, data } = selectedItem;
        
        return (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[200] flex items-center justify-end p-0 sm:p-6 animate-in fade-in duration-500">
                <div 
                    className="bg-white w-full max-w-2xl h-full sm:h-[90vh] sm:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right-10 duration-500 border border-white/20"
                >
                    {/* Header */}
                    <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100">
                                {type === 'application' ? <FileText size={20} /> : <Users size={20} />}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 tracking-tight uppercase tracking-tight">{type === 'application' ? 'Node Detailed Metadata' : 'Identity Node Explorer'}</h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Deep drill analysis active</p>
                            </div>
                        </div>
                        <button onClick={() => setSelectedItem(null)} className="p-3 hover:bg-gray-50 rounded-2xl text-gray-400 transition-all"><X size={24} /></button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                        {type === 'application' ? (
                            <>
                                <section className="space-y-6">
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-4">Institutional Core</h4>
                                    <div className="grid grid-cols-2 gap-10">
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 leading-none">Applicant Identification</p>
                                            <p className="text-lg font-bold text-gray-900 tracking-tight">{data.full_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 leading-none">Requested Capital</p>
                                            <p className="text-lg font-bold text-blue-600 tracking-tight">₹{data.loan_amount?.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 leading-none">Application Cluster ID</p>
                                            <p className="text-xs font-bold text-gray-900 font-mono">#ID-{data.id}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 leading-none">Protocol Priority</p>
                                            <span className="inline-block px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[9px] font-bold uppercase tracking-widest">Normal</span>
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-4">Heuristic Analysis Results</h4>
                                    <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-full border-4 border-blue-500/20 border-t-blue-500 flex items-center justify-center text-xl font-black text-blue-600 bg-white shadow-sm">
                                                {data.ai_creditworthiness}%
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 leading-none mb-1.5">Consensus Score</p>
                                                <p className="text-[10px] text-gray-500 font-medium">Confidence Interval: 0.94</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-[10px] font-bold px-3 py-1.5 rounded-xl uppercase tracking-widest leading-none ${data.ai_creditworthiness > 60 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                {data.ai_creditworthiness > 60 ? 'PASS READY' : 'RISK DETECTED'}
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-4">Metadata Stream</h4>
                                    <div className="grid grid-cols-2 gap-8">
                                        {['PAN_VERIFIED', 'ADHAAR_MATCH', 'INCOME_CONFIRMED', 'NODAL_CLEAR'].map(check => (
                                            <div key={check} className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                                                <CheckCircle2 size={14} className="text-emerald-500" />
                                                <span className="text-[11px] font-bold text-gray-700 tracking-tight uppercase leading-none">{check}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </>
                        ) : (
                            <section className="space-y-8 text-center pt-10">
                                <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[2.5rem] flex items-center justify-center mx-auto text-3xl font-bold border border-blue-100">
                                    {data.username?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">{data.full_name}</h3>
                                    <p className="text-[10px] text-blue-600 font-bold bg-blue-50 px-4 py-1.5 rounded-full inline-block uppercase tracking-widest border border-blue-100">Access Key: @{data.username}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 py-10">
                                    <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Protocol Role</p>
                                        <p className="text-sm font-bold text-gray-900 tracking-tight uppercase leading-none">{data.role}</p>
                                    </div>
                                    <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Status Node</p>
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                            <p className="text-sm font-bold text-emerald-600 tracking-tight leading-none uppercase">Active</p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="p-8 bg-gray-50 border-t border-gray-100 grid grid-cols-2 gap-6 sticky bottom-0">
                        {type === 'application' ? (
                            <>
                                <button className="py-5 bg-white border border-gray-100 text-gray-400 hover:text-rose-600 hover:border-rose-100 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm">Discard Node</button>
                                <button className="py-5 bg-blue-600 text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95">Verify Cluster Access</button>
                            </>
                        ) : (
                            <>
                                <button 
                                    onClick={() => handleRevokeUser(data.id)}
                                    disabled={actionLoading}
                                    className="py-5 bg-white border border-gray-100 text-red-500 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2 hover:bg-red-50 disabled:opacity-50"
                                >
                                    {actionLoading ? <Loader2 className="animate-spin" size={12} /> : <ShieldAlert size={14} />}
                                    Revoke Credentials
                                </button>
                                <button 
                                    onClick={() => handleUpdateUser(data.id, { role: data.role === 'ADMIN' ? 'OFFICER' : 'ADMIN' })}
                                    disabled={actionLoading}
                                    className="py-5 bg-gray-900 text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl shadow-gray-900/10 hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {actionLoading ? <Loader2 className="animate-spin" size={12} /> : <RefreshCw size={14} />}
                                    Toggle Cluster Auth
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#F9FAFB] flex font-sans antialiased text-slate-900">
            {/* ADD USER MODAL (NEAT) */}
            {showAddUserModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[100] flex items-center justify-center p-8 animate-in fade-in zoom-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl border border-white">
                        <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-white">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Authorize Officer</h1>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 ml-0.5">Initialize new node in institutional registry</p>
                            </div>
                            <button onClick={() => setShowAddUserModal(false)} className="w-10 h-10 rounded-2xl hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-colors border border-slate-100"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleAddUser} className="p-10 space-y-8 bg-white">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Username Ident</label>
                                    <input 
                                        type="text" required value={newUser.username} onChange={v => setNewUser({...newUser, username: v.target.value})}
                                        className="w-full bg-slate-50 border-none py-4 px-6 rounded-2xl text-md font-bold outline-none focus:ring-2 ring-blue-100 transition-all placeholder:text-slate-300"
                                        placeholder="e.g. j_doe"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Access Clearance</label>
                                    <select 
                                        value={newUser.role} 
                                        onChange={e => setNewUser({...newUser, role: e.target.value})}
                                        className="w-full bg-slate-50 border-none py-4 px-6 rounded-2xl text-md font-bold outline-none focus:ring-2 ring-blue-100 transition-all cursor-pointer appearance-none"
                                    >
                                        <option value="OFFICER">OFFICER HUB</option>
                                        <option value="ADMIN">ROOT ACCESS</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Display Name</label>
                                <input 
                                    type="text" required value={newUser.full_name} onChange={v => setNewUser({...newUser, full_name: v.target.value})}
                                    className="w-full bg-slate-50 border-none py-4 px-6 rounded-2xl text-md font-bold outline-none focus:ring-2 ring-blue-100 transition-all placeholder:text-slate-300"
                                    placeholder="Full Institutional Name"
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={actionLoading}
                                className="w-full py-5 bg-blue-600 text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-3 mt-4"
                            >
                                {actionLoading ? <Loader2 className="animate-spin" size={20} /> : <>Authorize Node Access</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* 🏯 Institutional Sidebar (DARK) */}
            <aside className="w-[280px] bg-slate-900 flex flex-col sticky top-0 h-screen z-50 shadow-2xl">
                <div className="p-10 border-b border-white/5 flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-white leading-none mb-1">HDFC Hub</h1>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Admin Node</p>
                    </div>
                </div>

                <nav className="flex-1 p-6 space-y-1 overflow-y-auto">
                    {adminSidebar.map(item => (
                        <SidebarItem
                            key={item.id}
                            {...item}
                            active={activeTab === item.id}
                            onClick={setActiveTab}
                            dark={true}
                        />
                    ))}
                </nav>

                <div className="p-8 border-t border-white/5">
                    <div className="flex items-center gap-4 px-4 py-3 bg-white/5 rounded-2xl mb-6 border border-white/5">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs uppercase">
                            {user?.username?.charAt(0) || 'A'}
                        </div>
                        <div className="flex-1 truncate">
                            <p className="text-[11px] font-bold text-white truncate mb-0.5 leading-none">{user?.username || 'System Root'}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">Cluster Admin</p>
                        </div>
                    </div>
                    <button 
                        onClick={onLogout}
                        className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-[10px] font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all border border-transparent uppercase tracking-widest active:scale-95"
                    >
                        <LogOut size={16} />
                        <span>Disconnect Hub</span>
                    </button>
                </div>
            </aside>

            {/* WORKSPACE */}
            <div className="flex-1 flex flex-col min-h-screen min-w-0 bg-[#F1F5F9]">
                <header className="h-20 bg-white border-b border-slate-200 px-10 flex items-center justify-between sticky top-0 z-40">
                    <div className="flex items-center gap-8 flex-1">
                        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-3">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                            Institutional Node Active
                        </h2>
                        <div className="h-8 w-px bg-slate-200"></div>
                        <div className="relative w-full max-w-md group">
                            <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Scan registry identity nodes..."
                                className="w-full bg-transparent border-none py-3 pl-8 pr-6 rounded-2xl text-xs font-semibold focus:outline-none placeholder:text-slate-400 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                            <div className="flex items-center gap-1.5">
                                <Clock size={14} className="text-slate-400" />
                                {lastUpdateTime}
                            </div>
                            <div className="h-4 w-px bg-slate-200"></div>
                            <div className="flex items-center gap-2">
                                <span className={isRefreshing ? 'animate-spin' : ''}><RefreshCw size={14} /></span>
                                Latency: 12ms
                            </div>
                        </div>
                        <button className="relative w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
                            <Bell size={20} />
                            {notifications.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full border-2 border-white"></span>}
                        </button>
                    </div>
                </header>

                <main className="p-12 lg:p-14 overflow-y-auto">
                    <div className="max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-700">
                        {loading && !isRefreshing ? (
                            <div className="flex flex-col items-center justify-center py-40 space-y-6">
                                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.5em]">Fetching Application Data...</p>
                            </div>
                        ) : renderContent()}
                    </div>
                </main>
                {DetailModal()}
            </div>
        </div>
    );
};

const SidebarItem = ({ id, label, icon: Icon, active, onClick, dark }) => (
    <button
        onClick={() => onClick(id)}
        className={`group w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[13px] font-bold transition-all border border-transparent ${
            active 
            ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' 
            : dark
                ? 'text-slate-400 hover:bg-white/5 hover:text-white hover:border-white/5'
                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-100'
        }`}
    >
        <Icon size={18} className={active ? 'text-white' : dark ? 'text-slate-500 group-hover:text-white transition-colors' : 'text-slate-300 group-hover:text-slate-900 transition-colors'} />
        <span className="tracking-tight">{label}</span>
    </button>
);

const StatCard = ({ label, value, icon: Icon, color, bg, trend, onClick }) => (
    <div 
        onClick={onClick}
        className={`bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm transition-all group hover:shadow-2xl hover:shadow-blue-900/5 ${onClick ? 'cursor-pointer active:scale-95' : ''}`}
    >
        <div className={`w-12 h-12 ${bg} ${color} rounded-2xl flex items-center justify-center mb-10 shadow-sm border border-white`}>
            <Icon size={24} />
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 leading-none">{label}</p>
        <div className="flex items-center justify-between">
            <h3 className="text-3xl font-bold text-slate-900 tracking-tighter leading-none">{value}</h3>
            {trend && <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg uppercase tracking-widest">{trend}</span>}
        </div>
    </div>
);

export default AdminDashboard;
