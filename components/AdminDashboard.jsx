import React, { useState, useEffect, useMemo, useRef } from 'react';
import { API_BASE_URL } from '../src/config/api';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area
} from 'recharts';

const AdminDashboard = ({ user, onUpdateStatus, onDelete }) => {
    const [activeTab, setActiveTab] = useState('DASHBOARD');
    const [filter, setFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [applications, setApplications] = useState([]);
    const [staffUsers, setStaffUsers] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [systemConfig, setSystemConfig] = useState({});
    const [loading, setLoading] = useState(true);

    const [showStaffModal, setShowStaffModal] = useState(false);
    const [newStaff, setNewStaff] = useState({ username: '', full_name: '', role: 'OFFICER' });

    const isOfficer = user?.role === 'OFFICER';
    const isAdmin = user?.role === 'ADMIN';

    // ── Data Management ──
    const fetchData = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            // Loans (Both) - Using Promise.all for faster execution
            const fetchPromises = [fetch(`${API_BASE_URL}/api/applications`).then(r => r.json())];

            if (isAdmin) {
                fetchPromises.push(fetch(`${API_BASE_URL}/api/admin/users`).then(r => r.json()));
                fetchPromises.push(fetch(`${API_BASE_URL}/api/admin/audit-logs`).then(r => r.json()));
                fetchPromises.push(fetch(`${API_BASE_URL}/api/admin/config`).then(r => r.json()));
            }

            const results = await Promise.all(fetchPromises);
            const loanData = Array.isArray(results[0]) ? results[0] : results[0].data || [];

            // Add Debugging Log
            console.log("Applications received:", loanData);

            setApplications(loanData);

            if (isAdmin && results.length > 1) {
                setStaffUsers(Array.isArray(results[1]) ? results[1] : []);
                setAuditLogs(Array.isArray(results[2]) ? results[2] : []);
                setSystemConfig(results[3] || {});
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(); // Initial load with spinner
        const interval = setInterval(() => {
            if (activeTab === 'DASHBOARD' || activeTab === 'AUDIT') fetchData(true); // Silent background refresh
        }, 15000); // Relaxed polling for performance
        return () => clearInterval(interval);
    }, [activeTab]);

    const handleAddStaff = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/add-user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newStaff)
            });
            if (res.ok) {
                alert('Staff user added successfully!');
                setShowStaffModal(false);
                setNewStaff({ username: '', full_name: '', role: 'OFFICER' });
                fetchData(true);
            }
        } catch (err) { alert('Failed to add staff'); }
    };

    const handleDeleteStaff = async (id) => {
        if (!window.confirm('Are you sure you want to remove this officer?')) return;

        // Optimistic Update
        setStaffUsers(prev => prev.filter(s => s.id !== id));

        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/delete-user?id=${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Delete failed');
            // Silent refresh in background
            fetchData(true);
        } catch (err) {
            alert('Failed to delete staff. Reverting changes.');
            fetchData(false); // Re-fetch to restore if failed
        }
    };

    // Wrapper for loan deletion with optimistic UI
    const handleLoanDelete = async (id) => {
        if (!window.confirm('Delete this application permanently?')) return;

        // Optimistic Update for immediate response
        setApplications(prev => prev.filter(l => l.id !== id));

        try {
            await onDelete(id);
            // No need for fetchData here if onDelete already updates parent state, 
            // but allLoans is local to AdminDashboard.
        } catch (err) {
            fetchData(false);
        }
    };

    const [showDecisionModal, setShowDecisionModal] = useState(false);
    const [decisionData, setDecisionData] = useState({ id: null, status: '', remark: '' });

    // Wrapper for status updates with optimistic UI
    const handleStatusUpdate = async (id, status, remark, officer) => {
        // Optimistic Update: Change the local state immediately
        setApplications(prev => prev.map(loan => {
            if (loan.id === id) {
                return { ...loan, status, bankerRemark: remark, reviewedBy: officer?.name, isManualOverride: true };
            }
            return loan;
        }));

        try {
            await onUpdateStatus(id, status, remark, officer);
            // Silent refresh to sync with server's final state
            fetchData(true);
        } catch (err) {
            console.error('Status update failed:', err);
            // Re-fetch to restore correct state on failure
            fetchData(false);
        }
    };

    const openDecisionModal = (id, status) => {
        setDecisionData({ id, status, remark: status === 'APPROVED' ? 'Qualified per AI verification' : 'High risk Profile detected' });
        setShowDecisionModal(true);
    };

    const handleDecisionSubmit = async (e) => {
        e.preventDefault();
        setShowDecisionModal(false);
        await handleStatusUpdate(decisionData.id, decisionData.status, decisionData.remark, user);
    };

    const filteredLoans = useMemo(() => {
        let loans = applications;
        if (filter !== 'ALL') loans = loans.filter(l => l.status === filter);
        if (searchQuery) {
            loans = loans.filter(l =>
                (l.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (l.id || '').toString().includes(searchQuery)
            );
        }
        return loans;
    }, [applications, filter, searchQuery]);

    const stats = [
        { name: 'Total Apps', value: applications.length, color: '#3b82f6' },
        { name: 'Pending', value: applications.filter(a => a.status === 'PENDING').length, color: '#f59e0b' },
        { name: 'Approved', value: applications.filter(a => a.status === 'APPROVED').length, color: '#10b981' },
        { name: 'Rejected', value: applications.filter(a => a.status === 'REJECTED').length, color: '#ef4444' }
    ];

    const approvalRate = applications.length > 0
        ? ((applications.filter(a => a.status === 'APPROVED').length / applications.length) * 100).toFixed(1)
        : 0;

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
            {/* Sidebar */}
            <aside className="w-64 bg-[#003d82] text-white flex flex-col fixed h-full shadow-2xl z-50">
                <div className="p-8">
                    <div className="flex items-center space-x-3 mb-10">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-[#003d82] font-black text-xl">H</span>
                        </div>
                        <div>
                            <h1 className="font-black text-lg leading-tight tracking-tighter">HDFC BANK</h1>
                            <p className="text-[9px] font-bold text-blue-200 uppercase tracking-widest opacity-80 italic">RBAC-Secure Portal</p>
                        </div>
                    </div>

                    <nav className="space-y-2">
                        {[
                            { id: 'DASHBOARD', name: 'Worklist Queue', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16', roles: ['ADMIN', 'OFFICER'] },
                            { id: 'ANALYTICS', name: 'Risk Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', roles: ['ADMIN', 'OFFICER'] },
                            { id: 'USERS', name: 'Staff Control', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', roles: ['ADMIN'] },
                            { id: 'AUDIT', name: 'Audit Trail', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', roles: ['ADMIN'] },
                            { id: 'CONFIG', name: 'Rule Engine', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', roles: ['ADMIN'] }
                        ].filter(tab => tab.roles.includes(user?.role)).map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === item.id ? 'bg-white text-[#003d82] shadow-xl font-black' : 'text-blue-100/60 hover:bg-white/5 font-bold'}`}
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                </svg>
                                <span className="text-[10px] uppercase tracking-widest">{item.name}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-8 border-t border-white/10">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-black text-xs">
                            {user?.name?.[0]}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-[10px] font-black uppercase tracking-widest truncate">{user?.name}</p>
                            <span className={`text-[7px] px-1.5 py-0.5 rounded font-black uppercase ${isAdmin ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                                {user?.role}
                            </span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-64 flex-grow p-8">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter italic">
                            {activeTab === 'DASHBOARD' ? (isAdmin ? 'System Oversight' : 'Decision Hub') :
                                activeTab === 'AUDIT' ? 'Audit Ledger' :
                                    activeTab === 'USERS' ? 'Human Capital' :
                                        activeTab === 'CONFIG' ? 'Neural Rule Config' : 'ML Intelligence'}
                        </h2>
                        <div className="flex items-center space-x-2 mt-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <p className="text-gray-500 font-bold uppercase text-[9px] tracking-widest">HDFC Intelligent OS v4.5 • Role: {user?.role}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <input
                            type="text"
                            placeholder="Search by ID or Name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 px-5 py-2.5 rounded-2xl text-[10px] font-black outline-none focus:ring-2 focus:ring-blue-500 shadow-sm w-72"
                        />
                        <a
                            href={`${API_BASE_URL}/api/reports/loan-summary-pdf`}
                            download
                            className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-black rounded-2xl uppercase shadow-lg hover:scale-105 transition-all flex items-center space-x-2"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Generate PDF Report</span>
                        </a>
                    </div>
                </header>

                {/* Dashboard View */}
                {activeTab === 'DASHBOARD' && (
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-10">
                            {stats.map(stat => (
                                <div key={stat.name} className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 group hover:shadow-xl transition-all">
                                    <p className="text-gray-400 text-[8px] font-black uppercase tracking-widest mb-1">{stat.name}</p>
                                    <p className="text-3xl font-black group-hover:scale-110 transition-transform origin-left" style={{ color: stat.color }}>{stat.value}</p>
                                </div>
                            ))}
                            <div className="bg-gradient-to-br from-[#003d82] to-blue-900 p-6 rounded-3xl shadow-xl text-white">
                                <p className="text-blue-200 text-[8px] font-black uppercase tracking-widest mb-1">Velocity Index</p>
                                <p className="text-3xl font-black">{approvalRate}%</p>
                            </div>
                        </div>

                        {/* Quick Filters */}
                        <div className="flex items-center space-x-3 mb-6 bg-white dark:bg-slate-900 p-2 rounded-2xl w-fit shadow-sm border border-gray-100 dark:border-slate-800">
                            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filter === f
                                        ? 'bg-[#003d82] text-white shadow-lg'
                                        : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>

                        {/* Loans Table */}
                        <div className="bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50/50 dark:bg-slate-800/50 border-b dark:border-slate-700">
                                            <th className="px-6 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">App ID</th>
                                            <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Applicant Name</th>
                                            <th className="px-6 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Loan Amount</th>
                                            <th className="px-6 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Income</th>
                                            <th className="px-4 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Credit Score</th>
                                            <th className="px-4 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">AI Score</th>
                                            <th className="px-4 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Risk Level</th>
                                            <th className="px-6 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                                            <th className="px-6 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Created Date</th>
                                            <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                                        {loading ? (
                                            <tr><td colSpan={9} className="py-32 text-center font-black text-gray-300 uppercase tracking-widest text-xs">Accessing Neural Database...</td></tr>
                                        ) : filteredLoans.length === 0 ? (
                                            <tr><td colSpan={9} className="py-32 text-center font-black text-gray-400 uppercase tracking-widest text-xs">No applications available.</td></tr>
                                        ) : (
                                            filteredLoans.map(loan => (
                                                <tr key={loan.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors group">
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="text-[10px] bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded-lg font-black text-blue-600 tracking-tighter">
                                                            {loan.id.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-8 h-8 bg-[#003d82] rounded-full flex items-center justify-center text-white font-black text-[10px]">
                                                                {loan.fullName?.[0]}
                                                            </div>
                                                            <p className="font-black text-gray-900 dark:text-white text-sm tracking-tight">{loan.fullName}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center font-black text-gray-800 dark:text-gray-200">
                                                        ₹{loan.loanAmount?.toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-center font-black text-gray-600 dark:text-gray-400">
                                                        ₹{loan.income?.toLocaleString()}
                                                    </td>
                                                    <td className="px-4 py-4 text-center font-black text-[#003d82] dark:text-blue-400">
                                                        {loan.creditScore || '700'}
                                                    </td>
                                                    <td className="px-4 py-4 text-center">
                                                        <div className={`px-2 py-0.5 rounded text-[10px] font-black ${(loan.aiCreditworthiness || 0) >= 70 ? 'text-green-600 bg-green-50' : (loan.aiCreditworthiness || 0) >= 40 ? 'text-blue-600 bg-blue-50' : 'text-red-600 bg-red-50'}`}>
                                                            {loan.aiCreditworthiness || 0}%
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-center">
                                                        <span className={`text-[9px] font-black uppercase tracking-tight ${loan.riskLevel === 'Low' ? 'text-green-500' : loan.riskLevel === 'High' ? 'text-red-500' : 'text-blue-500'}`}>
                                                            {loan.riskLevel || 'Medium'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest shadow-sm ${loan.status === 'APPROVED' ? 'bg-green-500 text-white' : loan.status === 'REJECTED' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'}`}>
                                                            {loan.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <p className="text-[10px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-tighter">
                                                            {loan.createdAt ? new Date(loan.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                                                        </p>
                                                    </td>
                                                    <td className="px-8 py-4 text-right">
                                                        <div className="flex space-x-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {loan.status === 'PENDING' ? (
                                                                <>
                                                                    <button onClick={() => openDecisionModal(loan.id, 'APPROVED')} className="px-4 py-2 bg-green-600 text-white text-[9px] font-black rounded-xl uppercase hover:bg-green-700 shadow-lg">Verify</button>
                                                                    <button onClick={() => openDecisionModal(loan.id, 'REJECTED')} className="px-4 py-2 bg-red-600 text-white text-[9px] font-black rounded-xl uppercase hover:bg-red-700 shadow-lg">Reject</button>
                                                                </>
                                                            ) : (
                                                                <div className="flex items-center space-x-2">
                                                                    <div className="text-[9px] font-black text-gray-400 italic">LOGGED BY: {loan.reviewedBy || 'System'}</div>
                                                                    {isAdmin && (
                                                                        <button onClick={() => handleStatusUpdate(loan.id, 'PENDING', 'Admin Decision Reset', user)} className="px-3 py-1.5 bg-amber-600 text-white text-[8px] font-black rounded-lg uppercase hover:bg-amber-700 shadow-md">Reset</button>
                                                                    )}
                                                                </div>
                                                            )}
                                                            {isAdmin && <button onClick={() => handleLoanDelete(loan.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {/* Audit Ledger View */}
                {activeTab === 'AUDIT' && (
                    <div className="bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl border border-gray-100 dark:border-slate-800 p-8">
                        <div className="space-y-6">
                            {auditLogs.length > 0 ? auditLogs.map(log => (
                                <div key={log.id} className="flex items-start justify-between p-6 border-l-4 border-blue-500 bg-gray-50 dark:bg-slate-800/50 rounded-r-3xl">
                                    <div>
                                        <div className="flex items-center space-x-3 mb-2">
                                            <span className="text-xs font-black text-[#003d82] dark:text-blue-400 uppercase tracking-widest">{log.officer_name}</span>
                                            <span className={`text-[9px] px-2 py-0.5 rounded font-black ${log.action === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {log.action}
                                            </span>
                                        </div>
                                        <p className="text-xs font-bold text-gray-600 dark:text-gray-300">Action performed on <span className="text-blue-600 font-black">{log.applicant_name}</span>'s application (₹{log.loan_amount.toLocaleString()})</p>
                                        <p className="text-[10px] mt-2 text-gray-400 italic font-medium">Remark: "{log.rejection_reason}"</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{new Date(log.decision_timestamp).toLocaleString()}</p>
                                        {log.is_manual_override && <span className="text-[8px] bg-amber-500 text-white px-1.5 py-0.5 rounded-full font-black uppercase mt-1 inline-block">Manual Override</span>}
                                    </div>
                                </div>
                            )) : (
                                <div className="py-20 text-center text-gray-400 font-bold italic uppercase tracking-widest text-xs">No audit signals detected in the ledger.</div>
                            )}
                        </div>
                    </div>
                )}

                {/* Staff Management View */}
                {activeTab === 'USERS' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden">
                            <div className="p-8 border-b dark:border-slate-800 flex justify-between items-center">
                                <h3 className="font-black text-lg text-gray-900 dark:text-white uppercase tracking-tighter italic">Active Staff Directory</h3>
                                <button onClick={() => setShowStaffModal(true)} className="px-6 py-2.5 bg-blue-600 text-white text-[10px] font-black rounded-2xl uppercase shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all">Add New Officer</button>
                            </div>
                            <div className="p-8 space-y-4">
                                {staffUsers.map(staff => (
                                    <div key={staff.id} className="flex items-center justify-between p-5 bg-gray-50 dark:bg-slate-800 rounded-3xl group transition-all hover:bg-white dark:hover:bg-slate-700 hover:shadow-xl">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center font-black text-blue-600">
                                                {staff.full_name?.[0]}
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-900 dark:text-white uppercase text-xs tracking-widest">{staff.full_name}</p>
                                                <p className="text-[9px] text-gray-400 font-bold">ID: {staff.username} • Joined {new Date(staff.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <span className={`text-[7px] px-2 py-1 rounded-full font-black uppercase ${staff.role === 'ADMIN' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                                {staff.role}
                                            </span>
                                            <button onClick={() => handleDeleteStaff(staff.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Summary Card */}
                        <div className="space-y-8">
                            <div className="bg-gradient-to-br from-[#003d82] to-blue-900 p-10 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
                                <h4 className="text-blue-200 text-xs font-black uppercase tracking-widest mb-4">Staff Insight</h4>
                                <p className="text-4xl font-black mb-2">{staffUsers.filter(s => s.role === 'OFFICER').length}</p>
                                <p className="text-[10px] font-bold text-blue-300 uppercase italic">Active Underwriting Officers</p>
                                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Risk Configuration View */}
                {activeTab === 'CONFIG' && (
                    <div className="bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl border border-gray-100 dark:border-slate-800 p-10">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="font-black text-2xl text-gray-900 dark:text-white uppercase tracking-tighter italic">Lending Rule Engine</h3>
                            <button className="px-6 py-2.5 bg-blue-600 text-white text-[10px] font-black rounded-2xl uppercase">Save Changes</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-4">Financial Guardrails</p>
                                {Object.entries(systemConfig).map(([key, value]) => (
                                    <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">{key.replace(/_/g, ' ')}</span>
                                        <input type="number" defaultValue={value} className="bg-white dark:bg-slate-900 border-none rounded-xl px-4 py-2 text-xs font-black w-24 text-center ring-1 ring-gray-100" />
                                    </div>
                                ))}
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/10 p-10 rounded-[40px] border border-blue-100 dark:border-blue-800/20">
                                <h4 className="text-[#003d82] dark:text-blue-400 font-black text-xs uppercase tracking-widest mb-4">Admin Security Brief</h4>
                                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-bold">Modifying these parameters directly impacts the AI decision matrix. High-relevance scores ({systemConfig.ai_approval_threshold}+) trigger instant approval paths. Low scores ({systemConfig.ai_review_threshold}-) force mandatory manual review cycles.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Decision Remarks Modal */}
                {showDecisionModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-6">
                        <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[40px] shadow-2xl border border-gray-100 dark:border-slate-800 p-10 relative">
                            <button onClick={() => setShowDecisionModal(false)} className="absolute top-8 right-8 text-gray-400 hover:text-gray-600 font-bold uppercase text-[10px]">Cancel ESC</button>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic mb-2">Final Verification</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-8">Role: {user?.role} • Action: <span className={decisionData.status === 'APPROVED' ? 'text-green-600' : 'text-red-600'}>{decisionData.status}</span></p>

                            <form onSubmit={handleDecisionSubmit} className="space-y-6">
                                <div>
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Officer Verification Remarks</label>
                                    <textarea
                                        required
                                        className="w-full bg-gray-50 dark:bg-slate-800 border-none px-6 py-4 rounded-3xl font-bold text-xs min-h-[120px] ring-1 ring-gray-100 dark:ring-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        placeholder="Enter the basis for this decision (e.g., Document verification complete, High risk found in DTI...)"
                                        value={decisionData.remark}
                                        onChange={e => setDecisionData({ ...decisionData, remark: e.target.value })}
                                    />
                                </div>
                                <div className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/20">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <p className="text-[9px] text-blue-800 dark:text-blue-300 font-bold leading-tight">This action will be logged in the permanent audit ledger with your credentials.</p>
                                </div>
                                <button type="submit" className={`w-full py-5 text-white font-black uppercase text-[10px] tracking-widest rounded-3xl shadow-xl hover:scale-105 active:scale-95 transition-all ${decisionData.status === 'APPROVED' ? 'bg-green-600 shadow-green-500/20' : 'bg-red-600 shadow-red-500/20'}`}>
                                    Commit Decision
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Staff Modal */}
                {showStaffModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
                        <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[40px] shadow-2xl border border-gray-100 dark:border-slate-800 p-10 relative">
                            <button onClick={() => setShowStaffModal(false)} className="absolute top-8 right-8 text-gray-400 hover:text-gray-600 font-bold uppercase text-[10px]">Close ESC</button>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic mb-8">Enroll Officer</h3>
                            <form onSubmit={handleAddStaff} className="space-y-6">
                                <div>
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Employee ID</label>
                                    <input required type="text" placeholder="e.g. HDFC_9942" className="w-full bg-gray-50 dark:bg-slate-800 border-none px-6 py-4 rounded-3xl font-black text-xs ring-1 ring-gray-100 dark:ring-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={newStaff.username} onChange={e => setNewStaff({ ...newStaff, username: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Full Legal Name</label>
                                    <input required type="text" placeholder="e.g. Ramesh Kannan" className="w-full bg-gray-50 dark:bg-slate-800 border-none px-6 py-4 rounded-3xl font-black text-xs ring-1 ring-gray-100 dark:ring-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={newStaff.full_name} onChange={e => setNewStaff({ ...newStaff, full_name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Role Level</label>
                                    <select className="w-full bg-gray-50 dark:bg-slate-800 border-none px-6 py-4 rounded-3xl font-black text-xs uppercase" value={newStaff.role} onChange={e => setNewStaff({ ...newStaff, role: e.target.value })}>
                                        <option value="OFFICER">Bank Officer</option>
                                        <option value="ADMIN">System Administrator</option>
                                    </select>
                                </div>
                                <button type="submit" className="w-full py-5 bg-[#003d82] text-white font-black uppercase text-[10px] tracking-widest rounded-3xl shadow-xl hover:scale-105 active:scale-95 transition-all">Authorize Access</button>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
