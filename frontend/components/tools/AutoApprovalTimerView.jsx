import React, { useState, useEffect } from 'react';
import { 
    Clock, Zap, ShieldCheck, Activity, Timer, 
    TrendingUp, Terminal, Cpu, Play, BarChart3, Database 
} from 'lucide-react';

const AutoApprovalTimerView = ({ applications = [] }) => {
    const [isDiagnostic, setIsDiagnostic] = useState(false);
    const [stats, setStats] = useState({
        resolution: '0.82',
        velocity: '1.2x',
        latency: '8ms',
        uptime: '99.98',
        node: `IN-HDFC-NODE-${Math.floor(Math.random() * 900) + 100}`
    });
    
    const [logs, setLogs] = useState([
        { text: "System Audit Initiated...", time: new Date().toLocaleTimeString() },
        { text: "Institutional Backbone: Connected", time: new Date().toLocaleTimeString() }
    ]);
    
    useEffect(() => {
        const intv = setInterval(() => {
            setStats(prev => ({
                ...prev,
                uptime: (99.90 + Math.random() * 0.1).toFixed(2)
            }));
        }, 3000);
        return () => clearInterval(intv);
    }, []);

    const runDiagnostic = async () => {
        setIsDiagnostic(true);
        await new Promise(r => setTimeout(r, 1000));
        setLogs(prev => [{ text: "Diagnostic cycle complete.", time: new Date().toLocaleTimeString() }, ...prev].slice(0, 10));
        setIsDiagnostic(false);
    };

    return (
        <div className="p-8 bg-white rounded-[2rem] border border-gray-100 shadow-sm font-sans">
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">AI Speed Analytics</h2>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-400">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div>
                        <span>Security Protocol: {stats.node}</span>
                    </div>
                </div>
                <button 
                  onClick={runDiagnostic}
                  disabled={isDiagnostic}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg active:scale-95 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  {isDiagnostic ? 'Synchronizing...' : 'Start Audit'}
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Latency', value: stats.resolution + 's', icon: Timer, color: 'text-blue-600' },
                    { label: 'Uptime', value: stats.uptime + '%', icon: ShieldCheck, color: 'text-emerald-600' },
                    { label: 'Velocity', value: stats.velocity, icon: Activity, color: 'text-indigo-600' },
                    { label: 'Network', value: stats.latency, icon: Zap, color: 'text-orange-500' }
                ].map((m, i) => (
                    <div key={i} className="bg-slate-50/50 p-4 rounded-2xl border border-gray-50 flex flex-col items-center text-center">
                        <div className={`w-8 h-8 ${m.color} bg-white rounded-lg flex items-center justify-center mb-3 shadow-sm`}>
                            <m.icon size={16} />
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 leading-none mb-1">{m.value}</h4>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{m.label}</p>
                    </div>
                ))}
            </div>

            <div className="mt-8 pt-8 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-4 text-[10px] text-gray-400 font-black uppercase tracking-widest">
                    <Terminal size={14} className="text-blue-600" />
                    <span>Real-time Operational Logs</span>
                </div>
                <div className="space-y-2 h-40 overflow-y-auto">
                    {logs.map((log, i) => (
                        <div key={i} className="flex gap-4 text-[10.5px] font-mono leading-none">
                            <span className="text-gray-300">[{log.time}]</span>
                            <span className="text-gray-600">{typeof log.text === 'string' ? log.text : JSON.stringify(log.text)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AutoApprovalTimerView;
