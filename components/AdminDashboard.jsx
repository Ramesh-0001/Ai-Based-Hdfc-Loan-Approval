import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, AreaChart, Area, Legend, LineChart, Line } from 'recharts';

const AdminDashboard = ({ user, applications, onUpdateStatus, onDelete, isDark }) => {
    const isAdmin = user.role === 'ADMIN';
    const isOfficer = user.role === 'OFFICER';

    const [activeTab, setActiveTab] = useState('DASHBOARD');
    const [filter, setFilter] = useState('ALL');
    const [searchOfficer, setSearchOfficer] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [selectedApp, setSelectedApp] = useState(null);
    const [remark, setRemark] = useState('');

    // Mock Data for RBAC Features
    const [users, setUsers] = useState([
        { id: 'U001', name: 'RameshKannan', role: 'OFFICER', email: 'ramesh@hdfc.com', status: 'Active' },
        { id: 'U002', name: 'Surendran', role: 'OFFICER', email: 'surendran@hdfc.com', status: 'Active' },
        { id: 'U003', name: 'Admin User', role: 'ADMIN', email: 'admin@hdfc.com', status: 'Active' },
    ]);

    const [settings, setSettings] = useState({
        riskThreshold: 71,
        maxLoanAmount: 5000000,
        interestRateBase: 8.5,
        autoApproval: true
    });

    const filteredApps = useMemo(() => {
        return applications.filter(a => {
            const matchesStatus = filter === 'ALL' || a.status === filter;

            // For Officers: On the main Dashboard, show ALL applications that aren't specifically filtered by status/date.
            // On HISTORY tab, show ONLY items they reviewed.
            if (isOfficer && activeTab === 'HISTORY') {
                return (a.reviewedBy || '').toLowerCase() === (user.name || '').toLowerCase();
            }

            // For Admin: respect the searchOfficer filter if present
            const matchesOfficerSearch = !isAdmin || !searchOfficer ||
                (a.reviewedBy || '').toLowerCase().includes(searchOfficer.toLowerCase()) ||
                (a.fullName || '').toLowerCase().includes(searchOfficer.toLowerCase());

            const matchesDate = !filterDate || (a.createdAt && a.createdAt.startsWith(filterDate)) || (a.decisionDate && a.decisionDate.startsWith(filterDate));

            return matchesStatus && matchesOfficerSearch && matchesDate;
        });
    }, [applications, filter, searchOfficer, filterDate, activeTab, isOfficer, isAdmin, user.name]);

    const stats = [
        { name: 'Total', value: applications.length, color: '#3b82f6' },
        { name: 'Pending', value: applications.filter(a => a.status === 'PENDING').length, color: '#f59e0b' },
        { name: 'Approved', value: applications.filter(a => a.status === 'APPROVED').length, color: '#10b981' },
        { name: 'Rejected', value: applications.filter(a => a.status === 'REJECTED').length, color: '#ef4444' }
    ];

    const approvalRate = applications.length > 0
        ? ((applications.filter(a => a.status === 'APPROVED').length / applications.length) * 100).toFixed(1)
        : 0;

    const loanDistribution = [
        { name: 'Home', value: applications.filter(a => a.loanPurpose?.toLowerCase().includes('home')).length, color: '#003d82' },
        { name: 'Education', value: applications.filter(a => a.loanPurpose?.toLowerCase().includes('edu')).length, color: '#e11b22' },
        { name: 'Personal', value: applications.filter(a => a.loanPurpose?.toLowerCase().includes('person')).length, color: '#3b82f6' },
        { name: 'Others', value: applications.filter(a => !['home', 'edu', 'person'].some(kw => a.loanPurpose?.toLowerCase().includes(kw))).length, color: '#10b981' },
    ].filter(d => d.value > 0);

    const chartData = stats.slice(1);

    const menuItems = [
        { id: 'DASHBOARD', label: 'Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', roles: ['ADMIN', 'OFFICER'] },
        { id: 'USER_MGMT', label: 'User Management', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', roles: ['ADMIN'] },
        { id: 'OFFICER_PERF', label: 'Officer Performance', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', roles: ['ADMIN'] },
        { id: 'SETTINGS', label: 'System Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', roles: ['ADMIN'] },
        { id: 'HISTORY', label: 'My Decisions', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', roles: ['OFFICER'] },
        { id: 'REPORTS', label: 'Export Reports', icon: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', roles: ['ADMIN'] },
    ];

    const officerPerformance = users.filter(u => u.role === 'OFFICER').map(off => {
        const offApps = applications.filter(a => a.reviewedBy === off.name);
        const overrides = offApps.filter(a => a.isManualOverride).length;
        const avgTime = offApps.length > 0
            ? offApps.reduce((acc, a) => acc + (a.decisionDate && a.createdAt ? (new Date(a.decisionDate) - new Date(a.createdAt)) : 0), 0) / offApps.length
            : 0;

        return {
            ...off,
            total: offApps.length,
            approvals: offApps.filter(a => a.status === 'APPROVED').length,
            rejections: offApps.filter(a => a.status === 'REJECTED').length,
            overrideRate: offApps.length > 0 ? (overrides / offApps.length) * 100 : 0,
            avgProcessingTime: Math.round(avgTime / 60000), // minutes
            flags: [
                (overrides / offApps.length) > 0.4 ? 'High Override' : null,
                (avgTime / 60000) < 2 && offApps.length > 0 ? 'Suspiciously Fast' : null
            ].filter(Boolean)
        };
    });

    const visibleMenu = menuItems.filter(item => item.roles.includes(user.role));

    // Monthly Analytics Engine
    const monthlyAnalytics = useMemo(() => {
        const months = {};
        applications.forEach(app => {
            const date = new Date(app.createdAt || new Date());
            const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });
            if (!months[monthKey]) {
                months[monthKey] = {
                    name: monthKey,
                    totalLoan: 0,
                    approvedLoan: 0,
                    count: 0,
                    approvedCount: 0,
                    rejectedCount: 0,
                    totalIncome: 0,
                    avgCreditScore: 0,
                    totalCreditScore: 0
                };
            }
            months[monthKey].count += 1;
            months[monthKey].totalLoan += app.loanAmount;
            months[monthKey].totalIncome += app.income || 0;
            months[monthKey].totalCreditScore += (app.aiCreditworthiness || 0);

            if (app.status === 'APPROVED') {
                months[monthKey].approvedCount += 1;
                months[monthKey].approvedLoan += app.loanAmount;
            } else if (app.status === 'REJECTED') {
                months[monthKey].rejectedCount += 1;
            }

            months[monthKey].avgCreditScore = Math.round(months[monthKey].totalCreditScore / months[monthKey].count);
        });

        // Ensure we have some sort of order
        return Object.values(months).sort((a, b) => new Date(a.name) - new Date(b.name));
    }, [applications]);

    const totalDisbursed = applications.filter(a => a.status === 'APPROVED').reduce((sum, a) => sum + a.loanAmount, 0);
    const totalPendingVal = applications.filter(a => a.status === 'PENDING').reduce((sum, a) => sum + a.loanAmount, 0);
    const overallSuccessRate = applications.length > 0 ? ((applications.filter(a => a.status === 'APPROVED').length / applications.length) * 100).toFixed(1) : 0;


    return (
        <div className="flex bg-gray-50 dark:bg-slate-950 min-h-screen -mx-4 -my-8">
            {/* Sidebar Navigation */}
            <aside className="w-64 bg-white dark:bg-slate-900 border-r dark:border-slate-800 flex flex-col transition-all duration-300">
                <div className="p-6 border-b dark:border-slate-800">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-[#e11b22] rounded-lg flex items-center justify-center text-white font-black text-xl">H</div>
                        <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">HDFC Portal</p>
                            <p className="text-sm font-bold text-gray-800 dark:text-white">{user.role}</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-grow p-4 space-y-2">
                    {visibleMenu.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${activeTab === item.id
                                ? 'bg-[#003d82] text-white shadow-lg shadow-blue-500/20'
                                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                            </svg>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t dark:border-slate-800">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                        <p className="text-[10px] font-black text-blue-800 dark:text-blue-300 uppercase mb-2">System Status</p>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-bold text-blue-900 dark:text-blue-100">AI Node Active</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-grow p-8 overflow-y-auto">
                {activeTab === 'DASHBOARD' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Header */}
                        <div className="flex justify-between items-end">
                            <div>
                                <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                                    {isOfficer ? 'Operational Queue' : 'System Command Center'}
                                </h1>
                                <p className="text-gray-500 font-bold">Welcome back, {user.name}</p>
                            </div>
                            <div className="flex space-x-2">
                                <span className="bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border dark:border-slate-700 text-xs font-bold text-gray-500 italic">
                                    Session Token: {Math.random().toString(36).substr(7).toUpperCase()}
                                </span>
                            </div>
                        </div>

                        {/* Top Stats - Only for Admin or Officer Dashboard view */}
                        {!isOfficer || activeTab === 'DASHBOARD' ? (
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                {stats.map(stat => (
                                    <div key={stat.name} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 transition-all hover:scale-[1.02]">
                                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{stat.name}</p>
                                        <p className="text-3xl font-black" style={{ color: stat.color }}>{stat.value}</p>
                                    </div>
                                ))}
                                <div className="bg-[#003d82] p-6 rounded-2xl shadow-xl text-white">
                                    <p className="text-blue-200 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Approval Rate</p>
                                    <p className="text-3xl font-black">{approvalRate}%</p>
                                </div>
                            </div>
                        ) : null}

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                            {/* Table Sections */}
                            <div className="lg:col-span-3 space-y-6">
                                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border dark:border-slate-700 overflow-hidden">
                                    <div className="p-5 border-b dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <h2 className="font-black text-sm text-gray-500 uppercase tracking-widest flex items-center">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                            Live Applications
                                        </h2>
                                        <div className="flex flex-wrap gap-2">
                                            <select
                                                value={filter}
                                                onChange={(e) => setFilter(e.target.value)}
                                                className="text-[10px] p-2 bg-white dark:bg-slate-700 border-2 border-gray-100 dark:border-slate-600 rounded-lg outline-none font-black uppercase"
                                            >
                                                <option value="ALL">All Status</option>
                                                <option value="PENDING">Pending</option>
                                                <option value="APPROVED">Approved</option>
                                                <option value="REJECTED">Rejected</option>
                                                <option value="INFO_REQUIRED">Info Required</option>
                                            </select>
                                            <input
                                                type="date"
                                                value={filterDate}
                                                onChange={(e) => setFilterDate(e.target.value)}
                                                className="text-[10px] p-2 bg-white dark:bg-slate-700 border-2 border-gray-100 dark:border-slate-600 rounded-lg outline-none font-black"
                                            />
                                            {isAdmin && (
                                                <input
                                                    type="text"
                                                    placeholder="Assigned Officer..."
                                                    value={searchOfficer}
                                                    onChange={(e) => setSearchOfficer(e.target.value)}
                                                    className="text-[10px] p-2 bg-white dark:bg-slate-700 border-2 border-gray-100 dark:border-slate-600 rounded-lg outline-none font-black w-32"
                                                />
                                            )}
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="text-[10px] text-gray-400 dark:text-gray-500 uppercase bg-gray-50/30 dark:bg-slate-800/30 border-b dark:border-slate-700">
                                                <tr>
                                                    <th className="px-6 py-4 font-black">Applicant Details</th>
                                                    <th className="px-6 py-4 font-black">Finance</th>
                                                    <th className="px-6 py-4 font-black text-center">AI Risk</th>
                                                    <th className="px-6 py-4 font-black text-center">ML Confidence</th>
                                                    <th className="px-6 py-4 font-black">Status</th>
                                                    <th className="px-6 py-4 font-black text-right">Audit</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y dark:divide-slate-700">
                                                {filteredApps.length === 0 ? (
                                                    <tr><td colSpan={6} className="px-6 py-20 text-center text-gray-400 font-bold italic">No records present in the active queue</td></tr>
                                                ) : (
                                                    filteredApps.map(app => (
                                                        <tr key={app.id} className="group hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                                            <td className="px-6 py-5">
                                                                <div className="flex items-center space-x-3">
                                                                    <div>
                                                                        <div className="font-black text-gray-900 dark:text-white text-sm">{app.fullName}</div>
                                                                        <div className="text-[10px] text-gray-400 font-bold tracking-tighter uppercase">{app.id}</div>
                                                                    </div>
                                                                    {app.comparison?.conflict && (
                                                                        <span className="p-1.5 bg-orange-100 text-orange-600 rounded-full" title="Conflict between Logic and ML">
                                                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-5">
                                                                <div className="font-bold text-gray-800 dark:text-gray-200">₹{app.loanAmount.toLocaleString()}</div>
                                                                <div className="text-[10px] text-gray-400">{app.loanPurpose}</div>
                                                            </td>
                                                            <td className="px-6 py-5 text-center">
                                                                <div className="flex flex-col items-center">
                                                                    <span className={`text-sm font-black ${app.aiCreditworthiness >= 71 ? 'text-green-500' : 'text-red-500'}`}>
                                                                        {app.aiCreditworthiness}
                                                                    </span>
                                                                    <span className="text-[8px] font-black text-gray-400 uppercase">Score</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-5 text-center">
                                                                <div className="flex flex-col items-center">
                                                                    <div className="w-16 h-1 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden mb-1">
                                                                        <div
                                                                            className={`h-full rounded-full ${app.mlConfidence >= 85 ? 'bg-indigo-500' : app.mlConfidence >= 70 ? 'bg-blue-500' : 'bg-orange-500'}`}
                                                                            style={{ width: `${app.mlConfidence}%` }}
                                                                        ></div>
                                                                    </div>
                                                                    <span className="text-[10px] font-black dark:text-gray-300">
                                                                        {app.mlConfidence || 'Pending'}%
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-5">
                                                                <div className={`inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase ${app.status === 'APPROVED' ? 'bg-green-100/50 text-green-700' :
                                                                    app.status === 'REJECTED' ? 'bg-red-100/50 text-red-700' :
                                                                        app.status === 'INFO_REQUIRED' ? 'bg-blue-100/50 text-blue-700' :
                                                                            'bg-yellow-100/30 text-yellow-700'
                                                                    }`}>
                                                                    {app.status.replace('_', ' ')}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-5 text-right">
                                                                <button
                                                                    onClick={() => setSelectedApp(app)}
                                                                    className="invisible group-hover:visible bg-[#003d82] text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transform transition active:scale-95 shadow-lg shadow-blue-500/20"
                                                                >
                                                                    Verify
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Right Panel - Context Specific */}
                            <div className="space-y-6">
                                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border dark:border-slate-700">
                                    <h3 className="font-black text-gray-400 uppercase tracking-widest text-[10px] mb-6">Distribution Monitor</h3>
                                    <div className="h-48 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={loanDistribution}
                                                    innerRadius={50}
                                                    outerRadius={70}
                                                    paddingAngle={8}
                                                    dataKey="value"
                                                >
                                                    {loanDistribution.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mt-6">
                                        {loanDistribution.map(d => (
                                            <div key={d.name} className="flex items-center space-x-2">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></div>
                                                <span className="text-[10px] text-gray-500 font-black uppercase">{d.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {isAdmin && (
                                    <div className="bg-[#e11b22] text-white p-6 rounded-2xl shadow-xl space-y-4">
                                        <h3 className="font-black text-red-100 uppercase tracking-widest text-[10px]">Security Alert</h3>
                                        <p className="text-xs font-medium opacity-90">3 New unusual login attempts detected in the last hour from South Bombay Hub.</p>
                                        <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">
                                            Lock Global Node
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'USER_MGMT' && isAdmin && (
                    <div className="animate-in slide-in-from-right-8 duration-500 space-y-8">
                        <div className="flex justify-between items-center">
                            <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Identity Access Manager</h2>
                            <button className="bg-[#003d82] text-white px-6 py-2 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-500/20">
                                Add Officer
                            </button>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-2xl border dark:border-slate-700 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="text-[10px] font-black text-gray-400 uppercase bg-gray-50 dark:bg-slate-900/50 border-b dark:border-slate-700">
                                    <tr>
                                        <th className="px-8 py-4">Internal User</th>
                                        <th className="px-8 py-4">Direct Role</th>
                                        <th className="px-8 py-4">Email Channel</th>
                                        <th className="px-8 py-4">Status</th>
                                        <th className="px-8 py-4 text-right">Settings</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y dark:divide-slate-700">
                                    {users.map(u => (
                                        <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-8 py-5 font-bold dark:text-white">{u.name}</td>
                                            <td className="px-8 py-5">
                                                <span className={`px-2 py-1 rounded text-[10px] font-black ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-sm text-gray-500">{u.email}</td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{u.status}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button className="text-gray-400 hover:text-red-500 font-bold text-xs uppercase tracking-tighter">Disable</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'SETTINGS' && isAdmin && (
                    <div className="animate-in slide-in-from-right-8 duration-500 space-y-8 max-w-4xl">
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Core System Params</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border dark:border-slate-700 space-y-6">
                                <h3 className="font-black text-[#003d82] dark:text-blue-400 uppercase tracking-widest text-xs">AI Risk Scoring Engine</h3>
                                <div className="space-y-4">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase">Approval Threshold (%)</label>
                                    <input
                                        type="range"
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#003d82]"
                                        value={settings.riskThreshold}
                                        onChange={(e) => setSettings({ ...settings, riskThreshold: e.target.value })}
                                    />
                                    <div className="flex justify-between font-black text-sm dark:text-white">
                                        <span>Current: {settings.riskThreshold}%</span>
                                        <span>Sensitivity: High</span>
                                    </div>
                                </div>
                                <div className="pt-4 border-t dark:border-slate-700 flex items-center justify-between">
                                    <span className="text-sm font-bold dark:text-gray-300">Automated AI Approvals</span>
                                    <button
                                        onClick={() => setSettings({ ...settings, autoApproval: !settings.autoApproval })}
                                        className={`w-12 h-6 rounded-full transition-colors relative ${settings.autoApproval ? 'bg-green-500' : 'bg-gray-300'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.autoApproval ? 'right-1' : 'left-1'}`}></div>
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border dark:border-slate-700 space-y-6">
                                <h3 className="font-black text-[#e11b22] uppercase tracking-widest text-xs">Financial Governance</h3>
                                <div className="space-y-4">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase">Max Cap per Application (₹)</label>
                                    <input
                                        type="text"
                                        className="w-full p-4 bg-gray-50 dark:bg-slate-900 border-0 rounded-xl font-bold dark:text-white"
                                        value={`₹ ${settings.maxLoanAmount.toLocaleString()}`}
                                        readOnly
                                    />
                                    <p className="text-[9px] text-gray-400 italic font-medium">* This limit requires Board Approval to modify.</p>
                                </div>
                                <div className="space-y-4">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase">Base PLR Interest Rate (%)</label>
                                    <div className="flex items-center space-x-4">
                                        <input
                                            type="number"
                                            className="w-24 p-2 bg-gray-50 dark:bg-slate-900 rounded-lg font-bold dark:text-white"
                                            value={settings.interestRateBase}
                                            step="0.1"
                                        />
                                        <span className="text-xs font-bold text-gray-500">Subject to RBI Repo Rate</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex space-x-4">
                            <button className="bg-[#003d82] text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20">
                                Apply Master Configuration
                            </button>
                            <button className="bg-white dark:bg-slate-800 text-gray-500 px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest border border-gray-100 dark:border-slate-700">
                                Factory Reset
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'HISTORY' && isOfficer && (
                    <div className="animate-in slide-in-from-right-8 duration-500 space-y-8">
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Your Decision History</h2>
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border dark:border-slate-700 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="text-[10px] font-black text-gray-400 uppercase bg-gray-50 dark:bg-slate-900/50 border-b dark:border-slate-700">
                                    <tr>
                                        <th className="px-8 py-4">Applicant</th>
                                        <th className="px-8 py-4">Decision</th>
                                        <th className="px-8 py-4">Date/Time</th>
                                        <th className="px-8 py-4">Internal Remark</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y dark:divide-slate-700">
                                    {filteredApps.filter(a => a.reviewedBy === user.name).length === 0 ? (
                                        <tr><td colSpan={4} className="px-8 py-20 text-center text-gray-400 font-bold italic">You haven't reviewed any applications yet</td></tr>
                                    ) : (
                                        filteredApps.filter(a => a.reviewedBy === user.name).map(app => (
                                            <tr key={app.id}>
                                                <td className="px-8 py-5 font-bold dark:text-white">{app.fullName}</td>
                                                <td className="px-8 py-5">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-black ${app.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {app.status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-sm text-gray-500">{new Date(app.decisionDate).toLocaleString()}</td>
                                                <td className="px-8 py-5 text-sm italic text-gray-400 truncate max-w-xs">{app.bankerRemark}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'OFFICER_PERF' && isAdmin && (
                    <div className="animate-in slide-in-from-right-8 duration-500 space-y-8">
                        <div className="flex justify-between items-center">
                            <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Officer Intelligence Panel</h2>
                            <button className="bg-[#003d82] text-white px-6 py-2 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-500/20">
                                Download Global KPI Report (PDF)
                            </button>
                        </div>

                        {/* Performance Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border dark:border-slate-700">
                                <h3 className="font-black text-gray-400 uppercase tracking-widest text-[10px] mb-8">Decision Distribution by Officer</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={officerPerformance}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                            <Tooltip />
                                            <Bar dataKey="approvals" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} name="Approved" />
                                            <Bar dataKey="rejections" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} name="Rejected" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border dark:border-slate-700">
                                <h3 className="font-black text-gray-400 uppercase tracking-widest text-[10px] mb-8">System Conflict Index (Manual Overrides)</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={officerPerformance}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                            <Tooltip tooltip={{ fontSize: 10 }} />
                                            <Bar dataKey="overrideRate" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} name="Override Rate %" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Officer KPI Table */}
                        <div className="bg-white dark:bg-slate-800 rounded-[2rem] border dark:border-slate-700 overflow-hidden shadow-sm">
                            <table className="w-full text-left">
                                <thead className="text-[10px] font-black text-gray-400 uppercase bg-gray-50 dark:bg-slate-900/50 border-b dark:border-slate-700">
                                    <tr>
                                        <th className="px-8 py-5">Officer Name</th>
                                        <th className="px-8 py-5 text-center">Total Reviews</th>
                                        <th className="px-8 py-5 text-center">Override Rate</th>
                                        <th className="px-8 py-5 text-center">Avg Latency</th>
                                        <th className="px-8 py-5">Integrity Flags</th>
                                        <th className="px-8 py-5 text-right">Settings</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y dark:divide-slate-700">
                                    {officerPerformance.map(off => (
                                        <tr key={off.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="font-black dark:text-white">{off.name}</div>
                                                <div className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Verified Hub Participant</div>
                                            </td>
                                            <td className="px-8 py-6 text-center font-bold text-gray-700 dark:text-gray-300">{off.total}</td>
                                            <td className="px-8 py-6 text-center">
                                                <span className={`font-black ${off.overrideRate > 40 ? 'text-red-500' : 'text-blue-500'}`}>
                                                    {off.overrideRate.toFixed(1)}%
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-center font-bold text-gray-500">
                                                {off.avgProcessingTime < 1 ? '< 1m' : `${off.avgProcessingTime}m`}
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-wrap gap-2">
                                                    {off.flags.length === 0 ? (
                                                        <span className="text-[10px] font-black text-green-500 uppercase tracking-tighter">A+ Integrity</span>
                                                    ) : (
                                                        off.flags.map(flag => (
                                                            <span key={flag} className="px-2 py-0.5 bg-red-100 text-red-700 text-[9px] font-black rounded uppercase flex items-center">
                                                                <svg className="w-2.5 h-2.5 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                                                {flag}
                                                            </span>
                                                        ))
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button className="text-[10px] font-black text-[#003d82] dark:text-blue-400 uppercase tracking-widest invisible group-hover:visible hover:underline">
                                                    Manage Access
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'REPORTS' && isAdmin && (
                    <div className="animate-in slide-in-from-top-8 duration-500 space-y-8">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Institutional Monthly Analysis</h1>
                                <p className="text-gray-500 font-bold">Comprehensive financial intelligence and trend mapping</p>
                            </div>
                            <div className="flex space-x-3">
                                <button className="bg-white dark:bg-slate-800 text-[#003d82] dark:text-blue-400 px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest border border-gray-100 dark:border-slate-700 shadow-sm flex items-center">
                                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                    Export XLSX
                                </button>
                                <button className="bg-[#003d82] text-white px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 flex items-center">
                                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    Generate PDF
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { title: 'Loan Disbursement (Total Approved)', value: `₹${(totalDisbursed / 10000000).toFixed(2)} Cr`, trend: 'Approved Assets', color: 'text-[#003d82] dark:text-blue-400' },
                                { title: 'Avg. Portfolio Creditworthiness', value: `${applications.length > 0 ? (applications.reduce((acc, a) => acc + (a.aiCreditworthiness || 0), 0) / applications.length).toFixed(1) : 0}%`, trend: 'System Avg', color: 'text-green-600' },
                                { title: 'Pending Risk Exposure', value: `₹${(totalPendingVal / 10000000).toFixed(2)} Cr`, trend: 'In-Queue Value', color: 'text-orange-600' }
                            ].map((rep, idx) => (
                                <div key={idx} className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border dark:border-slate-700 shadow-sm transition-all hover:shadow-md">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">{rep.title}</p>
                                    <div className="flex items-end justify-between">
                                        <p className={`text-4xl font-black ${rep.color}`}>{rep.value}</p>
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">{rep.trend}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border dark:border-slate-700 shadow-sm">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tight">Monthly Funding Velocity</h3>
                                        <p className="text-xs text-gray-400 font-bold">Values in INR (Total Loan Amount Requested)</p>
                                    </div>
                                    <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black rounded-lg uppercase">Volume Metric</span>
                                </div>
                                <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={monthlyAnalytics}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                formatter={(value) => [`₹${value.toLocaleString()}`, 'Total Loan Amount']}
                                            />
                                            <Bar dataKey="totalLoan" fill="#003d82" radius={[6, 6, 0, 0]} barSize={40}>
                                                {monthlyAnalytics.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={index === monthlyAnalytics.length - 1 ? '#e11b22' : '#003d82'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border dark:border-slate-700 shadow-sm">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tight">Approval Trend Mapping</h3>
                                        <p className="text-xs text-gray-400 font-bold">Total Apps vs Approved Units</p>
                                    </div>
                                    <span className="px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[10px] font-black rounded-lg uppercase">Conversion</span>
                                </div>
                                <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={monthlyAnalytics}>
                                            <defs>
                                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#003d82" stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor="#003d82" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                            <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                            <Legend verticalAlign="top" align="right" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                                            <Area type="monotone" dataKey="count" name="Total Applications" stroke="#003d82" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                                            <Area type="monotone" dataKey="approvedCount" name="Approvals" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorApproved)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Monthly Summary Table */}
                        <div className="bg-white dark:bg-slate-800 rounded-[2rem] border dark:border-slate-700 overflow-hidden shadow-sm">
                            <div className="p-6 border-b dark:border-slate-700 flex justify-between items-center">
                                <h3 className="font-black text-xs text-gray-400 uppercase tracking-widest">Monthly Data Ledger</h3>
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter italic">Live Intelligence Data</span>
                                </div>
                            </div>
                            <table className="w-full text-left">
                                <thead className="text-[10px] font-black text-gray-400 uppercase bg-gray-50/50 dark:bg-slate-900/50 border-b dark:border-slate-700">
                                    <tr>
                                        <th className="px-8 py-4">Fiscal Period</th>
                                        <th className="px-8 py-4 text-center">Total Apps</th>
                                        <th className="px-8 py-4 text-center">Approved</th>
                                        <th className="px-8 py-4 text-center">Rejected</th>
                                        <th className="px-8 py-4 text-center">Success Rate</th>
                                        <th className="px-8 py-4 text-right">Volume Disbursed</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y dark:divide-slate-700">
                                    {monthlyAnalytics.length === 0 ? (
                                        <tr><td colSpan={6} className="px-8 py-20 text-center text-gray-400 font-bold italic">No monthly data aggregated for this fiscal year</td></tr>
                                    ) : (
                                        monthlyAnalytics.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="px-8 py-5">
                                                    <div className="font-black text-sm dark:text-white uppercase">{row.name}</div>
                                                    <div className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Verified Audit Month</div>
                                                </td>
                                                <td className="px-8 py-5 text-center font-bold dark:text-gray-300">{row.count}</td>
                                                <td className="px-8 py-5 text-center font-bold text-green-600">{row.approvedCount}</td>
                                                <td className="px-8 py-5 text-center font-bold text-red-500">{row.rejectedCount}</td>
                                                <td className="px-8 py-5 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-xs font-black dark:text-white">
                                                            {((row.approvedCount / row.count) * 100).toFixed(1)}%
                                                        </span>
                                                        <div className="w-16 h-1 bg-gray-100 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
                                                            <div
                                                                className="h-full bg-blue-500"
                                                                style={{ width: `${(row.approvedCount / row.count) * 100}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-right font-black text-gray-900 dark:text-blue-400">
                                                    ₹{row.approvedLoan.toLocaleString()}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            {/* Application Review Modal (Audit trail room) */}
            {selectedApp && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-950 rounded-[2.5rem] shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto border-4 border-gray-100 dark:border-slate-800 scale-in-center overflow-hidden">
                        <div className="p-10 border-b dark:border-slate-800 flex justify-between items-start sticky top-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl z-10">
                            <div>
                                <div className="flex items-center space-x-3 mb-2">
                                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-[#003d82] dark:text-blue-400 text-[10px] font-black rounded-full uppercase tracking-widest border border-blue-200 dark:border-blue-800/50">SECURE AUDIT PATH</span>
                                    <span className="text-gray-300">|</span>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ID: {selectedApp.id?.toUpperCase()}</span>
                                </div>
                                <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Decision Certificate</h2>
                            </div>
                            <button onClick={() => { setSelectedApp(null); setRemark(''); }} className="p-4 hover:bg-gray-100 dark:hover:bg-slate-900 rounded-full transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-10 space-y-12 pb-20">
                            {/* Top Layer: The Official Stamp */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="col-span-1 space-y-4">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">AI Risk Analysis</h4>
                                    <div className="bg-gray-50 dark:bg-slate-900 p-6 rounded-[2rem] border-2 border-dashed border-gray-100 dark:border-slate-800 text-center">
                                        <p className={`text-6xl font-black mb-1 ${selectedApp.aiCreditworthiness >= 71 ? 'text-green-500' : 'text-red-500'}`}>
                                            {selectedApp.aiCreditworthiness}%
                                        </p>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Credit Scorer v2.1</p>
                                    </div>
                                </div>
                                <div className="col-span-2 space-y-4">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Officer Verification Data</h4>
                                    <div className="bg-[#003d82] p-8 rounded-[2rem] text-white shadow-xl shadow-blue-900/20 relative overflow-hidden">
                                        <div className="relative z-10 grid grid-cols-2 gap-8">
                                            <div>
                                                <p className="text-blue-300 text-[10px] font-black uppercase mb-1">Authenticated Reviewer</p>
                                                <p className="font-bold text-lg">{selectedApp.reviewedBy || 'UNCLAIMED'}</p>
                                            </div>
                                            <div>
                                                <p className="text-blue-300 text-[10px] font-black uppercase mb-1">Decision Timestamp</p>
                                                <p className="font-bold text-lg">{selectedApp.decisionDate ? new Date(selectedApp.decisionDate).toLocaleDateString() : 'WAITING'}</p>
                                            </div>
                                            <div>
                                                <p className="text-blue-300 text-[10px] font-black uppercase mb-1">Manual Override</p>
                                                <p className="font-bold text-lg tracking-tighter">{selectedApp.isManualOverride ? 'ENABLED - ACTIVE' : 'SYSTEM AUTO'}</p>
                                            </div>
                                            <div>
                                                <p className="text-blue-300 text-[10px] font-black uppercase mb-1">Verification Status</p>
                                                <div className="flex items-center">
                                                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                                    <p className="font-black text-xs uppercase tracking-widest italic">Encrypted Log</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <svg className="w-40 h-40" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.333 16.676 2 12.23 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* NEW: Institutional Fraud Check Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-gray-50 dark:bg-slate-900/50 p-8 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-slate-800">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center space-x-3">
                                            <div className={`p-2 rounded-lg ${selectedApp.fraudRiskLevel === 'High' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">HDFC AI Fraud Analysis</h4>
                                                <p className={`text-sm font-black uppercase tracking-tight ${selectedApp.fraudRiskLevel === 'High' ? 'text-red-600' : 'text-green-600'}`}>
                                                    Risk Level: {selectedApp.fraudRiskLevel || 'LOW'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`p-5 rounded-2xl ${selectedApp.fraudRiskLevel === 'High' ? 'bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-300' : 'bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-300'} text-[10px] font-medium italic border dark:border-slate-800`}>
                                        {selectedApp.fraudReason || "Our behavioral engine analyzed this application against local and global datasets. No substantial recursive anomalies detected."}
                                    </div>
                                </div>

                                <div className="bg-blue-50/30 dark:bg-blue-900/10 p-8 rounded-[2rem] border-2 border-dashed border-blue-200 dark:border-blue-800/50">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 rounded-lg">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">ML Confidence Intelligence</h4>
                                                <p className="text-sm font-black uppercase tracking-tight text-blue-600 dark:text-blue-400">
                                                    Confidence: {selectedApp.mlInsight?.confidence_score || selectedApp.mlConfidence || 0}%
                                                </p>
                                            </div>
                                        </div>
                                        {selectedApp.comparison?.conflict && (
                                            <span className="px-2 py-1 bg-orange-100 text-orange-600 text-[8px] font-black rounded-lg uppercase animate-pulse">Conflict Detected</span>
                                        )}
                                    </div>
                                    <div className="bg-white/50 dark:bg-slate-900/50 p-5 rounded-2xl border dark:border-slate-800 space-y-2">
                                        <p className="text-[10px] font-bold text-gray-600 dark:text-gray-400 italic">"AI Prediction: {selectedApp.mlInsight?.prediction || 'N/A'}"</p>
                                        <p className="text-[10px] text-gray-500 font-medium leading-relaxed">{selectedApp.mlInsight?.ai_recommendation}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Middle Layer: Documents & Financials */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4">
                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Compliance Documents</h4>
                                    <div className="grid grid-cols-1 gap-4">
                                        {['AADHAAR_KYC', 'PAN_INCOME_TAX'].map(doc => (
                                            <div key={doc} className="group bg-gray-50 dark:bg-slate-900 flex items-center justify-between p-5 rounded-2xl border-2 border-transparent hover:border-blue-500/50 transition-all cursor-pointer">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center shadow-sm">
                                                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black dark:text-white uppercase">{doc.replace(/_/g, ' ')}</p>
                                                        <p className="text-[10px] text-gray-400 font-bold">DIGI-SIGNED VERIFIED</p>
                                                    </div>
                                                </div>
                                                <span className="text-blue-600 font-black text-[10px] uppercase tracking-tighter invisible group-hover:visible">View Document</span>
                                            </div>
                                        ))}
                                    </div>

                                </div>

                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Decision Transparency Breakdown</h4>
                                    <div className="bg-gray-50 dark:bg-slate-900 p-8 rounded-[2rem] border-2 border-transparent space-y-3">
                                        {selectedApp.scoreBreakdown ? Object.entries(selectedApp.scoreBreakdown).map(([name, score]) => (
                                            <div key={name} className="flex justify-between items-center pb-2 border-b border-gray-200/50 dark:border-slate-800/50">
                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">{name}</span>
                                                <span className={`font-black text-xs ${score >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                    {score >= 0 ? '+' : ''}{score}
                                                </span>
                                            </div>
                                        )) : (
                                            <div className="text-center py-4 text-gray-400 text-[10px] italic">No breakdown available for this audit record.</div>
                                        )}
                                        <div className="flex justify-between items-center pt-2">
                                            <span className="text-[10px] font-black text-gray-800 dark:text-gray-200 uppercase">Final Risk Rating</span>
                                            <span className="font-black text-sm text-[#003d82] dark:text-blue-400">{selectedApp.aiCreditworthiness}/100</span>
                                        </div>
                                    </div>

                                    {/* Textual Rationale */}
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-6 mb-4">Decision Rationale (AI)</h4>
                                    <div className="bg-white dark:bg-slate-900/50 p-6 rounded-2xl border dark:border-slate-800 space-y-2">
                                        {Array.isArray(selectedApp.aiReasoning) ? selectedApp.aiReasoning.map((point, idx) => (
                                            <p key={idx} className="text-[11px] text-gray-600 dark:text-gray-400 font-medium leading-relaxed">• {point.replace(/^•\s*/, '')}</p>
                                        )) : (
                                            <p className="text-[11px] text-gray-500 italic">No textual rationale provided by the engine.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* NEW: Comparison & Recommendations Layer (Optimized Row) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
                                <div className="bg-white dark:bg-slate-900/50 p-8 rounded-[2.5rem] border-2 border-dashed border-gray-100 dark:border-slate-800">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">AI vs. Logic Comparison</h4>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-gray-500 uppercase">Rule Engine Decision</span>
                                            <span className={`font-black uppercase ${selectedApp.comparison?.rule_decision === 'APPROVED' ? 'text-green-500' : 'text-red-500'}`}>
                                                {selectedApp.comparison?.rule_decision || 'PENDING'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-gray-500 uppercase">ML Model Prediction</span>
                                            <span className={`font-black uppercase ${selectedApp.comparison?.ml_decision === 'APPROVED' ? 'text-green-500' : 'text-red-500'}`}>
                                                {selectedApp.comparison?.ml_decision || 'PENDING'}
                                            </span>
                                        </div>
                                        <div className={`p-3 rounded-xl text-[10px] font-bold text-center ${selectedApp.comparison?.conflict ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                                            {selectedApp.comparison?.conflict ? '⚠️ Strategic Alert: Model/Rule Conflict' : '✅ System Alignment: Full Consensus'}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-purple-50/30 dark:bg-purple-900/10 p-8 rounded-[2.5rem] border-2 border-dashed border-purple-200 dark:border-purple-800/50">
                                    <h4 className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-[0.3em] mb-4">Smart Recommendations</h4>
                                    <div className="space-y-3">
                                        {selectedApp.recommendations && selectedApp.recommendations.length > 0 ? (
                                            selectedApp.recommendations.map((rec, idx) => (
                                                <div key={idx} className="flex items-start space-x-2">
                                                    <span className="text-sm">💡</span>
                                                    <p className="text-[11px] text-gray-600 dark:text-gray-300 font-medium leading-relaxed">{rec}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-[10px] text-gray-400 italic font-medium">No strategic suggestions generated for this profile.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Final Layer: Action Room (If pending or if Admin wants override) */}
                            {(selectedApp.status === 'PENDING' || isAdmin) && (
                                <div className="bg-gray-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                                    <div className="relative z-10 space-y-8">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-1.5 h-6 bg-[#e11b22] rounded-full"></div>
                                            <h3 className="text-xl font-black uppercase tracking-tight">Final Decision Terminal</h3>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Executive Decision Remark</label>
                                            <textarea
                                                className="w-full p-6 bg-white/5 border border-white/10 rounded-3xl text-sm outline-none focus:ring-4 focus:ring-blue-500/20 transition-all placeholder:text-gray-600"
                                                rows="4"
                                                placeholder="Provide the formal reasoning for approval/rejection for internal auditing records..."
                                                value={remark}
                                                onChange={(e) => setRemark(e.target.value)}
                                            ></textarea>
                                        </div>

                                        <div className="grid grid-cols-3 gap-6">
                                            <button
                                                onClick={() => { onUpdateStatus(selectedApp.id, 'APPROVED', remark, user); setSelectedApp(null); setRemark(''); }}
                                                className="bg-green-600 hover:bg-green-500 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-green-900/40 transition-all text-[9px] uppercase tracking-widest active:scale-95"
                                            >
                                                Execute Approval
                                            </button>
                                            <button
                                                onClick={() => { onUpdateStatus(selectedApp.id, 'INFO_REQUIRED', remark || 'Documents required.', user); setSelectedApp(null); setRemark(''); }}
                                                className="bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-blue-900/40 transition-all text-[9px] uppercase tracking-widest active:scale-95"
                                            >
                                                Request Info
                                            </button>
                                            <button
                                                onClick={() => { onUpdateStatus(selectedApp.id, 'REJECTED', remark, user); setSelectedApp(null); setRemark(''); }}
                                                className="bg-red-600 hover:bg-red-500 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-red-900/40 transition-all text-[9px] uppercase tracking-widest active:scale-95"
                                            >
                                                Formal Rejection
                                            </button>
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-20 -right-20 opacity-5">
                                        <svg className="w-80 h-80" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5V2a1 1 0 112 0v5a1 1 0 01-1 1h-5zM11 13a1 1 0 110-2h5v-5a1 1 0 112 0v5a1 1 0 01-1 1h-5z" /></svg>
                                    </div>
                                </div>
                            )}

                            {isAdmin && (
                                <div className="text-center">
                                    <button
                                        onClick={() => { if (window.confirm('IRREVERSABLE ACTION: Delete audit entry?')) { onDelete(selectedApp.id); setSelectedApp(null); } }}
                                        className="text-gray-400 hover:text-red-500 text-[10px] font-black uppercase tracking-[0.5em] transition-all"
                                    >
                                        Delete Audit Record Permanently
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
