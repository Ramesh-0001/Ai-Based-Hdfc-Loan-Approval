import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Activity, PieChart as PieChartIcon, 
  MapPin, Globe, Search, Filter, ArrowUpRight, ArrowDownRight,
  TrendingDown, Users, CheckCircle2, XCircle, Clock, ShieldCheck, Cpu
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, PieChart, Pie, Cell
} from 'recharts';

const Dashboard = () => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeRange, setActiveRange] = useState('7D');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/dashboard-stats`);
            if (!response.ok) throw new Error("Synchronization Error");
            const data = await response.json();
            setStats(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-[500px] flex flex-col items-center justify-center space-y-6 font-sans">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]"></div>
            <p className="text-xs font-medium text-gray-400">Aggregating institutional metrics...</p>
        </div>
    );

    const trendData = [
        { name: 'Mon', value: 4000 }, { name: 'Tue', value: 3000 },
        { name: 'Wed', value: 2000 }, { name: 'Thu', value: 2780 },
        { name: 'Fri', value: 1890 }, { name: 'Sat', value: 2390 },
        { name: 'Sun', value: 3490 },
    ];

    const distributionData = [
        { name: 'Approved', value: stats?.approved || 0 },
        { name: 'Pending', value: (stats?.total_apps - stats?.approved - stats?.rejected) || 0 },
        { name: 'Rejected', value: stats?.rejected || 0 },
    ];

    const COLORS = ['#2563eb', '#93c5fd', '#1e1b4b'];

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-700 py-6 px-6 font-sans selection:bg-blue-100 selection:text-blue-900">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-10 border-b border-gray-200">
                <div>
                    <div className="inline-flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100 mb-4">
                        <Cpu size={12} className="text-blue-600" />
                        <span className="text-[11px] font-medium text-blue-600">Global intelligence hub</span>
                    </div>
                    <h1 className="text-2xl font-medium text-gray-900 tracking-tight">Market intelligence</h1>
                    <p className="text-sm text-gray-400 mt-2 font-normal">Live institutional credit exposure terminal</p>
                </div>
                <div className="flex bg-slate-50 p-1 rounded-xl border border-gray-200 overflow-hidden">
                    {['24H', '7D', '30D', 'YTD'].map((r) => (
                        <button 
                          key={r}
                          onClick={() => setActiveRange(r)}
                          className={`px-6 py-2 rounded-lg text-xs font-medium transition-all ${activeRange === r ? 'bg-white text-blue-600 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]' : 'text-gray-400 hover:text-gray-900'}`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <InsightCard label="Market inflow" value={stats?.total_apps} trend="+12.5%" icon={Activity} color="bg-blue-600" />
                <InsightCard label="Yield ledger" value={stats?.approved} trend="+5.2%" icon={CheckCircle2} color="bg-green-600" />
                <InsightCard label="Risk offload" value={stats?.rejected} trend="-2.1%" icon={XCircle} color="bg-red-600" />
                <InsightCard label="AI integrity" value="74.2%" trend="+0.8%" icon={ShieldCheck} color="bg-blue-900" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 bg-white border border-gray-200 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-medium text-gray-900 flex items-center">
                            <TrendingUp size={16} className="mr-3 text-blue-600" />
                            Origination velocity
                        </h3>
                        <span className="text-[11px] font-medium text-gray-300 uppercase tracking-wider">Normalized data</span>
                    </div>
                    <div className="h-[340px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.08}/>
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 500, fill: '#94a3b8'}} dy={15} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 500, fill: '#94a3b8'}} />
                                <Tooltip 
                                    contentStyle={{ 
                                        borderRadius: '16px', 
                                        border: 'none', 
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', 
                                        fontSize: '11px',
                                        fontWeight: '500'
                                    }} 
                                />
                                <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2.5} fill="url(#colorValue)" animationDuration={2000} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="lg:col-span-4 bg-white border border-gray-200 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] flex flex-col items-center">
                    <h3 className="text-sm font-medium text-gray-900 mb-6 w-full">Portfolio distribution</h3>
                    <div className="h-72 w-full relative flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={distributionData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value" stroke="none" animationDuration={1500}>
                                    {distributionData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '16px', fontSize: '11px', fontWeight: '500' }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-1">Total apps</span>
                            <span className="text-2xl font-semibold text-gray-900 tracking-tight">{stats?.total_apps}</span>
                        </div>
                    </div>
                    <div className="mt-6 space-y-6 w-full pt-10 border-t border-gray-200 font-normal">
                        <DistributionRow label="Provisioned" value={stats?.approved} color="#2563eb" total={stats?.total_apps} />
                        <DistributionRow label="Risk reserve" value={stats?.rejected} color="#1e1b4b" total={stats?.total_apps} />
                    </div>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div>
                        <h4 className="text-sm font-medium text-gray-900">Institutional activity ledger</h4>
                        <p className="text-xs text-gray-400 mt-1 font-normal">Authorized real-time transaction log</p>
                    </div>
                    <div className="relative group w-full sm:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" size={16} />
                        <input type="text" placeholder="Search registry..." className="w-full pl-12 pr-6 py-3 bg-slate-50 border border-transparent rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-blue-100 transition-all placeholder:text-gray-300 placeholder:font-normal shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 text-[11px] font-medium text-gray-400 uppercase tracking-wider border-b border-gray-200">
                                <th className="py-5 px-6">Principal entity</th>
                                <th className="py-5 px-6">Exposure protocol</th>
                                <th className="py-5 px-6 text-center">Capital volume</th>
                                <th className="py-5 px-6 text-right">Node status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50/50">
                            {(stats?.recent_activity || []).map((app, index) => (
                                <tr key={index} className="group hover:bg-slate-50 transition-all cursor-pointer">
                                    <td className="py-6 px-6">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 bg-slate-50 text-blue-600 rounded-xl flex items-center justify-center font-medium text-sm border border-gray-200 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">{(app.fullName || app.full_name)?.charAt(0)}</div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{(app.fullName || app.full_name)}</p>
                                                <p className="text-[11px] text-gray-400 font-normal mt-0.5">ID: #{Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-6 px-6">
                                        <p className="text-xs font-medium text-gray-500">Institutional yield</p>
                                    </td>
                                    <td className="py-6 px-6 text-center">
                                        <p className="text-sm font-semibold text-gray-900">₹{(app.amount || app.loan_amount || 0).toLocaleString()}</p>
                                    </td>
                                    <td className="py-6 px-6 text-right">
                                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-medium border ${
                                            app.status === 'APPROVED' ? 'bg-green-50 border-green-100 text-green-600' : 
                                            app.status === 'REJECTED' ? 'bg-red-50 border-red-100 text-red-600' : 
                                            'bg-blue-50 border-blue-100 text-blue-600'
                                        }`}>
                                            {app.status.charAt(0) + app.status.slice(1).toLowerCase()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <footer className="text-center pt-8">
                 <p className="text-[10px] font-medium text-gray-300 tracking-widest">
                    HDFC Institutional Network • Risk Core v4.8 • All Nodes Operational
                 </p>
            </footer>
        </div>
    );
};

const InsightCard = ({ label, value, trend, icon: Icon, color }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] hover:border-blue-100 transition-all group">
        <div className="flex items-center justify-between mb-6">
            <div className={`p-4 rounded-xl ${color} text-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] group-hover:scale-110 transition-transform`}><Icon size={18} /></div>
            <div className="flex items-center space-x-1.5 text-[10px] font-medium text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                <span>{trend}</span>
            </div>
        </div>
        <div>
            <p className="text-xs font-medium text-gray-400">{label}</p>
            <h4 className="text-2xl font-semibold text-gray-900 mt-2 tracking-tight">{(value || 0).toLocaleString()}</h4>
        </div>
    </div>
);

const DistributionRow = ({ label, value, color, total }) => (
    <div className="flex items-center justify-between group">
        <div className="flex items-center space-x-3">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }}></div>
            <span className="text-xs font-medium text-gray-500 group-hover:text-blue-600 transition-colors">{label}</span>
        </div>
        <span className="text-xs font-semibold text-gray-900">{(total > 0 ? (value / total * 100) : 0).toFixed(1)}%</span>
    </div>
);

export default Dashboard;
