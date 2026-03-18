import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ShieldCheck, ArrowRight, Lock, Cpu, Globe, Activity } from 'lucide-react';

const RoleSelection = ({ user }) => {
    const navigate = useNavigate();

    const roles = [
        {
            id: 'applicant',
            title: 'Consumer portal',
            desc: 'Access personal loan services and manage your credit portfolio.',
            icon: User,
            path: '/login/applicant',
            tag: 'Public access'
        },
        {
            id: 'officer',
            title: 'Underwriting terminal',
            desc: 'Authorized risk assessment and institutional lending management.',
            icon: Activity,
            path: '/login/officer',
            tag: 'Authorized only'
        },
        {
            id: 'admin',
            title: 'System governance',
            desc: 'Global policy orchestration and core system integrity control.',
            icon: ShieldCheck,
            path: '/login/admin',
            tag: 'Administrative'
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
            <div className="max-w-5xl w-full text-center space-y-6">
                <div className="space-y-4">
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center text-white font-semibold text-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]">H</div>
                        <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1 rounded-lg">
                            <Lock size={12} className="text-blue-600" />
                            <span className="text-xs font-medium text-blue-600">Secure Access</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-semibold text-gray-900">Select your portal</h1>
                        <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
                            Choose your access portal for the HDFC Bank loan management system.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {roles.map((role) => (
                        <button
                            key={role.id}
                            onClick={() => navigate(role.path)}
                            className="bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] transition-all duration-200 text-left flex flex-col items-start group relative h-full"
                        >
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                                    {role.tag}
                                </span>
                            </div>
                            
                            <div className="w-11 h-11 rounded-xl bg-slate-50 text-gray-400 flex items-center justify-center mb-6 transition-all duration-200 group-hover:bg-blue-600 group-hover:text-white">
                                <role.icon size={22} />
                            </div>

                            <div className="space-y-2 flex-grow w-full">
                                <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {role.title}
                                </h2>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    {role.desc}
                                </p>
                            </div>

                            <div className="w-full mt-6 pt-4 border-t border-gray-200 flex items-center justify-between text-sm font-medium text-blue-600 transition-all group-hover:text-blue-700">
                                <div className="flex items-center group-hover:translate-x-1 transition-transform duration-200">
                                    <span>Continue to login</span>
                                    <ArrowRight size={14} className="ml-2" />
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {user && (
                    <div className="pt-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="inline-flex items-center gap-4 bg-white border border-gray-200 hover:border-blue-500 px-5 py-3 rounded-xl transition-all duration-200 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-white border-r border-gray-200 flex items-center justify-center text-xs font-medium">
                                {user.name?.charAt(0)}
                            </div>
                            <div className="flex flex-col items-start">
                                <p className="text-xs text-gray-400 font-medium leading-none mb-1">Active session</p>
                                <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">Resume as {user.name}</span>
                            </div>
                            <ArrowRight size={14} className="text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                        </button>
                    </div>
                )}
            </div>

            <footer className="mt-6 border-t border-gray-200 pt-8 w-full max-w-4xl mx-auto text-center space-y-4 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FooterBadge icon={Lock} label="Bank-grade encryption" />
                    <FooterBadge icon={Cpu} label="AI-powered risk engine" />
                    <FooterBadge icon={Globe} label="Secure banking protocol" />
                </div>
                <p className="text-xs text-gray-400">
                    © 2026 HDFC Bank Ltd. All rights reserved.
                </p>
            </footer>
        </div>
    );
};

const FooterBadge = ({ icon: Icon, label }) => (
  <div className="flex items-center justify-center gap-2 group">
      <div className="text-gray-400 group-hover:text-blue-600 transition-colors">
          <Icon size={14} />
      </div>
      <span className="text-xs font-medium text-gray-400 group-hover:text-gray-600 transition-colors">{label}</span>
  </div>
);

export default RoleSelection;
