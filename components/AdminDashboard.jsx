import React, { useState, useEffect, useMemo } from 'react';
import { API_BASE_URL } from '../src/config/api';
import {
    LayoutDashboard, Users, ShieldCheck, Database,
    Activity, LogOut, Search, Plus, Trash2,
    RefreshCw, Bell, CheckCircle2, AlertTriangle, XCircle,
    Download, FileText, ChevronRight, PieChart as PieChartIcon,
    BarChart3, Settings, MoreVertical, ExternalLink, Loader2, X, UserPlus,
    UserCheck, ShieldAlert
} from 'lucide-react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area, LineChart, Line
} from 'recharts';

const AdminDashboard = ({ user, onLogout }) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [searchQuery, setSearchQuery] = useState('');
    const [applications, setApplications] = useState([]);
    const [staffUsers, setStaffUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [newUser, setNewUser] = useState({ username: '', full_name: '', role: 'OFFICER', password: '123' });
    const [actionLoading, setActionLoading] = useState(false);

    const isAdmin = user?.role === 'ADMIN';

    const fetchData = async (silent = false) => {
        if (!silent) setLoading(true);
        setIsRefreshing(true);
        try {
            const [appsRes, usersRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/applications`).then(r => r.json()),
                isAdmin ? fetch(`${API_BASE_URL}/api/admin/users`).then(r => r.json()) : Promise.resolve({ data: [] })
            ]);

            setApplications(Array.isArray(appsRes) ? appsRes : appsRes.data || []);
            if (isAdmin) {
                setStaffUsers(Array.isArray(usersRes) ? usersRes : usersRes.data || []);
            }
        } catch (error) { console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [isAdmin]);

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
                fetchData(true);
            }
        } catch (err) { alert('Failed to add user'); }
        finally { setActionLoading(false); }
    };

    const stats = useMemo(() => {
        const approved = applications.filter(a => a.status === 'APPROVED').length;
        const rejected = applications.filter(a => a.status === 'REJECTED').length;
        const pending = applications.filter(a => a.status === 'PENDING').length;
        return { total: applications.length, approved, rejected, pending };
    }, [applications]);

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
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-gray-600 hover:!bg-blue-600 hover:!text-white'
            }`}
        >
            <Icon size={18} className={active ? 'text-white' : 'text-gray-500 group-hover:!text-white transition-colors'} />
            <span className="tracking-tight">{label}</span>
            {active && <ChevronRight size={14} className="ml-auto opacity-70" />}
        </button>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard label="Total Applications" value={stats.total} icon={FileText} color="text-blue-600" bg="bg-blue-50" />
                            <StatCard label="Approved Loans" value={stats.approved} icon={CheckCircle2} color="text-green-600" bg="bg-green-50" />
                            <StatCard label="Rejected" value={stats.rejected} icon={XCircle} color="text-red-600" bg="bg-red-50" />
                            <StatCard label="Manual Review" value={stats.pending} icon={Activity} color="text-amber-600" bg="bg-amber-50" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-none">
                                <h3 className="text-sm font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                    <Activity size={18} className="text-blue-600" />
                                    Recent Activity
                                </h3>
                                <div className="space-y-4">
                                    {applications.slice(0, 6).map(app => (
                                        <div key={app.id} className="flex items-center justify-between p-3 hover:bg-slate-50 transition-colors rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-semibold text-xs border border-blue-100">
                                                    {app.full_name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900 leading-none">{app.full_name}</p>
                                                    <p className="text-[11px] text-gray-500 mt-1">App: #{app.id}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-gray-900">₹{(app.loan_amount || 0).toLocaleString()}</p>
                                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-xl uppercase ${
                                                    app.status === 'APPROVED' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                                                }`}>{app.status}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-none">
                                <h3 className="text-sm font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                    <BarChart3 size={18} className="text-blue-600" />
                                    Risk Trends
                                </h3>
                                <div className="h-[280px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={applications.slice(0, 10)}>
                                            <defs>
                                                <linearGradient id="colorLoan" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="full_name" hide />
                                            <YAxis axisLine={false} tickLine={false} fontSize={10} tick={{fill: '#94a3b8'}} />
                                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                                            <Area type="monotone" dataKey="loan_amount" stroke="#2563eb" strokeWidth={2} fill="url(#colorLoan)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'users':
                const admins = staffUsers.filter(u => u.role === 'ADMIN');
                const officers = staffUsers.filter(u => u.role === 'OFFICER');
                const customers = staffUsers.filter(u => u.role === 'APPLICANT');
                return (
                    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
                        <div className="flex items-center justify-between">
                             <div>
                                <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
                                <p className="text-sm text-gray-500 mt-1">Manage system authorities and customer nodes</p>
                             </div>
                             <button 
                                onClick={() => setShowAddUserModal(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all active:scale-[0.98] shadow-sm shadow-blue-100"
                             >
                                <UserPlus size={16} />
                                <span>Add New Officer</span>
                             </button>
                        </div>

                        {/* ADMIN TABLE */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                <ShieldAlert size={14} />
                                Administrator Directory
                            </h3>
                            <div className="bg-white border border-gray-200 rounded-xl shadow-none overflow-hidden">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-gray-100">
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin Ident</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Full Name</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">System Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {admins.map(u => (
                                            <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 bg-red-50 text-red-600 rounded-xl flex items-center justify-center font-semibold text-xs border border-red-100 uppercase">
                                                            {u.username.charAt(0)}
                                                        </div>
                                                        <span className="text-sm font-semibold text-gray-900">{u.username}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500 font-medium">{u.full_name || 'Service Account'}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-xl uppercase tracking-wider">Root Access</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* OFFICER TABLE */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                <UserCheck size={14} />
                                Officer Registry
                            </h3>
                            <div className="bg-white border border-gray-200 rounded-xl shadow-none overflow-hidden border-b-2 border-b-blue-600">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-gray-100">
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Officer Ident</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Full Name</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Operational Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {officers.map(u => (
                                            <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-semibold text-xs border border-blue-100 uppercase">
                                                            {u.username.charAt(0)}
                                                        </div>
                                                        <span className="text-sm font-semibold text-gray-900">{u.username}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500 font-medium">{u.full_name || 'Field Officer'}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-xl uppercase tracking-wider">Active duty</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* APPLICANT TABLE */}
                        <div className="space-y-4 pt-4">
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-1">Customer Node Directory</h3>
                            <div className="bg-white border border-gray-200 rounded-xl shadow-none overflow-hidden">
                                <table className="w-full text-left">
                                    <tbody className="divide-y divide-gray-50">
                                        {customers.map(u => (
                                            <tr key={u.id} className="hover:bg-slate-50/20 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-gray-400 font-bold text-[9px] uppercase border border-gray-100">C</div>
                                                        <span className="text-sm text-gray-600 font-medium">{u.username}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-400 font-medium">Synced Profile</td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="w-2 h-2 bg-slate-200 rounded-full ml-auto"></div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="py-40 text-center animate-in slide-in-from-bottom-5 duration-500">
                        <div className="w-16 h-16 bg-white border border-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                           <LayoutDashboard size={32} className="text-gray-200" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900">Module Synchronizing</h4>
                        <p className="text-sm text-gray-400 mt-2">Loading secure {activeTab} environment...</p>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-gray-900 antialiased">
            {/* ADD USER MODAL */}
            {showAddUserModal && (
                <div className="fixed inset-0 bg-slate-900/10 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-xl overflow-hidden shadow-2xl border border-gray-200">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Initialize Officer Node</h2>
                                <p className="text-xs text-gray-500 mt-0.5 tracking-tight font-medium">Assign a new member to the banking system</p>
                            </div>
                            <button onClick={() => setShowAddUserModal(false)} className="text-gray-400 hover:text-gray-900 transition-colors"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleAddUser} className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Username Reference</label>
                                    <input 
                                        type="text" required value={newUser.username} onChange={v => setNewUser({...newUser, username: v.target.value})}
                                        className="w-full bg-slate-50 border border-gray-200 py-3 px-4 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-blue-500 transition-all"
                                        placeholder="e.g. officer_name"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Full Display Name</label>
                                    <input 
                                        type="text" required value={newUser.full_name} onChange={v => setNewUser({...newUser, full_name: v.target.value})}
                                        className="w-full bg-slate-50 border border-gray-200 py-3 px-4 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-blue-500 transition-all"
                                        placeholder="e.g. Rahul Sharma"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Access Clearance</label>
                                    <select 
                                        value={newUser.role} 
                                        onChange={e => setNewUser({...newUser, role: e.target.value})}
                                        className="w-full bg-slate-50 border border-gray-200 py-3 px-4 rounded-xl text-sm font-medium outline-none cursor-pointer focus:bg-white focus:border-blue-500 transition-all shadow-sm"
                                    >
                                        <option value="OFFICER">OFFICER</option>
                                        <option value="ADMIN">ADMIN</option>
                                    </select>
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                disabled={actionLoading}
                                className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold shadow-sm hover:bg-blue-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2 shadow-blue-50 shadow-lg"
                            >
                                {actionLoading ? <Loader2 className="animate-spin" size={18} /> : (
                                    <>
                                        <Plus size={18} />
                                        <span>Authorize Node</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* SIDEBAR */}
            <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-50">
                <div className="p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-blue-200 shadow-xl">H</div>
                        <div>
                            <h1 className="text-sm font-semibold text-gray-900 tracking-tight">HDFC Admin</h1>
                            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Secure Portal</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 py-4 px-3 overflow-y-auto">
                    <SidebarSection title="Operations">
                        <SidebarItem id="dashboard" label="System Overview" icon={LayoutDashboard} active={activeTab === 'dashboard'} onClick={setActiveTab} />
                        <SidebarItem id="analytics" label="Risk Trends" icon={BarChart3} active={activeTab === 'analytics'} onClick={setActiveTab} />
                    </SidebarSection>

                    {isAdmin && (
                        <SidebarSection title="Control Plane">
                            <SidebarItem id="users" label="User Management" icon={Users} active={activeTab === 'users'} onClick={setActiveTab} />
                            <SidebarItem id="audit" label="Audit Trail" icon={Database} active={activeTab === 'audit'} onClick={setActiveTab} />
                            <SidebarItem id="config" label="Policy Config" icon={Settings} active={activeTab === 'config'} onClick={setActiveTab} />
                        </SidebarSection>
                    )}
                </nav>

                <div className="p-4 mt-auto border-t border-gray-200">
                    <div className="flex items-center gap-3 mb-4 px-1">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-semibold text-xs shrink-0 shadow-inner">
                            {user?.username?.charAt(0) || 'A'}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate tracking-tight">{user?.full_name || user?.username || 'Super Admin'}</p>
                            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider leading-none mt-0.5">{user?.role} Access</p>
                        </div>
                    </div>
                    <button 
                        onClick={onLogout}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 group"
                    >
                        <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* WORKSPACE */}
            <div className="flex-1 ml-64 flex flex-col min-h-screen">
                <header className="h-[70px] bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-40">
                    <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-widest">{activeTab} VIEW</h2>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl text-gray-400 border border-gray-100 focus-within:border-blue-300 focus-within:bg-white transition-all duration-200">
                            <Search size={14} />
                            <input 
                                type="text" 
                                placeholder="Search registry..." 
                                className="bg-transparent border-none outline-none text-xs font-medium w-52 placeholder:text-gray-300"
                            />
                        </div>
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" onClick={() => fetchData(true)}>
                            <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all relative">
                            <Bell size={18} />
                            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
                        </button>
                    </div>
                </header>

                <main className="p-8 flex-1">
                    <div className="max-w-7xl mx-auto">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-40 space-y-4">
                                <Loader2 className="animate-spin text-blue-600" size={28} />
                                <p className="text-sm font-medium text-gray-400 tracking-tight">Synchronizing State...</p>
                            </div>
                        ) : renderContent()}
                    </div>
                </main>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, icon: Icon, color, bg }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-none transition-all duration-200 group hover:-translate-y-1">
        <div className={`w-10 h-10 ${bg} ${color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm`}>
            <Icon size={20} />
        </div>
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
        <div className="flex items-baseline gap-1.5">
            <h3 className="text-2xl font-semibold text-gray-900 tracking-tighter">{(value || 0).toLocaleString()}</h3>
            <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-xl">+2.4%</span>
        </div>
    </div>
);

export default AdminDashboard;
